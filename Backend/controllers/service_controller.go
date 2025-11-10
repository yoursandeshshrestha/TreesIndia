package controllers

import (
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ServiceController struct {
	serviceService *services.ServiceService
}

func NewServiceController() *ServiceController {
	logrus.Info("Initializing ServiceController...")
	
	serviceRepo := repositories.NewServiceRepository()
	logrus.Info("ServiceRepository initialized")
	
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CloudinaryService: %v", err)
		// Don't panic, create a nil cloudinary service
		cloudinaryService = nil
	} else {
		logrus.Info("CloudinaryService initialized successfully")
	}
	
	serviceService := services.NewServiceService(serviceRepo, cloudinaryService)
	logrus.Info("ServiceService initialized")
	
	// Ensure services table exists
	// DISABLED: Using Goose migrations instead of GORM AutoMigrate
	/*
	db := database.GetDB()
	if err := db.AutoMigrate(&models.Service{}); err != nil {
		logrus.Errorf("Failed to auto-migrate services table: %v", err)
	} else {
		logrus.Info("Services table auto-migrated successfully")
	}
	*/
	
	logrus.Info("ServiceController initialization completed")
	return &ServiceController{
		serviceService: serviceService,
	}
}

// CreateService creates a new service
// @Summary Create a new service
// @Description Create a new service with images
// @Tags services
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Service name"
// @Param description formData string false "Service description"
// @Param price_type formData string true "Price type (fixed or inquiry)"
// @Param price formData number false "Fixed price (required if price_type is fixed)"
// @Param duration formData string false "Service duration"
// @Param category_id formData integer true "Category ID"
// @Param subcategory_id formData integer true "Subcategory ID"
// @Param is_active formData boolean false "Is active (default: true)"
// @Param images formData file false "Service images"
// @Success 201 {object} views.Response{data=models.Service}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /api/v1/admin/services [post]
func (sc *ServiceController) CreateService(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.CreateService panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.CreateService called")
	contentType := c.GetHeader("Content-Type")
	var req models.CreateServiceRequest
	var imageFiles []*multipart.FileHeader

	if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data with JSON data field
		if dataStr := c.PostForm("data"); dataStr != "" {
			// Parse JSON data from form field
			if err := json.Unmarshal([]byte(dataStr), &req); err != nil {
				c.JSON(400, views.CreateErrorResponse("Invalid JSON data", err.Error()))
				return
			}
		} else {
			// Fallback to individual form fields
			req.Name = c.PostForm("name")
			req.Description = c.PostForm("description")
			req.PriceType = c.PostForm("price_type")
			if duration := c.PostForm("duration"); duration != "" {
				req.Duration = &duration
			}
			
			if categoryIDStr := c.PostForm("category_id"); categoryIDStr != "" {
				if categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32); err == nil {
					req.CategoryID = uint(categoryID)
				}
			}
			
			if subcategoryIDStr := c.PostForm("subcategory_id"); subcategoryIDStr != "" {
				if subcategoryID, err := strconv.ParseUint(subcategoryIDStr, 10, 32); err == nil {
					req.SubcategoryID = uint(subcategoryID)
				}
			}
			
			if priceStr := c.PostForm("price"); priceStr != "" {
				if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
					req.Price = &price
				}
			}
			
			if isActiveStr := c.PostForm("is_active"); isActiveStr != "" {
				if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
					req.IsActive = &isActive
				}
			}
		}

		// Handle multiple image files
		form, err := c.MultipartForm()
		if err == nil {
			if files, exists := form.File["images"]; exists {
				imageFiles = append(imageFiles, files...)
			}
		}
	} else {
		// Handle JSON
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	}

	// Validate required fields
	if req.Name == "" {
		c.JSON(400, views.CreateErrorResponse("Name is required", ""))
		return
	}
	if req.PriceType == "" {
		c.JSON(400, views.CreateErrorResponse("Price type is required", ""))
		return
	}
	if req.CategoryID == 0 {
		c.JSON(400, views.CreateErrorResponse("Category ID is required", ""))
		return
	}
	if req.SubcategoryID == 0 {
		c.JSON(400, views.CreateErrorResponse("Subcategory ID is required", ""))
		return
	}
	
	// Validate service areas
	if len(req.ServiceAreaIDs) == 0 {
		c.JSON(400, views.CreateErrorResponse("At least one service area ID is required", ""))
		return
	}
	
	// Validate that service area IDs are provided
	for _, areaID := range req.ServiceAreaIDs {
		if areaID == 0 {
			c.JSON(400, views.CreateErrorResponse("Invalid service area ID", ""))
			return
		}
	}

	service, err := sc.serviceService.CreateService(&req, imageFiles)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to create service", err.Error()))
		return
	}

	c.JSON(201, views.CreateSuccessResponse("Service created successfully", service))
}

