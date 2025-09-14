package services

import (
	"errors"
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

	service := &models.Service{
		Name:          req.Name,
		Slug:          slug,
		Description:   req.Description,
		Images:        pq.StringArray(imageURLs),
		PriceType:     req.PriceType,
		Price:         req.Price,
		Duration:      req.Duration,
		CategoryID:    req.CategoryID,
		SubcategoryID: req.SubcategoryID,
		IsActive:      isActive,
	}

	logrus.Info("ServiceService.CreateService calling repository.Create")
	err := ss.serviceRepo.Create(service)
	if err != nil {
		logrus.Errorf("ServiceService.CreateService repository.Create error: %v", err)
		return nil, err
	}

	logrus.Infof("ServiceService.CreateService service created with ID: %d", service.ID)

	// Associate service areas with the service using many-to-many relationship
	if len(req.ServiceAreaIDs) > 0 {
		err = ss.serviceRepo.AssociateServiceAreas(service.ID, req.ServiceAreaIDs)
		if err != nil {
			logrus.Errorf("ServiceService.CreateService failed to associate service areas: %v", err)
			// Clean up the created service if association fails
			ss.serviceRepo.Delete(service.ID)
			return nil, err
		}
		logrus.Infof("ServiceService.CreateService associated %d service areas with service", len(req.ServiceAreaIDs))
	}

	// Fetch the created service with service areas
	logrus.Info("ServiceService.CreateService fetching created service")
	createdService, err := ss.serviceRepo.GetByID(service.ID)
	if err != nil {
		return nil, err
	}

	// Send notification to admins about new service
	go NotifyServiceAdded(createdService)

	return createdService, nil
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
func (ss *ServiceService) GetServiceSubcategories(categoryID uint) ([]models.Subcategory, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServiceSubcategories panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServiceSubcategories called with categoryID: %d", categoryID)
	
	var subcategories []models.Subcategory
	err := ss.serviceRepo.GetDB().Where("parent_id = ? AND is_active = ?", categoryID, true).Find(&subcategories).Error
	if err != nil {
		logrus.Errorf("ServiceService.GetServiceSubcategories error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServiceSubcategories returning %d subcategories", len(subcategories))
	return subcategories, nil
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

// GetServicesBySubcategory retrieves services by subcategory ID
func (ss *ServiceService) GetServicesBySubcategory(subcategoryID uint, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceService.GetServicesBySubcategory panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceService.GetServicesBySubcategory called with subcategoryID: %d, excludeInactive: %v", subcategoryID, excludeInactive)
	
	services, err := ss.serviceRepo.GetBySubcategory(subcategoryID, excludeInactive)
	if err != nil {
		logrus.Errorf("ServiceService.GetServicesBySubcategory error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceService.GetServicesBySubcategory returning %d services", len(services))
	return services, nil
}

// UpdateService updates a service
func (ss *ServiceService) UpdateService(id uint, req *models.UpdateServiceRequest, imageFiles []*multipart.FileHeader) (*models.Service, error) {
	service, err := ss.serviceRepo.GetByID(id)
	if err != nil {
		return nil, err
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
		service.Price = req.Price
	}
	if req.Duration != nil {
		service.Duration = req.Duration
	}
	if req.SubcategoryID != nil {
		service.SubcategoryID = *req.SubcategoryID
	}
	if req.IsActive != nil {
		service.IsActive = *req.IsActive
	}

	// Upload new images if provided
	if len(imageFiles) > 0 {
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
	}

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
