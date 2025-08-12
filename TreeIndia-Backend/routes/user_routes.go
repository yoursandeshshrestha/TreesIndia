package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes sets up user-related routes
func SetupUserRoutes(router *gin.RouterGroup) {
	userController := controllers.NewUserController()

	// User routes (authentication required)
	users := router.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		// GET /api/v1/users/profile - Get user profile
		users.GET("/profile", userController.GetUserProfile)
		
		// PUT /api/v1/users/profile - Update user profile
		users.PUT("/profile", userController.UpdateUserProfile)
		
		// POST /api/v1/users/upload-avatar - Upload profile picture
		users.POST("/upload-avatar", userController.UploadAvatar)
		
		// GET /api/v1/users/notifications - Get notification settings
		users.GET("/notifications", userController.GetNotificationSettings)
		
		// PUT /api/v1/users/notifications - Update notification settings
		users.PUT("/notifications", userController.UpdateNotificationSettings)
	}
}
