package repositories

import (
	"errors"
	"sort"
	"strconv"
	"strings"
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
	logrus.Infof("ServiceRepository.Create service data: CategoryID=%d", service.CategoryID)

	// Verify the category exists
	var category models.Category
	if err := sr.GetDB().First(&category, service.CategoryID).Error; err != nil {
		logrus.Errorf("ServiceRepository.Create category lookup failed: %v", err)
		return err
	}
	logrus.Infof("ServiceRepository.Create found category: ID=%d, Name=%s, Level=%d", category.ID, category.Name, category.GetLevel())

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
	err := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas").First(&service, id).Error
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
	err := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas").First(&service, id).Error
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
	query := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas")

	// Filter by price type
	if priceType != nil {
		query = query.Where("price_type = ?", *priceType)
	}

	// Filter by category (by name or ID) - can be any level
	if category != nil {
		// Try to parse as ID first
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			// Filter by exact category ID or any of its descendants
			query = query.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?) OR category_id IN (SELECT id FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE parent_id = ?))",
				categoryID, categoryID, categoryID)
		} else {
			// If not a number, treat as category name (searches in category hierarchy including parent categories)
			query = query.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Joins("LEFT JOIN categories grandparent ON parent.parent_id = grandparent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ? OR grandparent.name ILIKE ?)", "%"+*category+"%", "%"+*category+"%", "%"+*category+"%")
		}
	}

	// Filter by subcategory (now treated as a category filter - for backward compatibility)
	// This can filter by Level 2 categories or their children
	if subcategory != nil {
		// Try to parse as ID first
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			// Filter by this category or its children (Level 3)
			query = query.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)",
				subcategoryID, subcategoryID)
		} else {
			// If not a number, treat as category name
			query = query.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ?)", "%"+*subcategory+"%", "%"+*subcategory+"%")
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
	query := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas")

	// Filter by price type
	if priceType != nil {
		query = query.Where("price_type = ?", *priceType)
	}

	// Filter by category (by name or ID) - can be any level
	if category != nil {
		// Try to parse as ID first
		if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
			// Filter by exact category ID or any of its descendants
			query = query.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?) OR category_id IN (SELECT id FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE parent_id = ?))",
				categoryID, categoryID, categoryID)
		} else {
			// If not a number, treat as category name (searches in category hierarchy including parent categories)
			query = query.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Joins("LEFT JOIN categories grandparent ON parent.parent_id = grandparent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ? OR grandparent.name ILIKE ?)", "%"+*category+"%", "%"+*category+"%", "%"+*category+"%")
		}
	}

	// Filter by subcategory (now treated as a category filter - for backward compatibility)
	if subcategory != nil {
		// Try to parse as ID first
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			// Filter by this category or its children (Level 3)
			query = query.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)",
				subcategoryID, subcategoryID)
		} else {
			// If not a number, treat as category name
			query = query.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ?)", "%"+*subcategory+"%", "%"+*subcategory+"%")
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
			// Filter by exact category ID or any of its descendants
			countQuery = countQuery.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?) OR category_id IN (SELECT id FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE parent_id = ?))",
				categoryID, categoryID, categoryID)
		} else {
			// If not a number, treat as category name (searches in category hierarchy including parent categories)
			countQuery = countQuery.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Joins("LEFT JOIN categories grandparent ON parent.parent_id = grandparent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ? OR grandparent.name ILIKE ?)", "%"+*category+"%", "%"+*category+"%", "%"+*category+"%")
		}
	}

	if subcategory != nil {
		if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
			// Filter by this category or its children (Level 3)
			countQuery = countQuery.Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)",
				subcategoryID, subcategoryID)
		} else {
			countQuery = countQuery.Joins("JOIN categories cat ON services.category_id = cat.id").
				Joins("LEFT JOIN categories parent ON cat.parent_id = parent.id").
				Where("(cat.name ILIKE ? OR parent.name ILIKE ?)", "%"+*subcategory+"%", "%"+*subcategory+"%")
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
	query := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas")

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

// GetByCategory retrieves services by category ID (includes services in child categories)
func (sr *ServiceRepository) GetByCategory(categoryID uint, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetByCategory panic: %v", r)
		}
	}()

	logrus.Infof("ServiceRepository.GetByCategory called with categoryID: %d, excludeInactive: %v", categoryID, excludeInactive)

	var services []models.Service
	// Get services in this category or any of its children (Level 3)
	query := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas").
		Where("category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)", categoryID, categoryID)

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
	// Use Omit to exclude preloaded relationships from being saved
	// This prevents issues when service has preloaded Category, ServiceAreas, etc.
	return sr.GetDB().Model(service).
		Omit("Category", "ServiceAreas", "CreatedAt").
		Save(service).Error
}

