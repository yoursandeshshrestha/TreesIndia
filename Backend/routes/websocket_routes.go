package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
)

// SetupWebSocketRoutes sets up WebSocket routes
func SetupWebSocketRoutes(router *gin.Engine, wsController *controllers.WebSocketController) {
	// WebSocket routes (no authentication middleware for WebSocket upgrade)
	websocket := router.Group("/ws")
	{
		websocket.GET("/chat", wsController.HandleWebSocket)      // For chat functionality
		websocket.GET("/location", wsController.HandleWebSocket)  // For location tracking
	}
}
