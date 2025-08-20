package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupChatRoutes sets up chat-related routes
func SetupChatRoutes(router *gin.RouterGroup) {
	chatController := controllers.NewChatController()

	// Chat routes (authenticated users only)
	chat := router.Group("/chat")
	chat.Use(middleware.AuthMiddleware())
	{
		// Chat room management
		chat.POST("/rooms", chatController.CreateChatRoom)                    // Create new chat room
		chat.GET("/rooms", chatController.GetUserChatRooms)                   // Get user's chat rooms
		chat.GET("/rooms/:room_id/messages", chatController.GetMessages)      // Get messages for a room
		
		// Message management
		chat.POST("/messages", chatController.SendMessage)                    // Send a message
		chat.POST("/messages/read", chatController.MarkMessageRead)           // Mark message as read
		
		// Booking-specific chat rooms
		chat.POST("/bookings/:booking_id/room", chatController.CreateBookingChatRoom) // Create chat room for booking
	}
}
