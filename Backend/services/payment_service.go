package services

import (
	"fmt"
	"strconv"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type PaymentService struct {
	paymentRepo     *repositories.PaymentRepository
	razorpayService *RazorpayService
}

func NewPaymentService() *PaymentService {
	return &PaymentService{
		paymentRepo:     repositories.NewPaymentRepository(),
		razorpayService: NewRazorpayService(),
	}
}

// CreatePayment creates a new payment record
func (ps *PaymentService) CreatePayment(req *models.CreatePaymentRequest) (*models.Payment, error) {
	// Generate payment reference
	paymentReference := ps.generatePaymentReference()

	// Handle metadata - use provided metadata or empty object
	var metadata *models.JSONMap
	if req.Metadata != nil {
		metadata = req.Metadata
	} else {
		// Use empty JSON object as default
		emptyMap := models.JSONMap{}
		metadata = &emptyMap
	}

	payment := &models.Payment{
		PaymentReference:  paymentReference,
		UserID:           req.UserID,
		Amount:           req.Amount,
		Currency:         req.Currency,
		Status:           models.PaymentStatusPending,
		Type:             req.Type,
		Method:           req.Method,
		RelatedEntityType: req.RelatedEntityType,
		RelatedEntityID:   req.RelatedEntityID,
		Description:      req.Description,
		Notes:            req.Notes,
		Metadata:         metadata,
		InitiatedAt:      time.Now(),
	}

	err := ps.paymentRepo.Create(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %v", err)
	}

	return payment, nil
}

// CreateRazorpayOrder creates a Razorpay order and payment record
func (ps *PaymentService) CreateRazorpayOrder(req *models.CreatePaymentRequest) (*models.Payment, map[string]interface{}, error) {
	// Create payment record first
	payment, err := ps.CreatePayment(req)
	if err != nil {
		return nil, nil, err
	}

	// Create Razorpay order
	razorpayOrder, err := ps.razorpayService.CreateOrder(payment.Amount, payment.PaymentReference, req.Description)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create razorpay order: %v", err)
	}

	// Update payment with Razorpay order ID
	orderID := razorpayOrder["id"].(string)
	payment.RazorpayOrderID = &orderID
	err = ps.paymentRepo.Update(payment)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update payment with order ID: %v", err)
	}

	return payment, razorpayOrder, nil
}

// VerifyAndCompletePayment verifies Razorpay payment and completes the payment
func (ps *PaymentService) VerifyAndCompletePayment(paymentID uint, razorpayPaymentID, razorpaySignature string) (*models.Payment, error) {
	// Get payment record
	payment, err := ps.paymentRepo.GetByID(paymentID)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %v", err)
	}

	// Check if payment has Razorpay order ID
	if payment.RazorpayOrderID == nil {
		return nil, fmt.Errorf("payment does not have Razorpay order ID")
	}

	// Verify Razorpay payment
	isValid, err := ps.razorpayService.VerifyPayment(razorpayPaymentID, *payment.RazorpayOrderID, razorpaySignature)
	if err != nil {
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}

	if !isValid {
		// Update payment status to failed
		payment.Status = models.PaymentStatusFailed
		now := time.Now()
		payment.FailedAt = &now
		payment.Notes = "Payment verification failed"
		err = ps.paymentRepo.Update(payment)
		if err != nil {
			return nil, fmt.Errorf("failed to update payment status: %v", err)
		}
		return nil, fmt.Errorf("payment signature verification failed")
	}

	// Update payment as completed
	payment.Status = models.PaymentStatusCompleted
	payment.RazorpayPaymentID = &razorpayPaymentID
	payment.RazorpaySignature = &razorpaySignature
	now := time.Now()
	payment.CompletedAt = &now
	payment.Notes = "Payment completed successfully"

	err = ps.paymentRepo.Update(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment status: %v", err)
	}

	// Handle payment completion based on type
	if payment.RelatedEntityType == "booking" && payment.RelatedEntityID != 0 {
		err = ps.handleBookingPaymentCompletion(payment)
		if err != nil {
			logrus.Errorf("Failed to handle booking payment completion: %v", err)
			// Don't fail the payment verification, just log the error
		}
	} else if payment.Type == models.PaymentTypeSubscription {
		err = ps.handleSubscriptionPaymentCompletion(payment)
		if err != nil {
			logrus.Errorf("Failed to handle subscription payment completion: %v", err)
			// Don't fail the payment verification, just log the error
		}
	}

	return payment, nil
}

