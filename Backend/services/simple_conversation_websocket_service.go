package services

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// SimpleConversationWebSocketService handles WebSocket connections for simple conversations
type SimpleConversationWebSocketService struct {
	// Map of conversation ID to connected clients
	conversationClients map[uint]map[*websocket.Conn]bool
	// Map of user ID to their WebSocket connections
	userConnections map[uint][]*websocket.Conn
	// Map of admin user ID to their WebSocket connections for monitoring
	adminConnections map[uint]*websocket.Conn
	// Map of user ID to their WebSocket connections for monitoring
	userMonitorConnections map[uint]*websocket.Conn
	// Mutex for thread safety
	mutex sync.RWMutex
	// Channel for broadcasting messages
	broadcast chan SimpleConversationMessage
	// Channel for registering new clients
	register chan SimpleConversationClient
	// Channel for unregistering clients
	unregister chan SimpleConversationClient
}

// SimpleConversationClient represents a WebSocket client
type SimpleConversationClient struct {
	Conn           *websocket.Conn
	UserID         uint
	ConversationID uint
}

// SimpleConversationMessage represents a message to be broadcasted
type SimpleConversationMessage struct {
	ConversationID uint                   `json:"conversation_id"`
	Message        map[string]interface{} `json:"message"`
	Event          string                 `json:"event"`
}

// NewSimpleConversationWebSocketService creates a new WebSocket service
func NewSimpleConversationWebSocketService() *SimpleConversationWebSocketService {
	return &SimpleConversationWebSocketService{
		conversationClients:    make(map[uint]map[*websocket.Conn]bool),
		userConnections:        make(map[uint][]*websocket.Conn),
		adminConnections:       make(map[uint]*websocket.Conn),
		userMonitorConnections: make(map[uint]*websocket.Conn),
		broadcast:              make(chan SimpleConversationMessage),
		register:            make(chan SimpleConversationClient),
		unregister:          make(chan SimpleConversationClient),
	}
}

// Start starts the WebSocket service
func (s *SimpleConversationWebSocketService) Start() {
	for {
		select {
		case client := <-s.register:
			s.registerClient(client)

		case client := <-s.unregister:
			s.unregisterClient(client)

		case message := <-s.broadcast:
			s.broadcastMessage(message)
		}
	}
}

// RegisterClient registers a new WebSocket client
func (s *SimpleConversationWebSocketService) RegisterClient(conn *websocket.Conn, userID uint, conversationID uint) {
	client := SimpleConversationClient{
		Conn:           conn,
		UserID:         userID,
		ConversationID: conversationID,
	}
	s.register <- client
}

// UnregisterClient unregisters a WebSocket client
func (s *SimpleConversationWebSocketService) UnregisterClient(conn *websocket.Conn) {
	client := SimpleConversationClient{
		Conn: conn,
	}
	s.unregister <- client
}

// BroadcastSimpleConversationMessage broadcasts a message to all clients in a conversation
func (s *SimpleConversationWebSocketService) BroadcastSimpleConversationMessage(conversationID uint, messageData map[string]interface{}) {
	log.Printf("BroadcastSimpleConversationMessage called for conversation %d", conversationID)
	message := SimpleConversationMessage{
		ConversationID: conversationID,
		Message:        messageData,
		Event:          "conversation_message",
	}
	log.Printf("Sending message to broadcast channel for conversation %d", conversationID)
	s.broadcast <- message
	log.Printf("Message sent to broadcast channel for conversation %d", conversationID)
}

// BroadcastConversationStatus broadcasts conversation status updates
func (s *SimpleConversationWebSocketService) BroadcastConversationStatus(conversationID uint, statusData map[string]interface{}) {
	message := SimpleConversationMessage{
		ConversationID: conversationID,
		Message:        statusData,
		Event:          "conversation_status",
	}
	s.broadcast <- message
}

