package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRazorpayRoutes sets up Razorpay-related routes
func SetupRazorpayRoutes(group *gin.RouterGroup) {
	razorpayController := controllers.NewRazorpayController()

	// Razorpay routes (authenticated users)
	razorpayGroup := group.Group("/razorpay")
	razorpayGroup.Use(middleware.AuthMiddleware())

	{
		// Create payment order
		razorpayGroup.POST("/create-order", razorpayController.CreatePaymentOrder)
		
		// Verify payment
		razorpayGroup.POST("/verify", razorpayController.VerifyPayment)
	}

	// Webhook route (no authentication required)
	{
		// Handle webhook notifications
		group.POST("/razorpay/webhook", razorpayController.HandleWebhook)
	}
}
