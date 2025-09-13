package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupSimpleConversationRoutes sets up simple conversation-related routes
func SetupSimpleConversationRoutes(router *gin.RouterGroup, conversationService *services.SimpleConversationService) {
	conversationController := controllers.NewSimpleConversationController(conversationService)

	// Simple conversation routes (authenticated users only)
	conversations := router.Group("/conversations")
	conversations.Use(middleware.AuthMiddleware())
	{
		// Conversation management
		conversations.POST("", conversationController.CreateConversation)                    // Create new conversation
		conversations.GET("", conversationController.GetUserConversations)                  // Get user's conversations
		conversations.GET("/:id", conversationController.GetConversation)                   // Get specific conversation
		
		// Message management
		conversations.GET("/:id/messages", conversationController.GetMessages)              // Get messages for a conversation
		conversations.POST("/:id/messages", conversationController.SendMessage)             // Send a message
		conversations.PUT("/messages/:message_id/read", conversationController.MarkMessageRead) // Mark message as read
		conversations.PUT("/:id/mark-read", conversationController.MarkConversationAsRead)      // Mark conversation as read
		conversations.GET("/:id/unread-count", conversationController.GetUnreadCount)       // Get unread count
		conversations.GET("/unread-count/total", conversationController.GetTotalUnreadCount) // Get total unread count
	}

	// Admin conversation routes
	adminConversations := router.Group("/admin/conversations")
	adminConversations.Use(middleware.AuthMiddleware())
	{
		adminConversations.GET("", conversationController.GetAllConversations)              // Get all conversations (admin only)
		adminConversations.POST("", conversationController.CreateConversation)              // Admin create conversation
		adminConversations.POST("/:id/messages", conversationController.SendMessage)       // Admin send message
		adminConversations.GET("/unread-count/total", conversationController.GetAdminTotalUnreadCount) // Get admin total unread count
	}
}
