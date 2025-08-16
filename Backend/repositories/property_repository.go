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
func (pr *PropertyRepository) GetAll(params utils.PaginationParams, filters map[string]interface{}) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetAll panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetAll called with params: %+v, filters: %+v", params, filters)
	
	query := pr.GetDB().Model(&models.Property{}).Preload("User").Preload("Broker")
	
	// Apply filters
	query = pr.applyFilters(query, filters)
	
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

// GetByBrokerID retrieves properties by broker ID
func (pr *PropertyRepository) GetByBrokerID(brokerID uint, params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.GetByBrokerID panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.GetByBrokerID called with brokerID: %d", brokerID)
	
	query := pr.GetDB().Model(&models.Property{}).Where("broker_id = ?", brokerID).Preload("User").Preload("Broker")
	
	paginationHelper := utils.NewPaginationHelper()
	pagination, err := paginationHelper.PaginateQuery(query, params, &[]models.Property{})
	if err != nil {
		logrus.Errorf("PropertyRepository.GetByBrokerID pagination error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	var properties []models.Property
	if err := paginationHelper.ApplyPagination(query, params).Find(&properties).Error; err != nil {
		logrus.Errorf("PropertyRepository.GetByBrokerID database error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	logrus.Infof("PropertyRepository.GetByBrokerID found %d properties for broker %d", len(properties), brokerID)
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

// UpdateExpiredProperties updates expired properties to expired status
func (pr *PropertyRepository) UpdateExpiredProperties() error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyRepository.UpdateExpiredProperties panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyRepository.UpdateExpiredProperties called")
	
	err := pr.GetDB().Model(&models.Property{}).
		Where("status = ? AND expires_at < ?", models.PropertyStatusAvailable, time.Now()).
		Update("status", models.PropertyStatusExpired).Error
	
	if err != nil {
		logrus.Errorf("PropertyRepository.UpdateExpiredProperties database error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyRepository.UpdateExpiredProperties successfully updated expired properties")
	return nil
}

// applyFilters applies filters to the query
func (pr *PropertyRepository) applyFilters(query *gorm.DB, filters map[string]interface{}) *gorm.DB {
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
				query = query.Where("bedrooms >= ?", bedrooms)
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
		}
	}
	
	// Only show approved properties by default (unless explicitly filtered)
	// This ensures user properties need admin approval before showing
	if _, exists := filters["is_approved"]; !exists {
		query = query.Where("is_approved = ?", true)
	}
	
	// Only show non-expired properties by default
	if _, exists := filters["status"]; !exists {
		query = query.Where("status != ?", models.PropertyStatusExpired)
	}
	
	return query
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
