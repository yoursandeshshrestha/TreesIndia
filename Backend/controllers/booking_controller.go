package controllers

import (
	"fmt"
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

// CreateBooking creates a new booking (handles all booking types)
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

	// Get service details
	service, err := bc.bookingService.GetServiceByID(req.ServiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Service not found"})
		return
	}

	if !service.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Service is not active"})
		return
	}

	// Create booking with payment order
	booking, paymentOrder, err := bc.bookingService.CreateBooking(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create booking", "details": err.Error()})
		return
	}

	// Debug: Print booking details
	fmt.Printf("Created booking - ID: %d, Reference: %s, Status: %s\n", booking.ID, booking.BookingReference, booking.Status)

	// Prepare response based on whether payment is required
	response := gin.H{
		"message": "Booking created successfully",
		"booking": booking,
	}

	if paymentOrder != nil {
		response["payment_order"] = paymentOrder
		response["payment_required"] = true
		
		// Check booking type and provide appropriate messaging
		if booking.BookingType == models.BookingTypeRegular {
			response["message"] = "Time slot reserved temporarily. Complete payment within 7 minutes to confirm your booking."
			response["payment_type"] = "booking_payment"
			response["hold_expires_at"] = booking.HoldExpiresAt
		} else if booking.BookingType == models.BookingTypeInquiry {
			response["message"] = "Inquiry booking created. Payment required for inquiry fee."
			response["payment_type"] = "inquiry_fee"
		}
	} else {
		response["payment_required"] = false
		if booking.BookingType == models.BookingTypeInquiry {
			response["message"] = "Inquiry booking created successfully."
		}
	}

	c.JSON(http.StatusCreated, response)
}



// GetBookingConfig gets booking-related configuration (public endpoint)
func (bc *BookingController) GetBookingConfig(c *gin.Context) {
	adminConfigRepo := repositories.NewAdminConfigRepository()
	
	// Get specific configs needed for booking
	configKeys := []string{"working_hours_start", "working_hours_end", "booking_advance_days", "booking_buffer_time_minutes", "booking_hold_time_minutes"}
	
	configs := make(map[string]string)
	for _, key := range configKeys {
		config, err := adminConfigRepo.GetByKey(key)
		if err == nil && config != nil {
			configs[key] = config.Value
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Booking config retrieved successfully",
		"data":    configs,
	})
}

// GetAvailableSlots gets available time slots for a service on a specific date
func (bc *BookingController) GetAvailableSlots(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	serviceIDStr := c.Query("service_id")
	date := c.Query("date")

	if serviceIDStr == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "service_id and date are required"})
		return
	}

	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service_id"})
		return
	}

	availabilityService := services.NewAvailabilityService()
	availableSlots, err := availabilityService.GetAvailableSlots(uint(serviceID), date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get available slots", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Available slots retrieved successfully",
		"data": availableSlots,
	})
}



// VerifyPayment verifies payment for a specific booking
func (bc *BookingController) VerifyPayment(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get booking ID from URL parameter
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	fmt.Printf("Verifying payment for booking ID: %d\n", bookingID)

	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Request binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Add booking ID to the request
	req.BookingID = uint(bookingID)

	fmt.Printf("Payment verification request: %+v\n", req)

	booking, err := bc.bookingService.VerifyPayment(&req)
	if err != nil {
		fmt.Printf("Payment verification error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to verify payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment verified and booking confirmed successfully",
		"booking": booking,
		"payment": gin.H{
			"payment_id": req.RazorpayPaymentID,
			"order_id": req.RazorpayOrderID,
			"status": "completed",
		},
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
