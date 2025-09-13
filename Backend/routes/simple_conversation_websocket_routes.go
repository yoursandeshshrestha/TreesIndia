package routes

import (
	"treesindia/controllers"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupSimpleConversationWebSocketRoutes sets up WebSocket routes for simple conversations
func SetupSimpleConversationWebSocketRoutes(router *gin.RouterGroup, wsService *services.SimpleConversationWebSocketService) {
	wsController := controllers.NewSimpleConversationWebSocketController(wsService)

	// WebSocket routes (authentication handled manually in controller)
	ws := router.Group("/ws/conversations")
	{
		ws.GET("/connect", wsController.HandleWebSocket)                    // WebSocket connection endpoint
		ws.GET("/monitor", wsController.HandleUserWebSocket)                // User WebSocket for monitoring all conversations
		ws.GET("/:id/status", wsController.GetWebSocketStatus)             // Get WebSocket status for a conversation
	}

	// Admin WebSocket routes for monitoring all conversations
	adminWS := router.Group("/admin/ws/conversations")
	{
		adminWS.GET("/monitor", wsController.HandleAdminWebSocket)          // Admin WebSocket for monitoring all conversations
	}
}
