package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type PropertyController struct {
	propertyService  *services.PropertyService
	cloudinaryService *services.CloudinaryService
}

func NewPropertyController() *PropertyController {
	logrus.Info("Initializing PropertyController...")
	
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CloudinaryService: %v", err)
		// Don't panic, create a nil cloudinary service
		cloudinaryService = nil
	} else {
		logrus.Info("CloudinaryService initialized successfully")
	}
	
	propertyService := services.NewPropertyService(cloudinaryService)
	logrus.Info("PropertyService initialized")
	
	logrus.Info("PropertyController initialization completed")
	return &PropertyController{
		propertyService:  propertyService,
		cloudinaryService: cloudinaryService,
	}
}

// CreateProperty creates a new property listing
// @Summary Create a new property listing
// @Description Create a new property listing for sale or rent (supports both JSON and form-data). Brokers require active subscription. Users with active subscriptions get auto-approval.
// @Tags properties
// @Accept json,multipart/form-data
// @Produce json
// @Param property body models.Property true "Property data (JSON)"
// @Param title formData string true "Property title"
// @Param description formData string false "Property description"
// @Param property_type formData string true "Property type (residential/commercial)"
// @Param listing_type formData string true "Listing type (sale/rent)"
// @Param sale_price formData number false "Sale price (for sale listings)"
// @Param monthly_rent formData number false "Monthly rent (for rental listings)"
// @Param price_negotiable formData boolean false "Price negotiable (default: true)"
// @Param bedrooms formData integer false "Number of bedrooms"
// @Param bathrooms formData integer false "Number of bathrooms"
// @Param area formData number false "Area in sq ft"
// @Param parking_spaces formData integer false "Number of parking spaces"
// @Param floor_number formData integer false "Floor number"
// @Param age formData integer false "Age of property in years"
// @Param furnishing_status formData string false "Furnishing status"
// @Param state formData string true "State"
// @Param city formData string true "City"
// @Param locality formData string false "Locality"
// @Param address formData string false "Address"
// @Param pincode formData string false "Pincode"
// @Param images formData file false "Property images (up to 5 files)"
// @Success 201 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Router /api/v1/user/properties [post]
func (pc *PropertyController) CreateProperty(c *gin.Context) {
	logrus.Infof("PropertyController.CreateProperty called")
	
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.CreateProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	var property models.Property
	
	// Check content type to determine how to parse the request
	contentType := c.GetHeader("Content-Type")
	
	var err error
	if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		err = pc.parseFormDataProperty(c, &property)
	} else {
		// Handle JSON request
		err = c.ShouldBindJSON(&property)
	}
	
	if err != nil {
		logrus.Errorf("PropertyController.CreateProperty binding error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}
	
	// Create property
	err = pc.propertyService.CreateProperty(&property, userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.CreateProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to create property", err.Error()))
		return
	}
	
	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Property created successfully", property))
}

// GetPropertyByID retrieves a property by ID
// @Summary Get property by ID
// @Description Get property details by ID
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/properties/{id} [get]
func (pc *PropertyController) GetPropertyByID(c *gin.Context) {
	logrus.Infof("PropertyController.GetPropertyByID called")
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.GetPropertyByID invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	property, err := pc.propertyService.GetPropertyByID(uint(id))
	if err != nil {
		logrus.Errorf("PropertyController.GetPropertyByID service error: %v", err)
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Property not found", "Property with this ID does not exist"))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property retrieved successfully", property))
}

// GetPropertyBySlug retrieves a property by slug
// @Summary Get property by slug
// @Description Get property details by slug
// @Tags properties
// @Accept json
// @Produce json
// @Param slug path string true "Property slug"
// @Success 200 {object} views.SuccessResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/properties/slug/{slug} [get]
func (pc *PropertyController) GetPropertyBySlug(c *gin.Context) {
	logrus.Infof("PropertyController.GetPropertyBySlug called")
	
	slug := c.Param("slug")
	if slug == "" {
		logrus.Errorf("PropertyController.GetPropertyBySlug empty slug")
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid slug", "Slug cannot be empty"))
		return
	}
	
	property, err := pc.propertyService.GetPropertyBySlug(slug)
	if err != nil {
		logrus.Errorf("PropertyController.GetPropertyBySlug service error: %v", err)
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Property not found", "Property with this slug does not exist"))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property retrieved successfully", property))
}

