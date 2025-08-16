package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminConfigRoutes sets up admin configuration routes
func SetupAdminConfigRoutes(group *gin.RouterGroup) {
	adminConfigController := controllers.NewAdminConfigController()

	// Admin configuration routes (admin only)
	adminConfigGroup := group.Group("/admin/configs")
	adminConfigGroup.Use(middleware.AuthMiddleware())
	adminConfigGroup.Use(middleware.AdminMiddleware()) // Ensure only admins can access

	{
		// Get all configurations
		adminConfigGroup.GET("", adminConfigController.GetAllConfigs)

		// Get configurations by category
		adminConfigGroup.GET("/category/:category", adminConfigController.GetConfigsByCategory)

		// Get configuration by key
		adminConfigGroup.GET("/key/:key", adminConfigController.GetConfigByKey)

		// Get configuration by ID
		adminConfigGroup.GET("/:id", adminConfigController.GetConfigByID)

		// Create new configuration
		adminConfigGroup.POST("", adminConfigController.CreateConfig)

		// Update configuration
		adminConfigGroup.PUT("/:id", adminConfigController.UpdateConfig)

		// Delete configuration
		adminConfigGroup.DELETE("/:id", adminConfigController.DeleteConfig)

		// Set configuration value by key
		adminConfigGroup.PUT("/key/:key/value", adminConfigController.SetConfigValue)

		// Reset to defaults
		adminConfigGroup.POST("/reset", adminConfigController.ResetToDefaults)

		// Initialize defaults
		adminConfigGroup.POST("/initialize", adminConfigController.InitializeDefaults)

		// Get configuration map
		adminConfigGroup.GET("/map", adminConfigController.GetConfigMap)
	}
}
