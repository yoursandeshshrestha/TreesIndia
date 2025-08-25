package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// ChatController handles chat-related HTTP requests
type ChatController struct {
	BaseController
	chatService *services.ChatService
}

// NewChatController creates a new chat controller
func NewChatController() *ChatController {
	return &ChatController{
		BaseController: *NewBaseController(),
		chatService:    services.NewChatService(),
	}
}

// CreateChatRoom godoc
// @Summary Create a new chat room
// @Description Create a new chat room for communication
// @Tags Chat
// @Accept json
// @Produce json
// @Param request body models.CreateChatRoomRequest true "Chat room creation request"
// @Success 200 {object} models.Response "Chat room created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/rooms [post]
func (cc *ChatController) CreateChatRoom(c *gin.Context) {
	var req models.CreateChatRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	chatRoom, err := cc.chatService.CreateChatRoom(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create chat room", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat room created successfully", chatRoom))
}

// GetUserChatRooms godoc
// @Summary Get user's chat rooms
// @Description Get all chat rooms for the authenticated user
// @Tags Chat
// @Accept json
// @Produce json
// @Param room_type query string false "Filter by room type"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20)"
// @Success 200 {object} models.Response "Chat rooms retrieved successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/rooms [get]
func (cc *ChatController) GetUserChatRooms(c *gin.Context) {
	// Get user ID from context
	userID := cc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	roomTypeStr := c.Query("room_type")

	var roomType *models.RoomType
	if roomTypeStr != "" {
		rt := models.RoomType(roomTypeStr)
		roomType = &rt
	}

	req := &models.GetChatRoomsRequest{
		UserID:   userID,
		RoomType: roomType,
		Page:     page,
		Limit:    limit,
	}

	chatRooms, pagination, err := cc.chatService.GetUserChatRooms(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get chat rooms", err.Error()))
		return
	}

	response := gin.H{
		"chat_rooms": chatRooms,
		"pagination": pagination,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat rooms retrieved successfully", response))
}

// SendMessage godoc
// @Summary Send a message
// @Description Send a message in a chat room
// @Tags Chat
// @Accept json
// @Produce json
// @Param request body models.SendMessageRequest true "Message request"
// @Success 200 {object} models.Response "Message sent successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 403 {object} models.Response "User not participant in chat room"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/messages [post]
func (cc *ChatController) SendMessage(c *gin.Context) {
	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context
	userID := cc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	message, err := cc.chatService.SendMessage(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to send message", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message sent successfully", message))
}

// GetMessages godoc
// @Summary Get chat messages
// @Description Get messages for a specific chat room
// @Tags Chat
// @Accept json
// @Produce json
// @Param room_id path int true "Chat room ID"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 50)"
// @Success 200 {object} models.Response "Messages retrieved successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 403 {object} models.Response "User not participant in chat room"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/rooms/{room_id}/messages [get]
func (cc *ChatController) GetMessages(c *gin.Context) {
	// Get room ID from path
	roomIDStr := c.Param("room_id")
	roomID, err := strconv.ParseUint(roomIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid room ID", err.Error()))
		return
	}

	// Get user ID from context
	userID := cc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	req := &models.GetMessagesRequest{
		RoomID: uint(roomID),
		Page:   page,
		Limit:  limit,
	}

	messages, pagination, err := cc.chatService.GetMessages(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get messages", err.Error()))
		return
	}

	response := gin.H{
		"messages":   messages,
		"pagination": pagination,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Messages retrieved successfully", response))
}

// MarkMessageRead godoc
// @Summary Mark message as read
// @Description Mark a specific message as read by the user
// @Tags Chat
// @Accept json
// @Produce json
// @Param request body models.MarkMessageReadRequest true "Mark read request"
// @Success 200 {object} models.Response "Message marked as read successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 403 {object} models.Response "User not participant in chat room"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/messages/read [post]
func (cc *ChatController) MarkMessageRead(c *gin.Context) {
	var req models.MarkMessageReadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context
	userID := cc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	// Override user ID from request with authenticated user ID
	req.UserID = userID

	err := cc.chatService.MarkMessageRead(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to mark message as read", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message marked as read successfully", nil))
}

// CreateBookingChatRoom godoc
// @Summary Create chat room for booking
// @Description Create a chat room for a specific booking
// @Tags Chat
// @Accept json
// @Produce json
// @Param booking_id path int true "Booking ID"
// @Success 200 {object} models.Response "Chat room created successfully"
// @Failure 400 {object} models.Response "Invalid booking ID"
// @Failure 404 {object} models.Response "Booking not found or no worker assigned"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /chat/bookings/{booking_id}/room [post]
func (cc *ChatController) CreateBookingChatRoom(c *gin.Context) {
	// Get booking ID from path
	bookingIDStr := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	chatRoom, err := cc.chatService.CreateBookingChatRoom(uint(bookingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create chat room", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat room created successfully", chatRoom))
}