// GetAllProperties retrieves all properties with pagination and filtering
// @Summary Get all properties
// @Description Get all properties with pagination and filtering
// @Tags properties
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Param search query string false "Search term"
// @Param property_type query string false "Property type (residential/commercial)"
// @Param listing_type query string false "Listing type (sale/rent)"
// @Param status query string false "Property status"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param location query string false "Location search"
// @Param bedrooms query int false "Minimum bedrooms"
// @Param bathrooms query int false "Minimum bathrooms"
// @Param min_area query number false "Minimum area"
// @Param max_area query number false "Maximum area"
// @Param furnishing_status query string false "Furnishing status"
// @Success 200 {object} views.SuccessResponse
// @Router /api/v1/properties [get]
func (pc *PropertyController) GetAllProperties(c *gin.Context) {
	logrus.Infof("PropertyController.GetAllProperties called")
	
	// Parse pagination parameters
	paginationHelper := utils.NewPaginationHelper()
	params := paginationHelper.ParsePaginationParams(c)
	
	// Set default limit to 20
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Parse filters
	filters := make(map[string]interface{})
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	if propertyType := c.Query("property_type"); propertyType != "" {
		filters["property_type"] = propertyType
	}
	if listingType := c.Query("listing_type"); listingType != "" {
		filters["listing_type"] = listingType
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filters["min_price"] = price
		}
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filters["max_price"] = price
		}
	}
	if location := c.Query("location"); location != "" {
		filters["location"] = location
	}
	if bedrooms := c.Query("bedrooms"); bedrooms != "" {
		if num, err := strconv.Atoi(bedrooms); err == nil {
			filters["bedrooms"] = num
		}
	}
	if bathrooms := c.Query("bathrooms"); bathrooms != "" {
		if num, err := strconv.Atoi(bathrooms); err == nil {
			filters["bathrooms"] = num
		}
	}
	if minArea := c.Query("min_area"); minArea != "" {
		if area, err := strconv.ParseFloat(minArea, 64); err == nil {
			filters["min_area"] = area
		}
	}
	if maxArea := c.Query("max_area"); maxArea != "" {
		if area, err := strconv.ParseFloat(maxArea, 64); err == nil {
			filters["max_area"] = area
		}
	}
	if furnishingStatus := c.Query("furnishing_status"); furnishingStatus != "" {
		filters["furnishing_status"] = furnishingStatus
	}
	if state := c.Query("state"); state != "" {
		filters["state"] = state
	}
	if city := c.Query("city"); city != "" {
		filters["city"] = city
	}
	if isApproved := c.Query("is_approved"); isApproved != "" {
		if approved, err := strconv.ParseBool(isApproved); err == nil {
			filters["is_approved"] = approved
		}
	}
	if uploadedByAdmin := c.Query("uploaded_by_admin"); uploadedByAdmin != "" {
		if adminUpload, err := strconv.ParseBool(uploadedByAdmin); err == nil {
			filters["uploaded_by_admin"] = adminUpload
		}
	}
	if sortBy := c.Query("sortBy"); sortBy != "" {
		filters["sort_by"] = sortBy
	}
	if sortOrder := c.Query("sortOrder"); sortOrder != "" {
		filters["sort_order"] = sortOrder
	}
	
	properties, pagination, err := pc.propertyService.GetAllProperties(params, filters)
	if err != nil {
		logrus.Errorf("PropertyController.GetAllProperties service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve properties", "Internal server error"))
		return
	}
	
	// Convert pagination to views format
	paginationView := views.CreatePagination(int(pagination.Page), int(pagination.Limit), pagination.Total)
	
	c.JSON(http.StatusOK, views.CreateSuccessResponseWithPagination("Properties retrieved successfully", properties, paginationView))
}

