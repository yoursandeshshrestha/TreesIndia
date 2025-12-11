package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminNotificationRoutes sets up admin notification routes
func SetupAdminNotificationRoutes(r *gin.RouterGroup) {
	// This will be initialized in main.go and passed here
	// For now, we'll create a new controller instance
	// Note: In main.go, you'll need to pass the notificationController here
}

// SetupAdminNotificationRoutesWithController sets up admin notification routes with a controller instance
func SetupAdminNotificationRoutesWithController(r *gin.RouterGroup, notificationController *controllers.NotificationController) {
	// Admin notification routes (require admin authentication)
	adminNotifications := r.Group("/notifications")
	adminNotifications.Use(
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
	)
	{
		// Send notification to a single user
		adminNotifications.POST("/send", notificationController.SendNotificationToUser)
		
		// Send notifications to multiple users
		adminNotifications.POST("/send-bulk", notificationController.SendNotificationToMultipleUsers)
	}
}


