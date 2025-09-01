package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type ChatController struct {
	chatService *services.ChatService
}

func NewChatController(chatService *services.ChatService) *ChatController {
	return &ChatController{
		chatService: chatService,
	}
}

// GetUserChatRooms gets chat rooms for a user
func (cc *ChatController) GetUserChatRooms(c *gin.Context) {
	userID := c.GetUint("user_id")
	_ = c.GetString("user_type") // Not used in this function but kept for consistency

	// Parse query parameters manually like GetChatHistory
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	
	// Validate page and limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}

	chatRooms, pagination, err := cc.chatService.GetUserChatRooms(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get chat rooms", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat rooms retrieved successfully", gin.H{
		"chat_rooms": chatRooms,
		"pagination": pagination,
	}))
}

// GetChatHistory gets chat history for a user
func (cc *ChatController) GetChatHistory(c *gin.Context) {
	userID := c.GetUint("user_id")
	userType := c.GetString("user_type")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Get both active and closed chat rooms for the user
	activeRooms, activePagination, err := cc.chatService.GetUserChatRooms(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get active chat rooms", err.Error()))
		return
	}

	closedRooms, closedPagination, err := cc.chatService.GetUserClosedChatRooms(userID, userType, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get closed chat rooms", err.Error()))
		return
	}

	// Combine active and closed rooms
	allRooms := append(activeRooms, closedRooms...)
	
	// Calculate combined pagination
	totalRooms := activePagination.Total + closedPagination.Total
	totalPages := int((totalRooms + limit - 1) / limit)
	combinedPagination := &repositories.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      totalRooms,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat history retrieved successfully", gin.H{
		"chat_rooms": allRooms,
		"pagination": combinedPagination,
	}))
}

// GetMessages gets messages for a chat room
func (cc *ChatController) GetMessages(c *gin.Context) {
	userID := c.GetUint("user_id")
	roomID, err := strconv.ParseUint(c.Param("room_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid room ID", err.Error()))
		return
	}

	// Parse query parameters manually
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	// Validate page and limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	messages, pagination, err := cc.chatService.GetMessages(userID, uint(roomID), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get messages", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Messages retrieved successfully", gin.H{
		"messages":   messages,
		"pagination": pagination,
	}))
}

// SendMessage sends a message in a chat room
func (cc *ChatController) SendMessage(c *gin.Context) {
	userID := c.GetUint("user_id")
	roomID, err := strconv.ParseUint(c.Param("room_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid room ID", err.Error()))
		return
	}

	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	req.RoomID = uint(roomID)

	message, err := cc.chatService.SendMessage(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to send message", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message sent successfully", gin.H{
		"message": message,
	}))
}

// MarkMessageRead marks a message as read
func (cc *ChatController) MarkMessageRead(c *gin.Context) {
	userID := c.GetUint("user_id")
	messageID, err := strconv.ParseUint(c.Param("message_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid message ID", err.Error()))
		return
	}

	var req models.MarkMessageReadRequest
	req.MessageID = uint(messageID)
	req.UserID = userID

	err = cc.chatService.MarkMessageRead(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to mark message as read", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message marked as read", nil))
}

// GetBookingChatRoom gets or creates a chat room for a booking
func (cc *ChatController) GetBookingChatRoom(c *gin.Context) {
	_ = c.GetUint("user_id") // Not used in this function but kept for consistency
	bookingID, err := strconv.ParseUint(c.Param("booking_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	chatRoom, err := cc.chatService.CreateBookingChatRoom(uint(bookingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get chat room", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat room retrieved successfully", gin.H{
		"chat_room": chatRoom,
	}))
}

// AdminGetAllChatRooms gets all chat rooms (admin only)
func (cc *ChatController) AdminGetAllChatRooms(c *gin.Context) {
	userType := c.GetString("user_type")
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", "Only admins can access this endpoint"))
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	chatRooms, pagination, err := cc.chatService.GetUserChatHistory(0, string(models.UserTypeAdmin), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get chat rooms", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat rooms retrieved successfully", gin.H{
		"chat_rooms": chatRooms,
		"pagination": pagination,
	}))
}

// AdminSendMessage allows admin to send message in any chat room
func (cc *ChatController) AdminSendMessage(c *gin.Context) {
	userID := c.GetUint("user_id")
	userType := c.GetString("user_type")
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", "Only admins can access this endpoint"))
		return
	}

	roomID, err := strconv.ParseUint(c.Param("room_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid room ID", err.Error()))
		return
	}

	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	req.RoomID = uint(roomID)

	message, err := cc.chatService.SendMessage(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to send message", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message sent successfully", gin.H{
		"message": message,
	}))
}

// CloseChatRoom closes a chat room (admin only)
func (cc *ChatController) CloseChatRoom(c *gin.Context) {
	userType := c.GetString("user_type")
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", "Only admins can access this endpoint"))
		return
	}

	roomID, err := strconv.ParseUint(c.Param("room_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid room ID", err.Error()))
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	err = cc.chatService.CloseBookingChatRoom(uint(roomID), req.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to close chat room", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chat room closed successfully", nil))
}
