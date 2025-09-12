package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminRoutes sets up admin routes
func SetupAdminRoutes(r *gin.RouterGroup) {
	adminController := controllers.NewAdminController()

	// Admin routes (admin authentication required)
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// Admin seeding
		admin.POST("/seed", adminController.SeedAdminUsers)

		// User management
		admin.GET("/users", adminController.GetAllUsers)
		admin.GET("/users/:id", adminController.GetUserByID)
		admin.PUT("/users/:id", adminController.UpdateUserByID)
		admin.DELETE("/users/:id", adminController.DeleteUserByID)
		admin.POST("/users/:id/activate", adminController.ToggleUserActivation)
		
		// Worker type toggle
		admin.PUT("/workers/:worker_id/toggle-worker-type", adminController.ToggleWorkerType)
		
		// Subscription admin routes
		SetupAdminSubscriptionRoutes(admin)
		
		// Project management routes
		SetupAdminProjectRoutes(admin)
	}
}
