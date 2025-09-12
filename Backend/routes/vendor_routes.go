package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupVendorRoutes sets up vendor-related routes
func SetupVendorRoutes(router *gin.RouterGroup) {
	vendorController := controllers.NewVendorController()
	
	// Vendor routes (authenticated users)
	vendorGroup := router.Group("/vendors")
	vendorGroup.Use(middleware.AuthMiddleware())
	{
		// CRUD operations for vendor profiles
		vendorGroup.POST("", vendorController.CreateVendor)
		vendorGroup.GET("", vendorController.GetVendors)
		vendorGroup.GET("/stats", vendorController.GetVendorStats)
		vendorGroup.GET("/:id", vendorController.GetVendor)
		vendorGroup.PUT("/:id", vendorController.UpdateVendor)
		vendorGroup.DELETE("/:id", vendorController.DeleteVendor)
	}
	
	// Public vendor routes (no authentication required)
	publicGroup := router.Group("/public")
	{
		publicVendorGroup := publicGroup.Group("/vendors")
		{
			publicVendorGroup.GET("", vendorController.GetPublicVendors)
			publicVendorGroup.GET("/search", vendorController.SearchVendors)
			publicVendorGroup.GET("/type/:type", vendorController.GetVendorsByBusinessType)
		}
	}
}
