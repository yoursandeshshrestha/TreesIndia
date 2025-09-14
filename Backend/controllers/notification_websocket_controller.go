package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"treesindia/config"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

// NotificationWebSocketController handles WebSocket connections for notifications
type NotificationWebSocketController struct {
	BaseController
	wsService           *services.NotificationWebSocketService
	notificationService *services.InAppNotificationService
}

// NewNotificationWebSocketController creates a new WebSocket controller
func NewNotificationWebSocketController(wsService *services.NotificationWebSocketService, notificationService *services.InAppNotificationService) *NotificationWebSocketController {
	return &NotificationWebSocketController{
		BaseController:      *NewBaseController(),
		wsService:           wsService,
		notificationService: notificationService,
	}
}

// WebSocket upgrader
var notificationUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin (you might want to restrict this in production)
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// HandleWebSocket handles WebSocket connections for user notifications
func (nwc *NotificationWebSocketController) HandleWebSocket(c *gin.Context) {
	logrus.Info("User WebSocket connection attempt")
	
	var userID uint
	var userType string
	var exists bool

	// Try to get user ID from context (set by auth middleware)
	userIDInterface, exists := c.Get("user_id")
	if exists {
		userID = userIDInterface.(uint)
		userTypeInterface, typeExists := c.Get("user_type")
		if typeExists {
			userType = userTypeInterface.(string)
		}
	}
	
	// If not found in context, try to authenticate via token query parameter
	if !exists {
		token := c.Query("token")
		if token == "" {
			logrus.Warn("User WebSocket: No token provided")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			return
		}

		// Parse and validate JWT token
		appConfig := config.LoadConfig()
		parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(appConfig.JWTSecret), nil
		})

		if err != nil || !parsedToken.Valid {
			logrus.Warnf("User WebSocket: Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Extract claims
		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		if !ok {
			logrus.Warn("User WebSocket: Invalid token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// Extract user ID and type from claims
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			logrus.Warn("User WebSocket: Invalid user_id in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id in token"})
			return
		}
		userID = uint(userIDFloat)

		userTypeClaim, ok := claims["user_type"].(string)
		if !ok {
			logrus.Warn("User WebSocket: Invalid user_type in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_type in token"})
			return
		}
		userType = userTypeClaim
	}

	if userID == 0 {
		logrus.Warn("User WebSocket: User not authenticated")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	if userType == "" {
		userType = "user" // Default to user type
	}

	logrus.Infof("User WebSocket: User %d (%s) authenticated successfully", userID, userType)
	nwc.handleWebSocketConnection(c, userID, userType)
}

// HandleAdminWebSocket handles WebSocket connections for admin notifications
func (nwc *NotificationWebSocketController) HandleAdminWebSocket(c *gin.Context) {
	logrus.Info("Admin WebSocket connection attempt")
	
	var userID uint
	var userType string
	var exists bool

	// Try to get user ID from context (set by auth middleware)
	userIDInterface, exists := c.Get("user_id")
	if exists {
		userID = userIDInterface.(uint)
		userTypeInterface, typeExists := c.Get("user_type")
		if typeExists {
			userType = userTypeInterface.(string)
		}
	}
	
	// If not found in context, try to authenticate via token query parameter
	if !exists {
		token := c.Query("token")
		if token == "" {
			logrus.Warn("Admin WebSocket: No token provided")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			return
		}

		// Parse and validate JWT token
		appConfig := config.LoadConfig()
		parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(appConfig.JWTSecret), nil
		})

		if err != nil || !parsedToken.Valid {
			logrus.Warnf("Admin WebSocket: Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Extract claims
		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		if !ok {
			logrus.Warn("Admin WebSocket: Invalid token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		// Get user ID and type from claims
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			logrus.Warn("Admin WebSocket: User ID not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
			return
		}
		userID = uint(userIDFloat)

		userType, ok = claims["user_type"].(string)
		if !ok {
			logrus.Warn("Admin WebSocket: User type not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User type not found in token"})
			return
		}
	}

	if userID == 0 {
		logrus.Warn("Admin WebSocket: User not authenticated")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	if userType != "admin" {
		logrus.Warn("Admin WebSocket: User is not admin")
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	logrus.Infof("Admin WebSocket: Proceeding with connection for user %d", userID)
	nwc.handleWebSocketConnection(c, userID, "admin")
}

// handleWebSocketConnection handles the WebSocket connection logic
func (nwc *NotificationWebSocketController) handleWebSocketConnection(c *gin.Context, userID uint, userType string) {
	logrus.Infof("Attempting WebSocket upgrade for user %d (type: %s)", userID, userType)
	
	// Upgrade HTTP connection to WebSocket
	conn, err := notificationUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("Failed to upgrade WebSocket connection: %v", err)
		return
	}
	defer conn.Close()
	
	logrus.Infof("WebSocket connection established for user %d (type: %s)", userID, userType)

	// Register client
	client := services.NotificationClient{
		Conn:     conn,
		UserID:   userID,
		UserType: userType,
	}
	nwc.wsService.Register <- client

	// Send initial unread count
	count, err := nwc.notificationService.GetUnreadCount(userID)
	if err != nil {
		logrus.Errorf("Failed to get initial unread count for user %d: %v", userID, err)
		count = 0
	}

	initialMessage := services.NotificationMessage{
		UserID:   userID,
		UserType: userType,
		Event:    "unread_count_update",
		Data:     map[string]interface{}{"unread_count": count},
	}

	err = conn.WriteJSON(initialMessage)
	if err != nil {
		logrus.Errorf("Failed to send initial unread count: %v", err)
	}

	logrus.Infof("WebSocket connection established for user %d (type: %s)", userID, userType)

	// Handle incoming messages
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.Errorf("WebSocket read error: %v", err)
			}
			break
		}

		nwc.handleWebSocketMessage(client, message)
	}

	// Unregister client
	nwc.wsService.Unregister <- client
	logrus.Infof("WebSocket connection closed for user %d (type: %s)", userID, userType)
}

