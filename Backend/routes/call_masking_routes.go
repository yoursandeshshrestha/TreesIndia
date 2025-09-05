package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupCallMaskingRoutes sets up call masking routes
func SetupCallMaskingRoutes(router *gin.RouterGroup) {
	callMaskingController := controllers.NewCallMaskingController()

	// Call masking routes (protected)
	callMasking := router.Group("/call-masking")
	callMasking.Use(middleware.AuthMiddleware())
	{
		// Initiate a call
		callMasking.POST("/call", callMaskingController.InitiateCall)
		
		// Get call logs for a booking
		callMasking.GET("/logs/:booking_id", callMaskingController.GetCallLogs)
		
		// Get call masking status for a booking
		callMasking.GET("/status/:booking_id", callMaskingController.GetCallMaskingStatus)
		
		// Test call endpoint (for development)
		callMasking.POST("/test", callMaskingController.TestCall)
	}

	// Exotel webhook (public endpoint)
	router.POST("/call-masking/webhook/exotel", callMaskingController.HandleExotelWebhook)
}
