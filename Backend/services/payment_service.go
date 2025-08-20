package services

import (
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"
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
		return nil, fmt.Errorf("payment verification failed")
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

	return payment, nil
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

// generatePaymentReference generates a unique payment reference
func (ps *PaymentService) generatePaymentReference() string {
	timestamp := time.Now().Format("20060102")
	// Generate a unique sequence number using current time in nanoseconds
	sequence := time.Now().UnixNano() % 1000000 // Use last 6 digits of nanoseconds
	return fmt.Sprintf("PAY%s%06d", timestamp, sequence)
}
