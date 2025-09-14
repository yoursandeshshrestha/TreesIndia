package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupInAppNotificationRoutes sets up in-app notification routes
func SetupInAppNotificationRoutes(router *gin.RouterGroup, wsService *services.NotificationWebSocketService, notificationService *services.InAppNotificationService) {
	// Create controllers
	notificationController := controllers.NewInAppNotificationController(notificationService)
	wsController := controllers.NewNotificationWebSocketController(wsService, notificationService)

	// User in-app notification routes (authentication required)
	userInAppNotifications := router.Group("/in-app-notifications")
	userInAppNotifications.Use(middleware.AuthMiddleware())
	{
		// GET /api/v1/in-app-notifications - Get user's notifications (paginated)
		userInAppNotifications.GET("", notificationController.GetNotifications)
		
		// GET /api/v1/in-app-notifications/unread-count - Get unread notification count
		userInAppNotifications.GET("/unread-count", notificationController.GetUnreadCount)
		
		// PATCH /api/v1/in-app-notifications/read-all - Mark all notifications as read
		userInAppNotifications.PATCH("/read-all", notificationController.MarkAllAsRead)
		
		// GET /api/v1/in-app-notifications/stats - Get notification statistics
		userInAppNotifications.GET("/stats", notificationController.GetNotificationStats)
	}

	// User WebSocket route (outside auth middleware to handle token via query parameter)
	userWS := router.Group("/in-app-notifications")
	{
		// WS /api/v1/in-app-notifications/ws - WebSocket for real-time updates
		userWS.GET("/ws", wsController.HandleWebSocket)
	}

	// Admin in-app notification routes (admin authentication required)
	adminInAppNotifications := router.Group("/admin/in-app-notifications")
	adminInAppNotifications.Use(middleware.AuthMiddleware())
	adminInAppNotifications.Use(middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/in-app-notifications - Get admin notifications (paginated)
		adminInAppNotifications.GET("", notificationController.AdminGetNotifications)
		
		// GET /api/v1/admin/in-app-notifications/unread-count - Get admin unread count
		adminInAppNotifications.GET("/unread-count", notificationController.AdminGetUnreadCount)
		
		// PATCH /api/v1/admin/in-app-notifications/read-all - Mark all admin notifications as read
		adminInAppNotifications.PATCH("/read-all", notificationController.AdminMarkAllAsRead)
		
		// GET /api/v1/admin/in-app-notifications/connection-stats - Get WebSocket connection statistics
		adminInAppNotifications.GET("/connection-stats", wsController.GetConnectionStats)
		
		// GET /api/v1/admin/in-app-notifications/user-connections/:user_id - Get connection count for specific user
		adminInAppNotifications.GET("/user-connections/:user_id", wsController.GetUserConnectionCount)
		
		// POST /api/v1/admin/in-app-notifications/broadcast - Broadcast message to connected users
		adminInAppNotifications.POST("/broadcast", wsController.BroadcastMessage)
	}

	// WebSocket routes (authentication handled within the controller)
	adminWS := router.Group("/admin/in-app-notifications")
	{
		// WS /api/v1/admin/in-app-notifications/ws - WebSocket for admin real-time updates
		adminWS.GET("/ws", wsController.HandleAdminWebSocket)
	}
}
