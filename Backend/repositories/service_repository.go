package repositories

import (
	"errors"
	"strconv"
	"treesindia/models"

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
	err := sr.GetDB().First(&service, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceRepository.GetByID service not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("ServiceRepository.GetByID database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetByID found service: %s", service.Name)
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
	err := sr.GetDB().Preload("Subcategory").First(&service, id).Error
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
	query := sr.GetDB().Preload("Category").Preload("Subcategory")
	
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
	query := sr.GetDB().Preload("Category").Preload("Subcategory")
	
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
	query := sr.GetDB()
	
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
	query := sr.GetDB().Where("subcategory_id = ?", subcategoryID)
	
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
