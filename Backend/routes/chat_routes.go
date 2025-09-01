package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupChatRoutes sets up chat-related routes
func SetupChatRoutes(router *gin.RouterGroup, chatService *services.ChatService) {
	chatController := controllers.NewChatController(chatService)

	// Chat routes (authenticated users only)
	chat := router.Group("/chat")
	chat.Use(middleware.AuthMiddleware())
	{
		// Chat room management
		chat.GET("/rooms", chatController.GetUserChatRooms)                   // Get user's chat rooms
		chat.GET("/history", chatController.GetChatHistory)                   // Get chat history
		chat.GET("/rooms/:room_id/messages", chatController.GetMessages)      // Get messages for a room
		
		// Message management
		chat.POST("/rooms/:room_id/messages", chatController.SendMessage)     // Send a message
		chat.POST("/messages/:message_id/read", chatController.MarkMessageRead) // Mark message as read
		
		// Booking-specific chat rooms
		chat.GET("/bookings/:booking_id/room", chatController.GetBookingChatRoom) // Get or create chat room for booking
	}

	// Admin chat routes
	adminChat := router.Group("/admin/chat")
	adminChat.Use(middleware.AuthMiddleware())
	{
		adminChat.GET("/rooms", chatController.AdminGetAllChatRooms)          // Get all chat rooms (admin only)
		adminChat.POST("/rooms/:room_id/messages", chatController.AdminSendMessage) // Admin send message
		adminChat.POST("/rooms/:room_id/close", chatController.CloseChatRoom) // Close chat room (admin only)
	}
}
