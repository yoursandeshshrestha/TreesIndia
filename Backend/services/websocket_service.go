package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

// WebSocket message types
const (
	MessageTypeJoin     = "join"
	MessageTypeLeave    = "leave"
	MessageTypeMessage  = "message"
	MessageTypePing     = "ping"
	MessageTypePong     = "pong"
)

// WebSocket message structure
type WSMessage struct {
	Type      string                 `json:"type"`
	RoomID    uint                   `json:"room_id,omitempty"`
	UserID    uint                   `json:"user_id,omitempty"`
	Message   string                 `json:"message,omitempty"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

// Client represents a WebSocket client
type Client struct {
	ID       string
	UserID   uint
	RoomID   uint
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
	mu       sync.Mutex
}

// Hub manages all WebSocket connections
type Hub struct {
	// Registered clients by room
	rooms map[uint]map[*Client]bool

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Broadcast messages to specific room
	broadcast chan *WSMessage

	mu sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		rooms:        make(map[uint]map[*Client]bool),
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		broadcast:    make(chan *WSMessage),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.RoomID] == nil {
				h.rooms[client.RoomID] = make(map[*Client]bool)
			}
			h.rooms[client.RoomID][client] = true
			h.mu.Unlock()

			// Send join notification to other clients in the room
			joinMsg := &WSMessage{
				Type:      MessageTypeJoin,
				RoomID:    client.RoomID,
				UserID:    client.UserID,
				Timestamp: time.Now(),
			}
			h.broadcastToRoom(joinMsg)

			logrus.Infof("Client %s joined room %d", client.ID, client.RoomID)

		case client := <-h.unregister:
			h.mu.Lock()
			if room, exists := h.rooms[client.RoomID]; exists {
				if _, ok := room[client]; ok {
					delete(room, client)
					close(client.Send)
					if len(room) == 0 {
						delete(h.rooms, client.RoomID)
					}
				}
			}
			h.mu.Unlock()

			// Send leave notification to other clients in the room
			leaveMsg := &WSMessage{
				Type:      MessageTypeLeave,
				RoomID:    client.RoomID,
				UserID:    client.UserID,
				Timestamp: time.Now(),
			}
			h.broadcastToRoom(leaveMsg)

			logrus.Infof("Client %s left room %d", client.ID, client.RoomID)

		case message := <-h.broadcast:
			h.broadcastToRoom(message)
		}
	}
}

// broadcastToRoom sends a message to all clients in a specific room
func (h *Hub) broadcastToRoom(message *WSMessage) {
	h.mu.RLock()
	room, exists := h.rooms[message.RoomID]
	h.mu.RUnlock()

	if !exists {
		logrus.Warnf("Room %d does not exist for broadcasting", message.RoomID)
		return
	}

	clientCount := len(room)
	logrus.Infof("Broadcasting message type '%s' to %d clients in room %d", message.Type, clientCount, message.RoomID)

	data, err := json.Marshal(message)
	if err != nil {
		logrus.Errorf("Failed to marshal message: %v", err)
		return
	}

	successCount := 0
	for client := range room {
		select {
		case client.Send <- data:
			successCount++
		default:
			logrus.Warnf("Client %s send buffer full, closing connection", client.ID)
			close(client.Send)
			delete(room, client)
		}
	}
	
	logrus.Infof("Successfully broadcasted message to %d/%d clients in room %d", successCount, clientCount, message.RoomID)
}

// BroadcastMessage broadcasts a message to a specific room
func (h *Hub) BroadcastMessage(roomID uint, messageType string, data map[string]interface{}) {
	msg := &WSMessage{
		Type:      messageType,
		RoomID:    roomID,
		Data:      data,
		Timestamp: time.Now(),
	}
	h.broadcast <- msg
}

// readPump reads messages from the WebSocket connection
func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.Errorf("WebSocket read error: %v", err)
			}
			break
		}

		// Log raw message for debugging
		logrus.Infof("Raw WebSocket message received from client %s: %s", c.ID, string(message))

		// Parse the message into a flexible map first
		var rawMsg map[string]interface{}
		if err := json.Unmarshal(message, &rawMsg); err != nil {
			logrus.Errorf("Failed to unmarshal message: %v", err)
			continue
		}

		// Convert to WSMessage, handling both flat and nested structures
		var wsMsg WSMessage
		wsMsg.Type = rawMsg["type"].(string)
		if roomID, ok := rawMsg["room_id"]; ok {
			if roomIDFloat, ok := roomID.(float64); ok {
				wsMsg.RoomID = uint(roomIDFloat)
			}
		}
		if userID, ok := rawMsg["user_id"]; ok {
			if userIDFloat, ok := userID.(float64); ok {
				wsMsg.UserID = uint(userIDFloat)
			}
		}
		if timestamp, ok := rawMsg["timestamp"]; ok {
			if timestampStr, ok := timestamp.(string); ok {
				if t, err := time.Parse(time.RFC3339, timestampStr); err == nil {
					wsMsg.Timestamp = t
				}
			}
		}

		// Use the data field if it exists
		if data, ok := rawMsg["data"]; ok {
			if dataMap, ok := data.(map[string]interface{}); ok {
				wsMsg.Data = dataMap
			}
		}

		// Log parsed message for debugging
		logrus.Infof("Parsed WebSocket message: type=%s, room_id=%d, user_id=%d", wsMsg.Type, wsMsg.RoomID, wsMsg.UserID)

		// Handle different message types
		switch wsMsg.Type {
		case MessageTypePing:
			// Send pong response
			pongMsg := &WSMessage{
				Type:      MessageTypePong,
				Timestamp: time.Now(),
			}
			if data, err := json.Marshal(pongMsg); err == nil {
				c.Send <- data
			}

		case MessageTypeMessage:
			// Broadcast the message to the room
			wsMsg.UserID = c.UserID
			wsMsg.RoomID = c.RoomID
			c.Hub.broadcast <- &wsMsg

		default:
			logrus.Infof("Received WebSocket message of type: %s", wsMsg.Type)
		}
	}
}

// writePump writes messages to the WebSocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for now - you can add proper CORS logic here
		return true
	},
}

// WebSocketService handles WebSocket connections
type WebSocketService struct {
	hub *Hub
}

// NewWebSocketService creates a new WebSocket service
func NewWebSocketService() *WebSocketService {
	hub := NewHub()
	go hub.Run()

	return &WebSocketService{
		hub: hub,
	}
}

// HandleWebSocket handles WebSocket connections
func (ws *WebSocketService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get user ID and room ID from query parameters
	userIDStr := r.URL.Query().Get("user_id")
	roomIDStr := r.URL.Query().Get("room_id")
	userType := r.URL.Query().Get("user_type")

	if userIDStr == "" || roomIDStr == "" {
		http.Error(w, "Missing user_id or room_id", http.StatusBadRequest)
		return
	}

	// Parse user ID and room ID
	var userID, roomID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		http.Error(w, "Invalid user_id", http.StatusBadRequest)
		return
	}
	if _, err := fmt.Sscanf(roomIDStr, "%d", &roomID); err != nil {
		http.Error(w, "Invalid room_id", http.StatusBadRequest)
		return
	}

	// Determine connection type based on URL path
	connectionType := "chat"
	if strings.Contains(r.URL.Path, "/location") {
		connectionType = "location tracking"
	}

	// Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	// Create a new client
	client := &Client{
		ID:     fmt.Sprintf("%d-%d", userID, roomID),
		UserID: userID,
		RoomID: roomID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    ws.hub,
	}

	// Register the client
	client.Hub.register <- client

	// Start the read and write pumps
	go client.writePump()
	go client.readPump()

	logrus.Infof("WebSocket %s connection established for user %d (type: %s) in room %d", connectionType, userID, userType, roomID)
}

// BroadcastChatMessage broadcasts a new chat message to all clients in the room
func (ws *WebSocketService) BroadcastChatMessage(roomID uint, message map[string]interface{}) {
	ws.hub.BroadcastMessage(roomID, MessageTypeMessage, message)
}


