package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type QuoteService struct {
	bookingRepo           *repositories.BookingRepository
	userRepo              *repositories.UserRepository
	paymentSegmentRepo    *repositories.PaymentSegmentRepository
}

func NewQuoteService() *QuoteService {
	return &QuoteService{
		bookingRepo:        repositories.NewBookingRepository(),
		userRepo:           repositories.NewUserRepository(),
		paymentSegmentRepo: repositories.NewPaymentSegmentRepository(),
	}
}

// ProvideQuote provides a quote for an inquiry booking (admin only)
func (qs *QuoteService) ProvideQuote(bookingID uint, adminID uint, req *models.ProvideQuoteRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking is inquiry type and in pending status
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusPending {
		return nil, errors.New("booking is not in pending status")
	}

	// 3. Validate segments
	if len(req.Segments) == 0 {
		return nil, errors.New("at least one payment segment is required")
	}

	// Calculate total amount from segments
	var segmentsTotal float64
	for _, segment := range req.Segments {
		segmentsTotal += segment.Amount
	}
	
	// Validate that total amount is greater than 0
	if segmentsTotal <= 0 {
		return nil, errors.New("total quote amount must be greater than 0")
	}

	// 4. Set quote details
	now := time.Now()
	booking.QuoteAmount = &segmentsTotal
	booking.QuoteNotes = req.Notes
	booking.QuoteProvidedBy = &adminID
	booking.QuoteProvidedAt = &now
	booking.Status = models.BookingStatusQuoteProvided
	
	// Set quote duration if provided (for single segment quotes)
	if req.Duration != nil && *req.Duration != "" {
		booking.QuoteDuration = req.Duration
	}

	// 5. Create payment segments
	err = qs.createPaymentSegments(bookingID, req.Segments)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment segments: %v", err)
	}

	// 6. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	// Send quote provided notification
	go func() {
		// Get user and service details for notification
		var user models.User
		err := qs.userRepo.FindByID(&user, booking.UserID)
		if err == nil {
			// Get service details
			var service models.Service
			serviceRepo := repositories.NewServiceRepository()
			err = serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
				// Create quote object for notification
			}
		}
	}()
	
	logrus.Infof("Quote provided for booking %d: amount=%.2f, admin=%d", bookingID, segmentsTotal, adminID)
	return booking, nil
}

// UpdateQuote updates an existing quote (admin only)
func (qs *QuoteService) UpdateQuote(bookingID uint, adminID uint, req *models.UpdateQuoteRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking is inquiry type and has quote provided
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteProvided {
		return nil, errors.New("booking does not have a quote provided")
	}

	// 3. Calculate total amount from segments
	var segmentsTotal float64
	for _, segment := range req.Segments {
		segmentsTotal += segment.Amount
	}
	
	// Validate that total amount is greater than 0
	if segmentsTotal <= 0 {
		return nil, errors.New("total quote amount must be greater than 0")
	}

	// 4. Update quote details
	now := time.Now()
	booking.QuoteAmount = &segmentsTotal
	booking.QuoteNotes = req.Notes
	booking.QuoteProvidedBy = &adminID
	booking.QuoteProvidedAt = &now

	// 5. Create payment segments
	err = qs.createPaymentSegments(bookingID, req.Segments)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment segments: %v", err)
	}

	// 5. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	logrus.Infof("Quote updated for booking %d: amount=%.2f, admin=%d", bookingID, segmentsTotal, adminID)
	return booking, nil
}

// AcceptQuote accepts a quote (customer only)
func (qs *QuoteService) AcceptQuote(bookingID uint, userID uint, req *models.AcceptQuoteRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and has quote provided
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteProvided {
		return nil, errors.New("booking does not have a quote provided")
	}

	// 4. Check if quote has expired
	if booking.QuoteExpiresAt != nil && time.Now().After(*booking.QuoteExpiresAt) {
		return nil, errors.New("quote has expired")
	}

	// 5. Update booking status
	now := time.Now()
	booking.Status = models.BookingStatusQuoteAccepted
	booking.QuoteAcceptedAt = &now

	// 6. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	// Send quote accepted notification
	go func() {
		// Get user and service details for notification
		var user models.User
		err := qs.userRepo.FindByID(&user, booking.UserID)
		if err == nil {
			// Get service details
			var service models.Service
			serviceRepo := repositories.NewServiceRepository()
			err = serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
				// Create quote object for notification
			}
		}
	}()
	
	logrus.Infof("Quote accepted for booking %d by user %d", bookingID, userID)
	return booking, nil
}

