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

	// Inquiry-based booking routes
	bookings.POST("/inquiry", middleware.AuthMiddleware(), bookingController.CreateInquiryBooking)
	bookings.POST("/inquiry/verify-payment", middleware.AuthMiddleware(), bookingController.VerifyInquiryPayment)

	// Quote management routes (user authentication required)
	quoteController := controllers.NewQuoteController()
	{
		// POST /api/v1/bookings/:id/accept-quote - Accept quote
		bookings.POST("/:id/accept-quote", middleware.AuthMiddleware(), quoteController.AcceptQuote)
		
		// POST /api/v1/bookings/:id/reject-quote - Reject quote
		bookings.POST("/:id/reject-quote", middleware.AuthMiddleware(), quoteController.RejectQuote)
		
		// POST /api/v1/bookings/:id/schedule-after-quote - Schedule after quote acceptance
		bookings.POST("/:id/schedule-after-quote", middleware.AuthMiddleware(), quoteController.ScheduleAfterQuote)
		
		// POST /api/v1/bookings/:id/create-quote-payment - Create payment order for quote
		bookings.POST("/:id/create-quote-payment", middleware.AuthMiddleware(), quoteController.CreateQuotePayment)
		
		// POST /api/v1/bookings/:id/verify-quote-payment - Verify payment for quote
		bookings.POST("/:id/verify-quote-payment", middleware.AuthMiddleware(), quoteController.VerifyQuotePayment)
		
		// GET /api/v1/bookings/:id/quote-info - Get quote information
		bookings.GET("/:id/quote-info", quoteController.GetQuoteInfo)
	}

	// Admin booking routes (admin authentication required)
	adminBookings := router.Group("/admin/bookings")
	adminBookings.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/bookings - Get all bookings
		adminBookings.GET("", bookingController.AdminGetAllBookings)
		
		// GET /api/v1/admin/bookings/dashboard - Get comprehensive dashboard data
		adminBookings.GET("/dashboard", bookingController.GetBookingDashboard)
		
		// GET /api/v1/admin/bookings/:id - Get detailed booking by ID
		adminBookings.GET("/:id", bookingController.AdminGetBookingByID)
		
		// PUT /api/v1/admin/bookings/:id/status - Update booking status
		adminBookings.PUT("/:id/status", bookingController.AdminUpdateBookingStatus)
		
		// POST /api/v1/admin/bookings/:id/assign-worker - Assign worker to booking
		adminBookings.POST("/:id/assign-worker", bookingController.AdminAssignWorker)
		
		// GET /api/v1/admin/bookings/stats - Get booking statistics
		adminBookings.GET("/stats", bookingController.GetBookingStats)
		
		// Quote management routes (admin only)
		// POST /api/v1/admin/bookings/:id/provide-quote - Provide quote
		adminBookings.POST("/:id/provide-quote", quoteController.ProvideQuote)
		
		// PUT /api/v1/admin/bookings/:id/update-quote - Update quote
		adminBookings.PUT("/:id/update-quote", quoteController.UpdateQuote)
		
		// GET /api/v1/admin/bookings/inquiries - Get inquiry bookings
		adminBookings.GET("/inquiries", quoteController.GetInquiryBookings)
		
		// POST /api/v1/admin/bookings/cleanup-expired-quotes - Cleanup expired quotes
		adminBookings.POST("/cleanup-expired-quotes", quoteController.CleanupExpiredQuotes)
	}
}