// GetAllPropertiesForAdmin retrieves all properties for admin (no default filters)
// @Summary Get all properties for admin
// @Description Get all properties with pagination and filtering for admin (shows all statuses and approval states)
// @Tags properties
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Param search query string false "Search term"
// @Param property_type query string false "Property type (residential, commercial)"
// @Param listing_type query string false "Listing type (sale, rent)"
// @Param status query string false "Property status (available, sold, rented)"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param location query string false "Location search"
// @Param bedrooms query int false "Minimum bedrooms"
// @Param bathrooms query int false "Minimum bathrooms"
// @Param min_area query number false "Minimum area"
// @Param max_area query number false "Maximum area"
// @Param furnishing_status query string false "Furnishing status"
// @Param state query string false "State"
// @Param city query string false "City"
// @Param is_approved query bool false "Approval status"
// @Param uploaded_by_admin query bool false "Uploaded by admin"
// @Param sortBy query string false "Sort by field"
// @Param sortOrder query string false "Sort order (asc, desc)"
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Router /api/v1/admin/properties [get]
// @Security ApiKeyAuth
func (pc *PropertyController) GetAllPropertiesForAdmin(c *gin.Context) {
	logrus.Infof("PropertyController.GetAllPropertiesForAdmin called")
	
	// Parse pagination parameters
	paginationHelper := utils.NewPaginationHelper()
	params := paginationHelper.ParsePaginationParams(c)
	
	// Set default limit to 20
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Parse filters
	filters := make(map[string]interface{})
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	if propertyType := c.Query("property_type"); propertyType != "" {
		filters["property_type"] = propertyType
	}
	if listingType := c.Query("listing_type"); listingType != "" {
		filters["listing_type"] = listingType
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filters["min_price"] = price
		}
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filters["max_price"] = price
		}
	}
	if location := c.Query("location"); location != "" {
		filters["location"] = location
	}
	if bedrooms := c.Query("bedrooms"); bedrooms != "" {
		if num, err := strconv.Atoi(bedrooms); err == nil {
			filters["bedrooms"] = num
		}
	}
	if bathrooms := c.Query("bathrooms"); bathrooms != "" {
		if num, err := strconv.Atoi(bathrooms); err == nil {
			filters["bathrooms"] = num
		}
	}
	if minArea := c.Query("min_area"); minArea != "" {
		if area, err := strconv.ParseFloat(minArea, 64); err == nil {
			filters["min_area"] = area
		}
	}
	if maxArea := c.Query("max_area"); maxArea != "" {
		if area, err := strconv.ParseFloat(maxArea, 64); err == nil {
			filters["max_area"] = area
		}
	}
	if furnishingStatus := c.Query("furnishing_status"); furnishingStatus != "" {
		filters["furnishing_status"] = furnishingStatus
	}
	if state := c.Query("state"); state != "" {
		filters["state"] = state
	}
	if city := c.Query("city"); city != "" {
		filters["city"] = city
	}
	if isApproved := c.Query("is_approved"); isApproved != "" {
		if approved, err := strconv.ParseBool(isApproved); err == nil {
			filters["is_approved"] = approved
		}
	}
	if uploadedByAdmin := c.Query("uploaded_by_admin"); uploadedByAdmin != "" {
		if adminUpload, err := strconv.ParseBool(uploadedByAdmin); err == nil {
			filters["uploaded_by_admin"] = adminUpload
		}
	}
	if sortBy := c.Query("sortBy"); sortBy != "" {
		filters["sort_by"] = sortBy
	}
	if sortOrder := c.Query("sortOrder"); sortOrder != "" {
		filters["sort_order"] = sortOrder
	}
	if treesIndiaAssured := c.Query("treesindia_assured"); treesIndiaAssured != "" {
		if assured, err := strconv.ParseBool(treesIndiaAssured); err == nil {
			filters["treesindia_assured"] = assured
		}
	}
	
	properties, pagination, err := pc.propertyService.GetAllPropertiesForAdmin(params, filters)
	if err != nil {
		logrus.Errorf("PropertyController.GetAllPropertiesForAdmin service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve properties", "Internal server error"))
		return
	}
	
	// Convert pagination to views format
	paginationView := views.CreatePagination(int(pagination.Page), int(pagination.Limit), pagination.Total)
	
	c.JSON(http.StatusOK, views.CreateSuccessResponseWithPagination("Admin properties retrieved successfully", properties, paginationView))
}

// GetPropertyStats retrieves property statistics for admin dashboard
// @Summary Get property statistics
// @Description Get property statistics for admin dashboard (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/stats [get]
// @Security ApiKeyAuth
func (pc *PropertyController) GetPropertyStats(c *gin.Context) {
	logrus.Infof("PropertyController.GetPropertyStats called")
	
	// Get user ID from context (for authentication check)
	_, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.GetPropertyStats user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	stats, err := pc.propertyService.GetPropertyStats()
	if err != nil {
		logrus.Errorf("PropertyController.GetPropertyStats service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve property stats", "Internal server error"))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property stats retrieved successfully", stats))
}