// RejectQuote rejects a quote (customer only)
func (qs *QuoteService) RejectQuote(bookingID uint, userID uint, req *models.RejectQuoteRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and has quote provided
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteProvided {
		return nil, errors.New("booking does not have a quote provided")
	}

	// 4. Update booking status back to pending (allows for new quote)
	booking.Status = models.BookingStatusPending
	// Clear quote details
	booking.QuoteAmount = nil
	booking.QuoteNotes = ""
	booking.QuoteProvidedBy = nil
	booking.QuoteProvidedAt = nil
	booking.QuoteExpiresAt = nil

	// 5. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	// Send quote rejected notification
	go func() {
		// Get user and service details for notification
		var user models.User
		err := qs.userRepo.FindByID(&user, booking.UserID)
		if err == nil {
			// Get service details
			var service models.Service
			serviceRepo := repositories.NewServiceRepository()
			err = serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
				// Create quote object for notification (using previous quote amount if available)
			}
		}
	}()
	
	logrus.Infof("Quote rejected for booking %d by user %d: reason=%s", bookingID, userID, req.Reason)
	return booking, nil
}

// ScheduleAfterQuote schedules the service after quote acceptance
func (qs *QuoteService) ScheduleAfterQuote(bookingID uint, userID uint, req *models.ScheduleAfterQuoteRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and quote accepted
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteAccepted {
		return nil, errors.New("quote has not been accepted")
	}

	// 4. Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid scheduled date format")
	}

	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid scheduled time format")
	}

	// 5. Combine date and time
	scheduledDateTime := time.Date(
		scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
		scheduledDate.Location(),
	)

	// 6. Validate scheduled time is in the future
	if scheduledDateTime.Before(time.Now()) {
		return nil, errors.New("scheduled time must be in the future")
	}

	// 7. Update booking with scheduling details
	booking.ScheduledDate = &scheduledDate
	booking.ScheduledTime = &scheduledDateTime
	booking.Status = models.BookingStatusConfirmed

	// 8. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	logrus.Infof("Booking %d scheduled after quote acceptance: date=%s, time=%s", bookingID, req.ScheduledDate, req.ScheduledTime)
	return booking, nil
}

// GetQuoteInfo gets quote information for a booking
func (qs *QuoteService) GetQuoteInfo(bookingID uint) (*models.QuoteInfo, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Check if booking has quote information
	if booking.QuoteAmount == nil {
		return nil, errors.New("booking does not have quote information")
	}

	// 3. Calculate quote expiration info
	var isExpired bool
	var daysUntilExpiry *int

	if booking.QuoteExpiresAt != nil {
		now := time.Now()
		if now.After(*booking.QuoteExpiresAt) {
			isExpired = true
		} else {
			days := int(booking.QuoteExpiresAt.Sub(now).Hours() / 24)
			daysUntilExpiry = &days
		}
	}

	// 4. Create quote info
	quoteInfo := &models.QuoteInfo{
		Amount:         *booking.QuoteAmount,
		Notes:          booking.QuoteNotes,
		ProvidedBy:     booking.QuoteProvidedBy,
		ProvidedAt:     booking.QuoteProvidedAt,
		AcceptedAt:     booking.QuoteAcceptedAt,
		ExpiresAt:      booking.QuoteExpiresAt,
		IsExpired:      isExpired,
		DaysUntilExpiry: daysUntilExpiry,
	}

	return quoteInfo, nil
}

// GetInquiryBookings gets all inquiry bookings with optional filters
func (qs *QuoteService) GetInquiryBookings(filters *repositories.InquiryBookingFilters) ([]models.Booking, *repositories.Pagination, error) {
	return qs.bookingRepo.GetInquiryBookings(filters)
}

