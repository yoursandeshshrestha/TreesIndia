package controllers

import (
	"fmt"
	"net/http"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// WebSocketController handles WebSocket connections
type WebSocketController struct {
	wsService *services.WebSocketService
}

// NewWebSocketController creates a new WebSocket controller
func NewWebSocketController(wsService *services.WebSocketService) *WebSocketController {
	return &WebSocketController{
		wsService: wsService,
	}
}

// HandleWebSocket handles WebSocket connections
func (wc *WebSocketController) HandleWebSocket(c *gin.Context) {
	// Log which endpoint was hit
	fmt.Printf("WebSocket endpoint hit: %s\n", c.Request.URL.Path)
	
	// For WebSocket connections, we'll get user_id from query parameters
	// since WebSocket can't use cookies/headers for authentication
	userIDStr := c.Query("user_id")
	roomIDStr := c.Query("room_id")

	if userIDStr == "" || roomIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user_id or room_id"})
		return
	}

	// Parse user ID and room ID
	var userID, roomID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}
	if _, err := fmt.Sscanf(roomIDStr, "%d", &roomID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room_id"})
		return
	}

	// Validate that the user exists and has access to the room
	// This is a simplified validation - in production you might want more robust auth
	if userID == 0 || roomID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user or room"})
		return
	}

	// Handle the WebSocket connection
	wc.wsService.HandleWebSocket(c.Writer, c.Request)
}