// GetUserProperties retrieves properties by user ID
// @Summary Get user properties
// @Description Get properties listed by the authenticated user (works for both users and brokers)
// @Tags properties
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Router /api/v1/user/properties [get]
func (pc *PropertyController) GetUserProperties(c *gin.Context) {
	logrus.Infof("PropertyController.GetUserProperties called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.GetUserProperties user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	// Parse pagination parameters
	paginationHelper := utils.NewPaginationHelper()
	params := paginationHelper.ParsePaginationParams(c)
	
	// Set default limit to 20
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	properties, pagination, err := pc.propertyService.GetUserProperties(userID.(uint), params)
	if err != nil {
		logrus.Errorf("PropertyController.GetUserProperties service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve properties", "Internal server error"))
		return
	}
	
	// Convert pagination to views format
	paginationView := views.CreatePagination(int(pagination.Page), int(pagination.Limit), pagination.Total)
	
	c.JSON(http.StatusOK, views.CreateSuccessResponseWithPagination("User properties retrieved successfully", properties, paginationView))
}


// GetPendingProperties retrieves only pending properties for admin
// @Summary Get pending properties
// @Description Get only pending properties (unapproved user properties) for admin dashboard
// @Tags properties
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Param search query string false "Search term"
// @Param property_type query string false "Property type (residential, commercial)"
// @Param listing_type query string false "Listing type (sale, rent)"
// @Param sortBy query string false "Sort by field"
// @Param sortOrder query string false "Sort order (asc, desc)"
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/pending [get]
// @Security ApiKeyAuth
func (pc *PropertyController) GetPendingProperties(c *gin.Context) {
	logrus.Infof("PropertyController.GetPendingProperties called")
	
	// Get user ID from context (for authentication check)
	_, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.GetPendingProperties user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	// Parse pagination parameters
	paginationHelper := utils.NewPaginationHelper()
	params := paginationHelper.ParsePaginationParams(c)
	
	// Set default limit to 20
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	// Parse filters
	filters := make(map[string]interface{})
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	if propertyType := c.Query("property_type"); propertyType != "" {
		filters["property_type"] = propertyType
	}
	if listingType := c.Query("listing_type"); listingType != "" {
		filters["listing_type"] = listingType
	}
	if sortBy := c.Query("sortBy"); sortBy != "" {
		filters["sort_by"] = sortBy
	}
	if sortOrder := c.Query("sortOrder"); sortOrder != "" {
		filters["sort_order"] = sortOrder
	}
	
	properties, pagination, err := pc.propertyService.GetPendingProperties(params, filters)
	if err != nil {
		logrus.Errorf("PropertyController.GetPendingProperties service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve pending properties", "Internal server error"))
		return
	}
	
	// Convert pagination to views format
	paginationView := views.CreatePagination(int(pagination.Page), int(pagination.Limit), pagination.Total)
	
	c.JSON(http.StatusOK, views.CreateSuccessResponseWithPagination("Pending properties retrieved successfully", properties, paginationView))
}

// GetPendingApproval retrieves properties pending admin approval
// @Summary Get pending approval properties
// @Description Get properties pending admin approval (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20, max: 100)"
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/pending-approval [get]
// @Security ApiKeyAuth
func (pc *PropertyController) GetPendingApproval(c *gin.Context) {
	logrus.Infof("PropertyController.GetPendingApproval called")
	
	// Get user ID from context (for authentication check)
	_, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.GetPendingApproval user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	// Parse pagination parameters
	paginationHelper := utils.NewPaginationHelper()
	params := paginationHelper.ParsePaginationParams(c)
	
	// Set default limit to 20
	if params.Limit == 0 {
		params.Limit = 20
	}
	
	properties, pagination, err := pc.propertyService.GetPendingApproval(params)
	if err != nil {
		logrus.Errorf("PropertyController.GetPendingApproval service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve properties", "Internal server error"))
		return
	}
	
	// Convert pagination to views format
	paginationView := views.CreatePagination(int(pagination.Page), int(pagination.Limit), pagination.Total)
	
	c.JSON(http.StatusOK, views.CreateSuccessResponseWithPagination("Pending approval properties retrieved successfully", properties, paginationView))
}

