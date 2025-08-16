package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// BookingController handles booking-related HTTP requests
type BookingController struct {
	BaseController
	bookingService *services.BookingService
}

// NewBookingController creates a new instance of BookingController
func NewBookingController() *BookingController {
	return &BookingController{
		BaseController: *NewBaseController(),
		bookingService: services.NewBookingService(),
	}
}

// CreateBooking creates a new booking
func (bc *BookingController) CreateBooking(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, err := bc.bookingService.CreateBooking(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create booking", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Booking created successfully",
		"booking": booking,
	})
}

// CreateBookingWithPayment creates a booking with Razorpay payment for fixed price services
func (bc *BookingController) CreateBookingWithPayment(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, razorpayOrder, err := bc.bookingService.CreateBookingWithPayment(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create booking with payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Booking created with payment order",
		"booking": booking,
		"payment_order": razorpayOrder,
	})
}

// VerifyPayment verifies payment and confirms booking
func (bc *BookingController) VerifyPayment(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, err := bc.bookingService.VerifyPayment(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to verify payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment verified and booking confirmed",
		"booking": booking,
	})
}

// GetUserBookings gets all bookings for the authenticated user
func (bc *BookingController) GetUserBookings(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse query parameters for filtering
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := &repositories.UserBookingFilters{
		Status: status,
		Page:   page,
		Limit:  limit,
	}

	bookings, pagination, err := bc.bookingService.GetUserBookings(userID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings":   bookings,
		"pagination": pagination,
	})
}

// GetBookingByID gets a specific booking by ID
func (bc *BookingController) GetBookingByID(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	booking, err := bc.bookingService.GetBookingByID(uint(bookingID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found", "details": err.Error()})
		return
	}

	// Check if user owns this booking or is admin
	userType := bc.GetUserType(c)
	if booking.UserID != userID && userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"booking": booking,
	})
}

// CancelUserBooking cancels a user's booking
func (bc *BookingController) CancelUserBooking(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req models.CancelBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	result, err := bc.bookingService.CancelUserBooking(userID, uint(bookingID), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to cancel booking", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking cancelled successfully",
		"result":  result,
	})
}

// AdminGetAllBookings gets all bookings (admin only)
func (bc *BookingController) AdminGetAllBookings(c *gin.Context) {
	userType := bc.GetUserType(c)
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	// Parse query parameters
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := &repositories.AdminBookingFilters{
		Status: status,
		Search: search,
		Page:   page,
		Limit:  limit,
	}

	bookings, pagination, err := bc.bookingService.GetAllBookings(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings":   bookings,
		"pagination": pagination,
	})
}

// AdminUpdateBookingStatus updates booking status (admin only)
func (bc *BookingController) AdminUpdateBookingStatus(c *gin.Context) {
	userType := bc.GetUserType(c)
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, err := bc.bookingService.UpdateBookingStatus(uint(bookingID), models.BookingStatus(req.Status), req.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update booking status", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking status updated successfully",
		"booking": booking,
	})
}

// AdminAssignWorker assigns a worker to a booking (admin only)
func (bc *BookingController) AdminAssignWorker(c *gin.Context) {
	userType := bc.GetUserType(c)
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var req struct {
		WorkerID uint `json:"worker_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	assignment, err := bc.bookingService.AssignWorkerToBooking(uint(bookingID), req.WorkerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to assign worker", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Worker assigned successfully",
		"assignment": assignment,
	})
}

// GetBookingStats gets booking statistics (admin only)
func (bc *BookingController) GetBookingStats(c *gin.Context) {
	userType := bc.GetUserType(c)
	if userType != string(models.UserTypeAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	stats, err := bc.bookingService.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch booking stats", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}
