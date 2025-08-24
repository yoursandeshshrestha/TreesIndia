package repositories

import (
	"errors"
	"strconv"
	"time"
	"treesindia/models"

	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ServiceRepository struct {
	BaseRepository
}

func NewServiceRepository() *ServiceRepository {
	return &ServiceRepository{
		BaseRepository: *NewBaseRepository(),
	}
}

// Create creates a new service
func (sr *ServiceRepository) Create(service *models.Service) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.Create panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.Create called for service: %s", service.Name)
	logrus.Infof("ServiceRepository.Create service data: CategoryID=%d, SubcategoryID=%d", service.CategoryID, service.SubcategoryID)
	
	// First, let's verify the subcategory exists
	var subcategory models.Subcategory
	if err := sr.GetDB().First(&subcategory, service.SubcategoryID).Error; err != nil {
		logrus.Errorf("ServiceRepository.Create subcategory lookup failed: %v", err)
		return err
	}
	logrus.Infof("ServiceRepository.Create found subcategory: ID=%d, Name=%s, ParentID=%d", subcategory.ID, subcategory.Name, subcategory.ParentID)
	
	// Also verify the category exists
	var category models.Category
	if err := sr.GetDB().First(&category, service.CategoryID).Error; err != nil {
		logrus.Errorf("ServiceRepository.Create category lookup failed: %v", err)
		return err
	}
	logrus.Infof("ServiceRepository.Create found category: ID=%d, Name=%s", category.ID, category.Name)
	
	err := sr.GetDB().Create(service).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.Create database error: %v", err)
		return err
	}
	
	logrus.Infof("ServiceRepository.Create successfully created service with ID: %d", service.ID)
	return nil
}

// GetByID retrieves a service by ID
func (sr *ServiceRepository) GetByID(id uint) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetByID panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetByID called with ID: %d", id)
	
	var service models.Service
	err := sr.GetDB().Preload("ServiceAreas").First(&service, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceRepository.GetByID service not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("ServiceRepository.GetByID database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetByID found service: %s with %d service areas", service.Name, len(service.ServiceAreas))
	return &service, nil
}

// GetByIDWithRelations retrieves a service by ID with preloaded relationships
func (sr *ServiceRepository) GetByIDWithRelations(id uint) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetByIDWithRelations panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetByIDWithRelations called with ID: %d", id)
	
	var service models.Service
	err := sr.GetDB().Preload("Subcategory").Preload("ServiceAreas").First(&service, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceRepository.GetByIDWithRelations service not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("ServiceRepository.GetByIDWithRelations database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetByIDWithRelations found service: %s", service.Name)
	return &service, nil
}

// GetWithFilters retrieves services with advanced filtering
func (sr *ServiceRepository) GetWithFilters(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetWithFilters panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetWithFilters called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive)
	
	var services []models.Service
	query := sr.GetDB().Preload("Category").Preload("Subcategory").Preload("ServiceAreas")
	
	// Filter by price type
	if priceType != nil {
		query = query.Where("price_type = ?", *priceType)
	}
	
	// Filter by category (by name or ID)
	if category != nil {
		// Try to parse as ID first
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			query = query.Where("category_id = ?", categoryID)
		} else {
			// If not a number, treat as category name
			query = query.Joins("JOIN categories ON services.category_id = categories.id").
				Where("categories.name ILIKE ?", "%"+*category+"%")
		}
	}
	
	// Filter by subcategory (by name or ID)
	if subcategory != nil {
		// Try to parse as ID first
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			query = query.Where("subcategory_id = ?", subcategoryID)
		} else {
			// If not a number, treat as subcategory name
			query = query.Joins("JOIN subcategories ON services.subcategory_id = subcategories.id").
				Where("subcategories.name ILIKE ?", "%"+*subcategory+"%")
		}
	}
	
	// Filter by price range
	if priceMin != nil {
		query = query.Where("price >= ?", *priceMin)
	}
	if priceMax != nil {
		query = query.Where("price <= ?", *priceMax)
	}
	
	// Filter by active status
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Find(&services).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.GetWithFilters database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetWithFilters found %d services", len(services))
	return services, nil
}