// Delete deletes a service
func (sr *ServiceRepository) Delete(id uint) error {
	return sr.GetDB().Delete(&models.Service{}, id).Error
}

// ToggleStatus toggles the active status of a service
func (sr *ServiceRepository) ToggleStatus(id uint) error {
	return sr.GetDB().Model(&models.Service{}).Where("id = ?", id).Update("is_active", gorm.Expr("NOT is_active")).Error
}

// GetSummariesWithFiltersPaginated retrieves service summaries with advanced filtering and pagination (without location filtering)
func (sr *ServiceRepository) GetSummariesWithFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.ServiceSummary, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated panic: %v", r)
		}
	}()

	logrus.Infof("ServiceRepository.GetSummariesWithFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, excludeInactive: %v, page: %d, limit: %d",
		priceType, category, subcategory, priceMin, priceMax, excludeInactive, page, limit)

	// Use the same approach as GetByID - get all services first, then filter and paginate
	var allServices []models.Service
	query := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas")

	// Get all services first (like GetByID does)
	if err := query.Find(&allServices).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetSummariesWithFiltersPaginated database error: %v", err)
		return nil, 0, err
	}

	// Apply filters in memory (since we're using the same approach as GetByID)
	var filteredServices []models.Service
	for _, service := range allServices {
		// Filter by price type
		if priceType != nil && service.PriceType != *priceType {
			continue
		}

		// Filter by category
		if category != nil {
			if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
				// Check if service category matches or is a descendant of the category
				var cat models.Category
				if err := sr.GetDB().Preload("Parent").Preload("Parent.Parent").First(&cat, service.CategoryID).Error; err != nil {
					continue
				}
				matched := false
				if cat.ID == uint(categoryID) {
					matched = true
				} else if cat.ParentID != nil && *cat.ParentID == uint(categoryID) {
					// Direct child
					matched = true
				} else if cat.Parent != nil && cat.Parent.ParentID != nil && *cat.Parent.ParentID == uint(categoryID) {
					// Grandchild
					matched = true
				}
				if !matched {
					continue
				}
			} else {
				// Get category with parent hierarchy
				var cat models.Category
				if err := sr.GetDB().Preload("Parent").Preload("Parent.Parent").First(&cat, service.CategoryID).Error; err != nil {
					continue
				}
				// Check category name in current, parent, or grandparent
				matched := strings.Contains(strings.ToLower(cat.Name), strings.ToLower(*category))
				if !matched && cat.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Name), strings.ToLower(*category))
				}
				if !matched && cat.Parent != nil && cat.Parent.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Parent.Name), strings.ToLower(*category))
				}
				if !matched {
					continue
				}
			}
		}

		// Filter by subcategory (now treated as category filter)
		if subcategory != nil {
			if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
				// Check if service category matches or is a child of the subcategory
				var cat models.Category
				if err := sr.GetDB().First(&cat, service.CategoryID).Error; err != nil {
					continue
				}
				// Check if category is the subcategory or a child of it
				if cat.ID != uint(subcategoryID) && (cat.ParentID == nil || *cat.ParentID != uint(subcategoryID)) {
					continue
				}
			} else {
				// Get category and check name match
				var cat models.Category
				if err := sr.GetDB().Preload("Parent").First(&cat, service.CategoryID).Error; err != nil {
					continue
				}
				matched := strings.Contains(strings.ToLower(cat.Name), strings.ToLower(*subcategory))
				if !matched && cat.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Name), strings.ToLower(*subcategory))
				}
				if !matched {
					continue
				}
			}
		}

		// Filter by price range
		if priceMin != nil && service.Price != nil && *service.Price < *priceMin {
			continue
		}
		if priceMax != nil && service.Price != nil && *service.Price > *priceMax {
			continue
		}

		// Filter by active status
		if excludeInactive && !service.IsActive {
			continue
		}

		filteredServices = append(filteredServices, service)
	}

	total := int64(len(filteredServices))

	// Apply sorting
	if sortBy != "" {
		sort.Slice(filteredServices, func(i, j int) bool {
			switch sortBy {
			case "name":
				if sortOrder == "desc" {
					return filteredServices[i].Name > filteredServices[j].Name
				}
				return filteredServices[i].Name < filteredServices[j].Name
			case "created_at":
				if sortOrder == "desc" {
					return filteredServices[i].CreatedAt.After(filteredServices[j].CreatedAt)
				}
				return filteredServices[i].CreatedAt.Before(filteredServices[j].CreatedAt)
			default:
				return filteredServices[i].Name < filteredServices[j].Name
			}
		})
	} else {
		// Default sorting by name ascending
		sort.Slice(filteredServices, func(i, j int) bool {
			return filteredServices[i].Name < filteredServices[j].Name
		})
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(filteredServices) {
		start = len(filteredServices)
	}
	if end > len(filteredServices) {
		end = len(filteredServices)
	}

	var paginatedServices []models.Service
	if start < len(filteredServices) {
		paginatedServices = filteredServices[start:end]
	}

	// Convert to ServiceSummary (same as GetByID approach)
	var serviceSummaries []models.ServiceSummary
	for _, service := range paginatedServices {
		// Convert service areas to ServiceAreaSummary
		var serviceAreas []models.ServiceAreaSummary
		for _, area := range service.ServiceAreas {
			serviceAreas = append(serviceAreas, models.ServiceAreaSummary{
				ID:       area.ID,
				City:     area.City,
				State:    area.State,
				Country:  area.Country,
				IsActive: area.IsActive,
			})
		}

		// Get category name and path from preloaded category
		var categoryName string
		var categoryPath string
		if service.Category.ID > 0 {
			categoryName = service.Category.Name
			categoryPath = models.BuildCategoryPath(&service.Category)
		}

		// Convert to ServiceSummary
		serviceSummary := models.ServiceSummary{
			ID:           service.ID,
			Name:         service.Name,
			Slug:         service.Slug,
			Description:  service.Description,
			Images:       service.Images,
			PriceType:    service.PriceType,
			Price:        service.Price,
			Duration:     service.Duration,
			CategoryID:   service.CategoryID,
			CategoryName: categoryName,
			CategoryPath: categoryPath,
			IsActive:     service.IsActive,
			CreatedAt:    service.CreatedAt,
			UpdatedAt:    service.UpdatedAt,
			DeletedAt:    service.DeletedAt,
			ServiceAreas: serviceAreas,
		}
		serviceSummaries = append(serviceSummaries, serviceSummary)
	}

	logrus.Infof("ServiceRepository.GetSummariesWithFiltersPaginated found %d services (total: %d)", len(serviceSummaries), total)
	return serviceSummaries, total, nil
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

// GetPopularServices retrieves the top 8 most popular services
// For now, this returns the most recently created active services
// In the future, this could be based on booking count, views, or other metrics
func (sr *ServiceRepository) GetPopularServices(limit int, city, state string) ([]models.ServiceSummary, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetPopularServices panic: %v", r)
		}
	}()

	logrus.Infof("ServiceRepository.GetPopularServices called with limit: %d, city: %s, state: %s", limit, city, state)

	var services []models.Service

	// Apply location filtering if city and/or state are provided
	if city != "" || state != "" {
		// Use a subquery approach to get distinct service IDs first, then fetch the full service data
		var serviceIDs []uint
		subQuery := sr.GetDB().Table("services").
			Select("DISTINCT services.id").
			Joins("JOIN service_service_areas ON services.id = service_service_areas.service_id").
			Joins("JOIN service_areas ON service_service_areas.service_area_id = service_areas.id").
			Where("services.is_active = ?", true)

		if city != "" && state != "" {
			// Both city and state provided
			subQuery = subQuery.Where("service_areas.city ILIKE ? AND service_areas.state ILIKE ? AND service_areas.is_active = ?",
				"%"+city+"%", "%"+state+"%", true)
		} else if city != "" {
			// Only city provided
			subQuery = subQuery.Where("service_areas.city ILIKE ? AND service_areas.is_active = ?",
				"%"+city+"%", true)
		} else if state != "" {
			// Only state provided
			subQuery = subQuery.Where("service_areas.state ILIKE ? AND service_areas.is_active = ?",
				"%"+state+"%", true)
		}

		// Get the distinct service IDs
		if err := subQuery.Pluck("id", &serviceIDs).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetPopularServices subquery error: %v", err)
			return nil, err
		}

		if len(serviceIDs) == 0 {
			// No services found for the location
			return []models.ServiceSummary{}, nil
		}

		// Fetch the full service data for the found IDs, ordered by creation date
		if err := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").
			Where("id IN ?", serviceIDs).
			Order("created_at DESC").
			Limit(limit).
			Find(&services).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetPopularServices database error: %v", err)
			return nil, err
		}
	} else {
		// No location filtering, get all active services
		if err := sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").
			Where("is_active = ?", true).
			Order("created_at DESC").
			Limit(limit).
			Find(&services).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetPopularServices database error: %v", err)
			return nil, err
		}
	}

	// Convert to ServiceSummary format
	var serviceSummaries []models.ServiceSummary
	for _, service := range services {
		// Get category name and path from preloaded category
		var categoryName string
		var categoryPath string
		if service.Category.ID > 0 {
			categoryName = service.Category.Name
			categoryPath = models.BuildCategoryPath(&service.Category)
		}
		// Get service areas
		var serviceAreas []models.ServiceAreaSummary
		if err := sr.GetDB().Table("service_service_areas").
			Select("service_areas.id, service_areas.city, service_areas.state, service_areas.country, service_areas.is_active").
			Joins("JOIN service_areas ON service_service_areas.service_area_id = service_areas.id").
			Where("service_service_areas.service_id = ?", service.ID).
			Find(&serviceAreas).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetPopularServices error getting service areas: %v", err)
		}

		// Convert to ServiceSummary
		serviceSummary := models.ServiceSummary{
			ID:           service.ID,
			Name:         service.Name,
			Slug:         service.Slug,
			Description:  service.Description,
			Images:       service.Images,
			PriceType:    service.PriceType,
			Price:        service.Price,
			Duration:     service.Duration,
			CategoryID:   service.CategoryID,
			CategoryName: categoryName,
			CategoryPath: categoryPath,
			IsActive:     service.IsActive,
			CreatedAt:    service.CreatedAt,
			UpdatedAt:    service.UpdatedAt,
			DeletedAt:    service.DeletedAt,
			ServiceAreas: serviceAreas,
		}
		serviceSummaries = append(serviceSummaries, serviceSummary)
	}

	logrus.Infof("ServiceRepository.GetPopularServices found %d popular services", len(serviceSummaries))
	return serviceSummaries, nil
}

