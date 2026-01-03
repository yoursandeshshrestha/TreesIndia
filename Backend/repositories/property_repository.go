package repositories

import (
	"errors"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PropertyRepository struct {
	BaseRepository
}

func NewPropertyRepository() *PropertyRepository {
	return &PropertyRepository{
		BaseRepository: *NewBaseRepository(),
	}
}

// Create creates a new property
func (pr *PropertyRepository) Create(property *models.Property) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.Create panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.Create called for property: %s", property.Title)
	
	err := pr.GetDB().Create(property).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.Create database error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.Create successfully created property with ID: %d", property.ID)
	return nil
}

// GetByID retrieves a property by ID
func (pr *PropertyRepository) GetByID(id uint) (*models.Property, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetByID panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetByID called with ID: %d", id)
	
	var property models.Property
	err := pr.GetDB().Preload("User").Preload("Broker").Preload("ApprovedByUser").First(&property, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("PropertyRepository.GetByID property not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("PropertyRepository.GetByID database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("PropertyRepository.GetByID found property: %s", property.Title)
	return &property, nil
}

// GetBySlug retrieves a property by slug
func (pr *PropertyRepository) GetBySlug(slug string) (*models.Property, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetBySlug panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetBySlug called with slug: %s", slug)
	
	var property models.Property
	err := pr.GetDB().Preload("User").Preload("Broker").Preload("ApprovedByUser").Where("slug = ?", slug).First(&property).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("PropertyRepository.GetBySlug property not found with slug: %s", slug)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("PropertyRepository.GetBySlug database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("PropertyRepository.GetBySlug found property: %s", property.Title)
	return &property, nil
}

// GetAll retrieves all properties with pagination and filtering
func (pr *PropertyRepository) GetAll(params utils.PaginationParams, filters map[string]interface{}, isAdmin bool) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetAll panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetAll called with params: %+v, filters: %+v, isAdmin: %v", params, filters, isAdmin)
	
	query := pr.GetDB().Model(&models.Property{}).Preload("User").Preload("Broker")
	
	// Apply filters
	query = pr.applyFilters(query, filters, isAdmin)
	
	// Apply pagination
	paginationHelper := utils.NewPaginationHelper()
	pagination, err := paginationHelper.PaginateQuery(query, params, &[]models.Property{})
	if err != nil {
		logrus.Errorf("PropertyRepository.GetAll pagination error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	var properties []models.Property
	if err := paginationHelper.ApplyPagination(query, params).Find(&properties).Error; err != nil {
		logrus.Errorf("PropertyRepository.GetAll database error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	logrus.Infof("PropertyRepository.GetAll found %d properties", len(properties))
	return properties, pagination, nil
}

// GetByUserID retrieves properties by user ID
func (pr *PropertyRepository) GetByUserID(userID uint, params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetByUserID panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetByUserID called with userID: %d", userID)
	
	query := pr.GetDB().Model(&models.Property{}).Where("user_id = ?", userID).Preload("User").Preload("Broker")
	
	paginationHelper := utils.NewPaginationHelper()
	pagination, err := paginationHelper.PaginateQuery(query, params, &[]models.Property{})
	if err != nil {
		logrus.Errorf("PropertyRepository.GetByUserID pagination error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	var properties []models.Property
	if err := paginationHelper.ApplyPagination(query, params).Find(&properties).Error; err != nil {
		logrus.Errorf("PropertyRepository.GetByUserID database error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	logrus.Infof("PropertyRepository.GetByUserID found %d properties for user %d", len(properties), userID)
	return properties, pagination, nil
}


// GetPendingProperties retrieves only pending properties (unapproved user properties) with filters
func (pr *PropertyRepository) GetPendingProperties(params utils.PaginationParams, filters map[string]interface{}) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetPendingProperties panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetPendingProperties called with params: %+v, filters: %+v", params, filters)
	
	// Base query for pending properties only (unapproved user properties)
	query := pr.GetDB().Model(&models.Property{}).Where("is_approved = ? AND broker_id IS NULL AND uploaded_by_admin = ?", false, false).Preload("User").Preload("Broker")
	
	// Apply custom filters for pending properties (without default admin filters)
	query = pr.applyPendingFilters(query, filters)
	
	// Apply pagination
	paginationHelper := utils.NewPaginationHelper()
	pagination, err := paginationHelper.PaginateQuery(query, params, &[]models.Property{})
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPendingProperties pagination error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	var properties []models.Property
	if err := paginationHelper.ApplyPagination(query, params).Find(&properties).Error; err != nil {
		logrus.Errorf("PropertyRepository.GetPendingProperties database error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	logrus.Infof("PropertyRepository.GetPendingProperties found %d pending properties", len(properties))
	return properties, pagination, nil
}

// GetPendingApproval retrieves properties pending admin approval
func (pr *PropertyRepository) GetPendingApproval(params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetPendingApproval panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetPendingApproval called")
	
	query := pr.GetDB().Model(&models.Property{}).Where("is_approved = ? AND broker_id IS NULL AND uploaded_by_admin = ?", false, false).Preload("User")
	
	paginationHelper := utils.NewPaginationHelper()
	pagination, err := paginationHelper.PaginateQuery(query, params, &[]models.Property{})
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPendingApproval pagination error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	var properties []models.Property
	if err := paginationHelper.ApplyPagination(query, params).Find(&properties).Error; err != nil {
		logrus.Errorf("PropertyRepository.GetPendingApproval database error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	logrus.Infof("PropertyRepository.GetPendingApproval found %d properties pending approval", len(properties))
	return properties, pagination, nil
}

// Update updates a property
func (pr *PropertyRepository) Update(property *models.Property) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.Update panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.Update called for property ID: %d", property.ID)
	
	err := pr.GetDB().Save(property).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.Update database error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.Update successfully updated property ID: %d", property.ID)
	return nil
}

// Delete deletes a property
func (pr *PropertyRepository) Delete(id uint) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.Delete panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.Delete called for property ID: %d", id)
	
	err := pr.GetDB().Delete(&models.Property{}, id).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.Delete database error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.Delete successfully deleted property ID: %d", id)
	return nil
}

// ApproveProperty approves a user property listing
func (pr *PropertyRepository) ApproveProperty(id uint, adminID uint) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.ApproveProperty panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.ApproveProperty called for property ID: %d by admin ID: %d", id, adminID)
	
	now := time.Now()
	err := pr.GetDB().Model(&models.Property{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_approved": true,
		"approved_at": &now,
		"approved_by": adminID,
	}).Error
	
	if err != nil {
		logrus.Errorf("PropertyRepository.ApproveProperty database error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.ApproveProperty successfully approved property ID: %d", id)
	return nil
}

// UpdateExpiredProperties updates expired properties to sold/rented status based on listing type
func (pr *PropertyRepository) UpdateExpiredProperties() error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.UpdateExpiredProperties panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.UpdateExpiredProperties called")
	
	// Update sale properties to sold
	err := pr.GetDB().Model(&models.Property{}).
		Where("status = ? AND expires_at < ? AND listing_type = ?", models.PropertyStatusAvailable, time.Now(), models.ListingTypeSale).
		Update("status", models.PropertyStatusSold).Error
	
	if err != nil {
		logrus.Errorf("PropertyRepository.UpdateExpiredProperties sale update error: %v", err)
		return err
	}
	
	// Update rent properties to rented
	err = pr.GetDB().Model(&models.Property{}).
		Where("status = ? AND expires_at < ? AND listing_type = ?", models.PropertyStatusAvailable, time.Now(), models.ListingTypeRent).
		Update("status", models.PropertyStatusRented).Error
	
	if err != nil {
		logrus.Errorf("PropertyRepository.UpdateExpiredProperties rent update error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.UpdateExpiredProperties successfully updated expired properties")
	return nil
}

// applyFilters applies filters to the query
func (pr *PropertyRepository) applyFilters(query *gorm.DB, filters map[string]interface{}, isAdmin bool) *gorm.DB {
	for key, value := range filters {
		switch key {
		case "search":
			if searchStr, ok := value.(string); ok && searchStr != "" {
				query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+searchStr+"%", "%"+searchStr+"%")
			}
		case "property_type":
			if propertyType, ok := value.(string); ok && propertyType != "" {
				query = query.Where("property_type = ?", propertyType)
			}
		case "listing_type":
			if listingType, ok := value.(string); ok && listingType != "" {
				query = query.Where("listing_type = ?", listingType)
			}
		case "status":
			if status, ok := value.(string); ok && status != "" {
				query = query.Where("status = ?", status)
			}
		case "min_price":
			if minPrice, ok := value.(float64); ok && minPrice > 0 {
				query = query.Where("(sale_price >= ? OR monthly_rent >= ?)", minPrice, minPrice)
			}
		case "max_price":
			if maxPrice, ok := value.(float64); ok && maxPrice > 0 {
				query = query.Where("(sale_price <= ? OR monthly_rent <= ?)", maxPrice, maxPrice)
			}
		case "location":
			if location, ok := value.(string); ok && location != "" {
				location = strings.ToLower(location)
				query = query.Where("LOWER(state) LIKE ? OR LOWER(city) LIKE ? OR LOWER(locality) LIKE ?", 
					"%"+location+"%", "%"+location+"%", "%"+location+"%")
			}
		case "bedrooms":
			if bedrooms, ok := value.(int); ok && bedrooms > 0 {
				query = query.Where("bedrooms = ?", bedrooms)
			}
		case "bathrooms":
			if bathrooms, ok := value.(int); ok && bathrooms > 0 {
				query = query.Where("bathrooms >= ?", bathrooms)
			}
		case "min_area":
			if minArea, ok := value.(float64); ok && minArea > 0 {
				query = query.Where("area >= ?", minArea)
			}
		case "max_area":
			if maxArea, ok := value.(float64); ok && maxArea > 0 {
				query = query.Where("area <= ?", maxArea)
			}
		case "furnishing_status":
			if furnishingStatus, ok := value.(string); ok && furnishingStatus != "" {
				query = query.Where("furnishing_status = ?", furnishingStatus)
			}
		case "is_approved":
			if isApproved, ok := value.(bool); ok {
				query = query.Where("is_approved = ?", isApproved)
			}
		case "state":
			if state, ok := value.(string); ok && state != "" {
				query = query.Where("state = ?", state)
			}
		case "city":
			if city, ok := value.(string); ok && city != "" {
				query = query.Where("city = ?", city)
			}
		case "uploaded_by_admin":
			if uploadedByAdmin, ok := value.(bool); ok {
				query = query.Where("uploaded_by_admin = ?", uploadedByAdmin)
			}
		case "treesindia_assured":
			if treesIndiaAssured, ok := value.(bool); ok {
				query = query.Where("treesindia_assured = ?", treesIndiaAssured)
			}
		case "sort_by":
			// Handle sorting - this will be processed after the switch statement
		case "sort_order":
			// Handle sorting - this will be processed after the switch statement
		}
	}
	
	// Apply sorting if specified
	if sortBy, exists := filters["sort_by"]; exists {
		if sortByStr, ok := sortBy.(string); ok && sortByStr != "" {
			sortOrder := "ASC"
			if sortOrderVal, exists := filters["sort_order"]; exists {
				if sortOrderStr, ok := sortOrderVal.(string); ok && sortOrderStr != "" {
					sortOrder = strings.ToUpper(sortOrderStr)
					if sortOrder != "ASC" && sortOrder != "DESC" {
						sortOrder = "ASC"
					}
				}
			}
			query = query.Order(sortByStr + " " + sortOrder)
		}
	} else {
		// Default sorting by created_at desc
		query = query.Order("created_at DESC")
	}
	
	// Apply default filters only for non-admin requests
	if !isAdmin {
		// Only show approved properties by default (unless explicitly filtered)
		// This ensures user properties need admin approval before showing
		if _, exists := filters["is_approved"]; !exists {
			query = query.Where("is_approved = ?", true)
		}
		
		// Only show available properties by default (exclude sold/rented)
		if _, exists := filters["status"]; !exists {
			query = query.Where("status = ?", models.PropertyStatusAvailable)
		}
	} else {
		// For admin requests, exclude pending properties (unapproved user properties)
		// This excludes properties that are not approved and not uploaded by admin/broker
		query = query.Where("(is_approved = ? OR broker_id IS NOT NULL OR uploaded_by_admin = ?)", true, true)
	}
	
	return query
}

// applyPendingFilters applies filters to pending properties query without default admin filters
func (pr *PropertyRepository) applyPendingFilters(query *gorm.DB, filters map[string]interface{}) *gorm.DB {
	for key, value := range filters {
		switch key {
		case "search":
			if searchStr, ok := value.(string); ok && searchStr != "" {
				query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+searchStr+"%", "%"+searchStr+"%")
			}
		case "property_type":
			if propertyType, ok := value.(string); ok && propertyType != "" {
				query = query.Where("property_type = ?", propertyType)
			}
		case "listing_type":
			if listingType, ok := value.(string); ok && listingType != "" {
				query = query.Where("listing_type = ?", listingType)
			}
		case "status":
			if status, ok := value.(string); ok && status != "" {
				query = query.Where("status = ?", status)
			}
		case "min_price":
			if minPrice, ok := value.(float64); ok && minPrice > 0 {
				query = query.Where("(sale_price >= ? OR monthly_rent >= ?)", minPrice, minPrice)
			}
		case "max_price":
			if maxPrice, ok := value.(float64); ok && maxPrice > 0 {
				query = query.Where("(sale_price <= ? OR monthly_rent <= ?)", maxPrice, maxPrice)
			}
		case "location":
			if location, ok := value.(string); ok && location != "" {
				location = strings.ToLower(location)
				query = query.Where("LOWER(state) LIKE ? OR LOWER(city) LIKE ? OR LOWER(locality) LIKE ?", 
					"%"+location+"%", "%"+location+"%", "%"+location+"%")
			}
		case "bedrooms":
			if bedrooms, ok := value.(int); ok && bedrooms > 0 {
				query = query.Where("bedrooms = ?", bedrooms)
			}
		case "bathrooms":
			if bathrooms, ok := value.(int); ok && bathrooms > 0 {
				query = query.Where("bathrooms >= ?", bathrooms)
			}
		case "min_area":
			if minArea, ok := value.(float64); ok && minArea > 0 {
				query = query.Where("area >= ?", minArea)
			}
		case "max_area":
			if maxArea, ok := value.(float64); ok && maxArea > 0 {
				query = query.Where("area <= ?", maxArea)
			}
		case "furnishing_status":
			if furnishingStatus, ok := value.(string); ok && furnishingStatus != "" {
				query = query.Where("furnishing_status = ?", furnishingStatus)
			}
		case "state":
			if state, ok := value.(string); ok && state != "" {
				query = query.Where("state = ?", state)
			}
		case "city":
			if city, ok := value.(string); ok && city != "" {
				query = query.Where("city = ?", city)
			}
		case "sort_by":
			// Handle sorting - this will be processed after the switch statement
		case "sort_order":
			// Handle sorting - this will be processed after the switch statement
		}
	}
	
	// Apply sorting if specified
	if sortBy, exists := filters["sort_by"]; exists {
		if sortByStr, ok := sortBy.(string); ok && sortByStr != "" {
			sortOrder := "ASC"
			if sortOrderVal, exists := filters["sort_order"]; exists {
				if sortOrderStr, ok := sortOrderVal.(string); ok && sortOrderStr != "" {
					sortOrder = strings.ToUpper(sortOrderStr)
					if sortOrder != "ASC" && sortOrder != "DESC" {
						sortOrder = "ASC"
					}
				}
			}
			query = query.Order(sortByStr + " " + sortOrder)
		}
	} else {
		// Default sorting by created_at desc
		query = query.Order("created_at DESC")
	}
	
	// No default filters for pending properties - we want to show all pending properties
	// regardless of their status (available, sold, rented, etc.)
	
	return query
}

// GetPropertyStats retrieves property statistics for admin dashboard
func (pr *PropertyRepository) GetPropertyStats() (map[string]interface{}, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetPropertyStats panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetPropertyStats called")
	
	var totalProperties, approvedProperties, pendingProperties, soldProperties, rentedProperties, treesindiaAssuredProperties int64
	var residentialProperties, commercialProperties, saleProperties, rentProperties int64
	
	// Get total properties count
	err := pr.GetDB().Model(&models.Property{}).Count(&totalProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats total count error: %v", err)
		return nil, err
	}
	
	// Get approved properties count
	err = pr.GetDB().Model(&models.Property{}).Where("is_approved = ?", true).Count(&approvedProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats approved count error: %v", err)
		return nil, err
	}
	
	// Get pending properties count
	err = pr.GetDB().Model(&models.Property{}).Where("is_approved = ?", false).Count(&pendingProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats pending count error: %v", err)
		return nil, err
	}
	
	// Get sold properties count
	err = pr.GetDB().Model(&models.Property{}).Where("status = ?", models.PropertyStatusSold).Count(&soldProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats sold count error: %v", err)
		return nil, err
	}
	
	// Get rented properties count
	err = pr.GetDB().Model(&models.Property{}).Where("status = ?", models.PropertyStatusRented).Count(&rentedProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats rented count error: %v", err)
		return nil, err
	}
	
	// Get Trees India Assured properties count
	err = pr.GetDB().Model(&models.Property{}).Where("treesindia_assured = ?", true).Count(&treesindiaAssuredProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats treesindia assured count error: %v", err)
		return nil, err
	}
	
	// Get residential properties count
	err = pr.GetDB().Model(&models.Property{}).Where("property_type = ?", models.PropertyTypeResidential).Count(&residentialProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats residential count error: %v", err)
		return nil, err
	}
	
	// Get commercial properties count
	err = pr.GetDB().Model(&models.Property{}).Where("property_type = ?", models.PropertyTypeCommercial).Count(&commercialProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats commercial count error: %v", err)
		return nil, err
	}
	
	// Get sale properties count
	err = pr.GetDB().Model(&models.Property{}).Where("listing_type = ?", models.ListingTypeSale).Count(&saleProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats sale count error: %v", err)
		return nil, err
	}
	
	// Get rent properties count
	err = pr.GetDB().Model(&models.Property{}).Where("listing_type = ?", models.ListingTypeRent).Count(&rentProperties).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyStats rent count error: %v", err)
		return nil, err
	}
	
	stats := map[string]interface{}{
		"total_properties":            totalProperties,
		"approved_properties":         approvedProperties,
		"pending_properties":          pendingProperties,
		"sold_properties":             soldProperties,
		"rented_properties":           rentedProperties,
		"treesindia_assured_properties": treesindiaAssuredProperties,
		"residential_properties":      residentialProperties,
		"commercial_properties":       commercialProperties,
		"sale_properties":             saleProperties,
		"rent_properties":             rentProperties,
		// Keep backward compatibility
		"expired_properties":          soldProperties + rentedProperties,
	}
	
	logrus.Infof("PropertyRepository.GetPropertyStats retrieved stats: %+v", stats)
	return stats, nil
}

// GetPropertyCountByUserID gets the count of properties for a specific user
func (pr *PropertyRepository) GetPropertyCountByUserID(userID uint) (int, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetPropertyCountByUserID panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetPropertyCountByUserID called for user: %d", userID)
	
	var count int64
	err := pr.GetDB().Model(&models.Property{}).Where("user_id = ?", userID).Count(&count).Error
	if err != nil {
		logrus.Errorf("PropertyRepository.GetPropertyCountByUserID database error: %v", err)
		return 0, err
	}
	
	logrus.Infof("PropertyRepository.GetPropertyCountByUserID found %d properties for user %d", count, userID)
	return int(count), nil
}
