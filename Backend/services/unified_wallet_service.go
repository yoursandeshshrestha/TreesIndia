package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// UnifiedWalletService handles all wallet operations using the unified payment system
type UnifiedWalletService struct {
	paymentService   *PaymentService
	userRepo         *repositories.UserRepository
	adminConfigService *AdminConfigService
}

// NewUnifiedWalletService creates a new unified wallet service
func NewUnifiedWalletService() *UnifiedWalletService {
	return &UnifiedWalletService{
		paymentService:   NewPaymentService(),
		userRepo:         repositories.NewUserRepository(),
		adminConfigService: NewAdminConfigService(),
	}
}

// RechargeWallet recharges a user's wallet using the unified payment system
func (s *UnifiedWalletService) RechargeWallet(userID uint, amount float64, paymentMethod string) (*models.Payment, map[string]interface{}, error) {
	// Validate amount
	minRecharge := s.adminConfigService.GetMinRechargeAmount()
	maxRecharge := s.adminConfigService.GetMaxRechargeAmount()
	
	if amount < minRecharge {
		return nil, nil, fmt.Errorf("minimum recharge amount is ₹%.2f", minRecharge)
	}
	
	if maxRecharge > 0 && amount > maxRecharge {
		return nil, nil, fmt.Errorf("maximum recharge amount is ₹%.2f", maxRecharge)
	}

	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, nil, fmt.Errorf("user not found: %w", err)
	}

	// Check wallet limit
	maxWalletBalance := s.adminConfigService.GetMaxWalletBalance()
	if maxWalletBalance > 0 && (user.WalletBalance+amount) > maxWalletBalance {
		return nil, nil, fmt.Errorf("wallet balance cannot exceed ₹%.2f", maxWalletBalance)
	}

	// Create payment record for wallet recharge
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            amount,
		Currency:          "INR",
		Type:              models.PaymentTypeWalletRecharge,
		Method:            paymentMethod,
		RelatedEntityType: "wallet",
		RelatedEntityID:   userID,
		Description:       fmt.Sprintf("Wallet recharge of ₹%.2f", amount),
		Notes:             "Wallet recharge payment",
	}

	// Create payment with Razorpay order
	payment, razorpayOrder, err := s.paymentService.CreateRazorpayOrder(paymentReq)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create payment: %w", err)
	}

	return payment, razorpayOrder, nil
}

// CompleteWalletRecharge completes a wallet recharge after payment verification
func (s *UnifiedWalletService) CompleteWalletRecharge(paymentID uint, razorpayPaymentID, razorpaySignature string) error {
	// Verify payment
	payment, err := s.paymentService.VerifyAndCompletePayment(paymentID, razorpayPaymentID, razorpaySignature)
	if err != nil {
		return fmt.Errorf("payment verification failed: %w", err)
	}

	if payment.Type != models.PaymentTypeWalletRecharge {
		return errors.New("payment is not a wallet recharge")
	}

	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, payment.UserID); err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Calculate new balance
	newBalance := user.WalletBalance + payment.Amount

	// Update user wallet balance
	user.WalletBalance = newBalance
	if err := s.userRepo.Update(&user); err != nil {
		return fmt.Errorf("failed to update user wallet: %w", err)
	}

	// Update payment with balance after transaction
	payment.BalanceAfter = &newBalance
	if err := s.paymentService.UpdatePayment(payment); err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	logrus.Infof("Wallet recharge completed for user %d: ₹%.2f, new balance: ₹%.2f", payment.UserID, payment.Amount, newBalance)
	return nil
}

// DeductFromWallet deducts amount from user's wallet for service payments
func (s *UnifiedWalletService) DeductFromWallet(userID uint, amount float64, serviceID uint, description string) (*models.Payment, error) {
	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if user has sufficient balance
	if user.WalletBalance < amount {
		return nil, fmt.Errorf("insufficient wallet balance. Required: ₹%.2f, Available: ₹%.2f", amount, user.WalletBalance)
	}

	// Calculate new balance
	newBalance := user.WalletBalance - amount

	// Create payment record for wallet debit
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            amount,
		Currency:          "INR",
		Type:              models.PaymentTypeWalletDebit,
		Method:            "wallet",
		RelatedEntityType: "service",
		RelatedEntityID:   serviceID,
		Description:       description,
		Notes:             "Service payment from wallet",
	}

	// Create payment record
	payment, err := s.paymentService.CreatePayment(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	// Update user wallet balance
	user.WalletBalance = newBalance
	if err := s.userRepo.Update(&user); err != nil {
		return nil, fmt.Errorf("failed to update user wallet: %w", err)
	}

	// Update payment status to completed
	now := time.Now()
	payment.Status = models.PaymentStatusCompleted
	payment.CompletedAt = &now
	payment.BalanceAfter = &newBalance

	if err := s.paymentService.UpdatePayment(payment); err != nil {
		return nil, fmt.Errorf("failed to update payment: %w", err)
	}

	logrus.Infof("Wallet debit for user %d: ₹%.2f, new balance: ₹%.2f", userID, amount, newBalance)
	return payment, nil
}