// GetWithFiltersPaginated retrieves services with advanced filtering and pagination
func (sr *ServiceRepository) GetWithFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.Service, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetWithFiltersPaginated panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetWithFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v, page: %d, limit: %d", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit)
	
	var services []models.Service
	var total int64
	
	// Build base query
	query := sr.GetDB().Preload("Category").Preload("Subcategory").Preload("ServiceAreas")
	
	// Filter by price type
	if priceType != nil {
		query = query.Where("price_type = ?", *priceType)
	}
	
	// Filter by category (by name or ID)
	if category != nil {
		// Try to parse as ID first
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			query = query.Where("category_id = ?", categoryID)
		} else {
			// If not a number, treat as category name
			query = query.Joins("JOIN categories ON services.category_id = categories.id").
				Where("categories.name ILIKE ?", "%"+*category+"%")
		}
	}
	
	// Filter by subcategory (by name or ID)
	if subcategory != nil {
		// Try to parse as ID first
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			query = query.Where("subcategory_id = ?", subcategoryID)
		} else {
			// If not a number, treat as subcategory name
			query = query.Joins("JOIN subcategories ON services.subcategory_id = subcategories.id").
				Where("subcategories.name ILIKE ?", "%"+*subcategory+"%")
		}
	}
	
	// Filter by price range
	if priceMin != nil {
		query = query.Where("price >= ?", *priceMin)
	}
	if priceMax != nil {
		query = query.Where("price <= ?", *priceMax)
	}
	
	// Filter by active status
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	// Apply sorting
	if sortBy != "" {
		orderClause := sortBy
		if sortOrder == "desc" {
			orderClause += " DESC"
		} else {
			orderClause += " ASC"
		}
		query = query.Order(orderClause)
	} else {
		// Default sorting by name ascending
		query = query.Order("services.name ASC")
	}
	
	// Get total count using a separate query to avoid join issues
	countQuery := sr.GetDB().Model(&models.Service{})
	
	// Apply the same filters to count query
	if priceType != nil {
		countQuery = countQuery.Where("price_type = ?", *priceType)
	}
	
	if category != nil {
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			countQuery = countQuery.Where("category_id = ?", categoryID)
		} else {
			countQuery = countQuery.Joins("JOIN categories ON services.category_id = categories.id").
				Where("categories.name ILIKE ?", "%"+*category+"%")
		}
	}
	
	if subcategory != nil {
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			countQuery = countQuery.Where("subcategory_id = ?", subcategoryID)
		} else {
			countQuery = countQuery.Joins("JOIN subcategories ON services.subcategory_id = subcategories.id").
				Where("subcategories.name ILIKE ?", "%"+*subcategory+"%")
		}
	}
	
	if priceMin != nil {
		countQuery = countQuery.Where("price >= ?", *priceMin)
	}
	if priceMax != nil {
		countQuery = countQuery.Where("price <= ?", *priceMax)
	}
	
	if excludeInactive {
		countQuery = countQuery.Where("is_active = ?", true)
	}
	
	if err := countQuery.Count(&total).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetWithFiltersPaginated count error: %v", err)
		return nil, 0, err
	}
	
	// Apply pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&services).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetWithFiltersPaginated database error: %v", err)
		return nil, 0, err
	}
	
	logrus.Infof("ServiceRepository.GetWithFiltersPaginated found %d services (total: %d)", len(services), total)
	return services, total, nil
}

// GetAll retrieves all services with optional filtering
func (sr *ServiceRepository) GetAll(excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetAll panic: %v", r)
		}
	}()
	
	var services []models.Service
	query := sr.GetDB().Preload("ServiceAreas")
	
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Find(&services).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.GetAll database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetAll found %d services", len(services))
	return services, nil
}

// GetBySubcategory retrieves services by subcategory ID
func (sr *ServiceRepository) GetBySubcategory(subcategoryID uint, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetBySubcategory panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetBySubcategory called with subcategoryID: %d, excludeInactive: %v", subcategoryID, excludeInactive)
	
	var services []models.Service
	query := sr.GetDB().Preload("ServiceAreas").Where("subcategory_id = ?", subcategoryID)
	
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Find(&services).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.GetBySubcategory database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetBySubcategory found %d services", len(services))
	return services, nil
}

// Update updates a service
func (sr *ServiceRepository) Update(service *models.Service) error {
	return sr.GetDB().Save(service).Error
}

// Delete deletes a service
func (sr *ServiceRepository) Delete(id uint) error {
	return sr.GetDB().Delete(&models.Service{}, id).Error
}

// ToggleStatus toggles the active status of a service
func (sr *ServiceRepository) ToggleStatus(id uint) error {
	return sr.GetDB().Model(&models.Service{}).Where("id = ?", id).Update("is_active", gorm.Expr("NOT is_active")).Error
}

