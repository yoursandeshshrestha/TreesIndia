package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupNotificationRoutes sets up notification-related routes
func SetupNotificationRoutes(r *gin.RouterGroup, notificationController *controllers.NotificationController) {
	// Notification routes group
	notificationGroup := r.Group("/notifications")
	{
		// Device management routes (require authentication)
		deviceGroup := notificationGroup.Group("/")
		deviceGroup.Use(middleware.AuthMiddleware())
		{
			deviceGroup.POST("/register-device", notificationController.RegisterDevice)
			deviceGroup.DELETE("/unregister-device", notificationController.UnregisterDevice)
			deviceGroup.GET("/devices", notificationController.GetUserDevices)
		}

		// Notification sending routes (require authentication)
		sendGroup := notificationGroup.Group("/")
		sendGroup.Use(middleware.AuthMiddleware())
		{
			sendGroup.POST("/send", notificationController.SendNotification)
		}

		// Notification history and stats routes (require authentication)
		historyGroup := notificationGroup.Group("/")
		historyGroup.Use(middleware.AuthMiddleware())
		{
			historyGroup.GET("/history", notificationController.GetNotificationHistory)
			historyGroup.GET("/stats", notificationController.GetNotificationStats)
			historyGroup.PATCH("/:notification_id/delivered", notificationController.MarkNotificationAsDelivered)
		}

		// Admin routes (require admin authentication)
		adminGroup := notificationGroup.Group("/")
		adminGroup.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			adminGroup.GET("/device-stats", notificationController.GetDeviceStats)
		}
	}
}