// GetExpiredQuotes gets all quotes that have expired
func (qs *QuoteService) GetExpiredQuotes() ([]models.Booking, error) {
	return qs.bookingRepo.GetExpiredQuotes()
}

// CleanupExpiredQuotes automatically expires quotes that have passed their expiration date
func (qs *QuoteService) CleanupExpiredQuotes() error {
	expiredBookings, err := qs.GetExpiredQuotes()
	if err != nil {
		return fmt.Errorf("failed to get expired quotes: %v", err)
	}

	for _, booking := range expiredBookings {
		booking.Status = models.BookingStatusPending
		// Clear quote details
		booking.QuoteAmount = nil
		booking.QuoteNotes = ""
		booking.QuoteProvidedBy = nil
		booking.QuoteProvidedAt = nil
		booking.QuoteExpiresAt = nil

		err = qs.bookingRepo.Update(&booking)
		if err != nil {
			logrus.Errorf("Failed to cleanup expired quote for booking %d: %v", booking.ID, err)
		}
	}

	if len(expiredBookings) > 0 {
		logrus.Infof("Cleaned up %d expired quotes", len(expiredBookings))
	}

	return nil
}

// CreateQuotePayment creates a payment order for quote acceptance
func (qs *QuoteService) CreateQuotePayment(bookingID uint, userID uint, req *models.CreateQuotePaymentRequest) (map[string]interface{}, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and quote accepted
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteAccepted {
		return nil, errors.New("quote has not been accepted")
	}

	// 4. Get payment segments to determine payment type
	segments, err := qs.getPaymentSegments(bookingID)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment segments: %v", err)
	}

	// 5. Process payment based on segment count
	if len(segments) == 1 {
		// Single segment = Single payment (requires scheduled date/time)
		if req.ScheduledDate == nil || req.ScheduledTime == nil {
			return nil, errors.New("scheduled date and time are required for single segment payments")
		}

	// Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", *req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid scheduled date format")
	}

	// Log the received scheduled time for debugging
	logrus.Infof("CreateQuotePayment: Received scheduled_time=%s", *req.ScheduledTime)
	
	scheduledTime, err := time.Parse("15:04", *req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid scheduled time format")
	}
	
	// Log the parsed scheduled time for debugging
	logrus.Infof("CreateQuotePayment: Parsed scheduled_time=%v", scheduledTime)

		// Use IST timezone to be consistent with the rest of the system
		istLocation, err := time.LoadLocation("Asia/Kolkata")
		if err != nil {
			istLocation = time.FixedZone("IST", 5*60*60+30*60) // UTC+5:30 as fallback
		}

		// Combine date and time
		scheduledDateTime := time.Date(
			scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
			scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
			istLocation,
		)

		// Validate scheduled time is in the future
		if scheduledDateTime.Before(time.Now()) {
			return nil, errors.New("scheduled time must be in the future")
		}

		return qs.processSinglePayment(bookingID, userID, req)
	} else {
		// Multiple segments = Segmented payment (no scheduled date/time required)
		return qs.processSegmentPayment(bookingID, userID, req)
	}
}

