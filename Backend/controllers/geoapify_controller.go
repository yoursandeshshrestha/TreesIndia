package controllers

import (
	"net/http"
	"strconv"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// GeoapifyController handles Geoapify API HTTP requests
type GeoapifyController struct {
	*BaseController
	geoapifyService *services.GeoapifyService
}

// NewGeoapifyController creates a new Geoapify controller
func NewGeoapifyController() *GeoapifyController {
	return &GeoapifyController{
		BaseController:  NewBaseController(),
		geoapifyService: services.NewGeoapifyService(),
	}
}

// GetPlaceAutocomplete godoc
// @Summary Get place autocomplete suggestions
// @Description Get autocomplete suggestions for places
// @Tags Geoapify
// @Accept json
// @Produce json
// @Param input query string true "Input text for autocomplete"
// @Param latitude query number false "Latitude for location bias"
// @Param longitude query number false "Longitude for location bias"
// @Param radius query integer false "Radius for location bias in meters"
// @Success 200 {object} models.Response "Autocomplete suggestions retrieved successfully"
// @Failure 400 {object} models.Response "Invalid request parameters"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /places/autocomplete [get]
func (gpc *GeoapifyController) GetPlaceAutocomplete(c *gin.Context) {
	req := &services.AutocompleteRequest{}

	// Parse query parameters
	if input := c.Query("input"); input != "" {
		req.Input = input
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Input parameter is required"))
		return
	}

	if latStr := c.Query("latitude"); latStr != "" {
		if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
			req.Latitude = lat
		}
	}

	if lngStr := c.Query("longitude"); lngStr != "" {
		if lng, err := strconv.ParseFloat(lngStr, 64); err == nil {
			req.Longitude = lng
		}
	}

	if radiusStr := c.Query("radius"); radiusStr != "" {
		if radius, err := strconv.Atoi(radiusStr); err == nil {
			req.Radius = radius
		}
	}

	// Get autocomplete suggestions
	result, err := gpc.geoapifyService.GetPlaceAutocomplete(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get autocomplete suggestions", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Autocomplete suggestions retrieved successfully", result))
}

// GeocodeAddress godoc
// @Summary Geocode an address
// @Description Convert an address to coordinates
// @Tags Geoapify
// @Accept json
// @Produce json
// @Param address query string true "Address to geocode"
// @Success 200 {object} models.Response "Address geocoded successfully"
// @Failure 400 {object} models.Response "Invalid request parameters"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /places/geocode [get]
func (gpc *GeoapifyController) GeocodeAddress(c *gin.Context) {
	req := &services.GeocodeRequest{}

	// Parse query parameters
	if address := c.Query("address"); address != "" {
		req.Address = address
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Address parameter is required"))
		return
	}

	// Geocode address
	result, err := gpc.geoapifyService.GeocodeAddress(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to geocode address", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Address geocoded successfully", result))
}
