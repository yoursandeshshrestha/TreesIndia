package controllers

import (
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type QuoteController struct {
	quoteService *services.QuoteService
}

func NewQuoteController() *QuoteController {
	return &QuoteController{
		quoteService: services.NewQuoteService(),
	}
}

// ProvideQuote provides a quote for an inquiry booking (admin only)
// @Summary Provide quote for inquiry booking
// @Description Admin provides a quote for an inquiry booking
// @Tags quotes
// @Accept json
// @Produce json
// @Param id path integer true "Booking ID"
// @Param request body models.ProvideQuoteRequest true "Quote details"
// @Success 200 {object} views.Response{data=models.Booking}
// @Router /api/v1/bookings/{id}/provide-quote [post]
func (qc *QuoteController) ProvideQuote(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.ProvideQuote panic: %v", r)
		}
	}()

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		logrus.Error("QuoteController.ProvideQuote: user_id not found in context")
		c.JSON(401, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Parse request body
	var req models.ProvideQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Provide quote
	booking, err := qc.quoteService.ProvideQuote(uint(bookingID), adminID.(uint), &req)
	if err != nil {
		logrus.Errorf("QuoteController.ProvideQuote service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to provide quote", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Quote provided successfully", booking))
}

// UpdateQuote updates an existing quote (admin only)
// @Summary Update quote for inquiry booking
// @Description Admin updates an existing quote for an inquiry booking
// @Tags quotes
// @Accept json
// @Produce json
// @Param id path integer true "Booking ID"
// @Param request body models.UpdateQuoteRequest true "Updated quote details"
// @Success 200 {object} views.Response{data=models.Booking}
// @Router /api/v1/bookings/{id}/update-quote [put]
func (qc *QuoteController) UpdateQuote(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.UpdateQuote panic: %v", r)
		}
	}()

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		logrus.Error("QuoteController.UpdateQuote: user_id not found in context")
		c.JSON(401, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Parse request body
	var req models.UpdateQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Update quote
	booking, err := qc.quoteService.UpdateQuote(uint(bookingID), adminID.(uint), &req)
	if err != nil {
		logrus.Errorf("QuoteController.UpdateQuote service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to update quote", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Quote updated successfully", booking))
}

// AcceptQuote accepts a quote (customer only)
// @Summary Accept quote for inquiry booking
// @Description Customer accepts a quote for their inquiry booking
// @Tags quotes
// @Accept json
// @Produce json
// @Param id path integer true "Booking ID"
// @Param request body models.AcceptQuoteRequest true "Acceptance details"
// @Success 200 {object} views.Response{data=models.Booking}
// @Router /api/v1/bookings/{id}/accept-quote [post]
func (qc *QuoteController) AcceptQuote(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.AcceptQuote panic: %v", r)
		}
	}()

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Error("QuoteController.AcceptQuote: user_id not found in context")
		c.JSON(401, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Parse request body
	var req models.AcceptQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Accept quote
	booking, err := qc.quoteService.AcceptQuote(uint(bookingID), userID.(uint), &req)
	if err != nil {
		logrus.Errorf("QuoteController.AcceptQuote service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to accept quote", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Quote accepted successfully", booking))
}

// RejectQuote rejects a quote (customer only)
// @Summary Reject quote for inquiry booking
// @Description Customer rejects a quote for their inquiry booking
// @Tags quotes
// @Accept json
// @Produce json
// @Param id path integer true "Booking ID"
// @Param request body models.RejectQuoteRequest true "Rejection details"
// @Success 200 {object} views.Response{data=models.Booking}
// @Router /api/v1/bookings/{id}/reject-quote [post]
func (qc *QuoteController) RejectQuote(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.RejectQuote panic: %v", r)
		}
	}()

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Error("QuoteController.RejectQuote: user_id not found in context")
		c.JSON(401, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Parse request body
	var req models.RejectQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Reject quote
	booking, err := qc.quoteService.RejectQuote(uint(bookingID), userID.(uint), &req)
	if err != nil {
		logrus.Errorf("QuoteController.RejectQuote service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to reject quote", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Quote rejected successfully", booking))
}

// ScheduleAfterQuote schedules the service after quote acceptance
// @Summary Schedule service after quote acceptance
// @Description Customer schedules the service after accepting a quote
// @Tags quotes
// @Accept json
// @Produce json
// @Param id path integer true "Booking ID"
// @Param request body models.ScheduleAfterQuoteRequest true "Scheduling details"
// @Success 200 {object} views.Response{data=models.Booking}
// @Router /api/v1/bookings/{id}/schedule-after-quote [post]
func (qc *QuoteController) ScheduleAfterQuote(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.ScheduleAfterQuote panic: %v", r)
		}
	}()

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		logrus.Error("QuoteController.ScheduleAfterQuote: user_id not found in context")
		c.JSON(401, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Parse request body
	var req models.ScheduleAfterQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Schedule after quote
	booking, err := qc.quoteService.ScheduleAfterQuote(uint(bookingID), userID.(uint), &req)
	if err != nil {
		logrus.Errorf("QuoteController.ScheduleAfterQuote service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to schedule after quote", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Service scheduled successfully", booking))
}

// GetQuoteInfo gets quote information for a booking
// @Summary Get quote information
// @Description Get quote information for a booking
// @Tags quotes
// @Produce json
// @Param id path integer true "Booking ID"
// @Success 200 {object} views.Response{data=models.QuoteInfo}
// @Router /api/v1/bookings/{id}/quote-info [get]
func (qc *QuoteController) GetQuoteInfo(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.GetQuoteInfo panic: %v", r)
		}
	}()

	// Parse booking ID
	bookingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, views.CreateErrorResponse("Invalid booking ID", err.Error()))
		return
	}

	// Get quote info
	quoteInfo, err := qc.quoteService.GetQuoteInfo(uint(bookingID))
	if err != nil {
		logrus.Errorf("QuoteController.GetQuoteInfo service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to get quote info", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Quote info retrieved successfully", quoteInfo))
}

// GetInquiryBookings gets inquiry bookings with filters (admin only)
// @Summary Get inquiry bookings
// @Description Get inquiry bookings with filters
// @Tags quotes
// @Produce json
// @Param status query string false "Booking status"
// @Param date_from query string false "Date from (YYYY-MM-DD)"
// @Param date_to query string false "Date to (YYYY-MM-DD)"
// @Param service_id query string false "Service ID"
// @Param user_id query string false "User ID"
// @Param has_quote query boolean false "Has quote"
// @Param quote_expired query boolean false "Quote expired"
// @Param search query string false "Search term"
// @Param page query integer false "Page number"
// @Param limit query integer false "Items per page"
// @Param sort query string false "Sort order"
// @Success 200 {object} views.Response{data=[]models.Booking}
// @Router /api/v1/bookings/inquiries [get]
func (qc *QuoteController) GetInquiryBookings(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.GetInquiryBookings panic: %v", r)
		}
	}()

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := &repositories.InquiryBookingFilters{
		Status:       c.Query("status"),
		DateFrom:     c.Query("date_from"),
		DateTo:       c.Query("date_to"),
		ServiceID:    c.Query("service_id"),
		UserID:       c.Query("user_id"),
		Search:       c.Query("search"),
		Page:         page,
		Limit:        limit,
		Sort:         c.Query("sort"),
	}

	// Parse boolean filters
	if hasQuote := c.Query("has_quote"); hasQuote != "" {
		hasQuoteBool := hasQuote == "true"
		filters.HasQuote = &hasQuoteBool
	}

	if quoteExpired := c.Query("quote_expired"); quoteExpired != "" {
		quoteExpiredBool := quoteExpired == "true"
		filters.QuoteExpired = &quoteExpiredBool
	}

	// Get inquiry bookings
	bookings, pagination, err := qc.quoteService.GetInquiryBookings(filters)
	if err != nil {
		logrus.Errorf("QuoteController.GetInquiryBookings service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to get inquiry bookings", err.Error()))
		return
	}

	response := map[string]interface{}{
		"bookings":   bookings,
		"pagination": pagination,
	}

	c.JSON(200, views.CreateSuccessResponse("Inquiry bookings retrieved successfully", response))
}

// CleanupExpiredQuotes cleans up expired quotes (admin only)
// @Summary Cleanup expired quotes
// @Description Cleanup quotes that have expired
// @Tags quotes
// @Produce json
// @Success 200 {object} views.Response
// @Router /api/v1/bookings/cleanup-expired-quotes [post]
func (qc *QuoteController) CleanupExpiredQuotes(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("QuoteController.CleanupExpiredQuotes panic: %v", r)
		}
	}()

	// Cleanup expired quotes
	err := qc.quoteService.CleanupExpiredQuotes()
	if err != nil {
		logrus.Errorf("QuoteController.CleanupExpiredQuotes service error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to cleanup expired quotes", err.Error()))
		return
	}

	c.JSON(200, views.CreateSuccessResponse("Expired quotes cleaned up successfully", nil))
}
