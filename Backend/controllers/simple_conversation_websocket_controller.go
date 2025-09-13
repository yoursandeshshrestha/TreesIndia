package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
	"treesindia/config"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

type SimpleConversationWebSocketController struct {
	wsService *services.SimpleConversationWebSocketService
}

func NewSimpleConversationWebSocketController(wsService *services.SimpleConversationWebSocketService) *SimpleConversationWebSocketController {
	return &SimpleConversationWebSocketController{
		wsService: wsService,
	}
}

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin
		// In production, you should implement proper origin checking
		return true
	},
}

// HandleWebSocket handles WebSocket connections for simple conversations
func (c *SimpleConversationWebSocketController) HandleWebSocket(ctx *gin.Context) {
	var userID uint
	var exists bool

	// Try to get user ID from context (set by auth middleware)
	userIDInterface, exists := ctx.Get("user_id")
	if exists {
		userID = userIDInterface.(uint)
	}
	
	// If not found in context, try to authenticate via token query parameter
	if !exists {
		token := ctx.Query("token")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Authentication token required"))
			return
		}

		// Validate the token and get user ID
		userIDFromToken, err := c.validateTokenAndGetUserID(token)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Invalid token"))
			return
		}
		userID = userIDFromToken
	}

	// Get conversation ID from query parameter
	conversationIDStr := ctx.Query("conversation_id")
	if conversationIDStr == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Bad Request", "conversation_id is required"))
		return
	}

	conversationID, err := strconv.ParseUint(conversationIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Bad Request", "Invalid conversation_id"))
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal Server Error", "Failed to upgrade connection"))
		return
	}

	// Register the client
	c.wsService.RegisterClient(conn, userID, uint(conversationID))

	// Handle WebSocket messages
	go c.handleWebSocketMessages(conn, userID, uint(conversationID))
}

// handleWebSocketMessages handles incoming WebSocket messages
func (c *SimpleConversationWebSocketController) handleWebSocketMessages(conn *websocket.Conn, userID uint, conversationID uint) {
	defer func() {
		c.wsService.UnregisterClient(conn)
	}()

	for {
		// Read message from WebSocket
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Handle different message types
		c.handleMessage(conn, userID, conversationID, message)
	}
}

// handleMessage handles different types of WebSocket messages
func (c *SimpleConversationWebSocketController) handleMessage(conn *websocket.Conn, userID uint, conversationID uint, message []byte) {
	// Parse the incoming message
	var msg map[string]interface{}
	if err := json.Unmarshal(message, &msg); err != nil {
		// Send error response
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Invalid message format",
			},
		}
		conn.WriteJSON(errorResponse)
		return
	}

	// Handle different event types
	event, ok := msg["event"].(string)
	if !ok {
		// Send error response
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Event type is required",
			},
		}
		conn.WriteJSON(errorResponse)
		return
	}

	switch event {
	case "ping":
		// Respond to ping with pong
		pongResponse := map[string]interface{}{
			"event": "pong",
			"data": map[string]interface{}{
				"timestamp": time.Now().Unix(),
			},
		}
		conn.WriteJSON(pongResponse)

	case "typing":
		// Broadcast typing indicator
		typingData := map[string]interface{}{
			"user_id": userID,
			"is_typing": msg["data"].(map[string]interface{})["is_typing"],
		}
		c.wsService.BroadcastConversationStatus(conversationID, typingData)

	case "message_read":
		// Handle message read status
		readData := map[string]interface{}{
			"user_id": userID,
			"message_id": msg["data"].(map[string]interface{})["message_id"],
			"read_at": time.Now().Unix(),
		}
		c.wsService.BroadcastConversationStatus(conversationID, readData)

	default:
		// Unknown event type
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Unknown event type: " + event,
			},
		}
		conn.WriteJSON(errorResponse)
	}
}

