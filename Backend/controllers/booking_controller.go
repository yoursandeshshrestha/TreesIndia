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

// CreatePaymentOrder creates a Razorpay payment order for a booking (without creating the booking yet)
func (bc *BookingController) CreatePaymentOrder(c *gin.Context) {
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

	// Validate service exists and get its price
	service, err := bc.bookingService.GetServiceByID(req.ServiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Service not found"})
		return
	}

	if !service.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Service is not active"})
		return
	}

	// Create payment record first
	paymentService := services.NewPaymentService()
	paymentReq := &models.CreatePaymentRequest{
		UserID:             userID,
		Amount:             *service.Price,
		Currency:           "INR",
		Type:               models.PaymentTypeBooking,
		Method:             "razorpay",
		RelatedEntityType:  "service",
		RelatedEntityID:    service.ID,
		Description:        fmt.Sprintf("Payment for %s service", service.Name),
		Notes:              "Booking payment order",
	}

	payment, err := paymentService.CreatePayment(paymentReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create payment record", "details": err.Error()})
		return
	}

	// Create Razorpay order
	razorpayService := services.NewRazorpayService()
	razorpayOrder, err := razorpayService.CreateOrder(*service.Price, payment.PaymentReference, "Booking payment")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create payment order", "details": err.Error()})
		return
	}

	// Update payment with Razorpay order ID
	orderID := razorpayOrder["id"].(string)
	payment.RazorpayOrderID = &orderID
	err = paymentService.UpdatePayment(payment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment order created successfully",
		"payment_order": razorpayOrder,
		"payment_id": payment.ID,
		"payment_reference": payment.PaymentReference,
		"service": service,
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

// CreateInquiryBooking creates a new inquiry-based booking (simplified flow)
func (bc *BookingController) CreateInquiryBooking(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateInquiryBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, razorpayOrder, err := bc.bookingService.CreateInquiryBooking(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create inquiry booking", "details": err.Error()})
		return
	}

	// Debug logging
	if booking != nil {
		fmt.Printf("Inquiry booking created - Booking ID: %d, Razorpay Order: %v\n", booking.ID, razorpayOrder != nil)
	} else {
		fmt.Printf("Inquiry booking - No booking created yet, Razorpay Order: %v\n", razorpayOrder != nil)
	}

	// Check if payment is required
	if razorpayOrder != nil {
		// Payment required - return payment order info
		fmt.Printf("Payment required - returning payment order\n")
		c.JSON(http.StatusCreated, gin.H{
			"message": "Payment required for inquiry booking",
			"payment_order": razorpayOrder,
			"payment_required": true,
		})
	} else {
		// No payment required
		fmt.Printf("No payment required - returning success\n")
		c.JSON(http.StatusCreated, gin.H{
			"message": "Inquiry booking created successfully",
			"booking": booking,
			"payment_required": false,
		})
	}
}

// VerifyInquiryPaymentAndCreateBooking verifies payment and creates the inquiry booking
func (bc *BookingController) VerifyInquiryPaymentAndCreateBooking(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.VerifyInquiryPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, err := bc.bookingService.VerifyInquiryPaymentAndCreateBooking(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to verify payment and create inquiry booking", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment verified and inquiry booking created successfully",
		"booking": booking,
	})
}

// GetBookingConfig gets booking-related configuration (public endpoint)
func (bc *BookingController) GetBookingConfig(c *gin.Context) {
	adminConfigRepo := repositories.NewAdminConfigRepository()
	
	// Get specific configs needed for booking
	configKeys := []string{"working_hours_start", "working_hours_end", "booking_advance_days", "booking_buffer_time_minutes"}
	
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

// VerifyPaymentAndCreateBooking verifies payment and creates the booking
func (bc *BookingController) VerifyPaymentAndCreateBooking(c *gin.Context) {
	userID := bc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.VerifyPaymentAndCreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	booking, err := bc.bookingService.VerifyPaymentAndCreateBooking(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to verify payment and create booking", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment verified and booking created successfully",
		"booking": booking,
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
