package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupBookingRoutes sets up booking-related routes
func SetupBookingRoutes(router *gin.RouterGroup) {
	bookingController := controllers.NewBookingController()

	// Public booking routes (no authentication required)
	bookings := router.Group("/bookings")
	{
		// GET /api/v1/bookings/config - Get booking configuration (public)
		bookings.GET("/config", bookingController.GetBookingConfig)
	}

	// User booking routes (authentication required)
	userBookings := router.Group("/bookings")
	userBookings.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/bookings - Create new booking
		userBookings.POST("", bookingController.CreateBooking)
		
		// POST /api/v1/bookings/inquiry - Create inquiry-based booking (simplified)
		userBookings.POST("/inquiry", bookingController.CreateInquiryBooking)
		
		// POST /api/v1/bookings/verify-inquiry-payment - Verify payment and create inquiry booking
		userBookings.POST("/verify-inquiry-payment", bookingController.VerifyInquiryPaymentAndCreateBooking)
		
		// POST /api/v1/bookings/payment-order - Create payment order (without booking)
		userBookings.POST("/payment-order", bookingController.CreatePaymentOrder)
		
		// POST /api/v1/bookings/with-payment - Create booking with payment
		userBookings.POST("/with-payment", bookingController.CreateBookingWithPayment)
		
		// POST /api/v1/bookings/verify-payment - Verify payment
		userBookings.POST("/verify-payment", bookingController.VerifyPayment)
		
		// POST /api/v1/bookings/verify-payment-and-create - Verify payment and create booking
		userBookings.POST("/verify-payment-and-create", bookingController.VerifyPaymentAndCreateBooking)
		
		// GET /api/v1/bookings - Get user's bookings
		userBookings.GET("", bookingController.GetUserBookings)
		
		// GET /api/v1/bookings/available-slots - Get available time slots
		userBookings.GET("/available-slots", bookingController.GetAvailableSlots)
		
		// GET /api/v1/bookings/:id - Get booking by ID
		userBookings.GET("/:id", bookingController.GetBookingByID)
		
		// PUT /api/v1/bookings/:id/cancel - Cancel booking
		userBookings.PUT("/:id/cancel", bookingController.CancelUserBooking)
	}

	// Admin booking routes (admin authentication required)
	adminBookings := router.Group("/admin/bookings")
	adminBookings.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/bookings - Get all bookings
		adminBookings.GET("", bookingController.AdminGetAllBookings)
		
		// PUT /api/v1/admin/bookings/:id/status - Update booking status
		adminBookings.PUT("/:id/status", bookingController.AdminUpdateBookingStatus)
		
		// POST /api/v1/admin/bookings/:id/assign-worker - Assign worker to booking
		adminBookings.POST("/:id/assign-worker", bookingController.AdminAssignWorker)
		
		// GET /api/v1/admin/bookings/stats - Get booking statistics
		adminBookings.GET("/stats", bookingController.GetBookingStats)
	}
}