// GetServiceByID retrieves a service by ID
// @Summary Get service by ID
// @Description Get a service by its ID
// @Tags services
// @Produce json
// @Param id path integer true "Service ID"
// @Success 200 {object} views.Response{data=models.Service}
// @Failure 404 {object} views.Response
// @Router /api/v1/services/{id} [get]
func (sc *ServiceController) GetServiceByID(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServiceByID panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServiceByID called")
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		logrus.Errorf("ServiceController.GetServiceByID invalid ID: %v", err)
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	logrus.Infof("ServiceController.GetServiceByID looking for service ID: %d", id)
	service, err := sc.serviceService.GetServiceByID(uint(id))
	if err != nil {
		logrus.Errorf("ServiceController.GetServiceByID error type: %T, error: %v", err, err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceController.GetServiceByID service not found with ID: %d", id)
			c.JSON(404, views.CreateErrorResponse("Service not found", "Service with the specified ID does not exist"))
			return
		}
		logrus.Errorf("ServiceController.GetServiceByID database error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	if service == nil {
		logrus.Infof("ServiceController.GetServiceByID service is nil for ID: %d", id)
		c.JSON(404, views.CreateErrorResponse("Service not found", "Service with the specified ID does not exist"))
		return
	}

	logrus.Infof("ServiceController.GetServiceByID found service: %s", service.Name)
	c.JSON(200, views.CreateSuccessResponse("Service retrieved successfully", service))
}

// GetServices retrieves all services with advanced filtering
// @Summary Get all services with filters
// @Description Get all services with optional filtering by type, category, subcategory, price, and location
// @Tags services
// @Produce json
// @Param type query string false "Service type (fixed-price or inquiry-based)"
// @Param category query string false "Category name or ID"
// @Param subcategory query string false "Subcategory name or ID"
// @Param price_min query number false "Minimum price"
// @Param price_max query number false "Maximum price"
// @Param city query string false "City name for location filtering"
// @Param state query string false "State name for location filtering"
// @Param exclude_inactive query boolean false "Exclude inactive services"
// @Success 200 {object} views.Response{data=[]models.Service}
// @Router /api/v1/services [get]
func (sc *ServiceController) GetServices(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServices panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServices called")
	
	// Get query parameters
	serviceType := c.Query("type")           // "fixed-price" or "inquiry-based"
	category := c.Query("category")          // Category name or ID
	subcategory := c.Query("subcategory")    // Subcategory name or ID
	priceMinStr := c.Query("price_min")      // Minimum price
	priceMaxStr := c.Query("price_max")      // Maximum price
	city := c.Query("city")                  // City name for location filtering
	state := c.Query("state")                // State name for location filtering
	excludeInactive := c.Query("exclude_inactive") == "true"
	
	// Get pagination parameters
	pageStr := c.Query("page")
	limitStr := c.Query("limit")
	
	// Parse pagination parameters
	page := 1
	limit := 10
	
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	logrus.Infof("ServiceController.GetServices filters - type: %s, category: %s, subcategory: %s, price_min: %s, price_max: %s, city: %s, state: %s, excludeInactive: %v", 
		serviceType, category, subcategory, priceMinStr, priceMaxStr, city, state, excludeInactive)

	// Parse price range
	var priceMin, priceMax *float64
	if priceMinStr != "" {
		if min, err := strconv.ParseFloat(priceMinStr, 64); err == nil {
			priceMin = &min
		}
	}
	if priceMaxStr != "" {
		if max, err := strconv.ParseFloat(priceMaxStr, 64); err == nil {
			priceMax = &max
		}
	}

	// Map service type to database values
	var priceType *string
	if serviceType == "fixed-price" {
		priceTypeStr := "fixed"
		priceType = &priceTypeStr
	} else if serviceType == "inquiry-based" {
		priceTypeStr := "inquiry"
		priceType = &priceTypeStr
	}

	// Convert string parameters to pointers
	var categoryPtr, subcategoryPtr *string
	if category != "" {
		categoryPtr = &category
	}
	if subcategory != "" {
		subcategoryPtr = &subcategory
	}

	// Get sorting parameters
	sortBy := c.Query("sort_by")
	sortOrder := c.Query("sort_order")
	
	// Default sorting
	if sortBy == "" {
		sortBy = "name"
	}
	if sortOrder == "" {
		sortOrder = "asc"
	}
	
	services, total, err := sc.serviceService.GetServiceSummariesWithLocationFiltersPaginated(priceType, categoryPtr, subcategoryPtr, priceMin, priceMax, city, state, excludeInactive, page, limit, sortBy, sortOrder)
	if err != nil {
		logrus.Errorf("ServiceController.GetServices error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve services", err.Error()))
		return
	}

	// Calculate pagination metadata
	totalPages := (total + int64(limit) - 1) / int64(limit)
	pagination := map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"has_next":    int64(page*limit) < total,
		"has_prev":    page > 1,
	}

	response := map[string]interface{}{
		"services":   services,
		"pagination": pagination,
	}

	logrus.Infof("ServiceController.GetServices returning %d services (total: %d)", len(services), total)
	c.JSON(200, views.CreateSuccessResponse("Services retrieved successfully", response))
}

