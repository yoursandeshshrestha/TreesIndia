package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

func SetupServiceRoutes(router *gin.RouterGroup) {
	serviceController := controllers.NewServiceController()

	// Public routes (no authentication required)
	services := router.Group("/services")
	{
		services.GET("", serviceController.GetServices)
		services.GET("/:id", serviceController.GetServiceByID)
		services.GET("/subcategory/:subcategoryId", serviceController.GetServicesBySubcategory)
		services.GET("/categories", serviceController.GetServiceCategories)
		services.GET("/categories/:id/subcategories", serviceController.GetServiceSubcategories)
	}

	// Admin routes (authentication and admin role required)
	adminServices := router.Group("/admin/services")
	adminServices.Use(middleware.AuthMiddleware())
	adminServices.Use(middleware.AdminMiddleware())
	{
		adminServices.POST("", serviceController.CreateService)
		adminServices.PUT("/:id", serviceController.UpdateService)
		adminServices.DELETE("/:id", serviceController.DeleteService)
		adminServices.PATCH("/:id/status", serviceController.ToggleStatus)
	}
}
