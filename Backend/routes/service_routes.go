package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

func SetupServiceRoutes(router *gin.RouterGroup) {
	serviceController := controllers.NewServiceController()
	searchController := controllers.NewSearchController()

	// Public routes (no authentication required)
	services := router.Group("/services")
	{
		services.GET("", serviceController.GetServices)
		services.GET("/popular", serviceController.GetPopularServices)
		services.GET("/subcategory/:subcategoryId", serviceController.GetServicesBySubcategory)
		services.GET("/by-location", serviceController.GetServicesByLocation)
		services.GET("/categories", serviceController.GetServiceCategories)
		services.GET("/categories/:id/subcategories", serviceController.GetServiceSubcategories)
		services.GET("/:id", serviceController.GetServiceByID)
		
		// Search routes
		services.GET("/search/suggestions", searchController.GetSearchSuggestions)
		services.GET("/search", searchController.SearchServices)
		services.GET("/search/advanced", searchController.SearchServicesWithFilters)
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