// GetServicesBySubcategory retrieves services by subcategory ID
// @Summary Get services by subcategory
// @Description Get all services for a specific subcategory
// @Tags services
// @Produce json
// @Param subcategoryId path integer true "Subcategory ID"
// @Param exclude_inactive query boolean false "Exclude inactive services"
// @Success 200 {object} views.Response{data=[]models.Service}
// @Router /api/v1/services/subcategory/{subcategoryId} [get]
func (sc *ServiceController) GetServicesBySubcategory(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServicesBySubcategory panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServicesBySubcategory called")
	
	subcategoryIDStr := c.Param("subcategoryId")
	subcategoryID, err := strconv.ParseUint(subcategoryIDStr, 10, 32)
	if err != nil {
		logrus.Errorf("ServiceController.GetServicesBySubcategory invalid subcategory ID: %v", err)
		c.JSON(400, views.CreateErrorResponse("Invalid subcategory ID", err.Error()))
		return
	}

	// Get query parameters
	excludeInactive := c.Query("exclude_inactive") == "true"
	logrus.Infof("ServiceController.GetServicesBySubcategory subcategoryID: %d, excludeInactive: %v", subcategoryID, excludeInactive)

	services, err := sc.serviceService.GetServicesBySubcategory(uint(subcategoryID), excludeInactive)
	if err != nil {
		logrus.Errorf("ServiceController.GetServicesBySubcategory error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve services", err.Error()))
		return
	}

	// Convert to summaries to reduce response size
	var summaries []models.ServiceSummary
	for _, service := range services {
		// Convert service areas to summaries
		var serviceAreaSummaries []models.ServiceAreaSummary
		for _, area := range service.ServiceAreas {
			serviceAreaSummaries = append(serviceAreaSummaries, models.ServiceAreaSummary{
				ID:       area.ID,
				City:     area.City,
				State:    area.State,
				Country:  area.Country,
				IsActive: area.IsActive,
			})
		}
		
		summary := models.ServiceSummary{
			ID:              service.ID,
			Name:            service.Name,
			Slug:            service.Slug,
			Description:     service.Description,
			Images:          service.Images,
			PriceType:       service.PriceType,
			Price:           service.Price,
			Duration:        service.Duration,
			CategoryID:      service.CategoryID,
			SubcategoryID:   service.SubcategoryID,
			CategoryName:    service.Category.Name,
			SubcategoryName: service.Subcategory.Name,
			IsActive:        service.IsActive,
			CreatedAt:       service.CreatedAt,
			UpdatedAt:       service.UpdatedAt,
			DeletedAt:       service.DeletedAt,
			ServiceAreas:    serviceAreaSummaries,
		}
		summaries = append(summaries, summary)
	}

	logrus.Infof("ServiceController.GetServicesBySubcategory returning %d services", len(summaries))
	c.JSON(200, views.CreateSuccessResponse("Services retrieved successfully", summaries))
}