// VerifyQuotePayment verifies payment for quote acceptance
func (qs *QuoteService) VerifyQuotePayment(bookingID uint, userID uint, req *models.VerifyQuotePaymentRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and quote accepted
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteAccepted {
		return nil, errors.New("quote has not been accepted")
	}

	// Log the current scheduled date/time for debugging
	logrus.Infof("VerifyQuotePayment: Current booking scheduled_date=%v, scheduled_time=%v (retrieved from database)", 
		booking.ScheduledDate, booking.ScheduledTime)

		// 4. Find the most recent payment record for this booking
	paymentRepo := repositories.NewPaymentRepository()
	payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
		RelatedEntityType: "booking",
		RelatedEntityID:   &bookingID,
		Limit:             1,
	})
	if err != nil || len(payments) == 0 {
		return nil, fmt.Errorf("payment record not found: %v", err)
	}
	payment := &payments[0]
	
	// 5. Verify payment with Razorpay using payment service
	paymentService := NewPaymentService()
	_, err = paymentService.VerifyAndCompletePayment(payment.ID, req.RazorpayPaymentID, req.RazorpaySignature)
	if err != nil {
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}

	// 6. Update booking status to confirmed
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = "completed"

	// 7. The scheduled date/time should already be set from the CreateQuotePayment step
	// We just need to ensure the booking is updated with the correct status
	// Log the current scheduled date/time for debugging
	logrus.Infof("VerifyQuotePayment: Final booking scheduled_date=%v, scheduled_time=%v (after payment verification)", 
		booking.ScheduledDate, booking.ScheduledTime)

	// 8. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// 8. Mark payment segment as paid (if this is a segmented payment)
	segments, err := qs.getPaymentSegments(bookingID)
	if err == nil && len(segments) > 0 {
		// For single segment payments, mark the first segment as paid
		if len(segments) == 1 {
			err = qs.paymentSegmentRepo.MarkAsPaid(segments[0].ID, payment.ID)
			if err != nil {
				logrus.Errorf("Failed to mark segment as paid: %v", err)
			}
		}
		// For multiple segments, we would need to determine which segment this payment is for
		// This would require additional logic based on the payment amount or segment number
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	logrus.Infof("Payment verified for booking %d: payment_id=%s", bookingID, req.RazorpayPaymentID)
	return booking, nil
}

// WalletPayment processes wallet payment for quote acceptance
func (qs *QuoteService) WalletPayment(bookingID uint, userID uint, req *models.WalletPaymentRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type and quote accepted
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	if booking.Status != models.BookingStatusQuoteAccepted {
		return nil, errors.New("quote has not been accepted")
	}

	// 4. Validate quote amount matches
	if booking.QuoteAmount == nil || *booking.QuoteAmount != req.Amount {
		return nil, errors.New("quote amount mismatch")
	}

	// 5. Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid scheduled date format")
	}

	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid scheduled time format")
	}

	// 6. Combine date and time
	scheduledDateTime := time.Date(
		scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
		scheduledDate.Location(),
	)

	// 7. Validate scheduled time is in the future
	if scheduledDateTime.Before(time.Now()) {
		return nil, errors.New("scheduled time must be in the future")
	}

	// 8. Process wallet payment using unified wallet service
	walletService := NewUnifiedWalletService()
	
	// Deduct amount from wallet for booking payment
	_, err = walletService.DeductFromWalletForBooking(userID, req.Amount, bookingID, "Quote payment for "+booking.BookingReference)
	if err != nil {
		return nil, fmt.Errorf("failed to process wallet payment: %v", err)
	}

	// 9. Update booking with scheduling details and status
	booking.ScheduledDate = &scheduledDate
	booking.ScheduledTime = &scheduledDateTime
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = "completed"

	// 10. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	logrus.Infof("Wallet payment processed for booking %d: amount=%.2f", bookingID, req.Amount)
	return booking, nil
}

// createPaymentSegments creates payment segments for a booking
func (qs *QuoteService) createPaymentSegments(bookingID uint, segments []models.PaymentSegmentRequest) error {
	var paymentSegments []models.PaymentSegment

	for i, segmentReq := range segments {
		segment := models.PaymentSegment{
			BookingID:     bookingID,
			SegmentNumber: i + 1,
			Amount:        segmentReq.Amount,
			Status:        models.PaymentSegmentStatusPending,
			Notes:         segmentReq.Notes,
		}
		paymentSegments = append(paymentSegments, segment)
	}

	return qs.paymentSegmentRepo.CreateMultiple(paymentSegments)
}

// getPaymentSegments gets all payment segments for a booking
func (qs *QuoteService) getPaymentSegments(bookingID uint) ([]models.PaymentSegment, error) {
	return qs.paymentSegmentRepo.GetByBookingID(bookingID)
}