// BroadcastTotalUnreadCount broadcasts total unread count to all admin clients
func (s *SimpleConversationWebSocketService) BroadcastTotalUnreadCount(totalUnreadCount int) {
	log.Printf("BroadcastTotalUnreadCount called with count: %d", totalUnreadCount)
	
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	adminMessage := map[string]interface{}{
		"event": "total_unread_count",
		"data": map[string]interface{}{
			"total_unread_count": totalUnreadCount,
		},
		"timestamp": time.Now().Unix(),
	}

	adminData, err := json.Marshal(adminMessage)
	if err != nil {
		log.Printf("Error marshaling total unread count notification: %v", err)
		return
	}

	log.Printf("Broadcasting total unread count to %d admin clients", len(s.adminConnections))
	for adminID, conn := range s.adminConnections {
		log.Printf("Sending total unread count to admin %d", adminID)
		err := conn.WriteMessage(websocket.TextMessage, adminData)
		if err != nil {
			log.Printf("Error sending total unread count to admin %d: %v", adminID, err)
			conn.Close()
			delete(s.adminConnections, adminID)
		} else {
			log.Printf("Successfully sent total unread count to admin %d", adminID)
		}
	}
}

// BroadcastConversationUnreadCount broadcasts individual conversation unread count to all admin clients
func (s *SimpleConversationWebSocketService) BroadcastConversationUnreadCount(conversationID uint, unreadCount int) {
	log.Printf("BroadcastConversationUnreadCount called for conversation %d with count: %d", conversationID, unreadCount)
	
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	adminMessage := map[string]interface{}{
		"event": "conversation_unread_count",
		"data": map[string]interface{}{
			"conversation_id": conversationID,
			"unread_count":    unreadCount,
		},
		"timestamp": time.Now().Unix(),
	}

	adminData, err := json.Marshal(adminMessage)
	if err != nil {
		log.Printf("Error marshaling conversation unread count notification: %v", err)
		return
	}

	log.Printf("Broadcasting conversation unread count to %d admin clients", len(s.adminConnections))
	for adminID, conn := range s.adminConnections {
		log.Printf("Sending conversation unread count to admin %d", adminID)
		err := conn.WriteMessage(websocket.TextMessage, adminData)
		if err != nil {
			log.Printf("Error sending conversation unread count to admin %d: %v", adminID, err)
			conn.Close()
			delete(s.adminConnections, adminID)
		} else {
			log.Printf("Successfully sent conversation unread count to admin %d", adminID)
		}
	}
}

// registerClient handles client registration
func (s *SimpleConversationWebSocketService) registerClient(client SimpleConversationClient) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Add to conversation clients
	if s.conversationClients[client.ConversationID] == nil {
		s.conversationClients[client.ConversationID] = make(map[*websocket.Conn]bool)
	}
	s.conversationClients[client.ConversationID][client.Conn] = true

	// Add to user connections
	s.userConnections[client.UserID] = append(s.userConnections[client.UserID], client.Conn)

	log.Printf("Client registered for conversation %d, user %d", client.ConversationID, client.UserID)
}

// unregisterClient handles client unregistration
func (s *SimpleConversationWebSocketService) unregisterClient(client SimpleConversationClient) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Remove from conversation clients
	for conversationID, clients := range s.conversationClients {
		if clients[client.Conn] {
			delete(clients, client.Conn)
			if len(clients) == 0 {
				delete(s.conversationClients, conversationID)
			}
			break
		}
	}

	// Remove from user connections
	for userID, connections := range s.userConnections {
		for i, conn := range connections {
			if conn == client.Conn {
				s.userConnections[userID] = append(connections[:i], connections[i+1:]...)
				if len(s.userConnections[userID]) == 0 {
					delete(s.userConnections, userID)
				}
				break
			}
		}
	}

	// Close the connection
	client.Conn.Close()
	log.Printf("Client unregistered")
}