// UpdateProperty updates a property (admin only)
// @Summary Update property
// @Description Update property details (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Param property body map[string]interface{} true "Property updates"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/{id} [put]
// @Security ApiKeyAuth
func (pc *PropertyController) UpdateProperty(c *gin.Context) {
	logrus.Infof("PropertyController.UpdateProperty called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.UpdateProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.UpdateProperty invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	var updates map[string]interface{}
	
	// Check content type to determine how to parse the request
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "multipart/form-data") {
		// Initialize map for form-data
		updates = make(map[string]interface{})
		// Handle form-data request
		err = pc.parseFormDataPropertyUpdate(c, &updates)
	} else {
		// Handle JSON request
		err = c.ShouldBindJSON(&updates)
	}
	
	if err != nil {
		logrus.Errorf("PropertyController.UpdateProperty binding error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}
	
	err = pc.propertyService.UpdateProperty(uint(id), updates, userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.UpdateProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update property", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property updated successfully", nil))
}

// DeleteProperty deletes a property (admin only)
// @Summary Delete property
// @Description Delete a property (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/{id} [delete]
// @Security ApiKeyAuth
func (pc *PropertyController) DeleteProperty(c *gin.Context) {
	logrus.Infof("PropertyController.DeleteProperty called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.DeleteProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.DeleteProperty invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	err = pc.propertyService.DeleteProperty(uint(id), userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.DeleteProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to delete property", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property deleted successfully", nil))
}

// DeleteUserProperty deletes a user's own property
// @Summary Delete user property
// @Description Delete a property owned by the authenticated user
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/user/properties/{id} [delete]
// @Security ApiKeyAuth
func (pc *PropertyController) DeleteUserProperty(c *gin.Context) {
	logrus.Infof("PropertyController.DeleteUserProperty called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.DeleteUserProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.DeleteUserProperty invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	err = pc.propertyService.DeleteUserProperty(uint(id), userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.DeleteUserProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to delete property", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property deleted successfully", nil))
}

// UpdateUserProperty updates a user's own property
// @Summary Update user property
// @Description Update a property owned by the authenticated user
// @Tags properties
// @Accept json
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Property ID"
// @Param property body object false "Property update data"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/user/properties/{id} [put]
// @Security ApiKeyAuth
func (pc *PropertyController) UpdateUserProperty(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("PropertyController.UpdateUserProperty panic: %v", r)
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal server error", "Something went wrong"))
		}
	}()
	
	logrus.Infof("PropertyController.UpdateUserProperty called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.UpdateUserProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.UpdateUserProperty invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	var updates map[string]interface{}
	
	// Check content type to determine how to parse the request
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "multipart/form-data") {
		// Initialize map for form-data
		updates = make(map[string]interface{})
		// Handle form-data request
		err = pc.parseFormDataPropertyUpdate(c, &updates)
		if err != nil {
			logrus.Errorf("PropertyController.UpdateUserProperty form data parsing error: %v", err)
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid form data", err.Error()))
			return
		}
	} else {
		// Handle JSON request
		err = c.ShouldBindJSON(&updates)
		if err != nil {
			logrus.Errorf("PropertyController.UpdateUserProperty JSON binding error: %v", err)
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid JSON", err.Error()))
			return
		}
	}
	
	logrus.Infof("PropertyController.UpdateUserProperty updates map: %+v", updates)
	
	err = pc.propertyService.UpdateUserProperty(uint(id), updates, userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.UpdateUserProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update property", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property updated successfully", nil))
}

// UpdatePropertyStatus updates a property's status (admin only)
// @Summary Update property status
// @Description Update a property's status (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Param status body map[string]interface{} true "Status update data"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/{id}/status [patch]
// @Security ApiKeyAuth
func (pc *PropertyController) UpdatePropertyStatus(c *gin.Context) {
	logrus.Infof("PropertyController.UpdatePropertyStatus called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.UpdatePropertyStatus user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.UpdatePropertyStatus invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	var statusUpdate map[string]interface{}
	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		logrus.Errorf("PropertyController.UpdatePropertyStatus binding error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}
	
	err = pc.propertyService.UpdateProperty(uint(id), statusUpdate, userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.UpdatePropertyStatus service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update property status", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property status updated successfully", nil))
}

// ApproveProperty approves a user property listing
// @Summary Approve property
// @Description Approve a user property listing (admin only)
// @Tags properties
// @Accept json
// @Produce json
// @Param id path int true "Property ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Router /api/v1/admin/properties/{id}/approve [post]
// @Security ApiKeyAuth
func (pc *PropertyController) ApproveProperty(c *gin.Context) {
	logrus.Infof("PropertyController.ApproveProperty called")
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.ApproveProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("PropertyController.ApproveProperty invalid ID: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid property ID", "ID must be a valid number"))
		return
	}
	
	err = pc.propertyService.ApproveProperty(uint(id), userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.ApproveProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to approve property", err.Error()))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Property approved successfully", nil))
}