// GetServicesByLocation gets all services available in a specific location
// @Summary Get services by location
// @Description Get all services available in a specific city and state
// @Tags services
// @Produce json
// @Param city query string true "City name"
// @Param state query string true "State name"
// @Success 200 {object} views.Response{data=[]models.Service}
// @Failure 400 {object} views.Response
// @Router /api/v1/services/by-location [get]
func (sc *ServiceController) GetServicesByLocation(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServicesByLocation panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServicesByLocation called")
	
	city := c.Query("city")
	state := c.Query("state")
	
	if city == "" || state == "" {
		c.JSON(400, views.CreateErrorResponse("City and state are required", ""))
		return
	}
	
	logrus.Infof("ServiceController.GetServicesByLocation city: %s, state: %s", city, state)
	
	services, err := sc.serviceService.GetServicesByLocation(city, state)
	if err != nil {
		logrus.Errorf("ServiceController.GetServicesByLocation error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve services", err.Error()))
		return
	}
	
	// Convert to summaries to reduce response size
	var summaries []models.ServiceSummary
	for _, service := range services {
		// Convert service areas to summaries
		var serviceAreaSummaries []models.ServiceAreaSummary
		for _, area := range service.ServiceAreas {
			serviceAreaSummaries = append(serviceAreaSummaries, models.ServiceAreaSummary{
				ID:       area.ID,
				City:     area.City,
				State:    area.State,
				Country:  area.Country,
				IsActive: area.IsActive,
			})
		}
		
		summary := models.ServiceSummary{
			ID:              service.ID,
			Name:            service.Name,
			Slug:            service.Slug,
			Description:     service.Description,
			Images:          service.Images,
			PriceType:       service.PriceType,
			Price:           service.Price,
			Duration:        service.Duration,
			CategoryID:      service.CategoryID,
			SubcategoryID:   service.SubcategoryID,
			CategoryName:    service.Category.Name,
			SubcategoryName: service.Subcategory.Name,
			IsActive:        service.IsActive,
			CreatedAt:       service.CreatedAt,
			UpdatedAt:       service.UpdatedAt,
			DeletedAt:       service.DeletedAt,
			ServiceAreas:    serviceAreaSummaries,
		}
		summaries = append(summaries, summary)
	}
	
	logrus.Infof("ServiceController.GetServicesByLocation returning %d services", len(summaries))
	c.JSON(200, views.CreateSuccessResponse("Services retrieved successfully", summaries))
}

// UpdateService updates a service
// @Summary Update a service
// @Description Update an existing service
// @Tags services
// @Accept multipart/form-data
// @Produce json
// @Param id path integer true "Service ID"
// @Param name formData string false "Service name"
// @Param description formData string false "Service description"
// @Param price_type formData string false "Price type (fixed or inquiry)"
// @Param price formData number false "Fixed price"
// @Param duration formData string false "Service duration"
// @Param subcategory_id formData integer false "Subcategory ID"
// @Param is_active formData boolean false "Is active"
// @Param images formData file false "Additional service images"
// @Success 200 {object} views.Response{data=models.Service}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/services/{id} [put]
func (sc *ServiceController) UpdateService(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	contentType := c.GetHeader("Content-Type")
	var req models.UpdateServiceRequest
	var imageFiles []*multipart.FileHeader

	if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data
		req.Name = c.PostForm("name")
		req.Description = c.PostForm("description")
		req.PriceType = c.PostForm("price_type")
		if duration := c.PostForm("duration"); duration != "" {
			req.Duration = &duration
		}
		
		if subcategoryIDStr := c.PostForm("subcategory_id"); subcategoryIDStr != "" {
			if subcategoryID, err := strconv.ParseUint(subcategoryIDStr, 10, 32); err == nil {
				subcategoryID := uint(subcategoryID)
				req.SubcategoryID = &subcategoryID
			}
		}
		
		if priceStr := c.PostForm("price"); priceStr != "" {
			if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
				req.Price = &price
			}
		}
		
		if isActiveStr := c.PostForm("is_active"); isActiveStr != "" {
			if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
				req.IsActive = &isActive
			}
		}

		// Handle multiple image files
		form, err := c.MultipartForm()
		if err == nil {
			if files, exists := form.File["images"]; exists {
				imageFiles = append(imageFiles, files...)
			}
		}
	} else {
		// Handle JSON
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	}

	service, err := sc.serviceService.UpdateService(uint(id), &req, imageFiles)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Failed to update service", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service updated successfully", service))
}