// HandleUserWebSocket handles WebSocket connections for user conversation monitoring
func (c *SimpleConversationWebSocketController) HandleUserWebSocket(ctx *gin.Context) {
	var userID uint
	var exists bool

	// Try to get user ID from context (set by auth middleware)
	userIDInterface, exists := ctx.Get("user_id")
	if exists {
		userID = userIDInterface.(uint)
	}
	
	// If not found in context, try to authenticate via token query parameter
	if !exists {
		token := ctx.Query("token")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Authentication token required"))
			return
		}

		// Validate the token and get user ID
		userIDFromToken, err := c.validateTokenAndGetUserID(token)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Invalid token"))
			return
		}
		userID = userIDFromToken
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal Server Error", "Failed to upgrade connection"))
		return
	}

	// Register the client for monitoring all conversations
	c.wsService.RegisterUserMonitorClient(conn, userID)

	// Start handling the WebSocket connection
	go c.handleUserMonitorWebSocket(conn, userID)
}

// handleUserMonitorWebSocket handles the WebSocket connection for user conversation monitoring
func (c *SimpleConversationWebSocketController) handleUserMonitorWebSocket(conn *websocket.Conn, userID uint) {
	defer func() {
		conn.Close()
		c.wsService.UnregisterUserMonitorClient(userID)
	}()

	// Set up ping/pong handlers
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Set read deadline
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))

	// Start ping ticker
	pingTicker := time.NewTicker(30 * time.Second)
	defer pingTicker.Stop()

	// Handle incoming messages
	for {
		select {
		case <-pingTicker.C:
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		default:
			// Read message
			_, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					fmt.Printf("WebSocket error: %v\n", err)
				}
				return
			}

			// Parse message
			var wsMessage map[string]interface{}
			if err := json.Unmarshal(message, &wsMessage); err != nil {
				errorResponse := map[string]interface{}{
					"event": "error",
					"data": map[string]interface{}{
						"message": "Invalid JSON format",
					},
				}
				conn.WriteJSON(errorResponse)
				continue
			}

			// Handle different event types
			event, ok := wsMessage["event"].(string)
			if !ok {
				errorResponse := map[string]interface{}{
					"event": "error",
					"data": map[string]interface{}{
						"message": "Event type is required",
					},
				}
				conn.WriteJSON(errorResponse)
				continue
			}

			switch event {
			case "ping":
				// Respond to ping with pong
				pongResponse := map[string]interface{}{
					"event": "pong",
					"data": map[string]interface{}{
						"timestamp": time.Now().Unix(),
					},
				}
				conn.WriteJSON(pongResponse)
			default:
				// Unknown event type
				errorResponse := map[string]interface{}{
					"event": "error",
					"data": map[string]interface{}{
						"message": "Unknown event type: " + event,
					},
				}
				conn.WriteJSON(errorResponse)
			}
		}
	}
}

// HandleAdminWebSocket handles WebSocket connections for admin conversation monitoring
func (c *SimpleConversationWebSocketController) HandleAdminWebSocket(ctx *gin.Context) {
	var userID uint
	var userType string
	var exists bool

	// Try to get user ID from context (set by auth middleware)
	userIDInterface, exists := ctx.Get("user_id")
	if exists {
		userID = userIDInterface.(uint)
	}
	
	// Try to get user type from context
	userTypeInterface, exists := ctx.Get("user_type")
	if exists {
		userType = userTypeInterface.(string)
	}
	
	// If not found in context, try to authenticate via token query parameter
	if !exists {
		token := ctx.Query("token")
		if token == "" {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Authentication token required"))
			return
		}

		// Validate the token and get user ID
		userIDFromToken, userTypeFromToken, err := c.validateTokenAndGetUserInfo(token)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Invalid token"))
			return
		}
		userID = userIDFromToken
		userType = userTypeFromToken
	}

	// Check if user is admin
	if userType != "admin" {
		ctx.JSON(http.StatusForbidden, views.CreateErrorResponse("Forbidden", "Admin access required"))
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Internal Server Error", "Failed to upgrade connection"))
		return
	}

	// Register the admin client for monitoring all conversations
	c.wsService.RegisterAdminClient(conn, userID)

	// Handle WebSocket messages
	go c.handleAdminWebSocketMessages(conn, userID)
}

