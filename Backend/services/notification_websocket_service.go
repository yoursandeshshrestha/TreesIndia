package services

import (
	"sync"

	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

// NotificationWebSocketService handles WebSocket connections for real-time notifications
type NotificationWebSocketService struct {
	// Map of user ID to WebSocket connections
	userConnections map[uint][]*websocket.Conn
	// Map of admin user ID to WebSocket connections
	adminConnections map[uint][]*websocket.Conn
	// Mutex for thread safety
	mutex sync.RWMutex
	// Channel for broadcasting messages
	broadcast chan NotificationMessage
	// Channel for registering new clients
	Register chan NotificationClient
	// Channel for unregistering clients
	Unregister chan NotificationClient
}

// NotificationClient represents a WebSocket client
type NotificationClient struct {
	Conn     *websocket.Conn
	UserID   uint
	UserType string // "user" or "admin"
}

// NotificationMessage represents a message to be broadcasted
type NotificationMessage struct {
	UserID   uint                   `json:"user_id"`
	UserType string                 `json:"user_type"`
	Event    string                 `json:"event"`
	Data     map[string]interface{} `json:"data"`
}

// NewNotificationWebSocketService creates a new WebSocket service
func NewNotificationWebSocketService() *NotificationWebSocketService {
	return &NotificationWebSocketService{
		userConnections:  make(map[uint][]*websocket.Conn),
		adminConnections: make(map[uint][]*websocket.Conn),
		broadcast:        make(chan NotificationMessage),
		Register:         make(chan NotificationClient),
		Unregister:       make(chan NotificationClient),
	}
}

// Run starts the WebSocket service
func (nws *NotificationWebSocketService) Run() {
	logrus.Info("Notification WebSocket service started")
	
	for {
		select {
		case client := <-nws.Register:
			nws.registerClient(client)
			
		case client := <-nws.Unregister:
			nws.unregisterClient(client)
			
		case message := <-nws.broadcast:
			nws.broadcastToUser(message)
		}
	}
}

// RegisterClient registers a new WebSocket client
func (nws *NotificationWebSocketService) registerClient(client NotificationClient) {
	nws.mutex.Lock()
	defer nws.mutex.Unlock()
	
	if client.UserType == "admin" {
		nws.adminConnections[client.UserID] = append(nws.adminConnections[client.UserID], client.Conn)
		logrus.Infof("Admin client registered: UserID=%d, Total connections=%d", client.UserID, len(nws.adminConnections[client.UserID]))
	} else {
		nws.userConnections[client.UserID] = append(nws.userConnections[client.UserID], client.Conn)
		logrus.Infof("User client registered: UserID=%d, Total connections=%d", client.UserID, len(nws.userConnections[client.UserID]))
	}
}

// UnregisterClient unregisters a WebSocket client
func (nws *NotificationWebSocketService) unregisterClient(client NotificationClient) {
	nws.mutex.Lock()
	defer nws.mutex.Unlock()
	
	if client.UserType == "admin" {
		connections := nws.adminConnections[client.UserID]
		for i, conn := range connections {
			if conn == client.Conn {
				nws.adminConnections[client.UserID] = append(connections[:i], connections[i+1:]...)
				logrus.Infof("Admin client unregistered: UserID=%d, Remaining connections=%d", client.UserID, len(nws.adminConnections[client.UserID]))
				break
			}
		}
		// Clean up empty entries
		if len(nws.adminConnections[client.UserID]) == 0 {
			delete(nws.adminConnections, client.UserID)
		}
	} else {
		connections := nws.userConnections[client.UserID]
		for i, conn := range connections {
			if conn == client.Conn {
				nws.userConnections[client.UserID] = append(connections[:i], connections[i+1:]...)
				logrus.Infof("User client unregistered: UserID=%d, Remaining connections=%d", client.UserID, len(nws.userConnections[client.UserID]))
				break
			}
		}
		// Clean up empty entries
		if len(nws.userConnections[client.UserID]) == 0 {
			delete(nws.userConnections, client.UserID)
		}
	}
}

// BroadcastToUser sends a message to a specific user
func (nws *NotificationWebSocketService) broadcastToUser(message NotificationMessage) {
	nws.mutex.RLock()
	defer nws.mutex.RUnlock()
	
	var connections []*websocket.Conn
	if message.UserType == "admin" {
		connections = nws.adminConnections[message.UserID]
	} else {
		connections = nws.userConnections[message.UserID]
	}
	
	if len(connections) == 0 {
		return
	}

	// Send message to all connections for this user
	for _, conn := range connections {
		err := conn.WriteJSON(message)
		if err != nil {
			logrus.Errorf("Failed to send WebSocket message to user %d: %v", message.UserID, err)
			// Close the connection if it's broken
			conn.Close()
		}
	}
}

// SendNotification sends a new notification to a user
func (nws *NotificationWebSocketService) SendNotification(userID uint, userType string, notification map[string]interface{}) {
	message := NotificationMessage{
		UserID:   userID,
		UserType: userType,
		Event:    "new_notification",
		Data:     notification,
	}
	
	nws.broadcast <- message
}

// SendUnreadCountUpdate sends unread count update to a user
func (nws *NotificationWebSocketService) SendUnreadCountUpdate(userID uint, userType string, count int) {
	message := NotificationMessage{
		UserID:   userID,
		UserType: userType,
		Event:    "unread_count_update",
		Data:     map[string]interface{}{"unread_count": count},
	}
	
	nws.broadcast <- message
}

// SendNotificationRead sends notification read status update
func (nws *NotificationWebSocketService) SendNotificationRead(userID uint, userType string, notificationID uint, isRead bool) {
	message := NotificationMessage{
		UserID:   userID,
		UserType: userType,
		Event:    "notification_read",
		Data: map[string]interface{}{
			"notification_id": notificationID,
			"is_read":         isRead,
		},
	}
	
	nws.broadcast <- message
}

// SendAllNotificationsRead sends all notifications read status update
func (nws *NotificationWebSocketService) SendAllNotificationsRead(userID uint, userType string) {
	message := NotificationMessage{
		UserID:   userID,
		UserType: userType,
		Event:    "all_notifications_read",
		Data:     map[string]interface{}{"unread_count": 0},
	}
	
	nws.broadcast <- message
}

// GetConnectionCount returns the number of active connections for a user
func (nws *NotificationWebSocketService) GetConnectionCount(userID uint, userType string) int {
	nws.mutex.RLock()
	defer nws.mutex.RUnlock()
	
	if userType == "admin" {
		return len(nws.adminConnections[userID])
	}
	return len(nws.userConnections[userID])
}

// GetTotalConnections returns the total number of active connections
func (nws *NotificationWebSocketService) GetTotalConnections() (int, int) {
	nws.mutex.RLock()
	defer nws.mutex.RUnlock()
	
	userConnections := 0
	adminConnections := 0
	
	for _, connections := range nws.userConnections {
		userConnections += len(connections)
	}
	
	for _, connections := range nws.adminConnections {
		adminConnections += len(connections)
	}
	
	return userConnections, adminConnections
}

// BroadcastToAllAdmins broadcasts a message to all connected admins
func (nws *NotificationWebSocketService) BroadcastToAllAdmins(event string, data map[string]interface{}) {
	nws.mutex.RLock()
	defer nws.mutex.RUnlock()
	
	for userID := range nws.adminConnections {
		message := NotificationMessage{
			UserID:   userID,
			UserType: "admin",
			Event:    event,
			Data:     data,
		}
		nws.broadcastToUser(message)
	}
}

// BroadcastToAllUsers broadcasts a message to all connected users
func (nws *NotificationWebSocketService) BroadcastToAllUsers(event string, data map[string]interface{}) {
	nws.mutex.RLock()
	defer nws.mutex.RUnlock()
	
	for userID := range nws.userConnections {
		message := NotificationMessage{
			UserID:   userID,
			UserType: "user",
			Event:    event,
			Data:     data,
		}
		nws.broadcastToUser(message)
	}
}

// CloseAllConnections closes all WebSocket connections
func (nws *NotificationWebSocketService) CloseAllConnections() {
	nws.mutex.Lock()
	defer nws.mutex.Unlock()
	
	// Close all user connections
	for userID, connections := range nws.userConnections {
		for _, conn := range connections {
			conn.Close()
		}
		logrus.Infof("Closed %d connections for user %d", len(connections), userID)
	}
	
	// Close all admin connections
	for userID, connections := range nws.adminConnections {
		for _, conn := range connections {
			conn.Close()
		}
		logrus.Infof("Closed %d connections for admin %d", len(connections), userID)
	}
	
	// Clear the maps
	nws.userConnections = make(map[uint][]*websocket.Conn)
	nws.adminConnections = make(map[uint][]*websocket.Conn)
	
	logrus.Info("All WebSocket connections closed")
}
