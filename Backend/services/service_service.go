package services

import (
	"errors"
	"math"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ServiceService struct {
	serviceRepo     *repositories.ServiceRepository
	serviceAreaRepo *repositories.ServiceAreaRepository
	cloudinary      *CloudinaryService
}

func NewServiceService(serviceRepo *repositories.ServiceRepository, cloudinary *CloudinaryService) *ServiceService {
	return &ServiceService{
		serviceRepo:     serviceRepo,
		serviceAreaRepo: repositories.NewServiceAreaRepository(),
		cloudinary:      cloudinary,
	}
}

// roundServicePrice rounds service price to nearest integer, ensuring minimum of 1
func roundServicePrice(price *float64) *float64 {
	if price == nil {
		return nil
	}
	
	// Round to nearest integer
	rounded := math.Round(*price)
	
	// Ensure minimum price is 1
	if rounded < 1 {
		rounded = 1
	}
	
	return &rounded
}

// CreateService creates a new service
func (ss *ServiceService) CreateService(req *models.CreateServiceRequest, imageFiles []*multipart.FileHeader) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.CreateService panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.CreateService called with name: %s, price_type: %s", req.Name, req.PriceType)
	// Validate price type and price
	if req.PriceType == "fixed" && req.Price == nil {
		logrus.Error("ServiceService.CreateService validation error: price is required when price_type is fixed")
		return nil, errors.New("price is required when price_type is fixed")
	}
	if req.PriceType == "inquiry" && req.Price != nil {
		logrus.Error("ServiceService.CreateService validation error: price should not be provided when price_type is inquiry")
		return nil, errors.New("price should not be provided when price_type is inquiry")
	}

	// Validate that service area IDs exist
	if len(req.ServiceAreaIDs) == 0 {
		logrus.Error("ServiceService.CreateService validation error: at least one service area ID is required")
		return nil, errors.New("at least one service area ID is required")
	}

	// Verify that all service area IDs exist
	for _, areaID := range req.ServiceAreaIDs {
		exists, err := ss.serviceAreaRepo.ExistsByID(areaID)
		if err != nil {
			logrus.Errorf("ServiceService.CreateService error checking service area ID %d: %v", areaID, err)
			return nil, err
		}
		if !exists {
			logrus.Errorf("ServiceService.CreateService validation error: service area ID %d does not exist", areaID)
			return nil, errors.New("service area ID does not exist")
		}
	}

	logrus.Info("ServiceService.CreateService validation passed")

	// Generate slug
	slug := utils.GenerateSlug(req.Name)
	logrus.Infof("ServiceService.CreateService generated slug: %s", slug)

	// Upload images to Cloudinary
	var imageURLs []string
	if ss.cloudinary != nil {
		for _, file := range imageFiles {
			if file != nil {
				logrus.Infof("ServiceService.CreateService uploading image: %s", file.Filename)
				url, err := ss.cloudinary.UploadImage(file, "services")
				if err != nil {
					logrus.Errorf("ServiceService.CreateService image upload error: %v", err)
					return nil, err
				}
				imageURLs = append(imageURLs, url)
				logrus.Infof("ServiceService.CreateService image uploaded: %s", url)
			}
		}
	} else {
		logrus.Warn("ServiceService.CreateService cloudinary service is nil, skipping image upload")
	}

	// Set default is_active
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	logrus.Infof("ServiceService.CreateService creating service with isActive: %v", isActive)

	// Round price if provided
	var roundedPrice *float64
	if req.Price != nil {
		roundedPrice = roundServicePrice(req.Price)
		logrus.Infof("ServiceService.CreateService rounded price from %v to %v", *req.Price, *roundedPrice)
	}

	service := &models.Service{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Images:      pq.StringArray(imageURLs),
		PriceType:   req.PriceType,
		Price:       roundedPrice,
		Duration:    req.Duration,
		CategoryID:  req.CategoryID,
		IsActive:    isActive,
	}

	// Use a transaction to ensure atomicity
	db := ss.serviceRepo.GetDB()
	tx := db.Begin()
	if tx.Error != nil {
		logrus.Errorf("ServiceService.CreateService transaction begin error: %v", tx.Error)
		return nil, tx.Error
	}

	// Rollback on any error
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			logrus.Errorf("ServiceService.CreateService panic, rolling back: %v", r)
		}
	}()

	logrus.Info("ServiceService.CreateService calling repository.Create within transaction")
	
	// Verify category exists before creating
	var category models.Category
	if err := tx.First(&category, service.CategoryID).Error; err != nil {
		tx.Rollback()
		logrus.Errorf("ServiceService.CreateService category lookup failed: %v", err)
		return nil, err
	}
	logrus.Infof("ServiceService.CreateService found category: ID=%d, Name=%s, Level=%d", category.ID, category.Name, category.GetLevel())
	
	// Create service within transaction
	err := tx.Create(service).Error
	if err != nil {
		tx.Rollback()
		logrus.Errorf("ServiceService.CreateService repository.Create error: %v", err)
		return nil, err
	}

	logrus.Infof("ServiceService.CreateService service created with ID: %d", service.ID)

	// Associate service areas with the service using many-to-many relationship
	if len(req.ServiceAreaIDs) > 0 {
		logrus.Infof("ServiceService.CreateService associating %d service areas", len(req.ServiceAreaIDs))
		
		// Insert associations into the junction table within the same transaction
		for _, areaID := range req.ServiceAreaIDs {
			// Check if association already exists
			var count int64
			if err := tx.Table("service_service_areas").
				Where("service_id = ? AND service_area_id = ?", service.ID, areaID).
				Count(&count).Error; err != nil {
				tx.Rollback()
				logrus.Errorf("ServiceService.CreateService error checking existing association: %v", err)
				return nil, err
			}
			
			// Only insert if association doesn't exist
			if count == 0 {
				if err := tx.Exec("INSERT INTO service_service_areas (service_id, service_area_id) VALUES (?, ?)", 
					service.ID, areaID).Error; err != nil {
					tx.Rollback()
					logrus.Errorf("ServiceService.CreateService error inserting association: %v", err)
					return nil, err
				}
				logrus.Infof("ServiceService.CreateService created association: service_id=%d, service_area_id=%d", service.ID, areaID)
			} else {
				logrus.Infof("ServiceService.CreateService association already exists: service_id=%d, service_area_id=%d", service.ID, areaID)
			}
		}
		
		logrus.Infof("ServiceService.CreateService associated %d service areas with service", len(req.ServiceAreaIDs))
		
		// Load service areas within the transaction so we can return them
		var serviceAreas []models.ServiceArea
		if err := tx.Table("service_areas").
			Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
			Where("service_service_areas.service_id = ?", service.ID).
			Find(&serviceAreas).Error; err != nil {
			logrus.Warnf("ServiceService.CreateService error loading service areas: %v", err)
		} else {
			service.ServiceAreas = serviceAreas
			logrus.Infof("ServiceService.CreateService loaded %d service areas", len(serviceAreas))
		}
		
		// Load category within transaction
		if err := tx.Preload("Parent").Preload("Parent.Parent").First(&category, service.CategoryID).Error; err == nil {
			service.Category = category
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		logrus.Errorf("ServiceService.CreateService transaction commit error: %v", err)
		return nil, err
	}

	logrus.Info("ServiceService.CreateService transaction committed successfully")
	logrus.Infof("ServiceService.CreateService returning service with ID: %d", service.ID)

	// Send notification to admins about new service (async, don't block)
	go func() {
		defer func() {
			if r := recover(); r != nil {
				logrus.Errorf("ServiceService.CreateService NotifyServiceAdded panic: %v", r)
			}
		}()
		NotifyServiceAdded(service)
	}()

	return service, nil
}