// GetSummariesWithFiltersPaginated retrieves service summaries with advanced filtering and pagination
func (sr *ServiceRepository) GetSummariesWithFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.ServiceSummary, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetSummariesWithFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v, page: %d, limit: %d", 
		priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit)
	
	// Temporary struct for raw SQL result
	type ServiceSummaryRaw struct {
		ID              uint           `json:"id"`
		Name            string         `json:"name"`
		Slug            string         `json:"slug"`
		Description     string         `json:"description"`
		Images          pq.StringArray `json:"images"`
		PriceType       string         `json:"price_type"`
		Price           *float64       `json:"price"`
		Duration        *string        `json:"duration"`
		CategoryID      uint           `json:"category_id"`
		SubcategoryID   uint           `json:"subcategory_id"`
		IsActive        bool           `json:"is_active"`
		CreatedAt       time.Time      `json:"created_at"`
		UpdatedAt       time.Time      `json:"updated_at"`
		DeletedAt       gorm.DeletedAt `json:"deleted_at"`
		CategoryName    string         `json:"category_name"`
		SubcategoryName string         `json:"subcategory_name"`
	}
	
	var servicesRaw []ServiceSummaryRaw
	var total int64
	
	// Build base query with joins to get category and subcategory names
	query := sr.GetDB().Table("services").
		Select("services.id, services.name, services.slug, services.description, services.images, services.price_type, services.price, services.duration, services.category_id, services.subcategory_id, services.is_active, services.created_at, services.updated_at, services.deleted_at, categories.name as category_name, subcategories.name as subcategory_name").
		Joins("LEFT JOIN categories ON services.category_id = categories.id").
		Joins("LEFT JOIN subcategories ON services.subcategory_id = subcategories.id")
	
	// Filter by price type
	if priceType != nil {
		query = query.Where("services.price_type = ?", *priceType)
	}
	
	// Filter by category (by name or ID)
	if category != nil {
		// Try to parse as ID first
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			query = query.Where("services.category_id = ?", categoryID)
		} else {
			// If not a number, treat as category name
			query = query.Where("categories.name ILIKE ?", "%"+*category+"%")
		}
	}
	
	// Filter by subcategory (by name or ID)
	if subcategory != nil {
		// Try to parse as ID first
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			query = query.Where("services.subcategory_id = ?", subcategoryID)
		} else {
			// If not a number, treat as subcategory name
			query = query.Where("subcategories.name ILIKE ?", "%"+*subcategory+"%")
		}
	}
	
	// Filter by price range
	if priceMin != nil {
		query = query.Where("services.price >= ?", *priceMin)
	}
	if priceMax != nil {
		query = query.Where("services.price <= ?", *priceMax)
	}
	
	// Filter by active status
	if excludeInactive {
		query = query.Where("services.is_active = ?", true)
	}
	
	// Apply sorting
	if sortBy != "" {
		orderClause := "services." + sortBy
		if sortOrder == "desc" {
			orderClause += " DESC"
		} else {
			orderClause += " ASC"
		}
		query = query.Order(orderClause)
	} else {
		// Default sorting by name ascending
		query = query.Order("services.name ASC")
	}
	
	// Get total count using a separate query to avoid join issues
	countQuery := sr.GetDB().Model(&models.Service{})
	
	// Apply the same filters to count query
	if priceType != nil {
		countQuery = countQuery.Where("price_type = ?", *priceType)
	}
	
	if category != nil {
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			countQuery = countQuery.Where("category_id = ?", categoryID)
		} else {
			countQuery = countQuery.Joins("JOIN categories ON services.category_id = categories.id").
				Where("categories.name ILIKE ?", "%"+*category+"%")
		}
	}
	
	if subcategory != nil {
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			countQuery = countQuery.Where("subcategory_id = ?", subcategoryID)
		} else {
			countQuery = countQuery.Joins("JOIN subcategories ON services.subcategory_id = subcategories.id").
				Where("subcategories.name ILIKE ?", "%"+*subcategory+"%")
		}
	}
	
	if priceMin != nil {
		countQuery = countQuery.Where("price >= ?", *priceMin)
	}
	if priceMax != nil {
		countQuery = countQuery.Where("price <= ?", *priceMax)
	}
	
	if excludeInactive {
		countQuery = countQuery.Where("is_active = ?", true)
	}
	
	if err := countQuery.Count(&total).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated count error: %v", err)
		return nil, 0, err
	}
	
	// Apply pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&servicesRaw).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated database error: %v", err)
		return nil, 0, err
	}
	
	// Convert raw results to ServiceSummary and fetch service areas
	var services []models.ServiceSummary
	for _, raw := range servicesRaw {
		// Fetch service areas for this service (only essential fields)
		var serviceAreasRaw []struct {
			ID       uint   `json:"id"`
			City     string `json:"city"`
			State    string `json:"state"`
			Country  string `json:"country"`
			IsActive bool   `json:"is_active"`
		}
		if err := sr.GetDB().Table("service_areas").
			Select("service_areas.id, service_areas.city, service_areas.state, service_areas.country, service_areas.is_active").
			Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
			Where("service_service_areas.service_id = ?", raw.ID).
			Find(&serviceAreasRaw).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated error fetching service areas for service %d: %v", raw.ID, err)
			continue
		}
		
		// Convert to ServiceAreaSummary
		var serviceAreas []models.ServiceAreaSummary
		for _, areaRaw := range serviceAreasRaw {
			serviceAreas = append(serviceAreas, models.ServiceAreaSummary{
				ID:       areaRaw.ID,
				City:     areaRaw.City,
				State:    areaRaw.State,
				Country:  areaRaw.Country,
				IsActive: areaRaw.IsActive,
			})
		}
		
		// Convert to ServiceSummary
		service := models.ServiceSummary{
			ID:              raw.ID,
			Name:            raw.Name,
			Slug:            raw.Slug,
			Description:     raw.Description,
			Images:          raw.Images,
			PriceType:       raw.PriceType,
			Price:           raw.Price,
			Duration:        raw.Duration,
			CategoryID:      raw.CategoryID,
			SubcategoryID:   raw.SubcategoryID,
			CategoryName:    raw.CategoryName,
			SubcategoryName: raw.SubcategoryName,
			IsActive:        raw.IsActive,
			CreatedAt:       raw.CreatedAt,
			UpdatedAt:       raw.UpdatedAt,
			DeletedAt:       raw.DeletedAt,
			ServiceAreas:    serviceAreas,
		}
		services = append(services, service)
	}
	
	logrus.Infof("ServiceRepository.GetSummariesWithFiltersPaginated found %d services (total: %d)", len(services), total)
	return services, total, nil
}

