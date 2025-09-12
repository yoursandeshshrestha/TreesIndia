package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminVendorRoutes sets up admin vendor-related routes
func SetupAdminVendorRoutes(router *gin.RouterGroup) {
	adminVendorController := controllers.NewAdminVendorController()
	
	// Admin vendor routes (admin authentication required)
	adminVendorGroup := router.Group("/vendors")
	adminVendorGroup.Use(middleware.AuthMiddleware())
	adminVendorGroup.Use(middleware.AdminMiddleware())
	{
		// Admin CRUD operations for vendor profiles
		adminVendorGroup.GET("", adminVendorController.GetAllVendors)
		adminVendorGroup.GET("/stats", adminVendorController.GetVendorStats)
		adminVendorGroup.GET("/search", adminVendorController.SearchVendors)
		adminVendorGroup.GET("/type/:type", adminVendorController.GetVendorsByBusinessType)
		adminVendorGroup.GET("/:id", adminVendorController.GetVendor)
		adminVendorGroup.PUT("/:id", adminVendorController.UpdateVendor)
		adminVendorGroup.DELETE("/:id", adminVendorController.DeleteVendor)
	}
}
