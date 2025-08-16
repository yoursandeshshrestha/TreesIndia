package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupBookingRoutes sets up booking-related routes
func SetupBookingRoutes(router *gin.RouterGroup) {
	bookingController := controllers.NewBookingController()

	// User booking routes (authentication required)
	bookings := router.Group("/bookings")
	bookings.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/bookings - Create new booking
		bookings.POST("", bookingController.CreateBooking)
		
		// POST /api/v1/bookings/with-payment - Create booking with payment
		bookings.POST("/with-payment", bookingController.CreateBookingWithPayment)
		
		// POST /api/v1/bookings/verify-payment - Verify payment
		bookings.POST("/verify-payment", bookingController.VerifyPayment)
		
		// GET /api/v1/bookings - Get user's bookings
		bookings.GET("", bookingController.GetUserBookings)
		
		// GET /api/v1/bookings/:id - Get booking by ID
		bookings.GET("/:id", bookingController.GetBookingByID)
		
		// PUT /api/v1/bookings/:id/cancel - Cancel booking
		bookings.PUT("/:id/cancel", bookingController.CancelUserBooking)
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
