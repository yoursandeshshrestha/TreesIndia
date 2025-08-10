package controllers

import (
	"net/http"
	"time"
	"treesindia/config"
	"treesindia/models"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LocationController handles location-related requests
type LocationController struct {
	db *gorm.DB
}

// NewLocationController creates a new location controller
func NewLocationController() *LocationController {
	return &LocationController{
		db: config.GetDB(),
	}
}

// SaveLocationRequest represents location save request
type SaveLocationRequest struct {
	Latitude   float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude  float64 `json:"longitude" binding:"required,min=-180,max=180"`
	Accuracy   *float64 `json:"accuracy"`
	Address    string  `json:"address"`
	City       string  `json:"city"`
	State      string  `json:"state"`
	Country    string  `json:"country"`
	PostalCode string  `json:"postal_code"`
	Source     string  `json:"source" binding:"required,oneof=gps ip manual"`
}

// UpdateLocationRequest represents location update request
type UpdateLocationRequest struct {
	Latitude   float64  `json:"latitude" binding:"required,min=-90,max=180"`
	Longitude  float64  `json:"longitude" binding:"required,min=-180,max=180"`
	Accuracy   *float64 `json:"accuracy"`
	Address    string   `json:"address"`
	City       string   `json:"city"`
	State      string   `json:"state"`
	Country    string   `json:"country"`
	PostalCode string   `json:"postal_code"`
	Source     string   `json:"source" binding:"required,oneof=gps ip manual"`
}

// SaveLocation godoc
// @Summary Save user location
// @Description Save user's current location
// @Tags Location
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param location body SaveLocationRequest true "Location data"
// @Success 201 {object} models.Response "Location saved successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/location [post]
func (lc *LocationController) SaveLocation(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	var req SaveLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Check if location already exists for user
	var existingLocation models.Location
	err := lc.db.Where("user_id = ?", userID).First(&existingLocation).Error
	
	location := models.Location{
		UserID:         userID.(uint),
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		Accuracy:       req.Accuracy,
		Address:        req.Address,
		City:           req.City,
		State:          req.State,
		Country:        req.Country,
		PostalCode:     req.PostalCode,
		LocationSource: models.LocationSource(req.Source),
		IsPrimary:      true,
		LastUpdated:    time.Now(),
	}

	if err == gorm.ErrRecordNotFound {
		// Create new location
		if err := lc.db.Create(&location).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to save location", err.Error()))
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	} else {
		// Update existing location
		existingLocation.Latitude = req.Latitude
		existingLocation.Longitude = req.Longitude
		existingLocation.Accuracy = req.Accuracy
		existingLocation.Address = req.Address
		existingLocation.City = req.City
		existingLocation.State = req.State
		existingLocation.Country = req.Country
		existingLocation.PostalCode = req.PostalCode
		existingLocation.LocationSource = models.LocationSource(req.Source)
		existingLocation.LastUpdated = time.Now()

		if err := lc.db.Save(&existingLocation).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update location", err.Error()))
			return
		}
		location = existingLocation
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Location saved successfully", location))
}

// GetLocation godoc
// @Summary Get user location
// @Description Get user's current location
// @Tags Location
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Location retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/location [get]
func (lc *LocationController) GetLocation(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	var location models.Location
	if err := lc.db.Where("user_id = ?", userID).First(&location).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", "No location data found for user"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location retrieved successfully", location))
}

// UpdateLocation godoc
// @Summary Update user location
// @Description Update user's current location
// @Tags Location
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param location body UpdateLocationRequest true "Updated location data"
// @Success 200 {object} models.Response "Location updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "Location not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/location [put]
func (lc *LocationController) UpdateLocation(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	var req UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	var location models.Location
	if err := lc.db.Where("user_id = ?", userID).First(&location).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Location not found", "No location data found for user"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Update location fields
	location.Latitude = req.Latitude
	location.Longitude = req.Longitude
	location.Accuracy = req.Accuracy
	location.Address = req.Address
	location.City = req.City
	location.State = req.State
	location.Country = req.Country
	location.PostalCode = req.PostalCode
	location.LocationSource = models.LocationSource(req.Source)
	location.LastUpdated = time.Now()

	if err := lc.db.Save(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update location", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Location updated successfully", location))
}