// DeleteService deletes a service
// @Summary Delete a service
// @Description Delete a service by ID
// @Tags services
// @Produce json
// @Param id path integer true "Service ID"
// @Success 200 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/services/{id} [delete]
func (sc *ServiceController) DeleteService(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	err = sc.serviceService.DeleteService(uint(id))
	if err != nil {
		c.JSON(500, views.CreateErrorResponse("Failed to delete service", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service deleted successfully", nil))
}

// GetServiceCategories retrieves all service categories
// @Summary Get service categories
// @Description Get all service categories for the Home Services module
// @Tags services
// @Produce json
// @Success 200 {object} views.Response{data=[]models.Category}
// @Router /api/v1/services/categories [get]
func (sc *ServiceController) GetServiceCategories(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServiceCategories panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServiceCategories called")
	
	categories, err := sc.serviceService.GetServiceCategories()
	if err != nil {
		logrus.Errorf("ServiceController.GetServiceCategories error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve categories", err.Error()))
		return
	}

	logrus.Infof("ServiceController.GetServiceCategories returning %d categories", len(categories))
	c.JSON(200, views.CreateSuccessResponse("Categories retrieved successfully", categories))
}

// GetServiceSubcategories retrieves subcategories for a category
// @Summary Get service subcategories
// @Description Get all subcategories for a specific category
// @Tags services
// @Produce json
// @Param id path integer true "Category ID"
// @Success 200 {object} views.Response{data=[]models.Subcategory}
// @Router /api/v1/services/categories/{id}/subcategories [get]
func (sc *ServiceController) GetServiceSubcategories(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetServiceSubcategories panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetServiceSubcategories called")
	
	categoryIDStr := c.Param("id")
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		logrus.Errorf("ServiceController.GetServiceSubcategories invalid category ID: %v", err)
		c.JSON(400, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	subcategories, err := sc.serviceService.GetServiceSubcategories(uint(categoryID))
	if err != nil {
		logrus.Errorf("ServiceController.GetServiceSubcategories error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve subcategories", err.Error()))
		return
	}

	logrus.Infof("ServiceController.GetServiceSubcategories returning %d subcategories", len(subcategories))
	c.JSON(200, views.CreateSuccessResponse("Subcategories retrieved successfully", subcategories))
}

// ToggleStatus toggles the active status of a service
// @Summary Toggle service status
// @Description Toggle the active status of a service
// @Tags services
// @Produce json
// @Param id path integer true "Service ID"
// @Success 200 {object} views.Response{data=models.Service}
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/services/{id}/status [patch]
func (sc *ServiceController) ToggleStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}

	service, err := sc.serviceService.ToggleStatus(uint(id))
	if err != nil {
		c.JSON(500, views.CreateErrorResponse("Failed to toggle service status", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service status toggled successfully", service))
}

// GetPopularServices retrieves the top 8 most popular services
// @Summary Get popular services
// @Description Get the top 8 most popular services with optional city and state filtering
// @Tags services
// @Produce json
// @Param city query string false "City name for location-based filtering"
// @Param state query string false "State name for location-based filtering"
// @Success 200 {object} views.Response{data=[]models.ServiceSummary}
// @Failure 500 {object} views.Response
// @Router /api/v1/services/popular [get]
func (sc *ServiceController) GetPopularServices(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.GetPopularServices panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.GetPopularServices called")
	
	// Get optional location parameters
	city := c.Query("city")
	state := c.Query("state")
	
	logrus.Infof("ServiceController.GetPopularServices filters - city: %s, state: %s", city, state)
	
	services, err := sc.serviceService.GetPopularServices(8, city, state) // Default to top 8
	if err != nil {
		logrus.Errorf("Failed to get popular services: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to get popular services", err.Error()))
		return
	}
	
	c.JSON(200, views.CreateSuccessResponse("Popular services retrieved successfully", services))
}

// DeleteServiceImage deletes a specific image from a service
// @Summary Delete service image
// @Description Delete a specific image from a service
// @Tags services
// @Produce json
// @Param id path integer true "Service ID"
// @Param image_url body string true "Image URL to delete"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /api/v1/admin/services/{id}/images [delete]
func (sc *ServiceController) DeleteServiceImage(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceController.DeleteServiceImage panic: %v", r)
		}
	}()
	
	logrus.Info("ServiceController.DeleteServiceImage called")
	
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid service ID", err.Error()))
		return
	}
	
	// Get image URL from request body
	var req struct {
		ImageURL string `json:"image_url" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}
	
	err = sc.serviceService.DeleteServiceImage(uint(id), req.ImageURL)
	if err != nil {
		logrus.Errorf("ServiceController.DeleteServiceImage error: %v", err)
		c.JSON(400, views.CreateErrorResponse("Failed to delete service image", err.Error()))
		return
	}
	
	c.JSON(200, views.CreateSuccessResponse("Service image deleted successfully", nil))
}