// GetUserWalletTransactions gets wallet transactions for a user
func (s *UnifiedWalletService) GetUserWalletTransactions(userID uint, page, limit int) ([]models.Payment, int64, error) {
	offset := (page - 1) * limit
	
	// Get wallet-related payments
	payments, err := s.paymentService.GetPaymentsByUserAndType(userID, []models.PaymentType{
		models.PaymentTypeWalletRecharge,
		models.PaymentTypeWalletDebit,
	}, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get wallet transactions: %w", err)
	}

	// Get total count
	total, err := s.paymentService.GetPaymentCountByUserAndType(userID, []models.PaymentType{
		models.PaymentTypeWalletRecharge,
		models.PaymentTypeWalletDebit,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return payments, total, nil
}

// GetUserWalletSummary gets a summary of user's wallet activity
func (s *UnifiedWalletService) GetUserWalletSummary(userID uint) (map[string]interface{}, error) {
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Get recent wallet transactions
	recentTransactions, err := s.paymentService.GetRecentPaymentsByUserAndType(userID, []models.PaymentType{
		models.PaymentTypeWalletRecharge,
		models.PaymentTypeWalletDebit,
	}, 5)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent transactions: %w", err)
	}

	// Get total recharge amount
	totalRecharge, err := s.paymentService.GetTotalAmountByUserAndType(userID, models.PaymentTypeWalletRecharge)
	if err != nil {
		return nil, fmt.Errorf("failed to get total recharge: %w", err)
	}

	// Get total spent amount (wallet debits)
	totalSpent, err := s.paymentService.GetTotalAmountByUserAndType(userID, models.PaymentTypeWalletDebit)
	if err != nil {
		return nil, fmt.Errorf("failed to get total spent: %w", err)
	}

	// Get transaction count
	totalTransactions, err := s.paymentService.GetPaymentCountByUserAndType(userID, []models.PaymentType{
		models.PaymentTypeWalletRecharge,
		models.PaymentTypeWalletDebit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction count: %w", err)
	}

	summary := map[string]interface{}{
		"current_balance":      user.WalletBalance,
		"total_recharge":       totalRecharge,
		"total_spent":          totalSpent,
		"total_transactions":   totalTransactions,
		"recent_transactions":  recentTransactions,
	}

	return summary, nil
}

// AdminAdjustWallet allows admin to adjust user's wallet balance
func (s *UnifiedWalletService) AdminAdjustWallet(userID uint, amount float64, reason string, adminID uint) (*models.Payment, error) {
	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check wallet limit
	maxWalletBalance := s.adminConfigService.GetMaxWalletBalance()
	newBalance := user.WalletBalance + amount
	if maxWalletBalance > 0 && newBalance > maxWalletBalance {
		return nil, fmt.Errorf("wallet balance cannot exceed ₹%.2f", maxWalletBalance)
	}

	if newBalance < 0 {
		return nil, errors.New("wallet balance cannot be negative")
	}

	// Create payment record for admin adjustment
	paymentReq := &models.CreatePaymentRequest{
		UserID:            userID,
		Amount:            amount,
		Currency:          "INR",
		Type:              models.PaymentTypeWalletRecharge, // Use recharge type for admin adjustments
		Method:            "admin",
		RelatedEntityType: "wallet",
		RelatedEntityID:   userID,
		Description:       fmt.Sprintf("Admin adjustment: %s", reason),
		Notes:             fmt.Sprintf("Admin adjustment by admin ID %d", adminID),
	}

	// Create payment record
	payment, err := s.paymentService.CreatePayment(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	// Update user wallet balance
	user.WalletBalance = newBalance
	if err := s.userRepo.Update(&user); err != nil {
		return nil, fmt.Errorf("failed to update user wallet: %w", err)
	}

	// Update payment status to completed
	now := time.Now()
	payment.Status = models.PaymentStatusCompleted
	payment.CompletedAt = &now
	payment.BalanceAfter = &newBalance

	if err := s.paymentService.UpdatePayment(payment); err != nil {
		return nil, fmt.Errorf("failed to update payment: %w", err)
	}

	logrus.Infof("Admin wallet adjustment for user %d by admin %d: ₹%.2f - %s", userID, adminID, amount, reason)
	return payment, nil
}

// GetTransactionByReference gets a wallet transaction by reference ID
func (s *UnifiedWalletService) GetTransactionByReference(referenceID string) (*models.Payment, error) {
	return s.paymentService.GetPaymentByReference(referenceID)
}

// CancelWalletRecharge cancels a pending wallet recharge
func (s *UnifiedWalletService) CancelWalletRecharge(paymentID uint, userID uint) error {
	// Get payment record
	payment, err := s.paymentService.GetPaymentByID(paymentID)
	if err != nil {
		return fmt.Errorf("payment not found: %w", err)
	}

	// Verify payment belongs to user
	if payment.UserID != userID {
		return errors.New("payment does not belong to user")
	}

	// Check if payment can be cancelled
	if payment.Status != models.PaymentStatusPending {
		return fmt.Errorf("payment cannot be cancelled, current status: %s", payment.Status)
	}

	if payment.Type != models.PaymentTypeWalletRecharge {
		return errors.New("payment is not a wallet recharge")
	}

	// Update payment status to abandoned
	payment.Status = models.PaymentStatusAbandoned
	now := time.Now()
	payment.FailedAt = &now
	payment.Notes = "Payment cancelled by user"

	if err := s.paymentService.UpdatePayment(payment); err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	logrus.Infof("Wallet recharge cancelled by user %d: payment ID %d", userID, paymentID)
	return nil
}

// GetUserWalletTransactionsByType gets wallet transactions for a user by type
func (s *UnifiedWalletService) GetUserWalletTransactionsByType(userID uint, paymentType models.PaymentType, page, limit int) ([]models.Payment, int64, error) {
	offset := (page - 1) * limit
	
	// Get wallet-related payments by type
	payments, err := s.paymentService.GetPaymentsByUserAndType(userID, []models.PaymentType{paymentType}, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get wallet transactions: %w", err)
	}

	// Get total count
	total, err := s.paymentService.GetPaymentCountByUserAndType(userID, []models.PaymentType{paymentType})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return payments, total, nil
}