// CreateAdminProperty creates a new property listing (admin only)
// @Summary Create a new property listing (admin only)
// @Description Create a new property listing for sale or rent (admin only - auto-approved)
// @Tags properties
// @Accept json,multipart/form-data
// @Produce json
// @Param property body models.Property true "Property data (JSON)"
// @Param title formData string true "Property title"
// @Param description formData string false "Property description"
// @Param property_type formData string true "Property type (residential/commercial)"
// @Param listing_type formData string true "Listing type (sale/rent)"
// @Param sale_price formData number false "Sale price (for sale listings)"
// @Param monthly_rent formData number false "Monthly rent (for rental listings)"
// @Param price_negotiable formData boolean false "Price negotiable (default: true)"
// @Param bedrooms formData integer false "Number of bedrooms"
// @Param bathrooms formData integer false "Number of bathrooms"
// @Param area formData number false "Area in sq ft"
// @Param parking_spaces formData integer false "Number of parking spaces"
// @Param floor_number formData integer false "Floor number"
// @Param age formData integer false "Age of property in years"
// @Param furnishing_status formData string false "Furnishing status"
// @Param state formData string true "State"
// @Param city formData string true "City"
// @Param locality formData string false "Locality"
// @Param address formData string false "Address"
// @Param pincode formData string false "Pincode"
// @Param images formData file false "Property images (up to 5 files)"
// @Success 201 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Router /api/v1/admin/properties [post]
// @Security ApiKeyAuth
func (pc *PropertyController) CreateAdminProperty(c *gin.Context) {
	logrus.Infof("PropertyController.CreateAdminProperty called")
	
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Errorf("PropertyController.CreateAdminProperty user_id not found in context")
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	
	// Check if user is admin (this should be handled by middleware, but double-check)
	userType, exists := c.Get("user_type")
	if !exists || userType != string(models.UserTypeAdmin) {
		logrus.Errorf("PropertyController.CreateAdminProperty user is not admin")
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Forbidden", "Admin access required"))
		return
	}
	
	var property models.Property
	
	// Check content type to determine how to parse the request
	contentType := c.GetHeader("Content-Type")
	
	var err error
	if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		err = pc.parseFormDataProperty(c, &property)
	} else {
		// Handle JSON request
		err = c.ShouldBindJSON(&property)
	}
	
	if err != nil {
		logrus.Errorf("PropertyController.CreateAdminProperty binding error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}
	
	// Create property (admin properties are auto-approved)
	err = pc.propertyService.CreateProperty(&property, userID.(uint))
	if err != nil {
		logrus.Errorf("PropertyController.CreateAdminProperty service error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to create property", err.Error()))
		return
	}
	
	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Admin property created successfully", property))
}