// handleBookingPaymentCompletion handles booking-specific payment completion logic
func (ps *PaymentService) handleBookingPaymentCompletion(payment *models.Payment) error {
	// Get booking
	bookingRepo := repositories.NewBookingRepository()
	booking, err := bookingRepo.GetByID(payment.RelatedEntityID)
	if err != nil {
		return fmt.Errorf("failed to get booking: %v", err)
	}

	// Check if this is a segment payment by looking at the payment description
	if strings.Contains(payment.Description, "Segment") {
		// This is a segment payment
		err = ps.handleSegmentPaymentCompletion(booking, payment)
		if err != nil {
			return fmt.Errorf("failed to handle segment payment completion: %v", err)
		}
	} else {
		// This is a regular booking payment
		err = ps.handleRegularBookingPaymentCompletion(booking, payment)
		if err != nil {
			return fmt.Errorf("failed to handle regular booking payment completion: %v", err)
		}
	}

	return nil
}

// handleSegmentPaymentCompletion handles segment payment completion
func (ps *PaymentService) handleSegmentPaymentCompletion(booking *models.Booking, payment *models.Payment) error {
	// Extract segment number from payment description
	// Format: "Segment X payment for booking"
	segmentNumberStr := strings.TrimSpace(strings.Split(payment.Description, "Segment")[1])
	segmentNumberStr = strings.Split(segmentNumberStr, " ")[0]
	segmentNumber, err := strconv.Atoi(segmentNumberStr)
	if err != nil {
		return fmt.Errorf("failed to parse segment number: %v", err)
	}

	// Update the specific segment as paid
	paymentSegmentRepo := repositories.NewPaymentSegmentRepository()
	segment, err := paymentSegmentRepo.GetByBookingIDAndSegmentNumber(booking.ID, segmentNumber)
	if err != nil {
		return fmt.Errorf("failed to get payment segment: %v", err)
	}

	// Update segment status
	segment.Status = models.PaymentSegmentStatusPaid
	segment.PaymentID = &payment.ID
	now := time.Now()
	segment.PaidAt = &now

	err = paymentSegmentRepo.Update(segment)
	if err != nil {
		return fmt.Errorf("failed to update segment status: %v", err)
	}

	// Check if all segments are paid
	allPaid, err := paymentSegmentRepo.IsAllSegmentsPaid(booking.ID)
	if err != nil {
		return fmt.Errorf("failed to check if all segments are paid: %v", err)
	}

	// Update booking status
	bookingRepo := repositories.NewBookingRepository()
	if allPaid {
		// All segments paid - booking is confirmed
		booking.Status = models.BookingStatusConfirmed
		booking.PaymentStatus = "completed"
	} else {
		// Some segments still pending - booking is partially paid
		booking.Status = models.BookingStatusPartiallyPaid
		booking.PaymentStatus = "partial"
	}

	err = bookingRepo.Update(booking)
	if err != nil {
		return fmt.Errorf("failed to update booking status: %v", err)
	}

	return nil
}

// handleRegularBookingPaymentCompletion handles regular booking payment completion
func (ps *PaymentService) handleRegularBookingPaymentCompletion(booking *models.Booking, payment *models.Payment) error {
	// For regular bookings, just confirm the booking
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = "completed"

	bookingRepo := repositories.NewBookingRepository()
	err := bookingRepo.Update(booking)
	if err != nil {
		return fmt.Errorf("failed to update booking status: %v", err)
	}

	return nil
}

// handleSubscriptionPaymentCompletion handles subscription payment completion
func (ps *PaymentService) handleSubscriptionPaymentCompletion(payment *models.Payment) error {
	// For subscription payments, we don't need to do anything here
	// The subscription creation is handled in the CompleteSubscriptionPurchase method
	// This is just for logging and potential future enhancements
	logrus.Infof("Subscription payment completed: Payment ID %d, Amount ₹%.2f", payment.ID, payment.Amount)
	return nil
}

