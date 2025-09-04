package routes

import (
	"fmt"
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
	
	// Log the routes for debugging
	fmt.Printf("WebSocket routes registered:\n")
	fmt.Printf("  GET /ws/chat\n")
	fmt.Printf("  GET /ws/location\n")
}