// handleAdminWebSocketMessages handles incoming WebSocket messages for admin
func (c *SimpleConversationWebSocketController) handleAdminWebSocketMessages(conn *websocket.Conn, userID uint) {
	defer func() {
		c.wsService.UnregisterAdminClient(conn)
	}()

	for {
		// Read message from WebSocket
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Handle different message types for admin
		c.handleAdminMessage(conn, userID, message)
	}
}

// handleAdminMessage handles different types of admin WebSocket messages
func (c *SimpleConversationWebSocketController) handleAdminMessage(conn *websocket.Conn, userID uint, message []byte) {
	// Parse the incoming message
	var msg map[string]interface{}
	if err := json.Unmarshal(message, &msg); err != nil {
		// Send error response
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Invalid message format",
			},
		}
		conn.WriteJSON(errorResponse)
		return
	}

	// Handle different event types
	event, ok := msg["event"].(string)
	if !ok {
		// Send error response
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Event type is required",
			},
		}
		conn.WriteJSON(errorResponse)
		return
	}

	switch event {
	case "ping":
		// Respond to ping with pong
		pongResponse := map[string]interface{}{
			"event": "pong",
			"data": map[string]interface{}{
				"timestamp": time.Now().Unix(),
			},
		}
		conn.WriteJSON(pongResponse)

	case "get_conversations":
		// Admin can request current conversations
		conversationsData := c.wsService.GetAllConversationsData()
		response := map[string]interface{}{
			"event": "conversations_data",
			"data": map[string]interface{}{
				"conversations": conversationsData,
				"timestamp":     time.Now().Unix(),
			},
		}
		conn.WriteJSON(response)

	case "test_connection":
		// Respond to test connection
		testResponse := map[string]interface{}{
			"event": "test_connection_response",
			"data": map[string]interface{}{
				"message": "Admin WebSocket connection is working",
				"timestamp": time.Now().Unix(),
			},
		}
		conn.WriteJSON(testResponse)

	default:
		// Unknown event type
		errorResponse := map[string]interface{}{
			"event": "error",
			"data": map[string]interface{}{
				"message": "Unknown event type: " + event,
			},
		}
		conn.WriteJSON(errorResponse)
	}
}

// GetWebSocketStatus returns the status of WebSocket connections for a conversation
func (c *SimpleConversationWebSocketController) GetWebSocketStatus(ctx *gin.Context) {
	conversationID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	connectedUsers := c.wsService.GetConnectedUsers(uint(conversationID))
	connectionCount := c.wsService.GetConnectionCount(uint(conversationID))

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("WebSocket status retrieved", gin.H{
		"conversation_id":    conversationID,
		"connected_users":    connectedUsers,
		"connection_count":   connectionCount,
	}))
}

// validateTokenAndGetUserID validates a JWT token and returns the user ID
func (c *SimpleConversationWebSocketController) validateTokenAndGetUserID(token string) (uint, error) {
	// Parse and validate JWT token
	appConfig := config.LoadConfig()
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(appConfig.JWTSecret), nil
	})

	if err != nil {
		return 0, fmt.Errorf("invalid token: %v", err)
	}

	// Check if token is valid
	if !parsedToken.Valid {
		return 0, fmt.Errorf("invalid token")
	}

	// Extract claims
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid token claims")
	}

	// Get user ID from claims
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("user_id not found in token")
	}

	return uint(userIDFloat), nil
}

// validateTokenAndGetUserInfo validates a JWT token and returns the user ID and type
func (c *SimpleConversationWebSocketController) validateTokenAndGetUserInfo(token string) (uint, string, error) {
	// Parse and validate JWT token
	appConfig := config.LoadConfig()
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(appConfig.JWTSecret), nil
	})

	if err != nil {
		return 0, "", fmt.Errorf("invalid token: %v", err)
	}

	// Check if token is valid
	if !parsedToken.Valid {
		return 0, "", fmt.Errorf("invalid token")
	}

	// Extract claims
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", fmt.Errorf("invalid token claims")
	}

	// Get user ID from claims
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, "", fmt.Errorf("user_id not found in token")
	}

	// Get user type from claims
	userType, ok := claims["user_type"].(string)
	if !ok {
		return 0, "", fmt.Errorf("user_type not found in token")
	}

	return uint(userIDFloat), userType, nil
}
