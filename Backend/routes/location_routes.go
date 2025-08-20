package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupLocationRoutes sets up location-related routes
func SetupLocationRoutes(router *gin.RouterGroup) {
	locationController := controllers.NewLocationController()

	// Location routes (authentication required)
	locations := router.Group("/locations")
	locations.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/locations - Create new location
		locations.POST("", locationController.CreateLocation)
		
		// GET /api/v1/locations/user/me - Get current user's location (MUST come before /:id)
		locations.GET("/user/me", locationController.GetLocationByUserID)
		

		
		// PUT /api/v1/locations/user/me - Update current user's location
		locations.PUT("/user/me", locationController.UpdateUserLocation)
		
		// GET /api/v1/locations/:id - Get location by ID
		locations.GET("/:id", locationController.GetLocationByID)
		
		// PUT /api/v1/locations/:id - Update location
		locations.PUT("/:id", locationController.UpdateLocation)
		

		
		// DELETE /api/v1/locations/:id - Delete location
		locations.DELETE("/:id", locationController.DeleteLocation)
	}

	// Admin location routes (admin authentication required)
	adminLocations := router.Group("/admin/locations")
	adminLocations.Use(middleware.AuthMiddleware())
	adminLocations.Use(middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/locations/stats - Get location statistics
		adminLocations.GET("/stats", locationController.GetLocationStats)
	}
}
