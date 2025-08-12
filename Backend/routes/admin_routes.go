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
	}
}
