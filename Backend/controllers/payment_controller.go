package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

type PaymentController struct {
	*BaseController
	paymentService *services.PaymentService
}

func NewPaymentController() *PaymentController {
	return &PaymentController{
		BaseController: NewBaseController(),
		paymentService: services.NewPaymentService(),
	}
}

// CreatePayment creates a new payment
func (pc *PaymentController) CreatePayment(c *gin.Context) {
	var req models.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Set user ID from authenticated user
	userID := pc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	req.UserID = userID

	payment, err := pc.paymentService.CreatePayment(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Payment created successfully",
		"data":    payment,
	})
}

// CreateRazorpayOrder creates a Razorpay order
func (pc *PaymentController) CreateRazorpayOrder(c *gin.Context) {
	var req models.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Set user ID from authenticated user
	userID := pc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	req.UserID = userID

	payment, razorpayOrder, err := pc.paymentService.CreateRazorpayOrder(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Razorpay order", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Razorpay order created successfully",
		"data": gin.H{
			"payment": payment,
			"order":   razorpayOrder,
		},
	})
}

// VerifyPayment verifies and completes a payment
func (pc *PaymentController) VerifyPayment(c *gin.Context) {
	var req models.UpdatePaymentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Get payment ID from URL
	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	if req.RazorpayPaymentID == nil || req.RazorpaySignature == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razorpay payment ID and signature are required"})
		return
	}

	payment, err := pc.paymentService.VerifyAndCompletePayment(uint(paymentID), *req.RazorpayPaymentID, *req.RazorpaySignature)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment verification failed", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment verified and completed successfully",
		"data":    payment,
	})
}

// GetPayment gets a payment by ID
func (pc *PaymentController) GetPayment(c *gin.Context) {
	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	payment, err := pc.paymentService.GetPaymentByID(uint(paymentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found", "details": err.Error()})
		return
	}

	// Check if user owns this payment
	userID := pc.GetUserID(c)
	if userID != payment.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment retrieved successfully",
		"data":    payment,
	})
}

// GetUserPayments gets payments for the authenticated user
func (pc *PaymentController) GetUserPayments(c *gin.Context) {
	userID := pc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse query parameters
	filters := &models.PaymentFilters{
		Page:  1,
		Limit: 10,
	}

	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filters.Page = page
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			filters.Limit = limit
		}
	}

	if status := c.Query("status"); status != "" {
		filters.Status = models.PaymentStatus(status)
	}

	if paymentType := c.Query("type"); paymentType != "" {
		filters.Type = models.PaymentType(paymentType)
	}

	if method := c.Query("method"); method != "" {
		filters.Method = method
	}

	if startDate := c.Query("start_date"); startDate != "" {
		filters.StartDate = startDate
	}

	if endDate := c.Query("end_date"); endDate != "" {
		filters.EndDate = endDate
	}

	payments, pagination, err := pc.paymentService.GetUserPayments(userID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payments", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payments retrieved successfully",
		"data":    payments,
		"pagination": pagination,
	})
}

// GetPaymentStats gets payment statistics for the authenticated user
func (pc *PaymentController) GetPaymentStats(c *gin.Context) {
	userID := pc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	stats, err := pc.paymentService.GetPaymentStats(&userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payment stats", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment stats retrieved successfully",
		"data":    stats,
	})
}

// RefundPayment refunds a payment (admin only)
func (pc *PaymentController) RefundPayment(c *gin.Context) {
	var req models.RefundPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	payment, err := pc.paymentService.RefundPayment(uint(paymentID), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to refund payment", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment refunded successfully",
		"data":    payment,
	})
}