// handleWebSocketMessage handles incoming WebSocket messages
func (nwc *NotificationWebSocketController) handleWebSocketMessage(client services.NotificationClient, message map[string]interface{}) {
	event, ok := message["event"].(string)
	if !ok {
		logrus.Warn("Received message without event field")
		return
	}

	logrus.Debugf("Received WebSocket message: event=%s, userID=%d, userType=%s", event, client.UserID, client.UserType)

	switch event {
	case "join":
		// Client is joining (already handled in connection)
		logrus.Debugf("User %d joined notifications", client.UserID)

	case "mark_read":
		nwc.handleMarkAsRead(client, message)

	case "mark_all_read":
		nwc.handleMarkAllAsRead(client, message)

	case "ping":
		// Respond to ping with pong
		pongMessage := services.NotificationMessage{
			UserID:   client.UserID,
			UserType: client.UserType,
			Event:    "pong",
			Data:     map[string]interface{}{"timestamp": message["timestamp"]},
		}
		client.Conn.WriteJSON(pongMessage)

	default:
		logrus.Warnf("Unknown WebSocket event: %s", event)
	}
}

// handleMarkAsRead handles marking a notification as read
func (nwc *NotificationWebSocketController) handleMarkAsRead(client services.NotificationClient, message map[string]interface{}) {
	data, ok := message["data"].(map[string]interface{})
	if !ok {
		logrus.Warn("Invalid data format for mark_read event")
		return
	}

	notificationIDFloat, ok := data["notification_id"].(float64)
	if !ok {
		logrus.Warn("Invalid notification_id format for mark_read event")
		return
	}

	notificationID := uint(notificationIDFloat)

	err := nwc.notificationService.MarkNotificationAsRead(notificationID, client.UserID)
	if err != nil {
		logrus.Errorf("Failed to mark notification %d as read for user %d: %v", notificationID, client.UserID, err)
		
		// Send error response
		errorMessage := services.NotificationMessage{
			UserID:   client.UserID,
			UserType: client.UserType,
			Event:    "error",
			Data:     map[string]interface{}{"message": "Failed to mark notification as read"},
		}
		client.Conn.WriteJSON(errorMessage)
		return
	}

	logrus.Debugf("Marked notification %d as read for user %d", notificationID, client.UserID)
}

// handleMarkAllAsRead handles marking all notifications as read
func (nwc *NotificationWebSocketController) handleMarkAllAsRead(client services.NotificationClient, message map[string]interface{}) {
	err := nwc.notificationService.MarkAllNotificationsAsRead(client.UserID)
	if err != nil {
		logrus.Errorf("Failed to mark all notifications as read for user %d: %v", client.UserID, err)
		
		// Send error response
		errorMessage := services.NotificationMessage{
			UserID:   client.UserID,
			UserType: client.UserType,
			Event:    "error",
			Data:     map[string]interface{}{"message": "Failed to mark all notifications as read"},
		}
		client.Conn.WriteJSON(errorMessage)
		return
	}

	logrus.Debugf("Marked all notifications as read for user %d", client.UserID)
}

// GetUserType returns the user type from context
func (nwc *NotificationWebSocketController) GetUserType(c *gin.Context) string {
	userType, exists := c.Get("user_type")
	if !exists {
		return ""
	}
	return userType.(string)
}

// GetConnectionStats returns WebSocket connection statistics
func (nwc *NotificationWebSocketController) GetConnectionStats(c *gin.Context) {
	userConnections, adminConnections := nwc.wsService.GetTotalConnections()
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user_connections":  userConnections,
			"admin_connections": adminConnections,
			"total_connections": userConnections + adminConnections,
		},
	})
}

// GetUserConnectionCount returns connection count for a specific user
func (nwc *NotificationWebSocketController) GetUserConnectionCount(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	userType := c.Query("user_type")
	if userType == "" {
		userType = "user"
	}

	count := nwc.wsService.GetConnectionCount(uint(userID), userType)
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user_id":          userID,
			"user_type":        userType,
			"connection_count": count,
		},
	})
}

// BroadcastMessage broadcasts a message to all connected users (admin only)
func (nwc *NotificationWebSocketController) BroadcastMessage(c *gin.Context) {
	// Check if user is admin
	userType := nwc.GetUserType(c)
	if userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	var req struct {
		Event string                 `json:"event" binding:"required"`
		Data  map[string]interface{} `json:"data" binding:"required"`
		Target string                `json:"target"` // "all", "users", "admins"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	if req.Target == "" {
		req.Target = "all"
	}

	switch req.Target {
	case "all":
		nwc.wsService.BroadcastToAllUsers(req.Event, req.Data)
		nwc.wsService.BroadcastToAllAdmins(req.Event, req.Data)
	case "users":
		nwc.wsService.BroadcastToAllUsers(req.Event, req.Data)
	case "admins":
		nwc.wsService.BroadcastToAllAdmins(req.Event, req.Data)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target. Must be 'all', 'users', or 'admins'"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Message broadcasted successfully",
	})
}
