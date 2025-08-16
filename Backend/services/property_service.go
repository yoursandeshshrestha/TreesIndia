package services

import (
	"fmt"
	"strconv"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
)

type PropertyService struct {
	propertyRepo *repositories.PropertyRepository
	userRepo     *repositories.UserRepository
}

func NewPropertyService() *PropertyService {
	return &PropertyService{
		propertyRepo: repositories.NewPropertyRepository(),
		userRepo:     repositories.NewUserRepository(),
	}
}

// CreateProperty creates a new property listing
func (ps *PropertyService) CreateProperty(property *models.Property, userID uint) error {
	logrus.Infof("PropertyService.CreateProperty called for user ID: %d", userID)
	
	// Validate user exists
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		logrus.Errorf("PropertyService.CreateProperty user not found: %v", err)
		return fmt.Errorf("user not found")
	}
	
	// Set user ID
	property.UserID = userID
	
	// Set broker ID if user is a broker
	if user.UserType == models.UserTypeBroker {
		property.BrokerID = &userID
	}
	
	// Set admin upload flag if user is admin
	if user.UserType == models.UserTypeAdmin {
		property.UploadedByAdmin = true
	}
	
	// Generate slug
	property.Slug = ps.generateSlug(property.Title)
	
	// Validate property data
	if err := ps.validateProperty(property); err != nil {
		logrus.Errorf("PropertyService.CreateProperty validation error: %v", err)
		return err
	}
	
	// Validate images
	if err := ps.validateImages(property.Images); err != nil {
		logrus.Errorf("PropertyService.CreateProperty image validation error: %v", err)
		return err
	}
	
	// Create property
	err = ps.propertyRepo.Create(property)
	if err != nil {
		logrus.Errorf("PropertyService.CreateProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.CreateProperty successfully created property ID: %d", property.ID)
	return nil
}

// GetPropertyByID retrieves a property by ID
func (ps *PropertyService) GetPropertyByID(id uint) (*models.Property, error) {
	logrus.Infof("PropertyService.GetPropertyByID called with ID: %d", id)
	
	property, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.GetPropertyByID repository error: %v", err)
		return nil, err
	}
	
	// Check if property is expired and update status if needed
	if property.ShouldExpire() {
		property.Status = models.PropertyStatusExpired
		ps.propertyRepo.Update(property)
	}
	
	return property, nil
}

// GetPropertyBySlug retrieves a property by slug
func (ps *PropertyService) GetPropertyBySlug(slug string) (*models.Property, error) {
	logrus.Infof("PropertyService.GetPropertyBySlug called with slug: %s", slug)
	
	property, err := ps.propertyRepo.GetBySlug(slug)
	if err != nil {
		logrus.Errorf("PropertyService.GetPropertyBySlug repository error: %v", err)
		return nil, err
	}
	
	// Check if property is expired and update status if needed
	if property.ShouldExpire() {
		property.Status = models.PropertyStatusExpired
		ps.propertyRepo.Update(property)
	}
	
	return property, nil
}