// broadcastMessage broadcasts a message to all clients in a conversation
func (s *SimpleConversationWebSocketService) broadcastMessage(message SimpleConversationMessage) {
	log.Printf("broadcastMessage called for conversation %d with event %s", message.ConversationID, message.Event)
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// Always notify admin clients about new messages first
	if message.Event == "conversation_message" {
		log.Printf("Broadcasting to %d admin clients", len(s.adminConnections))
		adminMessage := map[string]interface{}{
			"event": "new_conversation_message",
			"data": map[string]interface{}{
				"conversation_id": message.ConversationID,
				"message":         message.Message,
			},
			"timestamp": time.Now().Unix(),
		}

		adminData, err := json.Marshal(adminMessage)
		if err != nil {
			log.Printf("Error marshaling admin notification: %v", err)
		} else {
			log.Printf("Admin notification data: %s", string(adminData))
			for adminID, conn := range s.adminConnections {
				log.Printf("Sending admin notification to admin %d", adminID)
				err := conn.WriteMessage(websocket.TextMessage, adminData)
				if err != nil {
					log.Printf("Error sending admin notification to admin %d: %v", adminID, err)
					conn.Close()
					delete(s.adminConnections, adminID)
				} else {
					log.Printf("Successfully sent admin notification to admin %d", adminID)
				}
			}
		}

		// Also notify user monitor clients about new messages
		log.Printf("Broadcasting to %d user monitor clients", len(s.userMonitorConnections))
		userMonitorMessage := map[string]interface{}{
			"event": "conversation_message",
			"data": map[string]interface{}{
				"conversation_id": message.ConversationID,
				"message":         message.Message,
			},
			"timestamp": time.Now().Unix(),
		}

		userMonitorData, err := json.Marshal(userMonitorMessage)
		if err != nil {
			log.Printf("Error marshaling user monitor notification: %v", err)
		} else {
			log.Printf("User monitor notification data: %s", string(userMonitorData))
			for userID, conn := range s.userMonitorConnections {
				log.Printf("Sending user monitor notification to user %d", userID)
				err := conn.WriteMessage(websocket.TextMessage, userMonitorData)
				if err != nil {
					log.Printf("Error sending user monitor notification to user %d: %v", userID, err)
					conn.Close()
					delete(s.userMonitorConnections, userID)
				} else {
					log.Printf("Successfully sent user monitor notification to user %d", userID)
				}
			}
		}
	}

	// Send to conversation clients if they exist
	clients, exists := s.conversationClients[message.ConversationID]
	if !exists {
		log.Printf("No clients connected to conversation %d, skipping client broadcast", message.ConversationID)
		return
	}

	// Convert message to JSON
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	// Send to all clients in the conversation
	for conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			conn.Close()
			delete(clients, conn)
		}
	}
}

// GetConnectedUsers returns the list of connected user IDs for a conversation
func (s *SimpleConversationWebSocketService) GetConnectedUsers(conversationID uint) []uint {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	var userIDs []uint
	clients, exists := s.conversationClients[conversationID]
	if !exists {
		return userIDs
	}

	// This is a simplified approach - in a real implementation,
	// you'd want to track user IDs more efficiently
	for userID := range s.userConnections {
		for _, conn := range s.userConnections[userID] {
			if clients[conn] {
				userIDs = append(userIDs, userID)
				break
			}
		}
	}

	return userIDs
}

// GetConnectionCount returns the number of connected clients for a conversation
func (s *SimpleConversationWebSocketService) GetConnectionCount(conversationID uint) int {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	clients, exists := s.conversationClients[conversationID]
	if !exists {
		return 0
	}

	return len(clients)
}

// RegisterAdminClient registers an admin client for monitoring all conversations
func (s *SimpleConversationWebSocketService) RegisterAdminClient(conn *websocket.Conn, adminID uint) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.adminConnections[adminID] = conn
	log.Printf("Admin client registered for user %d. Total admin connections: %d", adminID, len(s.adminConnections))
	log.Printf("Admin connections map: %+v", s.adminConnections)
}

// UnregisterAdminClient unregisters an admin client
func (s *SimpleConversationWebSocketService) UnregisterAdminClient(conn *websocket.Conn) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	for adminID, adminConn := range s.adminConnections {
		if adminConn == conn {
			delete(s.adminConnections, adminID)
			conn.Close()
			log.Printf("Admin client unregistered for user %d", adminID)
			break
		}
	}
}

// RegisterUserMonitorClient registers a user client for monitoring all conversations
func (s *SimpleConversationWebSocketService) RegisterUserMonitorClient(conn *websocket.Conn, userID uint) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.userMonitorConnections[userID] = conn
	log.Printf("User monitor client registered for user %d. Total user monitor connections: %d", userID, len(s.userMonitorConnections))
}

