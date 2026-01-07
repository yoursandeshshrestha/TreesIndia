package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type PaymentSegmentController struct {
	quoteService *services.QuoteService
}

func NewPaymentSegmentController() *PaymentSegmentController {
	return &PaymentSegmentController{
		quoteService: services.NewQuoteService(),
	}
}

// GetPaymentSegments gets all payment segments for a booking
// @Summary Get payment segments for a booking
// @Description Get all payment segments for a specific booking
// @Tags Payment Segments
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} models.PaymentProgress
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /bookings/{id}/payment-segments [get]
func (psc *PaymentSegmentController) GetPaymentSegments(c *gin.Context) {
	// Get booking ID from URL
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user type from context (set by auth middleware)
	userType, exists := c.Get("user_type")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User type not found"})
		return
	}

	// Get payment progress - allow admin access
	var progress *models.PaymentProgress
	if userType == "admin" {
		// Admin can access any booking's payment segments
		progress, err = psc.quoteService.GetPaymentProgressForAdmin(uint(bookingID))
	} else {
		// Regular users can only access their own booking's payment segments
		progress, err = psc.quoteService.GetPaymentProgress(uint(bookingID), userID.(uint))
	}

	if err != nil {
		logrus.Errorf("Failed to get payment progress for booking %d: %v", bookingID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment segments not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    progress,
	})
}

// PaySegment creates payment for a specific segment
// @Summary Pay for a specific payment segment
// @Description Create payment order for a specific payment segment
// @Tags Payment Segments
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Param request body models.CreateSegmentPaymentRequest true "Payment details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /bookings/{id}/payment-segments/pay [post]
func (psc *PaymentSegmentController) PaySegment(c *gin.Context) {
	// Get booking ID from URL
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse request body
	var req models.CreateSegmentPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create payment for segment
	result, err := psc.quoteService.CreateSegmentPayment(uint(bookingID), userID.(uint), &req)
	if err != nil {
		logrus.Errorf("Failed to create segment payment for booking %d: %v", bookingID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log what we're returning to the client
	logrus.Infof("[PaymentSegmentController] PaySegment - Returning to client: result=%+v", result)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// VerifySegmentPayment verifies payment for a specific segment
// @Summary Verify segment payment
// @Description Verify payment for a specific payment segment using Razorpay order ID
// @Tags Payment Segments
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Param request body models.VerifySegmentPaymentRequest true "Payment verification details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /bookings/{id}/payment-segments/verify [post]
func (psc *PaymentSegmentController) VerifySegmentPayment(c *gin.Context) {
	// Get booking ID from URL
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse request body
	var req models.VerifySegmentPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify segment payment
	result, err := psc.quoteService.VerifySegmentPayment(uint(bookingID), userID.(uint), &req)
	if err != nil {
		logrus.Errorf("Failed to verify segment payment for booking %d: %v", bookingID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// GetPendingSegments gets all pending payment segments for a booking
// @Summary Get pending payment segments
// @Description Get all pending payment segments for a specific booking
// @Tags Payment Segments
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} []models.PaymentSegmentInfo
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /bookings/{id}/payment-segments/pending [get]
func (psc *PaymentSegmentController) GetPendingSegments(c *gin.Context) {
	// Get booking ID from URL
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get pending segments
	segments, err := psc.quoteService.GetPendingSegments(uint(bookingID), userID.(uint))
	if err != nil {
		logrus.Errorf("Failed to get pending segments for booking %d: %v", bookingID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Pending segments not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    segments,
	})
}

// GetPaidSegments gets all paid payment segments for a booking
// @Summary Get paid payment segments
// @Description Get all paid payment segments for a specific booking
// @Tags Payment Segments
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} []models.PaymentSegmentInfo
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /bookings/{id}/payment-segments/paid [get]
func (psc *PaymentSegmentController) GetPaidSegments(c *gin.Context) {
	// Get booking ID from URL
	bookingIDStr := c.Param("id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get paid segments
	segments, err := psc.quoteService.GetPaidSegments(uint(bookingID), userID.(uint))
	if err != nil {
		logrus.Errorf("Failed to get paid segments for booking %d: %v", bookingID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Paid segments not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    segments,
	})
}