// AssociateServiceAreas associates service areas with a service using many-to-many relationship
func (sr *ServiceRepository) AssociateServiceAreas(serviceID uint, serviceAreaIDs []uint) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.AssociateServiceAreas panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.AssociateServiceAreas called for service ID: %d with %d service area IDs", serviceID, len(serviceAreaIDs))
	
	// Begin transaction
	tx := sr.GetDB().Begin()
	if tx.Error != nil {
		logrus.Errorf("ServiceRepository.AssociateServiceAreas transaction begin error: %v", tx.Error)
		return tx.Error
	}
	
	// Rollback on error
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	
	// Insert associations into the junction table
	for _, areaID := range serviceAreaIDs {
		// Check if association already exists
		var count int64
		if err := tx.Table("service_service_areas").
			Where("service_id = ? AND service_area_id = ?", serviceID, areaID).
			Count(&count).Error; err != nil {
			logrus.Errorf("ServiceRepository.AssociateServiceAreas error checking existing association: %v", err)
			tx.Rollback()
			return err
		}
		
		// Only insert if association doesn't exist
		if count == 0 {
			if err := tx.Exec("INSERT INTO service_service_areas (service_id, service_area_id) VALUES (?, ?)", 
				serviceID, areaID).Error; err != nil {
				logrus.Errorf("ServiceRepository.AssociateServiceAreas error inserting association: %v", err)
				tx.Rollback()
				return err
			}
			logrus.Infof("ServiceRepository.AssociateServiceAreas created association: service_id=%d, service_area_id=%d", serviceID, areaID)
		} else {
			logrus.Infof("ServiceRepository.AssociateServiceAreas association already exists: service_id=%d, service_area_id=%d", serviceID, areaID)
		}
	}
	
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		logrus.Errorf("ServiceRepository.AssociateServiceAreas transaction commit error: %v", err)
		return err
	}
	
	logrus.Infof("ServiceRepository.AssociateServiceAreas successfully associated %d service areas with service ID: %d", len(serviceAreaIDs), serviceID)
	return nil
}