// UnregisterUserMonitorClient unregisters a user monitor client
func (s *SimpleConversationWebSocketService) UnregisterUserMonitorClient(userID uint) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if conn, exists := s.userMonitorConnections[userID]; exists {
		delete(s.userMonitorConnections, userID)
		conn.Close()
		log.Printf("User monitor client unregistered for user %d", userID)
	}
}

// BroadcastToUserMonitors broadcasts a message to all connected user monitor clients
func (s *SimpleConversationWebSocketService) BroadcastToUserMonitors(event string, data map[string]interface{}) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	message := map[string]interface{}{
		"event": event,
		"data":  data,
	}

	for userID, conn := range s.userMonitorConnections {
		if err := conn.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting to user monitor %d: %v", userID, err)
			// Remove the connection if it's broken
			go s.UnregisterUserMonitorClient(userID)
		}
	}
}

// BroadcastTotalUnreadCountToUserMonitors broadcasts total unread count to all connected user monitor clients
func (s *SimpleConversationWebSocketService) BroadcastTotalUnreadCountToUserMonitors(totalUnreadCount int) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	userMessage := map[string]interface{}{
		"event": "total_unread_count",
		"data": map[string]interface{}{
			"total_unread_count": totalUnreadCount,
		},
		"timestamp": time.Now().Unix(),
	}

	userData, err := json.Marshal(userMessage)
	if err != nil {
		log.Printf("Error marshaling user total unread count notification: %v", err)
		return
	}

	for userID, conn := range s.userMonitorConnections {
		if err := conn.WriteMessage(websocket.TextMessage, userData); err != nil {
			log.Printf("Error sending total unread count to user monitor %d: %v", userID, err)
			conn.Close()
			go s.UnregisterUserMonitorClient(userID)
		} else {
			log.Printf("Successfully sent total unread count to user monitor %d", userID)
		}
	}
}

// BroadcastConversationUnreadCountToUserMonitors broadcasts conversation unread count to all connected user monitor clients
func (s *SimpleConversationWebSocketService) BroadcastConversationUnreadCountToUserMonitors(conversationID uint, unreadCount int) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	userMessage := map[string]interface{}{
		"event": "conversation_unread_count",
		"data": map[string]interface{}{
			"conversation_id": conversationID,
			"unread_count":    unreadCount,
		},
		"timestamp": time.Now().Unix(),
	}

	userData, err := json.Marshal(userMessage)
	if err != nil {
		log.Printf("Error marshaling user conversation unread count notification: %v", err)
		return
	}

	for userID, conn := range s.userMonitorConnections {
		if err := conn.WriteMessage(websocket.TextMessage, userData); err != nil {
			log.Printf("Error sending conversation unread count to user monitor %d: %v", userID, err)
			conn.Close()
			go s.UnregisterUserMonitorClient(userID)
		} else {
			log.Printf("Successfully sent conversation unread count to user monitor %d", userID)
		}
	}
}

// BroadcastToAdmins broadcasts a message to all connected admin clients
func (s *SimpleConversationWebSocketService) BroadcastToAdmins(event string, data map[string]interface{}) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	message := map[string]interface{}{
		"event": event,
		"data":  data,
		"timestamp": time.Now().Unix(),
	}

	messageData, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling admin message: %v", err)
		return
	}

	for adminID, conn := range s.adminConnections {
		err := conn.WriteMessage(websocket.TextMessage, messageData)
		if err != nil {
			log.Printf("Error sending message to admin %d: %v", adminID, err)
			conn.Close()
			delete(s.adminConnections, adminID)
		}
	}
}

// GetAllConversationsData returns data about all conversations (placeholder implementation)
func (s *SimpleConversationWebSocketService) GetAllConversationsData() map[string]interface{} {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// This would typically fetch data from the database
	// For now, return connection statistics
	return map[string]interface{}{
		"total_conversations": len(s.conversationClients),
		"total_users":         len(s.userConnections),
		"total_admins":        len(s.adminConnections),
		"active_conversations": s.getActiveConversations(),
	}
}

// getActiveConversations returns list of active conversations
func (s *SimpleConversationWebSocketService) getActiveConversations() []uint {
	var activeConversations []uint
	for conversationID := range s.conversationClients {
		activeConversations = append(activeConversations, conversationID)
	}
	return activeConversations
}
