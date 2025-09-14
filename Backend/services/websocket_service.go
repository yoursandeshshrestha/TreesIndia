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
	// Location tracking message types
	MessageTypeStartTracking = "start_tracking"
	MessageTypeStopTracking  = "stop_tracking"
	MessageTypeLocationUpdate = "location_update"
	MessageTypeTrackingStatus = "tracking_status"
	MessageTypeWorkerJoin     = "worker_join"
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

// Flat WebSocket message structure for location tracking
type FlatWSMessage struct {
	Type      string    `json:"type"`
	RoomID    uint      `json:"room_id,omitempty"`
	UserID    uint      `json:"user_id,omitempty"`
	Message   string    `json:"message,omitempty"`
	Timestamp time.Time `json:"timestamp"`
	// Location fields (flat structure)
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`
	Accuracy  float64 `json:"accuracy,omitempty"`
	Status    string  `json:"status,omitempty"`
}

// Location tracking message structures
type StartTrackingData struct {
	AssignmentID uint `json:"assignment_id"`
	WorkerID     uint `json:"worker_id"`
}

type StopTrackingData struct {
	AssignmentID uint `json:"assignment_id"`
	WorkerID     uint `json:"worker_id"`
}

type LocationUpdateData struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

// Worker join data structure
type WorkerJoinData struct {
	WorkerID  uint    `json:"worker_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Accuracy  float64 `json:"accuracy"`
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
	// Add location tracking service reference
	locationTrackingService *LocationTrackingService
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

	// Broadcast flat messages to specific room
	broadcastFlat chan *FlatWSMessage

	mu sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		rooms:        make(map[uint]map[*Client]bool),
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		broadcast:    make(chan *WSMessage),
		broadcastFlat: make(chan *FlatWSMessage),
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

		case flatMessage := <-h.broadcastFlat:
			h.broadcastFlatToRoom(flatMessage)
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
			logrus.Debugf("Message sent to client %s in room %d", client.ID, message.RoomID)
		default:
			logrus.Warnf("Client %s send buffer full, closing connection", client.ID)
			close(client.Send)
			delete(room, client)
		}
	}
	
	logrus.Infof("Successfully broadcasted message to %d/%d clients in room %d", successCount, clientCount, message.RoomID)
}

// broadcastFlatToRoom sends a flat message to all clients in a specific room
func (h *Hub) broadcastFlatToRoom(message *FlatWSMessage) {
	h.mu.RLock()
	room, exists := h.rooms[message.RoomID]
	h.mu.RUnlock()

	if !exists {
		logrus.Warnf("Room %d does not exist for broadcasting flat message", message.RoomID)
		return
	}

	clientCount := len(room)
	logrus.Infof("Broadcasting flat message type '%s' to %d clients in room %d", message.Type, clientCount, message.RoomID)

	data, err := json.Marshal(message)
	if err != nil {
		logrus.Errorf("Failed to marshal flat message: %v", err)
		return
	}

	successCount := 0
	for client := range room {
		select {
		case client.Send <- data:
			successCount++
			logrus.Debugf("Flat message sent to client %s in room %d", client.ID, message.RoomID)
		default:
			logrus.Warnf("Client %s send buffer full, closing connection", client.ID)
			close(client.Send)
			delete(room, client)
		}
	}
	
	logrus.Infof("Successfully broadcasted flat message to %d/%d clients in room %d", successCount, clientCount, message.RoomID)
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

		// For location-related messages, extract flat data into Data field for backward compatibility
		if wsMsg.Type == MessageTypeWorkerJoin || wsMsg.Type == MessageTypeLocationUpdate || wsMsg.Type == MessageTypeStartTracking {
			wsMsg.Data = make(map[string]interface{})
			if lat, ok := rawMsg["latitude"]; ok {
				wsMsg.Data["latitude"] = lat
			}
			if lng, ok := rawMsg["longitude"]; ok {
				wsMsg.Data["longitude"] = lng
			}
			if acc, ok := rawMsg["accuracy"]; ok {
				wsMsg.Data["accuracy"] = acc
			}
			if status, ok := rawMsg["status"]; ok {
				wsMsg.Data["status"] = status
			}
		} else {
			// For other messages, use the data field if it exists
			if data, ok := rawMsg["data"]; ok {
				if dataMap, ok := data.(map[string]interface{}); ok {
					wsMsg.Data = dataMap
				}
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

		case MessageTypeWorkerJoin:
			logrus.Infof("Handling worker join message")
			c.handleWorkerJoin(wsMsg)

		case MessageTypeMessage:
			// Broadcast the message to the room
			wsMsg.UserID = c.UserID
			wsMsg.RoomID = c.RoomID
			c.Hub.broadcast <- &wsMsg

		case MessageTypeStartTracking:
			logrus.Infof("Handling start tracking message")
			c.handleStartTracking(wsMsg)

		case MessageTypeStopTracking:
			logrus.Infof("Handling stop tracking message")
			c.handleStopTracking(wsMsg)

		case MessageTypeLocationUpdate:
			logrus.Infof("Handling location update message")
			c.handleLocationUpdate(wsMsg)

		default:
			logrus.Infof("Received WebSocket message of type: %s", wsMsg.Type)
		}
	}
}

