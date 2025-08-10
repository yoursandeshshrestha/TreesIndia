package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupLocationRoutes sets up location-related routes
func SetupLocationRoutes(r *gin.RouterGroup) {
	locationController := controllers.NewLocationController()

	// Protected routes (authentication required)
	userLocation := r.Group("/users")
	userLocation.Use(middleware.AuthMiddleware())
	{
		userLocation.POST("/location", locationController.SaveLocation)
		userLocation.GET("/location", locationController.GetLocation)
		userLocation.PUT("/location", locationController.UpdateLocation)
	}
}
