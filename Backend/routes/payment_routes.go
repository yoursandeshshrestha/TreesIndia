package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupPaymentRoutes sets up payment-related routes
func SetupPaymentRoutes(router *gin.RouterGroup) {
	paymentController := controllers.NewPaymentController()

	// User payment routes (authentication required)
	payments := router.Group("/payments")
	payments.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/payments - Create new payment
		payments.POST("", paymentController.CreatePayment)
		
		// POST /api/v1/payments/razorpay-order - Create Razorpay order
		payments.POST("/razorpay-order", paymentController.CreateRazorpayOrder)
		
		// POST /api/v1/payments/:id/verify - Verify payment
		payments.POST("/:id/verify", paymentController.VerifyPayment)
		
		// GET /api/v1/payments - Get user's payments
		payments.GET("", paymentController.GetUserPayments)
		
		// GET /api/v1/payments/stats - Get payment statistics
		payments.GET("/stats", paymentController.GetPaymentStats)
		
		// GET /api/v1/payments/:id - Get payment by ID
		payments.GET("/:id", paymentController.GetPayment)
	}

	// Admin payment routes (admin authentication required)
	adminPayments := router.Group("/admin/payments")
	adminPayments.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// POST /api/v1/admin/payments/:id/refund - Refund payment
		adminPayments.POST("/:id/refund", paymentController.RefundPayment)
	}
}