// GetPaymentByID gets a payment by ID
func (ps *PaymentService) GetPaymentByID(paymentID uint) (*models.Payment, error) {
	return ps.paymentRepo.GetByID(paymentID)
}

// GetPaymentByReference gets a payment by reference
func (ps *PaymentService) GetPaymentByReference(reference string) (*models.Payment, error) {
	return ps.paymentRepo.GetByReference(reference)
}

// GetPaymentByRazorpayOrderID gets a payment by Razorpay order ID
func (ps *PaymentService) GetPaymentByRazorpayOrderID(orderID string) (*models.Payment, error) {
	return ps.paymentRepo.GetByRazorpayOrderID(orderID)
}

// UpdatePayment updates a payment
func (ps *PaymentService) UpdatePayment(payment *models.Payment) error {
	return ps.paymentRepo.Update(payment)
}

// GetUserPayments gets payments for a user
func (ps *PaymentService) GetUserPayments(userID uint, filters *models.PaymentFilters) ([]models.Payment, *repositories.Pagination, error) {
	return ps.paymentRepo.GetUserPayments(userID, filters)
}

// GetPaymentStats gets payment statistics
func (ps *PaymentService) GetPaymentStats(userID *uint) (map[string]interface{}, error) {
	return ps.paymentRepo.GetPaymentStats(userID)
}

// RefundPayment refunds a payment
func (ps *PaymentService) RefundPayment(paymentID uint, req *models.RefundPaymentRequest) (*models.Payment, error) {
	// Get payment record
	payment, err := ps.paymentRepo.GetByID(paymentID)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %v", err)
	}

	// Check if payment is completed
	if payment.Status != models.PaymentStatusCompleted {
		return nil, fmt.Errorf("payment is not completed, cannot refund")
	}

	// Check if refund amount is valid
	if req.RefundAmount > payment.Amount {
		return nil, fmt.Errorf("refund amount cannot exceed payment amount")
	}

	// Update payment as refunded
	payment.Status = models.PaymentStatusRefunded
	payment.RefundAmount = &req.RefundAmount
	payment.RefundReason = &req.RefundReason
	payment.RefundMethod = &req.RefundMethod
	now := time.Now()
	payment.RefundedAt = &now
	payment.Notes = req.Notes

	err = ps.paymentRepo.Update(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment status: %v", err)
	}

	return payment, nil
}

// GetAbandonedWalletPayments gets pending wallet payments that are older than the cutoff time
func (ps *PaymentService) GetAbandonedWalletPayments(cutoffTime time.Time) ([]*models.Payment, error) {
	return ps.paymentRepo.GetAbandonedWalletPayments(cutoffTime)
}

// GetPaymentsByUserAndType gets payments for a user by type(s)
func (ps *PaymentService) GetPaymentsByUserAndType(userID uint, paymentTypes []models.PaymentType, limit, offset int) ([]models.Payment, error) {
	return ps.paymentRepo.GetByUserIDAndTypes(userID, paymentTypes, limit, offset)
}

// GetPaymentCountByUserAndType gets payment count for a user by type(s)
func (ps *PaymentService) GetPaymentCountByUserAndType(userID uint, paymentTypes []models.PaymentType) (int64, error) {
	return ps.paymentRepo.GetCountByUserIDAndTypes(userID, paymentTypes)
}

// GetRecentPaymentsByUserAndType gets recent payments for a user by type(s)
func (ps *PaymentService) GetRecentPaymentsByUserAndType(userID uint, paymentTypes []models.PaymentType, limit int) ([]models.Payment, error) {
	return ps.paymentRepo.GetRecentByUserIDAndTypes(userID, paymentTypes, limit)
}

// GetTotalAmountByUserAndType gets total amount for a user by type
func (ps *PaymentService) GetTotalAmountByUserAndType(userID uint, paymentType models.PaymentType) (float64, error) {
	return ps.paymentRepo.GetTotalAmountByUserIDAndType(userID, paymentType)
}

// generatePaymentReference generates a unique payment reference
func (ps *PaymentService) generatePaymentReference() string {
	timestamp := time.Now().Format("20060102")
	// Generate a unique sequence number using current time in nanoseconds
	sequence := time.Now().UnixNano() % 1000000 // Use last 6 digits of nanoseconds
	return fmt.Sprintf("PAY%s%06d", timestamp, sequence)
}
