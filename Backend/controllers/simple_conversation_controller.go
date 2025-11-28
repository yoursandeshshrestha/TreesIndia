package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
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
	// Get authenticated user ID
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	var req models.CreateSimpleConversationRequest
	// Parse JSON manually to avoid validation errors for optional fields
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Failed to read request body"))
		return
	}
	
	// Parse JSON without validation
	if err := json.Unmarshal(body, &req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Invalid JSON format"))
		return
	}

	// Auto-set user_1 or user_2 if not provided
	// If user_1 is provided, set user_2 to authenticated user (admin/customer service)
	// If user_2 is provided, set user_1 to authenticated user
	// If both are provided, use them as-is
	if req.User1 == 0 && req.User2 == 0 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Either user_1 or user_2 must be provided"))
		return
	}

	if req.User1 == 0 {
		// user_1 not provided, set it to authenticated user
		req.User1 = userID
	} else if req.User2 == 0 {
		// user_2 not provided, set it to authenticated user (admin starting conversation with customer)
		req.User2 = userID
	}

	// Ensure user is not creating a conversation with themselves
	if req.User1 == req.User2 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Cannot create a conversation with yourself"))
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

// SendMessage sends a message in a conversation (supports file uploads)
func (cc *SimpleConversationController) SendMessage(c *gin.Context) {
	// CRITICAL DEBUG - This should appear first
	fmt.Fprintf(c.Writer, "") // Force output
	fmt.Printf("=== SendMessage CALLED ===\n")
	os.Stderr.WriteString("=== SendMessage CALLED ===\n")
	
	userID := c.GetUint("user_id")
	conversationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid conversation ID", err.Error()))
		return
	}

	// Check Content-Type to determine request type (must check before parsing to avoid consuming body)
	contentType := c.GetHeader("Content-Type")
	contentTypeLower := strings.ToLower(contentType)
	isMultipart := strings.Contains(contentTypeLower, "multipart/form-data")
	
	// Debug logging - write to stderr to ensure visibility
	fmt.Fprintf(os.Stderr, "[DEBUG] SendMessage - Content-Type: %s\n", contentType)
	fmt.Fprintf(os.Stderr, "[DEBUG] SendMessage - isMultipart: %v\n", isMultipart)
	fmt.Fprintf(os.Stderr, "[DEBUG] SendMessage - Request Method: %s\n", c.Request.Method)
	fmt.Fprintf(os.Stderr, "[DEBUG] SendMessage - Request URL: %s\n", c.Request.URL.Path)
	
	var req models.SendSimpleConversationMessageRequest
	
	if isMultipart {
		// Handle multipart form data
		fmt.Printf("[DEBUG] SendMessage - Parsing multipart form\n")
		if err := c.Request.ParseMultipartForm(50 << 20); err != nil { // 50MB max
			fmt.Printf("[ERROR] SendMessage - ParseMultipartForm failed: %v\n", err)
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Failed to parse multipart form: "+err.Error()))
			return
		}
		fmt.Printf("[DEBUG] SendMessage - Multipart form parsed successfully\n")
		
		// Get message text from form
		req.Message = c.PostForm("message")
		
		// Try to get file
		file, fileErr := c.FormFile("file")
		if fileErr == nil && file != nil {
			// Determine media type from file's Content-Type header
			fileContentType := file.Header.Get("Content-Type")
			mediaType := getMediaType(fileContentType)
			
			// Validate file type
			if mediaType == "" {
				c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPEG, PNG, WebP images and MP4, WebM, AVI videos are allowed"))
				return
			}
			
			// Validate file size (max 5MB for images, 50MB for videos)
			maxSize := int64(5 * 1024 * 1024) // 5MB default
			if mediaType == "video" {
				maxSize = 50 * 1024 * 1024 // 50MB for videos
			}
			
			if file.Size > maxSize {
				maxSizeMB := maxSize / (1024 * 1024)
				c.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", fmt.Sprintf("File size must be less than %dMB", maxSizeMB)))
				return
			}
			
			// File was uploaded and validated
			req.AttachmentFile = file
		}
		
		// Message is required if no file
		if req.Message == "" && req.AttachmentFile == nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Message text or file attachment is required"))
			return
		}
	} else {
		// Handle JSON request (text message only)
		fmt.Printf("[DEBUG] SendMessage - Handling as JSON request\n")
		if err := c.ShouldBindJSON(&req); err != nil {
			fmt.Printf("[ERROR] SendMessage - ShouldBindJSON failed: %v\n", err)
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Failed to parse JSON. Error: "+err.Error()))
			return
		}
		
		// Validate that message is provided when no file
		if req.Message == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", "Message text is required when no file is attached"))
			return
		}
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

// isValidImageType checks if the content type is a valid image type
func isValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
		"image/gif",
	}

	for _, validType := range validTypes {
		if strings.EqualFold(contentType, validType) {
			return true
		}
	}
	return false
}

// isValidVideoType checks if the content type is a valid video type
func isValidVideoType(contentType string) bool {
	validTypes := []string{
		"video/mp4",
		"video/webm",
		"video/avi",
		"video/quicktime", // .mov files
		"video/x-msvideo", // .avi files
	}

	for _, validType := range validTypes {
		if strings.EqualFold(contentType, validType) {
			return true
		}
	}
	return false
}

// getMediaType determines if the file is an image or video
func getMediaType(contentType string) string {
	if isValidImageType(contentType) {
		return "image"
	}
	if isValidVideoType(contentType) {
		return "video"
	}
	return ""
}
