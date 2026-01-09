package controllers

import (
	"net/http"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type GoogleMapsController struct {
	BaseController
	googleMapsService *services.GoogleMapsService
}

func NewGoogleMapsController(googleMapsService *services.GoogleMapsService) *GoogleMapsController {
	return &GoogleMapsController{
		googleMapsService: googleMapsService,
	}
}

// GetDirections gets directions between two points
// @Summary Get directions
// @Description Get directions between origin and destination
// @Tags Maps
// @Accept json
// @Produce json
// @Param origin query string true "Origin coordinates (latitude,longitude)"
// @Param destination query string true "Destination coordinates (latitude,longitude)"
// @Success 200 {object} views.Response{data=services.DirectionsResult}
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /maps/directions [get]
func (gmc *GoogleMapsController) GetDirections(c *gin.Context) {
	origin := c.Query("origin")
	destination := c.Query("destination")

	if origin == "" || destination == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Bad Request", "origin and destination are required"))
		return
	}

	// Get directions from Google Maps
	directions, err := gmc.googleMapsService.GetDirections(origin, destination)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal Server Error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Directions retrieved successfully", directions))
}
