package services

import (
	"fmt"
	"mime/multipart"
	"strconv"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
)

type PropertyService struct {
	propertyRepo     *repositories.PropertyRepository
	userRepo         *repositories.UserRepository
	cloudinary       *CloudinaryService
}

func NewPropertyService(cloudinaryService *CloudinaryService) *PropertyService {
	return &PropertyService{
		propertyRepo: repositories.NewPropertyRepository(),
		userRepo:     repositories.NewUserRepository(),
		cloudinary:   cloudinaryService,
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
	
	// Check if broker has active subscription
	if user.UserType == models.UserTypeBroker {
		if !user.HasActiveSubscription {
			logrus.Errorf("PropertyService.CreateProperty broker %d does not have active subscription", userID)
			return fmt.Errorf("active subscription required for brokers to create properties")
		}
		
		// Check if subscription is not expired
		if user.SubscriptionExpiryDate != nil && user.SubscriptionExpiryDate.Before(time.Now()) {
			logrus.Errorf("PropertyService.CreateProperty broker %d subscription expired", userID)
			return fmt.Errorf("subscription has expired, please renew to create properties")
		}
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
	
	// Set subscription required flag if user has active subscription (for auto-approval)
	if user.HasActiveSubscription && user.SubscriptionExpiryDate != nil && user.SubscriptionExpiryDate.After(time.Now()) {
		property.SubscriptionRequired = true
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
	
	// Send notification to admins about new property
	go NotifyPropertyCreated(&user, property)
	
	return nil
}

// UploadPropertyImages uploads property images to Cloudinary
func (ps *PropertyService) UploadPropertyImages(imageFiles []*multipart.FileHeader) ([]string, error) {
	logrus.Infof("PropertyService.UploadPropertyImages called with %d images", len(imageFiles))
	
	// Upload images to Cloudinary
	var imageURLs []string
	if ps.cloudinary != nil {
		for _, file := range imageFiles {
			if file != nil {
				logrus.Infof("PropertyService.UploadPropertyImages uploading image: %s", file.Filename)
				url, err := ps.cloudinary.UploadImage(file, "properties")
				if err != nil {
					logrus.Errorf("PropertyService.UploadPropertyImages image upload error: %v", err)
					return nil, err
				}
				imageURLs = append(imageURLs, url)
				logrus.Infof("PropertyService.UploadPropertyImages image uploaded: %s", url)
			}
		}
	} else {
		logrus.Warn("PropertyService.UploadPropertyImages cloudinary service is nil, skipping image upload")
		return nil, fmt.Errorf("cloudinary service not available")
	}
	
	logrus.Infof("PropertyService.UploadPropertyImages successfully uploaded %d images", len(imageURLs))
	return imageURLs, nil
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
		if property.ListingType == models.ListingTypeSale {
			property.Status = models.PropertyStatusSold
		} else {
			property.Status = models.PropertyStatusRented
		}
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
		if property.ListingType == models.ListingTypeSale {
			property.Status = models.PropertyStatusSold
		} else {
			property.Status = models.PropertyStatusRented
		}
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
	
	properties, pagination, err := ps.propertyRepo.GetAll(params, processedFilters, false)
	if err != nil {
		logrus.Errorf("PropertyService.GetAllProperties repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	// Update expired properties
	ps.updateExpiredProperties(properties)
	
	return properties, pagination, nil
}

// GetAllPropertiesForAdmin retrieves all properties with pagination and filtering for admin (no default filters)
func (ps *PropertyService) GetAllPropertiesForAdmin(params utils.PaginationParams, filters map[string]interface{}) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetAllPropertiesForAdmin called with params: %+v", params)
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Validate and convert filter values
	processedFilters := ps.processFilters(filters)
	
	properties, pagination, err := ps.propertyRepo.GetAll(params, processedFilters, true)
	if err != nil {
		logrus.Errorf("PropertyService.GetAllPropertiesForAdmin repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	// Update expired properties
	ps.updateExpiredProperties(properties)
	
	return properties, pagination, nil
}

// GetPropertyStats retrieves property statistics for admin dashboard
func (ps *PropertyService) GetPropertyStats() (map[string]interface{}, error) {
	logrus.Infof("PropertyService.GetPropertyStats called")
	
	stats, err := ps.propertyRepo.GetPropertyStats()
	if err != nil {
		logrus.Errorf("PropertyService.GetPropertyStats repository error: %v", err)
		return nil, err
	}
	
	return stats, nil
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


// GetPendingProperties retrieves only pending properties (unapproved user properties)
func (ps *PropertyService) GetPendingProperties(params utils.PaginationParams, filters map[string]interface{}) ([]models.Property, utils.PaginationResponse, error) {
	logrus.Infof("PropertyService.GetPendingProperties called with params: %+v", params)
	
	// Set default limit to 20 if not specified
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Validate and convert filter values
	processedFilters := ps.processFilters(filters)
	
	properties, pagination, err := ps.propertyRepo.GetPendingProperties(params, processedFilters)
	if err != nil {
		logrus.Errorf("PropertyService.GetPendingProperties repository error: %v", err)
		return nil, utils.PaginationResponse{}, err
	}
	
	// Update expired properties
	ps.updateExpiredProperties(properties)
	
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
	if bedrooms, exists := updates["bedrooms"]; exists {
		if bedrooms != nil {
			bedroomsInt := int(bedrooms.(float64))
			property.Bedrooms = &bedroomsInt
		} else {
			property.Bedrooms = nil
		}
	}
	if bathrooms, exists := updates["bathrooms"]; exists {
		if bathrooms != nil {
			bathroomsInt := int(bathrooms.(float64))
			property.Bathrooms = &bathroomsInt
		} else {
			property.Bathrooms = nil
		}
	}
	if area, exists := updates["area"]; exists {
		if area != nil {
			areaFloat := area.(float64)
			property.Area = &areaFloat
		} else {
			property.Area = nil
		}
	}
	if floorNumber, exists := updates["floor_number"]; exists {
		if floorNumber != nil {
			floorInt := int(floorNumber.(float64))
			property.FloorNumber = &floorInt
		} else {
			property.FloorNumber = nil
		}
	}
	if age, exists := updates["age"]; exists {
		if age != nil {
			ageEnum := models.PropertyAge(age.(string))
			property.Age = &ageEnum
		} else {
			property.Age = nil
		}
	}
	if furnishingStatus, exists := updates["furnishing_status"]; exists {
		if furnishingStatus != nil {
			status := models.FurnishingStatus(furnishingStatus.(string))
			property.FurnishingStatus = &status
		} else {
			property.FurnishingStatus = nil
		}
	}
	if state, exists := updates["state"]; exists {
		property.State = state.(string)
	}
	if city, exists := updates["city"]; exists {
		property.City = city.(string)
	}
	if address, exists := updates["address"]; exists {
		property.Address = address.(string)
	}
	if pincode, exists := updates["pincode"]; exists {
		property.Pincode = pincode.(string)
	}
	if status, exists := updates["status"]; exists {
		property.Status = models.PropertyStatus(status.(string))
	}
	if isApproved, exists := updates["is_approved"]; exists {
		property.IsApproved = isApproved.(bool)
	}
	if uploadedByAdmin, exists := updates["uploaded_by_admin"]; exists {
		property.UploadedByAdmin = uploadedByAdmin.(bool)
	}
	if priorityScore, exists := updates["priority_score"]; exists {
		property.PriorityScore = int(priorityScore.(float64))
	}
	if subscriptionRequired, exists := updates["subscription_required"]; exists {
		property.SubscriptionRequired = subscriptionRequired.(bool)
	}
	if treesIndiaAssured, exists := updates["treesindia_assured"]; exists {
		property.TreesIndiaAssured = treesIndiaAssured.(bool)
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

// DeleteUserProperty deletes a user's own property
func (ps *PropertyService) DeleteUserProperty(id uint, userID uint) error {
	logrus.Infof("PropertyService.DeleteUserProperty called for property ID: %d by user ID: %d", id, userID)
	
	// Check if property exists and belongs to the user
	property, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.DeleteUserProperty property not found: %v", err)
		return err
	}
	
	// Check if property belongs to the user
	if property.UserID != userID {
		logrus.Errorf("PropertyService.DeleteUserProperty property does not belong to user: property user ID %d, requesting user ID %d", property.UserID, userID)
		return fmt.Errorf("property does not belong to you")
	}
	
	// Delete property
	err = ps.propertyRepo.Delete(id)
	if err != nil {
		logrus.Errorf("PropertyService.DeleteUserProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.DeleteUserProperty successfully deleted property ID: %d", id)
	return nil
}

// UpdateUserProperty updates a user's own property
func (ps *PropertyService) UpdateUserProperty(id uint, updates map[string]interface{}, userID uint) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyService.UpdateUserProperty panic: %v", r)
		}
	}()
	
	logrus.Infof("PropertyService.UpdateUserProperty called for property ID: %d by user ID: %d", id, userID)
	
	// Check if property exists and belongs to the user
	property, err := ps.propertyRepo.GetByID(id)
	if err != nil {
		logrus.Errorf("PropertyService.UpdateUserProperty property not found: %v", err)
		return err
	}
	
	// Check if property belongs to the user
	if property.UserID != userID {
		logrus.Errorf("PropertyService.UpdateUserProperty property does not belong to user: property user ID %d, requesting user ID %d", property.UserID, userID)
		return fmt.Errorf("property does not belong to you")
	}
	
	// Apply updates (similar to UpdateProperty but without admin-only fields)
	if title, exists := updates["title"]; exists {
		if titleStr, ok := title.(string); ok {
			property.Title = titleStr
			property.Slug = ps.generateSlug(property.Title)
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected title type: %T", title)
		}
	}
	if description, exists := updates["description"]; exists {
		if descStr, ok := description.(string); ok {
			property.Description = descStr
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected description type: %T", description)
		}
	}
	if propertyType, exists := updates["property_type"]; exists {
		if propTypeStr, ok := propertyType.(string); ok {
			property.PropertyType = models.PropertyType(propTypeStr)
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected property_type type: %T", propertyType)
		}
	}
	if listingType, exists := updates["listing_type"]; exists {
		if listTypeStr, ok := listingType.(string); ok {
			property.ListingType = models.ListingType(listTypeStr)
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected listing_type type: %T", listingType)
		}
	}
	if salePrice, exists := updates["sale_price"]; exists {
		if salePrice != nil {
			var price float64
			var ok bool
			switch v := salePrice.(type) {
			case float64:
				price = v
				ok = true
			case int:
				price = float64(v)
				ok = true
			case int64:
				price = float64(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected sale_price type: %T", v)
			}
			if ok {
				property.SalePrice = &price
			}
		} else {
			property.SalePrice = nil
		}
	}
	if monthlyRent, exists := updates["monthly_rent"]; exists {
		if monthlyRent != nil {
			var rent float64
			var ok bool
			switch v := monthlyRent.(type) {
			case float64:
				rent = v
				ok = true
			case int:
				rent = float64(v)
				ok = true
			case int64:
				rent = float64(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected monthly_rent type: %T", v)
			}
			if ok {
				property.MonthlyRent = &rent
			}
		} else {
			property.MonthlyRent = nil
		}
	}
	if priceNegotiable, exists := updates["price_negotiable"]; exists {
		if val, ok := priceNegotiable.(bool); ok {
			property.PriceNegotiable = val
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected price_negotiable type: %T", priceNegotiable)
		}
	}
	if bedrooms, exists := updates["bedrooms"]; exists {
		if bedrooms != nil {
			var bedroomsInt int
			var ok bool
			switch v := bedrooms.(type) {
			case int:
				bedroomsInt = v
				ok = true
			case float64:
				bedroomsInt = int(v)
				ok = true
			case int64:
				bedroomsInt = int(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected bedrooms type: %T", v)
			}
			if ok {
				property.Bedrooms = &bedroomsInt
			}
		} else {
			property.Bedrooms = nil
		}
	}
	if bathrooms, exists := updates["bathrooms"]; exists {
		if bathrooms != nil {
			var bathroomsInt int
			var ok bool
			switch v := bathrooms.(type) {
			case int:
				bathroomsInt = v
				ok = true
			case float64:
				bathroomsInt = int(v)
				ok = true
			case int64:
				bathroomsInt = int(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected bathrooms type: %T", v)
			}
			if ok {
				property.Bathrooms = &bathroomsInt
			}
		} else {
			property.Bathrooms = nil
		}
	}
	if area, exists := updates["area"]; exists {
		if area != nil {
			var areaFloat float64
			var ok bool
			switch v := area.(type) {
			case float64:
				areaFloat = v
				ok = true
			case int:
				areaFloat = float64(v)
				ok = true
			case int64:
				areaFloat = float64(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected area type: %T", v)
			}
			if ok {
				property.Area = &areaFloat
			}
		} else {
			property.Area = nil
		}
	}
	if floorNumber, exists := updates["floor_number"]; exists {
		if floorNumber != nil {
			var floorInt int
			var ok bool
			switch v := floorNumber.(type) {
			case int:
				floorInt = v
				ok = true
			case float64:
				floorInt = int(v)
				ok = true
			case int64:
				floorInt = int(v)
				ok = true
			default:
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected floor_number type: %T", v)
			}
			if ok {
				property.FloorNumber = &floorInt
			}
		} else {
			property.FloorNumber = nil
		}
	}
	if age, exists := updates["age"]; exists {
		if age != nil {
			if ageStr, ok := age.(string); ok {
				ageEnum := models.PropertyAge(ageStr)
				property.Age = &ageEnum
			} else {
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected age type: %T", age)
			}
		} else {
			property.Age = nil
		}
	}
	if furnishingStatus, exists := updates["furnishing_status"]; exists {
		if furnishingStatus != nil {
			if statusStr, ok := furnishingStatus.(string); ok {
				status := models.FurnishingStatus(statusStr)
				property.FurnishingStatus = &status
			} else {
				logrus.Warnf("PropertyService.UpdateUserProperty unexpected furnishing_status type: %T", furnishingStatus)
			}
		} else {
			property.FurnishingStatus = nil
		}
	}
	if state, exists := updates["state"]; exists {
		if stateStr, ok := state.(string); ok {
			property.State = stateStr
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected state type: %T", state)
		}
	}
	if city, exists := updates["city"]; exists {
		if cityStr, ok := city.(string); ok {
			property.City = cityStr
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected city type: %T", city)
		}
	}
	if address, exists := updates["address"]; exists {
		if addressStr, ok := address.(string); ok {
			property.Address = addressStr
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected address type: %T", address)
		}
	}
	if pincode, exists := updates["pincode"]; exists {
		if pincodeStr, ok := pincode.(string); ok {
			property.Pincode = pincodeStr
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected pincode type: %T", pincode)
		}
	}
	// Note: Users cannot update status, is_approved, uploaded_by_admin, priority_score, subscription_required, treesindia_assured
	// These are admin-only fields
	
	if images, exists := updates["images"]; exists {
		if imageArray, ok := images.([]string); ok {
			property.Images = models.JSONStringArray(imageArray)
		} else if imageArray, ok := images.(models.JSONStringArray); ok {
			property.Images = imageArray
		} else {
			logrus.Warnf("PropertyService.UpdateUserProperty unexpected images type: %T", images)
		}
		if len(property.Images) > 0 {
			if err := ps.validateImages(property.Images); err != nil {
				return err
			}
		}
	}
	
	// Validate property data
	if err := ps.validateProperty(property); err != nil {
		logrus.Errorf("PropertyService.UpdateUserProperty validation error: %v", err)
		return err
	}
	
	// Update property
	err = ps.propertyRepo.Update(property)
	if err != nil {
		logrus.Errorf("PropertyService.UpdateUserProperty repository error: %v", err)
		return err
	}
	
	logrus.Infof("PropertyService.UpdateUserProperty successfully updated property ID: %d", id)
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
	
	if len(property.Title) > 50 {
		return fmt.Errorf("title must be 50 characters or less")
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
	
	// Validate age if provided
	if property.Age != nil {
		validAges := []models.PropertyAge{
			models.PropertyAgeUnder1Year,
			models.PropertyAge1To2Years,
			models.PropertyAge2To5Years,
			models.PropertyAge10PlusYears,
		}
		valid := false
		for _, validAge := range validAges {
			if *property.Age == validAge {
				valid = true
				break
			}
		}
		if !valid {
			return fmt.Errorf("invalid age value")
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
		case "age":
			if str, ok := value.(string); ok {
				// Validate age enum value
				validAges := []string{"under_1_year", "1_2_years", "2_5_years", "10_plus_years"}
				for _, validAge := range validAges {
					if str == validAge {
						processed[key] = str
						break
					}
				}
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
			if properties[i].ListingType == models.ListingTypeSale {
				properties[i].Status = models.PropertyStatusSold
			} else {
				properties[i].Status = models.PropertyStatusRented
			}
			ps.propertyRepo.Update(&properties[i])
		}
	}
}