// processSinglePayment processes payment for single segment (current behavior)
func (qs *QuoteService) processSinglePayment(bookingID uint, userID uint, req *models.CreateQuotePaymentRequest) (map[string]interface{}, error) {
	// Get the single segment
	segments, err := qs.getPaymentSegments(bookingID)
	if err != nil {
		return nil, err
	}
	
	if len(segments) != 1 {
		return nil, errors.New("expected single payment segment")
	}
	
	segment := segments[0]
	
	// Validate amount matches
	if segment.Amount != req.Amount {
		return nil, errors.New("payment amount does not match segment amount")
	}
	
	// Process payment using existing logic
	paymentService := NewPaymentService()
	
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            req.Amount,
		Currency:          "INR",
		Type:              "booking",
		Method:            "razorpay",
		RelatedEntityType: "booking",
		RelatedEntityID:   bookingID,
		Description:       "Quote payment for booking",
		Notes:             "Quote payment for booking",
	}
	
	_, paymentOrder, err := paymentService.CreateRazorpayOrder(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment order: %v", err)
	}
	
	// Update booking with scheduling details (but don't mark as completed yet)
	if req.ScheduledDate == nil || req.ScheduledTime == nil {
		return nil, errors.New("scheduled date and time are required for single segment payments")
	}
	
	// Log the received scheduled time for debugging
	logrus.Infof("processSinglePayment: Received scheduled_time=%s", *req.ScheduledTime)
	
	scheduledDate, err := time.Parse("2006-01-02", *req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid scheduled date format")
	}
	
	scheduledTime, err := time.Parse("15:04", *req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid scheduled time format")
	}
	
	// Log the parsed scheduled time for debugging
	logrus.Infof("processSinglePayment: Parsed scheduled_time=%v", scheduledTime)
	
	// Use IST timezone to be consistent with the rest of the system
	istLocation, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		istLocation = time.FixedZone("IST", 5*60*60+30*60) // UTC+5:30 as fallback
	}
	
	scheduledDateTime := time.Date(
		scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
		istLocation,
	)
	
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}
	
	// Only update scheduling details, keep status as quote_accepted until payment is verified
	booking.ScheduledDate = &scheduledDate
	booking.ScheduledTime = &scheduledDateTime
	// Don't update status or payment_status here - that should happen in VerifyQuotePayment
	
	// Log the scheduled date/time being set
	logrus.Infof("processSinglePayment: Setting scheduled_date=%v, scheduled_time=%v (IST timezone)", 
		booking.ScheduledDate, booking.ScheduledTime)
	
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}
	
	// Don't mark segment as paid yet - that should happen in VerifyQuotePayment
	
	return map[string]interface{}{
		"payment_order": paymentOrder,
		"booking":       booking,
	}, nil
}

// processSegmentPayment processes payment for a specific segment
func (qs *QuoteService) processSegmentPayment(bookingID uint, userID uint, req *models.CreateQuotePaymentRequest) (map[string]interface{}, error) {
	if req.SegmentNumber == nil {
		return nil, errors.New("segment number is required for segmented payments")
	}
	
	// Get the specific segment
	segment, err := qs.paymentSegmentRepo.GetByBookingIDAndSegmentNumber(bookingID, *req.SegmentNumber)
	if err != nil {
		return nil, errors.New("payment segment not found")
	}
	
	// Validate segment is pending
	if segment.Status != models.PaymentSegmentStatusPending {
		return nil, errors.New("payment segment is not pending")
	}
	
	// Validate amount matches
	if segment.Amount != req.Amount {
		return nil, errors.New("payment amount does not match segment amount")
	}
	
	// Process payment using existing logic
	paymentService := NewPaymentService()
	
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            req.Amount,
		Currency:          "INR",
		Type:              "booking",
		Method:            "razorpay",
		RelatedEntityType: "booking",
		RelatedEntityID:   bookingID,
		Description:       fmt.Sprintf("Segment %d payment for booking", segment.SegmentNumber),
		Notes:             fmt.Sprintf("Segment %d payment for booking", segment.SegmentNumber),
	}
	
	_, paymentOrder, err := paymentService.CreateRazorpayOrder(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment order: %v", err)
	}
	
	// If this is the first segment, update booking scheduling (only if scheduled date/time provided)
	if segment.SegmentNumber == 1 && req.ScheduledDate != nil && req.ScheduledTime != nil {
		scheduledDate, _ := time.Parse("2006-01-02", *req.ScheduledDate)
		scheduledTime, _ := time.Parse("15:04", *req.ScheduledTime)
		scheduledDateTime := time.Date(
			scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
			scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
			scheduledDate.Location(),
		)
		
		booking, err := qs.bookingRepo.GetByID(bookingID)
		if err != nil {
			return nil, err
		}
		
		booking.ScheduledDate = &scheduledDate
		booking.ScheduledTime = &scheduledDateTime
		
		// Check if all segments are paid
		allPaid, err := qs.paymentSegmentRepo.IsAllSegmentsPaid(bookingID)
		if err != nil {
			return nil, err
		}
		
		if allPaid {
			booking.Status = models.BookingStatusConfirmed
			booking.PaymentStatus = "completed"
		} else {
			booking.Status = models.BookingStatusPartiallyPaid
			booking.PaymentStatus = "partial"
		}
		
		err = qs.bookingRepo.Update(booking)
		if err != nil {
			return nil, fmt.Errorf("failed to update booking: %v", err)
		}
	}
	
	return map[string]interface{}{
		"payment_order": paymentOrder,
		"segment":       segment,
	}, nil
}