// parseFormDataProperty parses form-data request and populates the property struct
func (pc *PropertyController) parseFormDataProperty(c *gin.Context, property *models.Property) error {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		return err
	}
	
	form := c.Request.MultipartForm
	
	// Parse basic fields
	property.Title = c.PostForm("title")
	property.Description = c.PostForm("description")
	property.PropertyType = models.PropertyType(c.PostForm("property_type"))
	property.ListingType = models.ListingType(c.PostForm("listing_type"))
	property.State = c.PostForm("state")
	property.City = c.PostForm("city")
	property.Address = c.PostForm("address")
	property.Pincode = c.PostForm("pincode")
	if furnishingStatus := c.PostForm("furnishing_status"); furnishingStatus != "" {
		status := models.FurnishingStatus(furnishingStatus)
		property.FurnishingStatus = &status
	}
	
	// Parse numeric fields
	if salePriceStr := c.PostForm("sale_price"); salePriceStr != "" {
		if salePrice, err := strconv.ParseFloat(salePriceStr, 64); err == nil {
			property.SalePrice = &salePrice
		}
	}
	
	if monthlyRentStr := c.PostForm("monthly_rent"); monthlyRentStr != "" {
		if monthlyRent, err := strconv.ParseFloat(monthlyRentStr, 64); err == nil {
			property.MonthlyRent = &monthlyRent
		}
	}
	
	if bedroomsStr := c.PostForm("bedrooms"); bedroomsStr != "" {
		if bedrooms, err := strconv.Atoi(bedroomsStr); err == nil {
			property.Bedrooms = &bedrooms
		}
	}
	
	if bathroomsStr := c.PostForm("bathrooms"); bathroomsStr != "" {
		if bathrooms, err := strconv.Atoi(bathroomsStr); err == nil {
			property.Bathrooms = &bathrooms
		}
	}
	
	if areaStr := c.PostForm("area"); areaStr != "" {
		if area, err := strconv.ParseFloat(areaStr, 64); err == nil {
			property.Area = &area
		}
	}
	
	
	if floorNumberStr := c.PostForm("floor_number"); floorNumberStr != "" {
		if floorNumber, err := strconv.Atoi(floorNumberStr); err == nil {
			property.FloorNumber = &floorNumber
		}
	}
	
	if ageStr := c.PostForm("age"); ageStr != "" {
		age := models.PropertyAge(ageStr)
		property.Age = &age
	}
	
	// Parse boolean fields
	if priceNegotiableStr := c.PostForm("price_negotiable"); priceNegotiableStr != "" {
		property.PriceNegotiable = priceNegotiableStr == "true" || priceNegotiableStr == "1"
	} else {
		property.PriceNegotiable = true // default value
	}
	
	if uploadedByAdminStr := c.PostForm("uploaded_by_admin"); uploadedByAdminStr != "" {
		property.UploadedByAdmin = uploadedByAdminStr == "true" || uploadedByAdminStr == "1"
	}
	
	if treesIndiaAssuredStr := c.PostForm("treesindia_assured"); treesIndiaAssuredStr != "" {
		property.TreesIndiaAssured = treesIndiaAssuredStr == "true" || treesIndiaAssuredStr == "1"
	}
	
	// Handle file uploads
	if form.File != nil && len(form.File["images"]) > 0 {
		logrus.Infof("PropertyController.parseFormDataProperty uploading %d images", len(form.File["images"]))
		
		// Upload images to Cloudinary
		imageURLs, err := pc.propertyService.UploadPropertyImages(form.File["images"])
		if err != nil {
			logrus.Errorf("PropertyController.parseFormDataProperty image upload error: %v", err)
			return fmt.Errorf("failed to upload images: %v", err)
		}
		
		property.Images = models.JSONStringArray(imageURLs)
		logrus.Infof("PropertyController.parseFormDataProperty successfully uploaded %d images", len(imageURLs))
	} else if imagesStr := c.PostForm("images"); imagesStr != "" {
		// Handle images passed as JSON string
		var imageURLs models.JSONStringArray
		if err := json.Unmarshal([]byte(imagesStr), &imageURLs); err == nil {
			property.Images = imageURLs
		}
	}
	
	return nil
}

