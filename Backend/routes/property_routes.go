package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupPropertyRoutes sets up property-related routes
func SetupPropertyRoutes(router *gin.RouterGroup) {
	propertyController := controllers.NewPropertyController()
	
	// Public routes (no authentication required)
	properties := router.Group("/properties")
	{
		properties.GET("", propertyController.GetAllProperties)                    // Get all properties with filters
		properties.GET("/:id", propertyController.GetPropertyByID)                // Get property by ID
		properties.GET("/slug/:slug", propertyController.GetPropertyBySlug)       // Get property by slug
	}
	
	// User routes (authentication required)
	userProperties := router.Group("/user/properties")
	userProperties.Use(middleware.AuthMiddleware())
	{
		userProperties.POST("", propertyController.CreateProperty)                // Create property listing
		userProperties.GET("", propertyController.GetUserProperties)              // Get user's properties
	}
	
	// Broker routes (broker authentication required)
	brokerProperties := router.Group("/broker/properties")
	brokerProperties.Use(middleware.AuthMiddleware())
	{
		brokerProperties.POST("", propertyController.CreateProperty)              // Create property listing (brokers)
		brokerProperties.GET("", propertyController.GetBrokerProperties)          // Get broker's properties
	}
	
	// Admin routes (admin authentication required)
	adminProperties := router.Group("/admin/properties")
	adminProperties.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminProperties.POST("", propertyController.CreateAdminProperty)          // Create property (admin only)
		adminProperties.GET("/pending", propertyController.GetPendingApproval)    // Get pending approval properties
		adminProperties.PUT("/:id", propertyController.UpdateProperty)            // Update property (admin only)
		adminProperties.DELETE("/:id", propertyController.DeleteProperty)         // Delete property (admin only)
		adminProperties.POST("/:id/approve", propertyController.ApproveProperty)  // Approve property (admin only)
	}
}