// GetServiceByID retrieves a service by ID
func (ss *ServiceService) GetServiceByID(id uint) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceByID panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServiceByID called with ID: %d", id)
	
	service, err := ss.serviceRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceService.GetServiceByID service not found with ID: %d", id)
			return nil, err
		}
		logrus.Errorf("ServiceService.GetServiceByID error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServiceByID found service: %s", service.Name)
	return service, nil
}



// GetServiceCategories retrieves all service categories
func (ss *ServiceService) GetServiceCategories() ([]models.Category, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceCategories panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceService.GetServiceCategories called")
	
	var categories []models.Category
	err := ss.serviceRepo.GetDB().Where("is_active = ?", true).Find(&categories).Error
	if err != nil {
		logrus.Errorf("ServiceService.GetServiceCategories error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServiceCategories returning %d categories", len(categories))
	return categories, nil
}

// GetServiceSubcategories retrieves subcategories for a category
func (ss *ServiceService) GetServiceSubcategories(categoryID uint) ([]models.Category, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceSubcategories panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServiceSubcategories called with categoryID: %d", categoryID)
	
	var categories []models.Category
	err := ss.serviceRepo.GetDB().Where("parent_id = ? AND is_active = ?", categoryID, true).Find(&categories).Error
	if err != nil {
		logrus.Errorf("ServiceService.GetServiceSubcategories error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServiceSubcategories returning %d categories", len(categories))
	return categories, nil
}

// GetServicesWithFilters retrieves services with advanced filtering
func (ss *ServiceService) GetServicesWithFilters(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServicesWithFilters panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServicesWithFilters called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive)
	
	services, err := ss.serviceRepo.GetWithFilters(priceType, category, subcategory, priceMin, priceMax, excludeInactive)
	if err != nil {
		logrus.Errorf("ServiceService.GetServicesWithFilters error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServicesWithFilters returning %d services", len(services))
	return services, nil
}

// GetServicesWithFiltersPaginated retrieves services with advanced filtering and pagination
func (ss *ServiceService) GetServicesWithFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.Service, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServicesWithFiltersPaginated panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServicesWithFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v, page: %d, limit: %d", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit)
	
	services, total, err := ss.serviceRepo.GetWithFiltersPaginated(priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit, sortBy, sortOrder)
	if err != nil {
		logrus.Errorf("ServiceService.GetServicesWithFiltersPaginated error: %v", err)
		return nil, 0, err
	}
	
	logrus.Infof("ServiceService.GetServicesWithFiltersPaginated returning %d services (total: %d)", len(services), total)
	return services, total, nil
}

// GetAllServices retrieves all services with optional filtering
func (ss *ServiceService) GetAllServices(excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetAllServices panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetAllServices called with excludeInactive: %v", excludeInactive)
	
	services, err := ss.serviceRepo.GetAll(excludeInactive)
	if err != nil {
		logrus.Errorf("ServiceService.GetAllServices error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetAllServices returning %d services", len(services))
	return services, nil
}

// GetServicesByCategory retrieves services by category ID (includes services in child categories)
func (ss *ServiceService) GetServicesByCategory(categoryID uint, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServicesByCategory panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServicesByCategory called with categoryID: %d, excludeInactive: %v", categoryID, excludeInactive)
	
	services, err := ss.serviceRepo.GetByCategory(categoryID, excludeInactive)
	if err != nil {
		logrus.Errorf("ServiceService.GetServicesByCategory error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServicesByCategory returning %d services", len(services))
	return services, nil
}

// UpdateService updates a service
func (ss *ServiceService) UpdateService(id uint, req *models.UpdateServiceRequest, imageFiles []*multipart.FileHeader) (*models.Service, error) {
	service, err := ss.serviceRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	logrus.Infof("UpdateService: Service ID %d currently has %d images", id, len(service.Images))
	if len(service.Images) > 0 {
		logrus.Infof("UpdateService: Current images: %v", service.Images)
	}

	// Validate price type and price
	if req.PriceType != "" {
		if req.PriceType == "fixed" && req.Price == nil {
			return nil, errors.New("price is required when price_type is fixed")
		}
		if req.PriceType == "inquiry" && req.Price != nil {
			return nil, errors.New("price should not be provided when price_type is inquiry")
		}
		service.PriceType = req.PriceType
	}

	// Update fields if provided
	if req.Name != "" {
		service.Name = req.Name
		service.Slug = utils.GenerateSlug(req.Name)
	}
	if req.Description != "" {
		service.Description = req.Description
	}
	if req.Price != nil {
		// Round price if provided
		roundedPrice := roundServicePrice(req.Price)
		logrus.Infof("UpdateService rounded price from %v to %v", *req.Price, *roundedPrice)
		service.Price = roundedPrice
	}
	if req.Duration != nil {
		service.Duration = req.Duration
	}
	// SubcategoryID removed - services now use single CategoryID
	if req.IsActive != nil {
		service.IsActive = *req.IsActive
	}

	// Upload new images if provided
	if len(imageFiles) > 0 {
		logrus.Infof("UpdateService: Uploading %d new images", len(imageFiles))
		var newImageURLs []string
		for _, file := range imageFiles {
			if file != nil {
				url, err := ss.cloudinary.UploadImage(file, "services")
				if err != nil {
					return nil, err
				}
				newImageURLs = append(newImageURLs, url)
			}
		}
		// Append new images to existing ones
		service.Images = append(service.Images, newImageURLs...)
		logrus.Infof("UpdateService: After adding new images, service now has %d images", len(service.Images))
	}

	logrus.Infof("UpdateService: Saving service with %d images", len(service.Images))
	err = ss.serviceRepo.Update(service)
	if err != nil {
		return nil, err
	}

	return ss.serviceRepo.GetByID(service.ID)
}

// DeleteService deletes a service
func (ss *ServiceService) DeleteService(id uint) error {
	return ss.serviceRepo.Delete(id)
}

// ToggleStatus toggles the active status of a service
func (ss *ServiceService) ToggleStatus(id uint) (*models.Service, error) {
	err := ss.serviceRepo.ToggleStatus(id)
	if err != nil {
		return nil, err
	}
	
	// Return the updated service
	return ss.serviceRepo.GetByID(id)
}

// GetServicesByLocation gets all services available in a specific location
func (ss *ServiceService) GetServicesByLocation(city, state string) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServicesByLocation panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServicesByLocation called with city: %s, state: %s", city, state)
	
	// Get service areas for the location
	serviceAreaRepo := repositories.NewServiceAreaRepository()
	var serviceAreas []models.ServiceArea
	if err := serviceAreaRepo.FindServicesByLocation(&serviceAreas, city, state); err != nil {
		logrus.Errorf("ServiceService.GetServicesByLocation error getting service areas: %v", err)
		return nil, err
	}
	
	// Extract unique service area IDs
	serviceAreaIDs := make([]uint, 0, len(serviceAreas))
	for _, area := range serviceAreas {
		serviceAreaIDs = append(serviceAreaIDs, area.ID)
	}
	
	if len(serviceAreaIDs) == 0 {
		logrus.Infof("ServiceService.GetServicesByLocation no service areas found for location: %s, %s", city, state)
		return []models.Service{}, nil
	}
	
	// Get service IDs from the junction table
	var serviceIDs []uint
	if err := ss.serviceRepo.GetDB().Table("service_service_areas").
		Select("DISTINCT service_id").
		Where("service_area_id IN ?", serviceAreaIDs).
		Pluck("service_id", &serviceIDs).Error; err != nil {
		logrus.Errorf("ServiceService.GetServicesByLocation error getting service IDs: %v", err)
		return nil, err
	}
	
	// Get services
	var services []models.Service
	for _, serviceID := range serviceIDs {
		service, err := ss.serviceRepo.GetByID(serviceID)
		if err != nil {
			logrus.Warnf("ServiceService.GetServicesByLocation failed to get service ID %d: %v", serviceID, err)
			continue
		}
		if service.IsActive {
			services = append(services, *service)
		}
	}
	
	logrus.Infof("ServiceService.GetServicesByLocation returning %d services", len(services))
	return services, nil
}

// GetServiceSummariesWithFiltersPaginated retrieves service summaries with advanced filtering and pagination
func (ss *ServiceService) GetServiceSummariesWithFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.ServiceSummary, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceSummariesWithFiltersPaginated panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServiceSummariesWithFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v, page: %d, limit: %d", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit)
	
	services, total, err := ss.serviceRepo.GetSummariesWithFiltersPaginated(priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit, sortBy, sortOrder)
	if err != nil {
		logrus.Errorf("ServiceService.GetServiceSummariesWithFiltersPaginated error: %v", err)
		return nil, 0, err
	}
	
	logrus.Infof("ServiceService.GetServiceSummariesWithFiltersPaginated returning %d services (total: %d)", len(services), total)
	return services, total, nil
}

// GetServiceSummariesWithLocationFiltersPaginated retrieves service summaries with advanced filtering including location and pagination
func (ss *ServiceService) GetServiceSummariesWithLocationFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, city, state string, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.ServiceSummary, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceSummariesWithLocationFiltersPaginated panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServiceSummariesWithLocationFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, city: %s, state: %s, excludeInactive: %v, page: %d, limit: %d", 
		priceType, category, subcategory, priceMin, priceMax, city, state, excludeInactive, page, limit)
	
	services, total, err := ss.serviceRepo.GetSummariesWithLocationFiltersPaginated(priceType, category, subcategory, priceMin, priceMax, city, state, excludeInactive, page, limit, sortBy, sortOrder)
	if err != nil {
		logrus.Errorf("ServiceService.GetServiceSummariesWithLocationFiltersPaginated error: %v", err)
		return nil, 0, err
	}
	
	logrus.Infof("ServiceService.GetServiceSummariesWithLocationFiltersPaginated returning %d services (total: %d)", len(services), total)
	return services, total, nil
}

