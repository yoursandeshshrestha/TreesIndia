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
		// POST /api/v1/bookings - Create new booking (handles all booking types)
		userBookings.POST("", bookingController.CreateBooking)
		
		// POST /api/v1/bookings/:id/verify-payment - Verify payment for booking
		userBookings.POST("/:id/verify-payment", bookingController.VerifyPayment)
		
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