// GetPaymentProgress gets payment progress for a booking
func (qs *QuoteService) GetPaymentProgress(bookingID uint, userID uint) (*models.PaymentProgress, error) {
	// Validate booking belongs to user
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// Get payment progress
	return qs.paymentSegmentRepo.GetPaymentProgress(bookingID)
}

// GetPaymentProgressForAdmin gets payment progress for a booking (admin access)
func (qs *QuoteService) GetPaymentProgressForAdmin(bookingID uint) (*models.PaymentProgress, error) {
	// Validate booking exists
	_, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// Get payment progress (no user validation for admin)
	return qs.paymentSegmentRepo.GetPaymentProgress(bookingID)
}

// CreateSegmentPayment creates payment for a specific segment
func (qs *QuoteService) CreateSegmentPayment(bookingID uint, userID uint, req *models.CreateSegmentPaymentRequest) (map[string]interface{}, error) {
	// Get the specific segment
	segment, err := qs.paymentSegmentRepo.GetByBookingIDAndSegmentNumber(bookingID, req.SegmentNumber)
	if err != nil {
		return nil, errors.New("payment segment not found")
	}

	// Validate segment is pending
	if segment.Status != models.PaymentSegmentStatusPending {
		return nil, errors.New("payment segment is not pending")
	}

	// Validate amount matches
	if segment.Amount != req.Amount {
		return nil, errors.New("payment amount does not match segment amount")
	}

	// Handle different payment methods
	if req.PaymentMethod == "wallet" {
		// Process wallet payment
		walletService := NewUnifiedWalletService()
		
		description := fmt.Sprintf("Segment %d payment for booking", segment.SegmentNumber)
		payment, err := walletService.DeductFromWalletForBooking(userID, req.Amount, bookingID, description)
		if err != nil {
			return nil, fmt.Errorf("wallet payment failed: %v", err)
		}

		// Mark segment as paid
		err = qs.paymentSegmentRepo.MarkAsPaid(segment.ID, payment.ID)
		if err != nil {
			logrus.Errorf("Failed to mark segment as paid: %v", err)
			return nil, fmt.Errorf("failed to mark segment as paid: %v", err)
		}

		// Update segment status
		segment.Status = models.PaymentSegmentStatusPaid
		segment.PaymentID = &payment.ID
		now := time.Now()
		segment.PaidAt = &now
		err = qs.paymentSegmentRepo.Update(segment)
		if err != nil {
			logrus.Errorf("Failed to update segment: %v", err)
		}

		// Update booking payment status if all segments are paid
		booking, err := qs.bookingRepo.GetByID(bookingID)
		if err == nil {
			paymentProgress := booking.GetPaymentProgress()
			if paymentProgress != nil && paymentProgress.RemainingSegments == 0 {
				booking.PaymentStatus = "completed"
				qs.bookingRepo.Update(booking)
			}
		}

		return map[string]interface{}{
			"success": true,
			"payment": payment,
			"segment": segment,
		}, nil
	} else {
		// Process Razorpay payment (existing logic)
		paymentService := NewPaymentService()
		
		paymentReq := &models.CreatePaymentRequest{
			UserID:            userID,
			Amount:            req.Amount,
			Currency:          "INR",
			Type:              "booking",
			Method:            "razorpay",
			RelatedEntityType: "booking",
			RelatedEntityID:   bookingID,
			Description:       fmt.Sprintf("Segment %d payment for booking", segment.SegmentNumber),
			Notes:             fmt.Sprintf("Segment %d payment for booking", segment.SegmentNumber),
		}
		
		_, paymentOrder, err := paymentService.CreateRazorpayOrder(paymentReq)
		if err != nil {
			return nil, fmt.Errorf("failed to create payment order: %v", err)
		}

		result := map[string]interface{}{
			"payment_order": paymentOrder,
			"segment":       segment,
		}

		// Log what we're returning from CreateSegmentPayment
		logrus.Infof("[QuoteService] CreateSegmentPayment - Returning result: payment_order=%+v, segment_id=%d", paymentOrder, segment.ID)

		return result, nil
	}
}

