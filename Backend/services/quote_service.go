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
	bookingRepo *repositories.BookingRepository
	userRepo    *repositories.UserRepository
}

func NewQuoteService() *QuoteService {
	return &QuoteService{
		bookingRepo: repositories.NewBookingRepository(),
		userRepo:    repositories.NewUserRepository(),
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

	// 3. Set quote details
	now := time.Now()
	booking.QuoteAmount = &req.Amount
	booking.QuoteNotes = req.Notes
	booking.QuoteProvidedBy = &adminID
	booking.QuoteProvidedAt = &now
	booking.Status = models.BookingStatusQuoteProvided

	// 4. Set quote expiration if provided
	if req.ExpiresIn != nil && *req.ExpiresIn > 0 {
		expiresAt := now.AddDate(0, 0, *req.ExpiresIn)
		booking.QuoteExpiresAt = &expiresAt
	}

	// 5. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	logrus.Infof("Quote provided for booking %d: amount=%.2f, admin=%d", bookingID, req.Amount, adminID)
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

	// 3. Update quote details
	now := time.Now()
	booking.QuoteAmount = &req.Amount
	booking.QuoteNotes = req.Notes
	booking.QuoteProvidedBy = &adminID
	booking.QuoteProvidedAt = &now

	// 4. Update quote expiration if provided
	if req.ExpiresIn != nil && *req.ExpiresIn > 0 {
		expiresAt := now.AddDate(0, 0, *req.ExpiresIn)
		booking.QuoteExpiresAt = &expiresAt
	}

	// 5. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	logrus.Infof("Quote updated for booking %d: amount=%.2f, admin=%d", bookingID, req.Amount, adminID)
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

	// 8. Create Razorpay order using payment service
	paymentService := NewPaymentService()
	
	// Create payment request
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            req.Amount,
		Currency:          "INR",
		Type:              "booking",
		Method:            "razorpay",
		RelatedEntityType: "booking",
		RelatedEntityID:   bookingID,
		Description:       "Quote payment for " + booking.BookingReference,
		Notes:             "Quote payment for booking",
	}
	
	// Create payment record and Razorpay order
	_, paymentOrder, err := paymentService.CreateRazorpayOrder(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment order: %v", err)
	}

	// 9. Update booking with scheduling details (but keep status as quote_accepted until payment is verified)
	booking.ScheduledDate = &scheduledDate
	booking.ScheduledTime = &scheduledDateTime

	// 10. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	logrus.Infof("Payment order created for booking %d: amount=%.2f, order_id=%s", bookingID, req.Amount, paymentOrder["id"])
	return paymentOrder, nil
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

	// 7. Update booking
	err = qs.bookingRepo.Update(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}

	logrus.Infof("Payment verified for booking %d: payment_id=%s", bookingID, req.RazorpayPaymentID)
	return booking, nil
}