// handleStartTracking handles start tracking requests
func (c *Client) handleStartTracking(wsMsg WSMessage) {
	if c.locationTrackingService == nil {
		logrus.Error("Location tracking service not available")
		return
	}

	// Extract data from flat message structure
	// Frontend sends: { room_id: X, user_id: Y, latitude: Z, longitude: W, accuracy: A }
	latitude, ok := wsMsg.Data["latitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid latitude in start tracking message")
		return
	}

	longitude, ok := wsMsg.Data["longitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid longitude in start tracking message")
		return
	}

	accuracy, ok := wsMsg.Data["accuracy"].(float64)
	if !ok {
		accuracy = 0 // Default accuracy if not provided
	}

	workerID := c.UserID
	bookingID := c.RoomID

	logrus.Infof("Starting location tracking for worker %d, booking %d", workerID, bookingID)

	// Get assignment by worker and booking
	assignment, err := c.locationTrackingService.GetAssignmentByWorkerAndBooking(workerID, bookingID)
	if err != nil {
		logrus.Errorf("Failed to get assignment: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeTrackingStatus,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": "assignment not found",
				"type": "tracking_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Start tracking
	status, err := c.locationTrackingService.StartTracking(workerID, assignment.ID)
	if err != nil {
		logrus.Errorf("Failed to start tracking: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeTrackingStatus,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": err.Error(),
				"type": "tracking_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Update initial location if provided
	if latitude != 0 && longitude != 0 {
		err = c.locationTrackingService.UpdateLocation(workerID, assignment.ID, latitude, longitude, accuracy)
		if err != nil {
			logrus.Warnf("Failed to update initial location: %v", err)
		}
	}

	// Send success response
	successMsg := &WSMessage{
		Type:      MessageTypeTrackingStatus,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Data: map[string]interface{}{
			"tracking_status": status,
			"type": "tracking_started",
		},
		Timestamp: time.Now(),
	}
	if data, err := json.Marshal(successMsg); err == nil {
		c.Send <- data
	}

	// Broadcast tracking started to all clients in the room
	broadcastMsg := &WSMessage{
		Type:      MessageTypeTrackingStatus,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Data: map[string]interface{}{
			"tracking_status": status,
			"type": "tracking_started",
		},
		Timestamp: time.Now(),
	}
	
	logrus.Infof("Broadcasting tracking started to room %d for worker %d, assignment %d", c.RoomID, workerID, assignment.ID)
	c.Hub.broadcast <- broadcastMsg

	logrus.Infof("Successfully started location tracking for worker %d, assignment %d", workerID, assignment.ID)
}

// handleStopTracking handles stop tracking requests
func (c *Client) handleStopTracking(wsMsg WSMessage) {
	if c.locationTrackingService == nil {
		logrus.Error("Location tracking service not available")
		return
	}

	workerID := c.UserID
	bookingID := c.RoomID

	logrus.Infof("Stopping location tracking for worker %d, booking %d", workerID, bookingID)

	// Get assignment by worker and booking
	assignment, err := c.locationTrackingService.GetAssignmentByWorkerAndBooking(workerID, bookingID)
	if err != nil {
		logrus.Errorf("Failed to get assignment: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeTrackingStatus,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": "assignment not found",
				"type": "tracking_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Stop tracking
	err = c.locationTrackingService.StopTracking(workerID, assignment.ID)
	if err != nil {
		logrus.Errorf("Failed to stop tracking: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeTrackingStatus,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": err.Error(),
				"type": "tracking_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Send success response
	successMsg := &WSMessage{
		Type:      MessageTypeTrackingStatus,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Data: map[string]interface{}{
			"tracking_status": map[string]interface{}{
				"assignment_id": assignment.ID,
				"booking_id":    assignment.BookingID,
				"worker_id":     workerID,
				"is_tracking":   false,
				"status":        "stopped",
				"worker_name":   assignment.Worker.Name,
				"customer_name": assignment.Booking.User.Name,
			},
			"type": "tracking_stopped",
		},
		Timestamp: time.Now(),
	}
	if data, err := json.Marshal(successMsg); err == nil {
		c.Send <- data
	}

	// Broadcast tracking stopped to all clients in the room
	broadcastMsg := &WSMessage{
		Type:      MessageTypeTrackingStatus,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Data: map[string]interface{}{
			"tracking_status": map[string]interface{}{
				"assignment_id": assignment.ID,
				"booking_id":    assignment.BookingID,
				"worker_id":     workerID,
				"is_tracking":   false,
				"status":        "stopped",
				"worker_name":   assignment.Worker.Name,
				"customer_name": assignment.Booking.User.Name,
			},
			"type": "tracking_stopped",
		},
		Timestamp: time.Now(),
	}
	
	logrus.Infof("Broadcasting tracking stopped to room %d for worker %d, assignment %d", c.RoomID, workerID, assignment.ID)
	c.Hub.broadcast <- broadcastMsg

	logrus.Infof("Successfully stopped location tracking for worker %d, assignment %d", workerID, assignment.ID)
}

// handleLocationUpdate handles location update requests
func (c *Client) handleLocationUpdate(wsMsg WSMessage) {
	if c.locationTrackingService == nil {
		logrus.Error("Location tracking service not available")
		return
	}

	// Extract location data from flat message structure
	// Frontend sends: { room_id: X, user_id: Y, latitude: Z, longitude: W, accuracy: A, status: B }
	latitude, ok := wsMsg.Data["latitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid latitude in location update message")
		return
	}

	longitude, ok := wsMsg.Data["longitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid longitude in location update message")
		return
	}

	accuracy, ok := wsMsg.Data["accuracy"].(float64)
	if !ok {
		accuracy = 0 // Default accuracy if not provided
	}

	status, ok := wsMsg.Data["status"].(string)
	if !ok {
		status = "active" // Default status if not provided
	}

	workerID := c.UserID
	bookingID := c.RoomID

	logrus.Infof("Updating location for worker %d, booking %d: lat=%.6f, lng=%.6f", 
		workerID, bookingID, latitude, longitude)

	// Get assignment by worker and booking
	assignment, err := c.locationTrackingService.GetAssignmentByWorkerAndBooking(workerID, bookingID)
	if err != nil {
		logrus.Errorf("Failed to get assignment: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeLocationUpdate,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": "assignment not found",
				"type": "location_update_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Update location
	err = c.locationTrackingService.UpdateLocation(workerID, assignment.ID, latitude, longitude, accuracy)
	if err != nil {
		logrus.Errorf("Failed to update location: %v", err)
		// Send error response to client
		errorMsg := &WSMessage{
			Type:      MessageTypeLocationUpdate,
			RoomID:    c.RoomID,
			UserID:    c.UserID,
			Data: map[string]interface{}{
				"error": err.Error(),
				"type": "location_update_error",
			},
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(errorMsg); err == nil {
			c.Send <- data
		}
		return
	}

	// Send success response
	successMsg := &WSMessage{
		Type:      MessageTypeLocationUpdate,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Data: map[string]interface{}{
			"type": "location_updated",
			"assignment_id": assignment.ID,
			"worker_id": workerID,
			"latitude": latitude,
			"longitude": longitude,
			"accuracy": accuracy,
		},
		Timestamp: time.Now(),
	}
	if data, err := json.Marshal(successMsg); err == nil {
		c.Send <- data
	}

	// Broadcast location update to all clients in the room with flat structure
	broadcastMsg := &FlatWSMessage{
		Type:      MessageTypeLocationUpdate,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Latitude:  latitude,
		Longitude: longitude,
		Accuracy:  accuracy,
		Status:    status,
		Timestamp: time.Now(),
	}
	
	logrus.Infof("Broadcasting location update to room %d for worker %d, assignment %d", c.RoomID, workerID, assignment.ID)
	c.Hub.broadcastFlat <- broadcastMsg

	logrus.Infof("Successfully updated location for worker %d, assignment %d", workerID, assignment.ID)
}

// handleWorkerJoin handles worker join messages
func (c *Client) handleWorkerJoin(wsMsg WSMessage) {
	// Extract worker join data from flat message structure
	// Frontend sends: { room_id: X, user_id: Y, latitude: Z, longitude: W, accuracy: A }
	latitude, ok := wsMsg.Data["latitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid latitude in worker join message")
		return
	}

	longitude, ok := wsMsg.Data["longitude"].(float64)
	if !ok {
		logrus.Error("Missing or invalid longitude in worker join message")
		return
	}

	accuracy, ok := wsMsg.Data["accuracy"].(float64)
	if !ok {
		accuracy = 0 // Default accuracy if not provided
	}

	workerID := c.UserID

	logrus.Infof("Worker %d joined room %d at location: lat=%.6f, lng=%.6f", 
		workerID, c.RoomID, latitude, longitude)

	// Broadcast worker joined message to all clients in the room with flat structure
	broadcastMsg := &FlatWSMessage{
		Type:      MessageTypeWorkerJoin,
		RoomID:    c.RoomID,
		UserID:    c.UserID,
		Latitude:  latitude,
		Longitude: longitude,
		Accuracy:  accuracy,
		Status:    "joined",
		Timestamp: time.Now(),
	}
	
	c.Hub.broadcastFlat <- broadcastMsg
	logrus.Infof("Successfully broadcasted worker join message for worker %d in room %d", workerID, c.RoomID)
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
	locationTrackingService *LocationTrackingService
}

// NewWebSocketService creates a new WebSocket service
func NewWebSocketService(locationTrackingService *LocationTrackingService) *WebSocketService {
	hub := NewHub()
	go hub.Run()

	return &WebSocketService{
		hub: hub,
		locationTrackingService: locationTrackingService,
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
		locationTrackingService: ws.locationTrackingService,
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


