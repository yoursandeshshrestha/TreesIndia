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

		// Get configuration by ID
		adminConfigGroup.GET("/:id", adminConfigController.GetConfigByID)

		// Update configuration
		adminConfigGroup.PUT("/:id", adminConfigController.UpdateConfig)

		// Reset to defaults
	

		// Get configuration map
		adminConfigGroup.GET("/map", adminConfigController.GetConfigMap)
	}
}
