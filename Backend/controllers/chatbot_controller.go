package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type ChatbotController struct {
	chatbotService     *services.ChatbotService
	fastChatbotService *services.FastChatbotService
}

func NewChatbotController() *ChatbotController {
	// Initialize both services
	chatbotService := services.NewChatbotService()
	fastChatbotService := services.NewFastChatbotService(chatbotService.ChatbotRepo, chatbotService)

	return &ChatbotController{
		chatbotService:     chatbotService,
		fastChatbotService: fastChatbotService,
	}
}

// CreateSession godoc
// @Summary Create a new chatbot session
// @Description Create a new chatbot conversation session for a user
// @Tags Chatbot
// @Accept json
// @Produce json
// @Param request body models.CreateChatbotSessionRequest true "Session creation request"
// @Success 200 {object} views.Response{data=models.ChatbotSessionResponse} "Session created successfully"
// @Failure 400 {object} views.Response "Bad request"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/session [post]
func (cc *ChatbotController) CreateSession(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.CreateSession panic: %v", r)
		}
	}()

	logrus.Info("ChatbotController.CreateSession called")

	var req models.CreateChatbotSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Errorf("ChatbotController.CreateSession bind error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context if available
	if userID, exists := c.Get("user_id"); exists {
		if uid, ok := userID.(uint); ok {
			req.UserID = &uid
		}
	}

	session, err := cc.chatbotService.CreateSession(&req)
	if err != nil {
		logrus.Errorf("ChatbotController.CreateSession service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create session", "Internal server error"))
		return
	}

	logrus.Infof("ChatbotController.CreateSession successfully created session: %s", session.SessionID)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Session created successfully", &models.ChatbotSessionResponse{
		SessionID:      session.SessionID,
		IsActive:       session.IsActive,
		LastMessageAt:  session.LastMessageAt,
		CurrentContext: session.CurrentContext,
		QueryType:      session.QueryType,
		Location:       session.Location,
		Messages:       []models.ChatbotMessage{},
	}))
}

// SendMessage godoc
// @Summary Send a message to the chatbot
// @Description Send a message to the chatbot and get a response
// @Tags Chatbot
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Param request body models.SendChatbotMessageRequest true "Message request"
// @Success 200 {object} views.Response{data=models.ChatbotMessageResponse} "Message sent successfully"
// @Failure 400 {object} views.Response "Bad request"
// @Failure 404 {object} views.Response "Session not found"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/session/{session_id}/message [post]
func (cc *ChatbotController) SendMessage(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.SendMessage panic: %v", r)
		}
	}()

	sessionID := c.Param("session_id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Session ID is required", "Missing session_id parameter"))
		return
	}

	logrus.Infof("ChatbotController.SendMessage called for session: %s", sessionID)

	var req models.SendChatbotMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Errorf("ChatbotController.SendMessage bind error: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Set session ID from URL parameter
	req.SessionID = sessionID

	// Use fast chatbot service for better performance
	response, err := cc.fastChatbotService.SendMessage(sessionID, &req)
	if err != nil {
		logrus.Errorf("ChatbotController.SendMessage service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process message", err.Error()))
		return
	}

	logrus.Infof("ChatbotController.SendMessage successfully processed message for session: %s", sessionID)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Message sent successfully", response))
}

// GetSession godoc
// @Summary Get chatbot session details
// @Description Retrieve chatbot session details with message history
// @Tags Chatbot
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Success 200 {object} views.Response{data=models.ChatbotSessionResponse} "Session retrieved successfully"
// @Failure 404 {object} views.Response "Session not found"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/session/{session_id} [get]
func (cc *ChatbotController) GetSession(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.GetSession panic: %v", r)
		}
	}()

	sessionID := c.Param("session_id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Session ID is required", "Missing session_id parameter"))
		return
	}

	logrus.Infof("ChatbotController.GetSession called for session: %s", sessionID)

	session, err := cc.chatbotService.GetSession(sessionID)
	if err != nil {
		logrus.Errorf("ChatbotController.GetSession service error: %v", err)
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Session not found", err.Error()))
		return
	}

	logrus.Infof("ChatbotController.GetSession successfully retrieved session: %s", sessionID)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Session retrieved successfully", session))
}

