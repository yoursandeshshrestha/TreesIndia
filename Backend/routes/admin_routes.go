package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/models"

	"github.com/gin-gonic/gin"
)

// SetupAdminRoutes sets up admin routes
func SetupAdminRoutes(r *gin.RouterGroup) {
	adminController := controllers.NewAdminController()

	// Admin routes (admin authentication required)
	admin := r.Group("/admin")
	admin.Use(
		middleware.AuthMiddleware(),
		middleware.RequireAdminRoles(
			// General admin panel access: most admin roles can view/manage users
			models.AdminRoleSuperAdmin,
			models.AdminRoleSupportAgent,
			models.AdminRoleBookingManager,
			models.AdminRoleVendorManager,
			models.AdminRoleFinanceManager,
			models.AdminRoleContentManager,
			models.AdminRolePropertiesManager,
		),
	)
	{
		// Admin seeding
		admin.POST("/seed", adminController.SeedAdminUsers)

		// User management
		admin.POST("/users", adminController.CreateUser)
		admin.GET("/users", adminController.GetAllUsers)
		admin.GET("/users/stats", adminController.GetUserStats)
		admin.GET("/users/search", adminController.SearchUsers)
		admin.GET("/users/:id", adminController.GetUserByID)
		admin.PUT("/users/:id", adminController.UpdateUserByID)
		admin.DELETE("/users/:id", adminController.DeleteUserByID)
		admin.POST("/users/:id/activate", adminController.ToggleUserActivation)
		
		// Worker management
		admin.GET("/workers/stats", adminController.GetWorkerStats)
		admin.PUT("/workers/:worker_id/toggle-worker-type", adminController.ToggleWorkerType)
		
		// Subscription admin routes
		SetupAdminSubscriptionRoutes(admin)
		
		// Project management routes
		SetupAdminProjectRoutes(admin)
		
		// Vendor management routes
		SetupAdminVendorRoutes(admin)
	}
}