// GetSummariesWithLocationFiltersPaginated retrieves service summaries with advanced filtering including location and pagination
func (sr *ServiceRepository) GetSummariesWithLocationFiltersPaginated(priceType *string, category *string, subcategory *string, priceMin *float64, priceMax *float64, city, state, search string, excludeInactive bool, page int, limit int, sortBy string, sortOrder string) ([]models.ServiceSummary, int64, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetSummariesWithLocationFiltersPaginated panic: %v", r)
		}
	}()

	logrus.Infof("ServiceRepository.GetSummariesWithLocationFiltersPaginated called with priceType: %v, category: %v, subcategory: %v, priceMin: %v, priceMax: %v, city: %s, state: %s, search: %s, excludeInactive: %v, page: %d, limit: %d",
		priceType, category, subcategory, priceMin, priceMax, city, state, search, excludeInactive, page, limit)

	var allServices []models.Service
	var query *gorm.DB

	// If location filtering is required, start with location-based query
	if city != "" || state != "" {
		// Get service IDs that match location criteria
		var serviceIDs []uint
		locationQuery := sr.GetDB().Table("services").
			Select("DISTINCT services.id").
			Joins("JOIN service_service_areas ON services.id = service_service_areas.service_id").
			Joins("JOIN service_areas ON service_service_areas.service_area_id = service_areas.id").
			Where("service_areas.is_active = ?", true)

		if city != "" && state != "" {
			// Both city and state provided
			locationQuery = locationQuery.Where("service_areas.city ILIKE ? AND service_areas.state ILIKE ?",
				"%"+city+"%", "%"+state+"%")
		} else if city != "" {
			// Only city provided
			locationQuery = locationQuery.Where("service_areas.city ILIKE ?", "%"+city+"%")
		} else if state != "" {
			// Only state provided
			locationQuery = locationQuery.Where("service_areas.state ILIKE ?", "%"+state+"%")
		}

		// Get the distinct service IDs
		if err := locationQuery.Pluck("id", &serviceIDs).Error; err != nil {
			logrus.Errorf("ServiceRepository.GetSummariesWithLocationFiltersPaginated location query error: %v", err)
			return nil, 0, err
		}

		if len(serviceIDs) == 0 {
			// No services found for the location
			return []models.ServiceSummary{}, 0, nil
		}

		// Create query with location-filtered service IDs
		query = sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas").Where("id IN ?", serviceIDs)
	} else {
		// No location filtering, get all services
		query = sr.GetDB().Preload("Category").Preload("Category.Parent").Preload("Category.Parent.Parent").Preload("ServiceAreas")
	}

	// Get all matching services first
	if err := query.Find(&allServices).Error; err != nil {
		logrus.Errorf("ServiceRepository.GetSummariesWithLocationFiltersPaginated database error: %v", err)
		return nil, 0, err
	}

	// Apply remaining filters in memory
	var filteredServices []models.Service
	for _, service := range allServices {
		// Filter by price type
		if priceType != nil && service.PriceType != *priceType {
			continue
		}

		// Filter by category - use preloaded Category data
		if category != nil {
			if categoryID, err := strconv.ParseUint(*category, 10, 32); err == nil {
				// Check if service category matches or is a descendant of the category
				cat := service.Category
				matched := false
				if cat.ID == uint(categoryID) {
					matched = true
				} else if cat.ParentID != nil && *cat.ParentID == uint(categoryID) {
					// Direct child
					matched = true
				} else if cat.Parent != nil && cat.Parent.ParentID != nil && *cat.Parent.ParentID == uint(categoryID) {
					// Grandchild
					matched = true
				}
				if !matched {
					continue
				}
			} else {
				// Use preloaded category data - check current, parent, and grandparent
				cat := service.Category
				matched := strings.Contains(strings.ToLower(cat.Name), strings.ToLower(*category))
				if !matched && cat.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Name), strings.ToLower(*category))
				}
				if !matched && cat.Parent != nil && cat.Parent.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Parent.Name), strings.ToLower(*category))
				}
				if !matched {
					continue
				}
			}
		}

		// Filter by subcategory (now treated as category filter) - use preloaded Category data
		if subcategory != nil {
			if subcategoryID, err := strconv.ParseUint(*subcategory, 10, 32); err == nil {
				// Use preloaded category data - check if service category matches or is a child of the subcategory
				cat := service.Category
				matched := false
				if cat.ID == uint(subcategoryID) {
					// Direct match
					matched = true
				} else if cat.ParentID != nil && *cat.ParentID == uint(subcategoryID) {
					// Direct child (Level 3 of Level 2)
					matched = true
				} else if cat.Parent != nil && cat.Parent.ParentID != nil && *cat.Parent.ParentID == uint(subcategoryID) {
					// Grandchild (Level 3 of Level 2, checking through parent chain)
					matched = true
				}
				if !matched {
					continue
				}
			} else {
				// Use preloaded category data
				cat := service.Category
				matched := strings.Contains(strings.ToLower(cat.Name), strings.ToLower(*subcategory))
				if !matched && cat.Parent != nil {
					matched = strings.Contains(strings.ToLower(cat.Parent.Name), strings.ToLower(*subcategory))
				}
				if !matched {
					continue
				}
			}
		}

		// Filter by price range
		if priceMin != nil && service.Price != nil && *service.Price < *priceMin {
			continue
		}
		if priceMax != nil && service.Price != nil && *service.Price > *priceMax {
			continue
		}

		// Filter by search query (name or description)
		if search != "" {
			searchLower := strings.ToLower(search)
			nameMatch := strings.Contains(strings.ToLower(service.Name), searchLower)
			descMatch := strings.Contains(strings.ToLower(service.Description), searchLower)
			if !nameMatch && !descMatch {
				continue
			}
		}

		// Filter by active status
		if excludeInactive && !service.IsActive {
			continue
		}

		filteredServices = append(filteredServices, service)
	}

	total := int64(len(filteredServices))

	// Apply sorting
	if sortBy != "" {
		sort.Slice(filteredServices, func(i, j int) bool {
			switch sortBy {
			case "name":
				if sortOrder == "desc" {
					return filteredServices[i].Name > filteredServices[j].Name
				}
				return filteredServices[i].Name < filteredServices[j].Name
			case "created_at":
				if sortOrder == "desc" {
					return filteredServices[i].CreatedAt.After(filteredServices[j].CreatedAt)
				}
				return filteredServices[i].CreatedAt.Before(filteredServices[j].CreatedAt)
			default:
				return filteredServices[i].Name < filteredServices[j].Name
			}
		})
	} else {
		// Default sorting by name ascending
		sort.Slice(filteredServices, func(i, j int) bool {
			return filteredServices[i].Name < filteredServices[j].Name
		})
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(filteredServices) {
		start = len(filteredServices)
	}
	if end > len(filteredServices) {
		end = len(filteredServices)
	}

	var paginatedServices []models.Service
	if start < len(filteredServices) {
		paginatedServices = filteredServices[start:end]
	}

	// Convert to ServiceSummary
	var serviceSummaries []models.ServiceSummary
	for _, service := range paginatedServices {
		// Convert service areas to ServiceAreaSummary
		var serviceAreas []models.ServiceAreaSummary
		for _, area := range service.ServiceAreas {
			serviceAreas = append(serviceAreas, models.ServiceAreaSummary{
				ID:       area.ID,
				City:     area.City,
				State:    area.State,
				Country:  area.Country,
				IsActive: area.IsActive,
			})
		}

		// Get category name and path from preloaded category
		var categoryName string
		var categoryPath string
		if service.Category.ID > 0 {
			categoryName = service.Category.Name
			categoryPath = models.BuildCategoryPath(&service.Category)
		}
		// Convert to ServiceSummary
		serviceSummary := models.ServiceSummary{
			ID:           service.ID,
			Name:         service.Name,
			Slug:         service.Slug,
			Description:  service.Description,
			Images:       service.Images,
			PriceType:    service.PriceType,
			Price:        service.Price,
			Duration:     service.Duration,
			CategoryID:   service.CategoryID,
			CategoryName: categoryName,
			CategoryPath: categoryPath,
			IsActive:     service.IsActive,
			CreatedAt:    service.CreatedAt,
			UpdatedAt:    service.UpdatedAt,
			DeletedAt:    service.DeletedAt,
			ServiceAreas: serviceAreas,
		}
		serviceSummaries = append(serviceSummaries, serviceSummary)
	}

	logrus.Infof("ServiceRepository.GetSummariesWithLocationFiltersPaginated found %d services (total: %d)", len(serviceSummaries), total)
	return serviceSummaries, total, nil
}
