package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupServiceAreaRoutes sets up service area routes
func SetupServiceAreaRoutes(router *gin.RouterGroup) {
	serviceAreaController := controllers.NewServiceAreaController()

	// Public routes for service availability checks
	publicAvailability := router.Group("/service-availability")
	{
		// GET /api/v1/service-availability/:service_id - Check if a specific service is available in a location
		publicAvailability.GET("/:service_id", serviceAreaController.CheckServiceAvailability)
	}

	// Admin routes for service area management
	adminServiceAreas := router.Group("/admin/service-areas")
	adminServiceAreas.Use(middleware.AuthMiddleware())
	adminServiceAreas.Use(middleware.AdminMiddleware())
	{
		adminServiceAreas.GET("", serviceAreaController.GetAllServiceAreas)
		adminServiceAreas.POST("", serviceAreaController.CreateServiceArea)
		adminServiceAreas.GET("/:id", serviceAreaController.GetServiceAreaByID)
		adminServiceAreas.PUT("/:id", serviceAreaController.UpdateServiceArea)
		adminServiceAreas.DELETE("/:id", serviceAreaController.DeleteServiceArea)
		adminServiceAreas.GET("/stats", serviceAreaController.GetServiceAreaStats)
	}

	// Admin routes for service-specific service areas
	adminServiceServiceAreas := router.Group("/admin/services/:service_id/service-areas")
	adminServiceServiceAreas.Use(middleware.AuthMiddleware())
	adminServiceServiceAreas.Use(middleware.AdminMiddleware())
	{
		adminServiceServiceAreas.GET("", serviceAreaController.GetServiceAreasByServiceID)
	}
}
