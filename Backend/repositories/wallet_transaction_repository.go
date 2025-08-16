package repositories

import (
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// WalletTransactionRepository handles database operations for wallet transactions
type WalletTransactionRepository struct {
	db *gorm.DB
}

// NewWalletTransactionRepository creates a new wallet transaction repository
func NewWalletTransactionRepository() *WalletTransactionRepository {
	return &WalletTransactionRepository{
		db: database.GetDB(),
	}
}

// Create creates a new wallet transaction
func (r *WalletTransactionRepository) Create(transaction *models.WalletTransaction) error {
	return r.db.Create(transaction).Error
}

// GetByID retrieves a wallet transaction by ID
func (r *WalletTransactionRepository) GetByID(id uint) (*models.WalletTransaction, error) {
	var transaction models.WalletTransaction
	err := r.db.First(&transaction, id).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// GetByReferenceID retrieves a wallet transaction by reference ID
func (r *WalletTransactionRepository) GetByReferenceID(referenceID string) (*models.WalletTransaction, error) {
	var transaction models.WalletTransaction
	err := r.db.Where("reference_id = ?", referenceID).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// GetByUserID retrieves all transactions for a user
func (r *WalletTransactionRepository) GetByUserID(userID uint, limit, offset int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}

// GetByUserIDAndType retrieves transactions for a user by type
func (r *WalletTransactionRepository) GetByUserIDAndType(userID uint, transactionType models.TransactionType, limit, offset int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("user_id = ? AND transaction_type = ?", userID, transactionType).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}

// GetByUserIDAndStatus retrieves transactions for a user by status
func (r *WalletTransactionRepository) GetByUserIDAndStatus(userID uint, status models.TransactionStatus, limit, offset int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("user_id = ? AND status = ?", userID, status).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}

// GetByDateRange retrieves transactions within a date range
func (r *WalletTransactionRepository) GetByDateRange(userID uint, startDate, endDate time.Time, limit, offset int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, startDate, endDate).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}

// GetPendingTransactions retrieves all pending transactions
func (r *WalletTransactionRepository) GetPendingTransactions() ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("status = ?", models.TransactionStatusPending).
		Order("created_at ASC").
		Find(&transactions).Error
	return transactions, err
}

// GetFailedTransactions retrieves all failed transactions
func (r *WalletTransactionRepository) GetFailedTransactions() ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("status = ?", models.TransactionStatusFailed).
		Order("created_at DESC").
		Find(&transactions).Error
	return transactions, err
}

// Update updates a wallet transaction
func (r *WalletTransactionRepository) Update(transaction *models.WalletTransaction) error {
	return r.db.Save(transaction).Error
}

// UpdateStatus updates the status of a transaction
func (r *WalletTransactionRepository) UpdateStatus(id uint, status models.TransactionStatus) error {
	return r.db.Model(&models.WalletTransaction{}).Where("id = ?", id).Update("status", status).Error
}

// Delete soft deletes a wallet transaction
func (r *WalletTransactionRepository) Delete(id uint) error {
	return r.db.Delete(&models.WalletTransaction{}, id).Error
}

// GetTransactionCount gets the total count of transactions for a user
func (r *WalletTransactionRepository) GetTransactionCount(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.WalletTransaction{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// GetTransactionCountByType gets the count of transactions by type for a user
func (r *WalletTransactionRepository) GetTransactionCountByType(userID uint, transactionType models.TransactionType) (int64, error) {
	var count int64
	err := r.db.Model(&models.WalletTransaction{}).Where("user_id = ? AND transaction_type = ?", userID, transactionType).Count(&count).Error
	return count, err
}

// GetTotalAmountByType gets the total amount of transactions by type for a user
func (r *WalletTransactionRepository) GetTotalAmountByType(userID uint, transactionType models.TransactionType) (float64, error) {
	var total float64
	err := r.db.Model(&models.WalletTransaction{}).
		Where("user_id = ? AND transaction_type = ? AND status = ?", userID, transactionType, models.TransactionStatusCompleted).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

// GetTotalAmountByDateRange gets the total amount of transactions within a date range
func (r *WalletTransactionRepository) GetTotalAmountByDateRange(userID uint, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.db.Model(&models.WalletTransaction{}).
		Where("user_id = ? AND created_at BETWEEN ? AND ? AND status = ?", userID, startDate, endDate, models.TransactionStatusCompleted).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

// GetRecentTransactions gets recent transactions for a user
func (r *WalletTransactionRepository) GetRecentTransactions(userID uint, limit int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&transactions).Error
	return transactions, err
}

// GetTransactionsWithRelations gets transactions with related data
func (r *WalletTransactionRepository) GetTransactionsWithRelations(userID uint, limit, offset int) ([]models.WalletTransaction, error) {
	var transactions []models.WalletTransaction
	err := r.db.Preload("User").
		Preload("Service").
		Preload("Property").
		Preload("Subscription").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}
