package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// WalletService handles business logic for wallet operations
type WalletService struct {
	walletRepo        *repositories.WalletTransactionRepository
	userRepo          *repositories.UserRepository
	adminConfigService *AdminConfigService
}

// NewWalletService creates a new wallet service
func NewWalletService() *WalletService {
	return &WalletService{
		walletRepo:        repositories.NewWalletTransactionRepository(),
		userRepo:          repositories.NewUserRepository(),
		adminConfigService: NewAdminConfigService(),
	}
}

// RechargeWallet recharges a user's wallet
func (s *WalletService) RechargeWallet(userID uint, amount float64, paymentMethod string, referenceID string) (*models.WalletTransaction, error) {
	// Validate amount
	minRecharge := s.adminConfigService.GetMinRechargeAmount()
	maxRecharge := s.adminConfigService.GetMaxRechargeAmount()
	
	if amount < minRecharge {
		return nil, fmt.Errorf("minimum recharge amount is ₹%.2f", minRecharge)
	}
	
	if maxRecharge > 0 && amount > maxRecharge {
		return nil, fmt.Errorf("maximum recharge amount is ₹%.2f", maxRecharge)
	}

	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check wallet limit
	maxWalletBalance := s.adminConfigService.GetMaxWalletBalance()
	if maxWalletBalance > 0 && (user.WalletBalance+amount) > maxWalletBalance {
		return nil, fmt.Errorf("wallet balance cannot exceed ₹%.2f", maxWalletBalance)
	}

	// Create transaction
	transaction := &models.WalletTransaction{
		UserID:          userID,
		TransactionType: models.TransactionTypeRecharge,
		Status:          models.TransactionStatusPending,
		PaymentMethod:   paymentMethod,
		Amount:          amount,
		PreviousBalance: user.WalletBalance,
		NewBalance:      user.WalletBalance + amount,
		ReferenceID:     referenceID,
		Description:     fmt.Sprintf("Wallet recharge of ₹%.2f", amount),
	}

	// Save transaction
	if err := s.walletRepo.Create(transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// RechargeWalletImmediate immediately completes a wallet recharge (for testing/development)
func (s *WalletService) RechargeWalletImmediate(userID uint, amount float64, paymentMethod string, referenceID string) (*models.WalletTransaction, error) {
	// Get admin config for validation
	minRecharge, err := s.adminConfigService.GetFloatValue("min_recharge_amount")
	if err != nil || minRecharge <= 0 {
		minRecharge = 100 // Default minimum
	}

	maxRecharge, err := s.adminConfigService.GetFloatValue("max_recharge_amount")
	if err != nil || maxRecharge <= 0 {
		maxRecharge = 50000 // Default maximum
	}

	// Validate amount
	if amount < minRecharge {
		return nil, fmt.Errorf("minimum recharge amount is ₹%.2f", minRecharge)
	}

	if amount > maxRecharge {
		return nil, fmt.Errorf("maximum recharge amount is ₹%.2f", maxRecharge)
	}

	// Get user
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check wallet limit
	maxWalletBalance := s.adminConfigService.GetMaxWalletBalance()
	if maxWalletBalance > 0 && (user.WalletBalance+amount) > maxWalletBalance {
		return nil, fmt.Errorf("wallet balance cannot exceed ₹%.2f", maxWalletBalance)
	}

	// Start transaction
	db := s.userRepo.GetDB()
	tx := db.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	// Create transaction
	transaction := &models.WalletTransaction{
		UserID:          userID,
		TransactionType: models.TransactionTypeRecharge,
		Status:          models.TransactionStatusCompleted,
		PaymentMethod:   paymentMethod,
		Amount:          amount,
		PreviousBalance: user.WalletBalance,
		NewBalance:      user.WalletBalance + amount,
		ReferenceID:     referenceID,
		Description:     fmt.Sprintf("Wallet recharge of ₹%.2f", amount),
	}

	now := time.Now()
	transaction.ProcessedAt = &now

	// Save transaction
	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Update user wallet balance
	user.WalletBalance += amount
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update user wallet: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	logrus.Infof("Wallet recharge completed immediately for user %d: ₹%.2f", userID, amount)
	return transaction, nil
}

// CompleteRecharge completes a wallet recharge
func (s *WalletService) CompleteRecharge(transactionID uint) error {
	// Get transaction
	transaction, err := s.walletRepo.GetByID(transactionID)
	if err != nil {
		return fmt.Errorf("transaction not found: %w", err)
	}

	if transaction.Status != models.TransactionStatusPending {
		return errors.New("transaction is not pending")
	}

	if transaction.TransactionType != models.TransactionTypeRecharge {
		return errors.New("transaction is not a recharge")
	}

	// Update user wallet balance
	var user models.User
	if err := s.userRepo.FindByID(&user, transaction.UserID); err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	user.WalletBalance = transaction.NewBalance
	if err := s.userRepo.Update(&user); err != nil {
		return fmt.Errorf("failed to update user wallet: %w", err)
	}

	// Update transaction status
	transaction.Status = models.TransactionStatusCompleted
	now := time.Now()
	transaction.ProcessedAt = &now
	if err := s.walletRepo.Update(transaction); err != nil {
		return fmt.Errorf("failed to update transaction: %w", err)
	}

	logrus.Infof("Wallet recharge completed for user %d: ₹%.2f", transaction.UserID, transaction.Amount)
	return nil
}



// GetUserTransactions gets transactions for a user
func (s *WalletService) GetUserTransactions(userID uint, page, limit int) ([]models.WalletTransaction, int64, error) {
	offset := (page - 1) * limit
	
	transactions, err := s.walletRepo.GetTransactionsWithRelations(userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transactions: %w", err)
	}

	total, err := s.walletRepo.GetTransactionCount(userID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return transactions, total, nil
}

// GetUserTransactionsByType gets transactions for a user by type
func (s *WalletService) GetUserTransactionsByType(userID uint, transactionType models.TransactionType, page, limit int) ([]models.WalletTransaction, int64, error) {
	offset := (page - 1) * limit
	
	transactions, err := s.walletRepo.GetByUserIDAndType(userID, transactionType, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transactions: %w", err)
	}

	total, err := s.walletRepo.GetTransactionCountByType(userID, transactionType)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return transactions, total, nil
}

// GetUserTransactionsByDateRange gets transactions for a user within a date range
func (s *WalletService) GetUserTransactionsByDateRange(userID uint, startDate, endDate time.Time, page, limit int) ([]models.WalletTransaction, int64, error) {
	offset := (page - 1) * limit
	
	transactions, err := s.walletRepo.GetByDateRange(userID, startDate, endDate, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transactions: %w", err)
	}

	// For date range, we'll use a simple count query
	var total int64
	db := s.userRepo.GetDB()
	err = db.Model(&models.WalletTransaction{}).
		Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, startDate, endDate).
		Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return transactions, total, nil
}

// GetUserWalletSummary gets a summary of user's wallet activity
func (s *WalletService) GetUserWalletSummary(userID uint) (map[string]interface{}, error) {
	var user models.User
	if err := s.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Get recent transactions
	recentTransactions, err := s.walletRepo.GetRecentTransactions(userID, 5)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent transactions: %w", err)
	}

	// Get total recharge amount
	totalRecharge, err := s.walletRepo.GetTotalAmountByType(userID, models.TransactionTypeRecharge)
	if err != nil {
		return nil, fmt.Errorf("failed to get total recharge: %w", err)
	}

	// Get total spent amount (service payments and subscriptions)
	totalSpent, err := s.walletRepo.GetTotalAmountByType(userID, models.TransactionTypeServicePayment)
	if err != nil {
		return nil, fmt.Errorf("failed to get total spent: %w", err)
	}

	// Get transaction count
	totalTransactions, err := s.walletRepo.GetTransactionCount(userID)
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
func (s *WalletService) AdminAdjustWallet(userID uint, amount float64, reason string, adminID uint) (*models.WalletTransaction, error) {
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

	// Create transaction
	transaction := &models.WalletTransaction{
		UserID:          userID,
		TransactionType: models.TransactionTypeAdminAdjustment,
		Status:          models.TransactionStatusCompleted,
		PaymentMethod:   string(models.PaymentMethodAdmin),
		Amount:          amount,
		PreviousBalance: user.WalletBalance,
		NewBalance:      newBalance,
		Description:     reason,
		AdminNotes:      &reason,
	}

	// Start transaction
	db := s.userRepo.GetDB()
	tx := db.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	// Save wallet transaction
	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Update user wallet balance
	user.WalletBalance = newBalance
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	logrus.Infof("Admin wallet adjustment for user %d by admin %d: ₹%.2f - %s", userID, adminID, amount, reason)
	return transaction, nil
}

// GetTransactionByReference gets a transaction by reference ID
func (s *WalletService) GetTransactionByReference(referenceID string) (*models.WalletTransaction, error) {
	return s.walletRepo.GetByReferenceID(referenceID)
}

// UpdateTransactionStatus updates the status of a transaction
func (s *WalletService) UpdateTransactionStatus(transactionID uint, status models.TransactionStatus) error {
	return s.walletRepo.UpdateStatus(transactionID, status)
}
