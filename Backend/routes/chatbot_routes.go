package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupChatbotRoutes sets up chatbot-related routes
func SetupChatbotRoutes(router *gin.RouterGroup) {
	chatbotController := controllers.NewChatbotController()

	// Chatbot routes (public access)
	chatbot := router.Group("/chatbot")
	{
		// Health check (no auth required)
		chatbot.GET("/health", chatbotController.HealthCheck)
		
		// Session management
		chatbot.POST("/session", chatbotController.CreateSession)                    // Create new session
		chatbot.GET("/session/:session_id", chatbotController.GetSession)           // Get session details
		chatbot.POST("/session/:session_id/message", chatbotController.SendMessage) // Send message to chatbot
		chatbot.DELETE("/session/:session_id", chatbotController.DeleteSession)     // Delete session
		
		// Suggestions
		chatbot.GET("/suggestions", chatbotController.GetSuggestions)               // Get contextual suggestions
	}

	// Authenticated chatbot routes
	authChatbot := router.Group("/chatbot")
	authChatbot.Use(middleware.AuthMiddleware())
	{
		// User-specific routes
		authChatbot.GET("/sessions", chatbotController.GetUserSessions)             // Get user's sessions
	}
}
