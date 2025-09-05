package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

func SetupPaymentSegmentRoutes(router *gin.RouterGroup) {
	paymentSegmentController := controllers.NewPaymentSegmentController()

	// Payment segment routes (user authenticated)
	paymentSegmentRoutes := router.Group("/bookings/:id/payment-segments")
	paymentSegmentRoutes.Use(middleware.AuthMiddleware())
	{
		// Get all payment segments and progress
		paymentSegmentRoutes.GET("", paymentSegmentController.GetPaymentSegments)
		
		// Get pending segments
		paymentSegmentRoutes.GET("/pending", paymentSegmentController.GetPendingSegments)
		
		// Get paid segments
		paymentSegmentRoutes.GET("/paid", paymentSegmentController.GetPaidSegments)
		
		// Pay for a specific segment
		paymentSegmentRoutes.POST("/pay", paymentSegmentController.PaySegment)
	}
}
