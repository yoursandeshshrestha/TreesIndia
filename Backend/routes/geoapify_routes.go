package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
)

// SetupGeoapifyRoutes sets up Geoapify API routes
func SetupGeoapifyRoutes(router *gin.RouterGroup) {
	geoapifyController := controllers.NewGeoapifyController()

	// Geoapify routes (public access - no authentication required)
	places := router.Group("/places")
	{
		// GET /api/v1/places/autocomplete - Get place autocomplete suggestions
		places.GET("/autocomplete", geoapifyController.GetPlaceAutocomplete)
		
		// GET /api/v1/places/reverse-geocode - Reverse geocode coordinates
		places.GET("/reverse-geocode", geoapifyController.ReverseGeocode)
	}
}
