package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/models"

	"github.com/gin-gonic/gin"
)

// SetupAdminConfigRoutes sets up admin configuration routes
func SetupAdminConfigRoutes(group *gin.RouterGroup) {
	adminConfigController := controllers.NewAdminConfigController()

	// Admin configuration routes (admin only)
	adminConfigGroup := group.Group("/admin/configs")
	adminConfigGroup.Use(
		middleware.AuthMiddleware(),
		// Only super admins can manage system configuration
		middleware.RequireAdminRoles(models.AdminRoleSuperAdmin),
	)

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