// VerifySegmentPayment verifies payment for a specific segment
func (qs *QuoteService) VerifySegmentPayment(bookingID uint, userID uint, req *models.VerifySegmentPaymentRequest) (map[string]interface{}, error) {
	// 1. Get booking
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// 2. Validate booking belongs to user
	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// 3. Validate booking is inquiry type
	if booking.BookingType != models.BookingTypeInquiry {
		return nil, errors.New("booking is not inquiry type")
	}

	// 4. Find payment by Razorpay order ID
	paymentRepo := repositories.NewPaymentRepository()
	payment, err := paymentRepo.GetByRazorpayOrderID(req.RazorpayOrderID)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %v", err)
	}

	// 5. Verify payment with Razorpay using payment service
	paymentService := NewPaymentService()
	_, err = paymentService.VerifyAndCompletePayment(payment.ID, req.RazorpayPaymentID, req.RazorpaySignature)
	if err != nil {
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}

	// 6. Get updated booking with payment progress
	updatedBooking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated booking: %v", err)
	}

	// Calculate payment progress before returning
	updatedBooking.GetPaymentProgress()
	
	logrus.Infof("Segment payment verified for booking %d: payment_id=%s", bookingID, req.RazorpayPaymentID)
	return map[string]interface{}{
		"booking": updatedBooking,
		"payment": payment,
	}, nil
}

// GetPendingSegments gets all pending segments for a booking
func (qs *QuoteService) GetPendingSegments(bookingID uint, userID uint) ([]models.PaymentSegmentInfo, error) {
	// Validate booking belongs to user
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// Get pending segments
	segments, err := qs.paymentSegmentRepo.GetPendingSegments(bookingID)
	if err != nil {
		return nil, err
	}

	// Convert to segment info
	var segmentInfos []models.PaymentSegmentInfo
	for _, segment := range segments {
		segmentInfo := models.PaymentSegmentInfo{
			ID:            segment.ID,
			SegmentNumber: segment.SegmentNumber,
			Amount:        segment.Amount,
			Status:        segment.Status,
			PaidAt:        segment.PaidAt,
			Notes:         segment.Notes,
			PaymentID:     segment.PaymentID,
		}
		segmentInfos = append(segmentInfos, segmentInfo)
	}

	return segmentInfos, nil
}

// GetPaidSegments gets all paid segments for a booking
func (qs *QuoteService) GetPaidSegments(bookingID uint, userID uint) ([]models.PaymentSegmentInfo, error) {
	// Validate booking belongs to user
	booking, err := qs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.UserID != userID {
		return nil, errors.New("unauthorized access to booking")
	}

	// Get paid segments
	segments, err := qs.paymentSegmentRepo.GetPaidSegments(bookingID)
	if err != nil {
		return nil, err
	}

	// Convert to segment info
	var segmentInfos []models.PaymentSegmentInfo
	for _, segment := range segments {
		segmentInfo := models.PaymentSegmentInfo{
			ID:            segment.ID,
			SegmentNumber: segment.SegmentNumber,
			Amount:        segment.Amount,
			Status:        segment.Status,
			PaidAt:        segment.PaidAt,
			Notes:         segment.Notes,
			PaymentID:     segment.PaymentID,
		}
		segmentInfos = append(segmentInfos, segmentInfo)
	}

	return segmentInfos, nil
}