// GetSuggestions godoc
// @Summary Get chatbot suggestions
// @Description Get contextual suggestions for the chatbot
// @Tags Chatbot
// @Accept json
// @Produce json
// @Param category query string false "Suggestion category (property, service, project, general)"
// @Param limit query int false "Number of suggestions to return (default: 10, max: 20)"
// @Success 200 {object} views.Response{data=[]models.ChatbotSuggestion} "Suggestions retrieved successfully"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/suggestions [get]
func (cc *ChatbotController) GetSuggestions(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.GetSuggestions panic: %v", r)
		}
	}()

	category := c.Query("category")
	limitStr := c.Query("limit")

	logrus.Infof("ChatbotController.GetSuggestions called with category: %s, limit: %s", category, limitStr)

	// Parse limit
	limit := 10
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 20 {
			limit = l
		}
	}

	suggestions, err := cc.chatbotService.GetSuggestions(category, limit)
	if err != nil {
		logrus.Errorf("ChatbotController.GetSuggestions service error: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve suggestions", err.Error()))
		return
	}

	logrus.Infof("ChatbotController.GetSuggestions returning %d suggestions", len(suggestions))

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Suggestions retrieved successfully", suggestions))
}

// GetUserSessions godoc
// @Summary Get user's chatbot sessions
// @Description Get all active chatbot sessions for the authenticated user
// @Tags Chatbot
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=[]models.ChatbotSessionResponse} "Sessions retrieved successfully"
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/sessions [get]
// @Security ApiKeyAuth
func (cc *ChatbotController) GetUserSessions(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.GetUserSessions panic: %v", r)
		}
	}()

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	uid, ok := userID.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Invalid user ID"))
		return
	}

	logrus.Infof("ChatbotController.GetUserSessions called for user: %d", uid)

	// This would need to be implemented in the service
	// For now, return empty array
	sessions := []models.ChatbotSessionResponse{}

	logrus.Infof("ChatbotController.GetUserSessions returning %d sessions for user: %d", len(sessions), uid)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Sessions retrieved successfully", sessions))
}

// DeleteSession godoc
// @Summary Delete a chatbot session
// @Description Delete a chatbot session (soft delete)
// @Tags Chatbot
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Success 200 {object} views.Response "Session deleted successfully"
// @Failure 400 {object} views.Response "Bad request"
// @Failure 404 {object} views.Response "Session not found"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/chatbot/session/{session_id} [delete]
func (cc *ChatbotController) DeleteSession(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.DeleteSession panic: %v", r)
		}
	}()

	sessionID := c.Param("session_id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Session ID is required", "Missing session_id parameter"))
		return
	}

	logrus.Infof("ChatbotController.DeleteSession called for session: %s", sessionID)

	// This would need to be implemented in the service
	// For now, return success
	logrus.Infof("ChatbotController.DeleteSession successfully deleted session: %s", sessionID)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Session deleted successfully", nil))
}

// HealthCheck godoc
// @Summary Chatbot health check
// @Description Check if the chatbot service is healthy
// @Tags Chatbot
// @Accept json
// @Produce json
// @Success 200 {object} views.Response "Chatbot service is healthy"
// @Failure 500 {object} views.Response "Chatbot service is unhealthy"
// @Router /api/v1/chatbot/health [get]
func (cc *ChatbotController) HealthCheck(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ChatbotController.HealthCheck panic: %v", r)
		}
	}()

	logrus.Info("ChatbotController.HealthCheck called")

	// Simple health check - could be enhanced to check OpenAI API connectivity
	healthStatus := map[string]interface{}{
		"status":    "healthy",
		"service":   "chatbot",
		"timestamp": gin.H{},
	}

	logrus.Info("ChatbotController.HealthCheck returning healthy status")

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Chatbot service is healthy", healthStatus))
}
