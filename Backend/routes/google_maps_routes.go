package routes

import (
	"treesindia/controllers"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupGoogleMapsRoutes sets up Google Maps API routes
func SetupGoogleMapsRoutes(router *gin.RouterGroup) {
	// Initialize Google Maps service
	googleMapsService := services.NewGoogleMapsService()
	googleMapsController := controllers.NewGoogleMapsController(googleMapsService)

	// Google Maps routes (public access - no authentication required)
	maps := router.Group("/maps")
	{
		// GET /api/v1/maps/directions - Get directions between two points
		maps.GET("/directions", googleMapsController.GetDirections)
	}
}