// GetAllProperties retrieves all properties with pagination and filtering
func (ps *PropertyService) GetAllProperties(params utils.PaginationParams, filters map[string]interface{}) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetAllProperties called with params: %+v", params)
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Validate and convert filter values
	processedFilters := ps.processFilters(filters)
	
	properties, pagination, err := ps.propertyRepo.GetAll(params, processedFilters)
	if err != nil {
		logrus.Errorf("PropertyService.GetAllProperties repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	// Update expired properties
	ps.updateExpiredProperties(properties)
	
	return properties, pagination, nil
}

// GetUserProperties retrieves properties by user ID
func (ps *PropertyService) GetUserProperties(userID uint, params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetUserProperties called for user ID: %d", userID)
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	properties, pagination, err := ps.propertyRepo.GetByUserID(userID, params)
	if err != nil {
		logrus.Errorf("PropertyService.GetUserProperties repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	return properties, pagination, nil
}

// GetBrokerProperties retrieves properties by broker ID
func (ps *PropertyService) GetBrokerProperties(brokerID uint, params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetBrokerProperties called for broker ID: %d", brokerID)
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	properties, pagination, err := ps.propertyRepo.GetByBrokerID(brokerID, params)
	if err != nil {
		logrus.Errorf("PropertyService.GetBrokerProperties repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	return properties, pagination, nil
}

// GetPendingApproval retrieves properties pending admin approval
func (ps *PropertyService) GetPendingApproval(params utils.PaginationParams) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetPendingApproval called")
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	properties, pagination, err := ps.propertyRepo.GetPendingApproval(params)
	if err != nil {
		logrus.Errorf("PropertyService.GetPendingApproval repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	return properties, pagination, nil
}

// UpdateProperty updates a property (admin only)
func (ps *PropertyService) UpdateProperty(id uint, updates map[string]interface{}, adminID uint) error {
	logrus.Infof("PropertyService.UpdateProperty called for property ID: %d by admin ID: %d", id, adminID)
	
	// Get existing property
	property, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.UpdateProperty property not found: %v", err)
		return err
	}
	
	// Apply updates
	if title, exists := updates["title"]; exists {
		property.Title = title.(string)
		property.Slug = ps.generateSlug(property.Title)
	}
	if description, exists := updates["description"]; exists {
		property.Description = description.(string)
	}
	if propertyType, exists := updates["property_type"]; exists {
		property.PropertyType = models.PropertyType(propertyType.(string))
	}
	if listingType, exists := updates["listing_type"]; exists {
		property.ListingType = models.ListingType(listingType.(string))
	}
	if salePrice, exists := updates["sale_price"]; exists {
		if salePrice != nil {
			price := salePrice.(float64)
			property.SalePrice = &price
		} else {
			property.SalePrice = nil
		}
	}
	if monthlyRent, exists := updates["monthly_rent"]; exists {
		if monthlyRent != nil {
			rent := monthlyRent.(float64)
			property.MonthlyRent = &rent
		} else {
			property.MonthlyRent = nil
		}
	}
	if priceNegotiable, exists := updates["price_negotiable"]; exists {
		property.PriceNegotiable = priceNegotiable.(bool)
	}
	if status, exists := updates["status"]; exists {
		property.Status = models.PropertyStatus(status.(string))
	}
	if images, exists := updates["images"]; exists {
		if imageArray, ok := images.([]string); ok {
			property.Images = models.JSONStringArray(imageArray)
		} else if imageArray, ok := images.(models.JSONStringArray); ok {
			property.Images = imageArray
		}
		if err := ps.validateImages(property.Images); err != nil {
			return err
		}
	}
	
	// Update property
	err = ps.propertyRepo.Update(property)
	if err != nil {
		logrus.Errorf("PropertyService.UpdateProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.UpdateProperty successfully updated property ID: %d", id)
	return nil
}

// DeleteProperty deletes a property (admin only)
func (ps *PropertyService) DeleteProperty(id uint, adminID uint) error {
	logrus.Infof("PropertyService.DeleteProperty called for property ID: %d by admin ID: %d", id, adminID)
	
	// Check if property exists
	_, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.DeleteProperty property not found: %v", err)
		return err
	}
	
	// Delete property
	err = ps.propertyRepo.Delete(id)
	if err != nil {
		logrus.Errorf("PropertyService.DeleteProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.DeleteProperty successfully deleted property ID: %d", id)
	return nil
}

// ApproveProperty approves a user property listing
func (ps *PropertyService) ApproveProperty(id uint, adminID uint) error {
	logrus.Infof("PropertyService.ApproveProperty called for property ID: %d by admin ID: %d", id, adminID)
	
	// Check if property exists
	property, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.ApproveProperty property not found: %v", err)
		return err
	}
	
	// Check if property is already approved
	if property.IsApproved {
		return fmt.Errorf("property is already approved")
	}
	
	// Check if property is by broker or admin (they don't need approval)
	if property.BrokerID != nil || property.UploadedByAdmin {
		return fmt.Errorf("broker and admin properties don't need approval")
	}
	
	// Approve property
	err = ps.propertyRepo.ApproveProperty(id, adminID)
	if err != nil {
		logrus.Errorf("PropertyService.ApproveProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.ApproveProperty successfully approved property ID: %d", id)
	return nil
}

// UpdateExpiredProperties updates all expired properties
func (ps *PropertyService) UpdateExpiredProperties() error {
	logrus.Infof("PropertyService.UpdateExpiredProperties called")
	
	err := ps.propertyRepo.UpdateExpiredProperties()
	if err != nil {
		logrus.Errorf("PropertyService.UpdateExpiredProperties repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.UpdateExpiredProperties successfully updated expired properties")
	return nil
}

// validateProperty validates property data
func (ps *PropertyService) validateProperty(property *models.Property) error {
	if property.Title == "" {
		return fmt.Errorf("title is required")
	}
	
	if property.PropertyType == "" {
		return fmt.Errorf("property type is required")
	}
	
	if property.ListingType == "" {
		return fmt.Errorf("listing type is required")
	}
	
	if property.State == "" {
		return fmt.Errorf("state is required")
	}
	
	if property.City == "" {
		return fmt.Errorf("city is required")
	}
	
	// Validate pricing based on listing type
	if property.ListingType == models.ListingTypeSale {
		if property.SalePrice == nil || *property.SalePrice <= 0 {
			return fmt.Errorf("sale price is required for sale listings")
		}
	} else if property.ListingType == models.ListingTypeRent {
		if property.MonthlyRent == nil || *property.MonthlyRent <= 0 {
			return fmt.Errorf("monthly rent is required for rental listings")
		}
	}
	
	return nil
}

// validateImages validates property images
func (ps *PropertyService) validateImages(images models.JSONStringArray) error {
	if len(images) < 2 {
		return fmt.Errorf("at least 2 images are required")
	}
	
	if len(images) > 5 {
		return fmt.Errorf("maximum 5 images allowed")
	}
	
	// TODO: Add image URL validation if needed
	
	return nil
}

// generateSlug generates a unique slug for the property
func (ps *PropertyService) generateSlug(title string) string {
	// Convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	
	// Remove special characters
	slug = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			return r
		}
		return -1
	}, slug)
	
	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	// Add timestamp to ensure uniqueness
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	slug = slug + "-" + timestamp
	
	return slug
}

// processFilters processes and validates filter values
func (ps *PropertyService) processFilters(filters map[string]interface{}) map[string]interface{} {
	processed := make(map[string]interface{})
	
	for key, value := range filters {
		switch key {
		case "min_price", "max_price":
			if str, ok := value.(string); ok {
				if price, err := strconv.ParseFloat(str, 64); err == nil && price > 0 {
					processed[key] = price
				}
			} else if price, ok := value.(float64); ok && price > 0 {
				processed[key] = price
			}
		case "bedrooms", "bathrooms":
			if str, ok := value.(string); ok {
				if num, err := strconv.Atoi(str); err == nil && num > 0 {
					processed[key] = num
				}
			} else if num, ok := value.(int); ok && num > 0 {
				processed[key] = num
			}
		case "min_area", "max_area":
			if str, ok := value.(string); ok {
				if area, err := strconv.ParseFloat(str, 64); err == nil && area > 0 {
					processed[key] = area
				}
			} else if area, ok := value.(float64); ok && area > 0 {
				processed[key] = area
			}
		default:
			processed[key] = value
		}
	}
	
	return processed
}

// updateExpiredProperties updates expired properties in the given list
func (ps *PropertyService) updateExpiredProperties(properties []models.Property) {
	for i := range properties {
		if properties[i].ShouldExpire() {
			properties[i].Status = models.PropertyStatusExpired
			ps.propertyRepo.Update(&properties[i])
		}
	}
}
