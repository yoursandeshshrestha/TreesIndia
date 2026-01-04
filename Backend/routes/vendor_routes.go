package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupVendorRoutes sets up vendor-related routes
func SetupVendorRoutes(router *gin.RouterGroup) {
	vendorController := controllers.NewVendorController()

	// Vendor routes (authenticated users - subscription required)
	vendorGroup := router.Group("/vendors")
	vendorGroup.Use(middleware.AuthMiddleware())
	{
		// CRUD operations for vendor profiles
		vendorGroup.POST("", vendorController.CreateVendor)
		vendorGroup.GET("", vendorController.GetPublicVendors)  // Get all public vendors (changed from GetVendors)
		vendorGroup.GET("/my", vendorController.GetVendors)      // Get my created vendors (new route)
		vendorGroup.GET("/stats", vendorController.GetVendorStats)
		vendorGroup.GET("/search", vendorController.SearchVendors)
		vendorGroup.GET("/type/:type", vendorController.GetVendorsByBusinessType)
		vendorGroup.GET("/:id", vendorController.GetVendor)
		vendorGroup.PUT("/:id", vendorController.UpdateVendor)
		vendorGroup.DELETE("/:id", vendorController.DeleteVendor)
	}
}