// parseFormDataPropertyUpdate parses form-data request for property updates
func (pc *PropertyController) parseFormDataPropertyUpdate(c *gin.Context, updates *map[string]interface{}) error {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		return err
	}
	
	form := c.Request.MultipartForm
	
	// Parse basic fields
	if title := c.PostForm("title"); title != "" {
		(*updates)["title"] = title
	}
	if description := c.PostForm("description"); description != "" {
		(*updates)["description"] = description
	}
	if propertyType := c.PostForm("property_type"); propertyType != "" {
		(*updates)["property_type"] = propertyType
	}
	if listingType := c.PostForm("listing_type"); listingType != "" {
		(*updates)["listing_type"] = listingType
	}
	if state := c.PostForm("state"); state != "" {
		(*updates)["state"] = state
	}
	if city := c.PostForm("city"); city != "" {
		(*updates)["city"] = city
	}
	if address := c.PostForm("address"); address != "" {
		(*updates)["address"] = address
	}
	if pincode := c.PostForm("pincode"); pincode != "" {
		(*updates)["pincode"] = pincode
	}
	if furnishingStatus := c.PostForm("furnishing_status"); furnishingStatus != "" {
		(*updates)["furnishing_status"] = furnishingStatus
	}
	if status := c.PostForm("status"); status != "" {
		(*updates)["status"] = status
	}
	
	// Parse numeric fields
	if salePriceStr := c.PostForm("sale_price"); salePriceStr != "" {
		if salePrice, err := strconv.ParseFloat(salePriceStr, 64); err == nil {
			(*updates)["sale_price"] = salePrice
		}
	}
	
	if monthlyRentStr := c.PostForm("monthly_rent"); monthlyRentStr != "" {
		if monthlyRent, err := strconv.ParseFloat(monthlyRentStr, 64); err == nil {
			(*updates)["monthly_rent"] = monthlyRent
		}
	}
	
	if bedroomsStr := c.PostForm("bedrooms"); bedroomsStr != "" {
		if bedrooms, err := strconv.Atoi(bedroomsStr); err == nil {
			(*updates)["bedrooms"] = bedrooms
		}
	}
	
	if bathroomsStr := c.PostForm("bathrooms"); bathroomsStr != "" {
		if bathrooms, err := strconv.Atoi(bathroomsStr); err == nil {
			(*updates)["bathrooms"] = bathrooms
		}
	}
	
	if areaStr := c.PostForm("area"); areaStr != "" {
		if area, err := strconv.ParseFloat(areaStr, 64); err == nil {
			(*updates)["area"] = area
		}
	}
	
	if parkingSpacesStr := c.PostForm("parking_spaces"); parkingSpacesStr != "" {
		if parkingSpaces, err := strconv.Atoi(parkingSpacesStr); err == nil {
			(*updates)["parking_spaces"] = parkingSpaces
		}
	}
	
	if floorNumberStr := c.PostForm("floor_number"); floorNumberStr != "" {
		if floorNumber, err := strconv.Atoi(floorNumberStr); err == nil {
			(*updates)["floor_number"] = floorNumber
		}
	}
	
	if ageStr := c.PostForm("age"); ageStr != "" {
		(*updates)["age"] = ageStr
	}
	
	if priorityScoreStr := c.PostForm("priority_score"); priorityScoreStr != "" {
		if priorityScore, err := strconv.Atoi(priorityScoreStr); err == nil {
			(*updates)["priority_score"] = priorityScore
		}
	}
	
	// Parse boolean fields
	if priceNegotiableStr := c.PostForm("price_negotiable"); priceNegotiableStr != "" {
		(*updates)["price_negotiable"] = priceNegotiableStr == "true" || priceNegotiableStr == "1"
	}
	
	if uploadedByAdminStr := c.PostForm("uploaded_by_admin"); uploadedByAdminStr != "" {
		(*updates)["uploaded_by_admin"] = uploadedByAdminStr == "true" || uploadedByAdminStr == "1"
	}
	
	if treesIndiaAssuredStr := c.PostForm("treesindia_assured"); treesIndiaAssuredStr != "" {
		(*updates)["treesindia_assured"] = treesIndiaAssuredStr == "true" || treesIndiaAssuredStr == "1"
	}
	
	if isApprovedStr := c.PostForm("is_approved"); isApprovedStr != "" {
		(*updates)["is_approved"] = isApprovedStr == "true" || isApprovedStr == "1"
	}
	
	if subscriptionRequiredStr := c.PostForm("subscription_required"); subscriptionRequiredStr != "" {
		(*updates)["subscription_required"] = subscriptionRequiredStr == "true" || subscriptionRequiredStr == "1"
	}
	
	// Handle file uploads
	if form.File != nil && len(form.File["images"]) > 0 {
		logrus.Infof("PropertyController.parseFormDataPropertyUpdate uploading %d images", len(form.File["images"]))
		
		// Upload images to Cloudinary
		imageURLs, err := pc.propertyService.UploadPropertyImages(form.File["images"])
		if err != nil {
			logrus.Errorf("PropertyController.parseFormDataPropertyUpdate image upload error: %v", err)
			return fmt.Errorf("failed to upload images: %v", err)
		}
		
		(*updates)["images"] = imageURLs
		logrus.Infof("PropertyController.parseFormDataPropertyUpdate successfully uploaded %d images", len(imageURLs))
	} else if imagesStr := c.PostForm("images"); imagesStr != "" {
		// Handle images passed as JSON string
		var imageURLs models.JSONStringArray
		if err := json.Unmarshal([]byte(imagesStr), &imageURLs); err == nil {
			(*updates)["images"] = imageURLs
		}
	}
	
	return nil
}