// GetPopularServices retrieves the top 8 most popular services
func (ss *ServiceService) GetPopularServices(limit int, city, state string) ([]models.ServiceSummary, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetPopularServices panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetPopularServices called with limit: %d, city: %s, state: %s", limit, city, state)
	
	services, err := ss.serviceRepo.GetPopularServices(limit, city, state)
	if err != nil {
		logrus.Errorf("ServiceService.GetPopularServices error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetPopularServices returning %d popular services", len(services))
	return services, nil
}

// DeleteServiceImage deletes a specific image from a service
func (ss *ServiceService) DeleteServiceImage(serviceID uint, imageURL string) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.DeleteServiceImage panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.DeleteServiceImage called with serviceID: %d, imageURL: %s", serviceID, imageURL)
	
	// Get the service
	service, err := ss.serviceRepo.GetByID(serviceID)
	if err != nil {
		logrus.Errorf("ServiceService.DeleteServiceImage error getting service: %v", err)
		return err
	}
	
	// Find and remove the image URL from the array
	var newImages []string
	imageFound := false
	for _, img := range service.Images {
		if img != imageURL {
			newImages = append(newImages, img)
		} else {
			imageFound = true
		}
	}
	
	if !imageFound {
		logrus.Errorf("ServiceService.DeleteServiceImage image not found in service images")
		return errors.New("image not found in service")
	}
	
	// Update the service with the new images array
	service.Images = pq.StringArray(newImages)
	err = ss.serviceRepo.Update(service)
	if err != nil {
		logrus.Errorf("ServiceService.DeleteServiceImage error updating service: %v", err)
		return err
	}
	
	// Delete the image from Cloudinary
	if ss.cloudinary != nil {
		publicID := ss.cloudinary.GetPublicIDFromURL(imageURL)
		if publicID != "" {
			if deleteErr := ss.cloudinary.DeleteImage(publicID); deleteErr != nil {
				logrus.Warnf("ServiceService.DeleteServiceImage failed to delete image from Cloudinary: %v", deleteErr)
				// Don't return error as the database update was successful
			} else {
				logrus.Infof("ServiceService.DeleteServiceImage successfully deleted image from Cloudinary: %s", publicID)
			}
		}
	}
	
	logrus.Infof("ServiceService.DeleteServiceImage successfully deleted image from service")
	return nil
}
