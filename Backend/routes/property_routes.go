package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupPropertyRoutes sets up property-related routes
func SetupPropertyRoutes(router *gin.RouterGroup, enhancedNotificationService *services.EnhancedNotificationService) {
	propertyController := controllers.NewPropertyController(enhancedNotificationService)

	// Public routes (no authentication required)
	properties := router.Group("/properties")
	{
		properties.GET("", propertyController.GetAllProperties)                    // Get all properties with filters
		properties.GET("/:id", propertyController.GetPropertyByID)                // Get property by ID
		properties.GET("/slug/:slug", propertyController.GetPropertyBySlug)       // Get property by slug
	}

	// User routes (authentication required - for both users and brokers)
	userProperties := router.Group("/user/properties")
	userProperties.Use(middleware.AuthMiddleware())
	{
		userProperties.POST("", propertyController.CreateProperty)                // Create property listing (users and brokers)
		userProperties.GET("", propertyController.GetUserProperties)              // Get user's properties (works for both users and brokers)
		userProperties.PUT("/:id", propertyController.UpdateUserProperty)        // Update user's property
		userProperties.DELETE("/:id", propertyController.DeleteUserProperty)      // Delete user's property
	}

	// Admin routes (admin authentication required)
	adminProperties := router.Group("/admin/properties")
	adminProperties.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminProperties.GET("", propertyController.GetAllPropertiesForAdmin)      // Get all properties (admin only - shows all statuses)
		adminProperties.GET("/:id", propertyController.GetPropertyByID)           // Get property by ID (admin only)
		adminProperties.GET("/stats", propertyController.GetPropertyStats)        // Get property statistics (admin only)
		adminProperties.POST("", propertyController.CreateAdminProperty)          // Create property (admin only)
		adminProperties.GET("/pending", propertyController.GetPendingProperties)  // Get pending properties only (admin only)
		adminProperties.GET("/pending-approval", propertyController.GetPendingApproval) // Get pending approval properties (legacy)
		adminProperties.PUT("/:id", propertyController.UpdateProperty)            // Update property (admin only)
		adminProperties.PATCH("/:id/status", propertyController.UpdatePropertyStatus) // Update property status (admin only)
		adminProperties.DELETE("/:id", propertyController.DeleteProperty)         // Delete property (admin only)
		adminProperties.POST("/:id/approve", propertyController.ApproveProperty)  // Approve property (admin only)
		adminProperties.POST("/:id/reject", propertyController.RejectProperty)    // Reject property (admin only)
	}
}
