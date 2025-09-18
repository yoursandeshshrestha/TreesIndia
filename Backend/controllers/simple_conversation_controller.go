package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type SimpleConversationController struct {
	conversationService *services.SimpleConversationService
}

func NewSimpleConversationController(conversationService *services.SimpleConversationService) *SimpleConversationController {
	return &SimpleConversationController{
		conversationService: conversationService,
	}
}

// CreateConversation creates a new conversation
func (cc *SimpleConversationController) CreateConversation(c *gin.Context) {
	var req models.CreateSimpleConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	conversation, err := cc.conversationService.CreateConversation(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to create conversation", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversation created successfully", gin.H{
		"conversation": conversation,
	}))
}

// GetUserConversations gets conversations for a user
func (cc *SimpleConversationController) GetUserConversations(c *gin.Context) {
	userID := c.GetUint("user_id")

	// Parse query parameters
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

	conversations, pagination, err := cc.conversationService.GetUserConversations(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get conversations", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversations retrieved successfully", gin.H{
		"conversations": conversations,
		"pagination":    pagination,
	}))
}

// GetAllConversations gets conversations where admin is a participant
func (cc *SimpleConversationController) GetAllConversations(c *gin.Context) {
	userType := c.GetString("user_type")
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", "Only admins can access this endpoint"))
		return
	}

	adminID := c.GetUint("user_id")

	// Parse query parameters
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

	conversations, pagination, err := cc.conversationService.GetAllConversations(adminID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get conversations", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversations retrieved successfully", gin.H{
		"conversations": conversations,
		"pagination":    pagination,
	}))
}

// GetAllConversationsForOversight gets all conversations for admin oversight (excluding admin's conversations)
func (cc *SimpleConversationController) GetAllConversationsForOversight(c *gin.Context) {
	userType := c.GetString("user_type")
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", "Only admins can access this endpoint"))
		return
	}

	adminID := c.GetUint("user_id")

	// Parse query parameters
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

	conversations, pagination, err := cc.conversationService.GetAllConversationsForOversight(adminID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get conversations for oversight", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversations for oversight retrieved successfully", gin.H{
		"conversations": conversations,
		"pagination":    pagination,
	}))
}

// GetConversation gets a specific conversation
func (cc *SimpleConversationController) GetConversation(c *gin.Context) {
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	conversation, err := cc.conversationService.GetConversation(uint(conversationID))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Conversation not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversation retrieved successfully", gin.H{
		"conversation": conversation,
	}))
}

// SendMessage sends a message in a conversation
func (cc *SimpleConversationController) SendMessage(c *gin.Context) {
	userID := c.GetUint("user_id")
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	var req models.SendSimpleConversationMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	message, err := cc.conversationService.SendMessage(userID, uint(conversationID), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to send message", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message sent successfully", gin.H{
		"message": message,
	}))
}

// GetMessages gets messages for a conversation
func (cc *SimpleConversationController) GetMessages(c *gin.Context) {
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	// Parse query parameters
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

	messages, pagination, err := cc.conversationService.GetMessages(uint(conversationID), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get messages", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Messages retrieved successfully", gin.H{
		"messages":   messages,
		"pagination": pagination,
	}))
}

// MarkMessageRead marks a message as read
func (cc *SimpleConversationController) MarkMessageRead(c *gin.Context) {
	userID := c.GetUint("user_id")
	messageID, err := strconv.ParseUint(c.Param("message_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid message ID", err.Error()))
		return
	}

	err = cc.conversationService.MarkMessageRead(uint(messageID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to mark message as read", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message marked as read", nil))
}

// GetUnreadCount gets unread message count for a conversation
func (cc *SimpleConversationController) GetUnreadCount(c *gin.Context) {
	userID := c.GetUint("user_id")
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	count, err := cc.conversationService.GetUnreadCount(uint(conversationID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get unread count", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Unread count retrieved successfully", gin.H{
		"unread_count": count,
	}))
}

// MarkConversationAsRead marks all messages in a conversation as read
func (cc *SimpleConversationController) MarkConversationAsRead(c *gin.Context) {
	userID := c.GetUint("user_id")
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	err = cc.conversationService.MarkConversationAsRead(uint(conversationID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to mark conversation as read", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Conversation marked as read", nil))
}

// GetTotalUnreadCount gets total unread count for a user
func (cc *SimpleConversationController) GetTotalUnreadCount(c *gin.Context) {
	userID := c.GetUint("user_id")

	totalUnreadCount, err := cc.conversationService.GetTotalUnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get total unread count", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Total unread count retrieved successfully", gin.H{
		"total_unread_count": totalUnreadCount,
	}))
}

// GetAdminTotalUnreadCount gets total unread count for admin (all conversations)
func (cc *SimpleConversationController) GetAdminTotalUnreadCount(c *gin.Context) {
	adminID := c.GetUint("user_id")

	totalUnreadCount, err := cc.conversationService.GetAdminTotalUnreadCount(adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get admin total unread count", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Admin total unread count retrieved successfully", gin.H{
		"total_unread_count": totalUnreadCount,
	}))
}
