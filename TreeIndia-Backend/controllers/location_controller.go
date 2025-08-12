package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// LocationController handles location-related HTTP requests
type LocationController struct {
	*BaseController
	locationService *services.LocationService
}

// NewLocationController creates a new location controller
func NewLocationController() *LocationController {
	// Add panic recovery for service initialization
	defer func() {
		if r := recover(); r != nil {
			panic("Failed to initialize LocationController: " + fmt.Sprintf("%v", r))
		}
	}()

	return &LocationController{
		BaseController:  NewBaseController(),
		locationService: services.NewLocationService(),
	}
}

// CreateLocation godoc
// @Summary Create a new location
// @Description Create a new location for the authenticated user
// @Tags Location
// @Accept json
// @Produce json
// @Param location body models.CreateLocationRequest true "Location data"
// @Security BearerAuth
// @Success 201 {object} models.Response "Location created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 409 {object} models.Response "Location already exists for user"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations [post]
func (lc *LocationController) CreateLocation(c *gin.Context) {
	var req models.CreateLocationRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID := c.GetUint("user_id")

	// Create location
	location, err := lc.locationService.CreateLocation(userID, &req)
	if err != nil {
		if err.Error() == "location already exists for user" {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Location already exists", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create location", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Location created successfully", location))
}

// GetLocationByID godoc
// @Summary Get location by ID
// @Description Get a specific location by its ID
// @Tags Location
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Security BearerAuth
// @Success 200 {object} models.Response "Location retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations/{id} [get]
func (lc *LocationController) GetLocationByID(c *gin.Context) {
	// Add panic recovery
	defer func() {
		if r := recover(); r != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal server error", "Something went wrong"))
		}
	}()

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing location ID", "Location ID is required"))
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid location ID", err.Error()))
		return
	}

	location, err := lc.locationService.GetLocationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location retrieved successfully", location))
}

// GetLocationByUserID godoc
// @Summary Get user's location
// @Description Get the current user's location
// @Tags Location
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Location retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations/user/me [get]
func (lc *LocationController) GetLocationByUserID(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := c.GetUint("user_id")

	location, err := lc.locationService.GetLocationByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location retrieved successfully", location))
}

// UpdateLocation godoc
// @Summary Update location
// @Description Update an existing location
// @Tags Location
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Param location body models.UpdateLocationRequest true "Updated location data"
// @Security BearerAuth
// @Success 200 {object} models.Response "Location updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations/{id} [put]
func (lc *LocationController) UpdateLocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid location ID", err.Error()))
		return
	}

	var req models.UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	location, err := lc.locationService.UpdateLocation(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location updated successfully", location))
}

// DeleteLocation godoc
// @Summary Delete location
// @Description Delete a location
// @Tags Location
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Security BearerAuth
// @Success 200 {object} models.Response "Location deleted successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations/{id} [delete]
func (lc *LocationController) DeleteLocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid location ID", err.Error()))
		return
	}

	err = lc.locationService.DeleteLocation(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location deleted successfully", nil))
}

// GetLocationStats godoc
// @Summary Get location statistics
// @Description Get location statistics (admin only)
// @Tags Location
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Statistics retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /locations/stats [get]
func (lc *LocationController) GetLocationStats(c *gin.Context) {
	stats, err := lc.locationService.GetLocationStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get statistics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Statistics retrieved successfully", stats))
}
