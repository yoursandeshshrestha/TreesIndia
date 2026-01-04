package repositories

import (
	"fmt"
	"treesindia/models"
)

type LedgerRepository struct {
	*BaseRepository
}

func NewLedgerRepository() *LedgerRepository {
	return &LedgerRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// Ledger Entry Operations

// Create creates a new ledger entry
func (lr *LedgerRepository) Create(entry *models.LedgerEntry) error {
	return lr.db.Create(entry).Error
}

// GetByID gets a ledger entry by ID
func (lr *LedgerRepository) GetByID(id uint) (*models.LedgerEntry, error) {
	var entry models.LedgerEntry
	err := lr.db.Preload("CreatedByUser").Preload("UpdatedByUser").First(&entry, id).Error
	if err != nil {
		return nil, err
	}
	return &entry, nil
}

// Update updates a ledger entry
func (lr *LedgerRepository) Update(entry *models.LedgerEntry) error {
	return lr.db.Save(entry).Error
}

// Delete soft deletes a ledger entry
func (lr *LedgerRepository) Delete(id uint) error {
	return lr.db.Delete(&models.LedgerEntry{}, id).Error
}

// GetAll gets all ledger entries with pagination and filters
func (lr *LedgerRepository) GetAll(offset, limit int, entryType *models.LedgerEntryType, status *models.LedgerStatus, search string) ([]models.LedgerEntry, int64, error) {
	var entries []models.LedgerEntry
	var total int64

	query := lr.db.Model(&models.LedgerEntry{}).Preload("CreatedByUser").Preload("UpdatedByUser")

	// Apply filters
	if entryType != nil {
		query = query.Where("entry_type = ?", *entryType)
	}
	if status != nil {
		query = query.Where("status = ?", *status)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ? OR notes ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&entries).Error
	return entries, total, err
}

// GetPendingPayments gets all pending payment entries
func (lr *LedgerRepository) GetPendingPayments() ([]models.LedgerEntry, error) {
	var entries []models.LedgerEntry
	err := lr.db.Where("entry_type = ? AND status IN ?", 
		models.LedgerEntryTypePay, 
		[]models.LedgerStatus{models.LedgerStatusPending, models.LedgerStatusPartial}).
		Preload("CreatedByUser").Preload("UpdatedByUser").
		Order("created_at DESC").Find(&entries).Error
	return entries, err
}

// GetPendingReceivables gets all pending receivable entries
func (lr *LedgerRepository) GetPendingReceivables() ([]models.LedgerEntry, error) {
	var entries []models.LedgerEntry
	err := lr.db.Where("entry_type = ? AND status IN ?", 
		models.LedgerEntryTypeReceive, 
		[]models.LedgerStatus{models.LedgerStatusPending, models.LedgerStatusPartial}).
		Preload("CreatedByUser").Preload("UpdatedByUser").
		Order("created_at DESC").Find(&entries).Error
	return entries, err
}

// GetSummary gets financial summary
func (lr *LedgerRepository) GetSummary() (*models.LedgerSummaryResponse, error) {
	var result models.LedgerSummaryResponse

	// Get total amounts to be paid (original amount)
	var totalToBePaidOriginal float64
	err := lr.db.Model(&models.LedgerEntry{}).
		Where("entry_type = ?", models.LedgerEntryTypePay).
		Select("COALESCE(SUM(amount_to_be_paid), 0)").
		Scan(&totalToBePaidOriginal).Error
	if err != nil {
		return nil, err
	}

	// Get total amounts to be received (original amount)
	var totalToBeReceivedOriginal float64
	err = lr.db.Model(&models.LedgerEntry{}).
		Where("entry_type = ?", models.LedgerEntryTypeReceive).
		Select("COALESCE(SUM(amount_to_receive), 0)").
		Scan(&totalToBeReceivedOriginal).Error
	if err != nil {
		return nil, err
	}

	// Get total paid
	var totalPaid float64
	err = lr.db.Model(&models.LedgerEntry{}).
		Where("entry_type = ?", models.LedgerEntryTypePay).
		Select("COALESCE(SUM(amount_paid), 0)").
		Scan(&totalPaid).Error
	if err != nil {
		return nil, err
	}

	// Get total received
	var totalReceived float64
	err = lr.db.Model(&models.LedgerEntry{}).
		Where("entry_type = ?", models.LedgerEntryTypeReceive).
		Select("COALESCE(SUM(amount_received), 0)").
		Scan(&totalReceived).Error
	if err != nil {
		return nil, err
	}

	// Calculate remaining amounts (what's still pending)
	result.TotalToBePaid = totalToBePaidOriginal - totalPaid    // Remaining to be paid
	result.TotalToBeReceived = totalToBeReceivedOriginal - totalReceived  // Remaining to be received
	result.TotalPaid = totalPaid
	result.TotalReceived = totalReceived

	return &result, nil
}

// Cash/Bank Balance Operations

// GetCurrentBalance gets the current cash/bank balance
func (lr *LedgerRepository) GetCurrentBalance() (*models.CashBankBalance, error) {
	var balance models.CashBankBalance
	err := lr.db.Preload("LastUpdatedByUser").First(&balance).Error
	if err != nil {
		// If no record exists, create one with the first admin user
		var adminUser models.User
		err = lr.db.Where("user_type = ?", "admin").First(&adminUser).Error
		if err != nil {
			return nil, fmt.Errorf("no admin user found to create initial balance record")
		}
		
		balance = models.CashBankBalance{
			CashInHand:     0,
			BankBalance:    0,
			LastUpdatedBy:  adminUser.ID,
			Notes:          "Initial balance record",
		}
		
		err = lr.db.Create(&balance).Error
		if err != nil {
			return nil, fmt.Errorf("failed to create initial balance record: %w", err)
		}
	}
	return &balance, nil
}

// UpdateBalance updates the cash/bank balance
func (lr *LedgerRepository) UpdateBalance(balance *models.CashBankBalance) error {
	return lr.db.Save(balance).Error
}

// CreateInitialBalance creates the initial balance record if it doesn't exist
func (lr *LedgerRepository) CreateInitialBalance(adminID uint) error {
	var count int64
	err := lr.db.Model(&models.CashBankBalance{}).Count(&count).Error
	if err != nil {
		return err
	}

	if count == 0 {
		balance := &models.CashBankBalance{
			CashInHand:     0,
			BankBalance:     0,
			LastUpdatedBy:   adminID,
			Notes:          "Initial balance record",
		}
		return lr.db.Create(balance).Error
	}

	return nil
}

// UpdateBalanceAmounts updates cash and bank balances
func (lr *LedgerRepository) UpdateBalanceAmounts(cashInHand, bankBalance float64, adminID uint, notes string) error {
	balance, err := lr.GetCurrentBalance()
	if err != nil {
		return err
	}

	balance.CashInHand = cashInHand
	balance.BankBalance = bankBalance
	balance.LastUpdatedBy = adminID
	balance.Notes = notes

	return lr.UpdateBalance(balance)
}

// ProcessPayment updates balance when payment is made
func (lr *LedgerRepository) ProcessPayment(amount float64, source models.PaymentSource, adminID uint, notes string) error {
	balance, err := lr.GetCurrentBalance()
	if err != nil {
		return err
	}

	// Subtract from the appropriate balance
	if source == models.PaymentSourceCash {
		if balance.CashInHand < amount {
			return fmt.Errorf("insufficient cash balance. Available: %.2f, Required: %.2f", balance.CashInHand, amount)
		}
		balance.CashInHand -= amount
	} else if source == models.PaymentSourceBank {
		if balance.BankBalance < amount {
			return fmt.Errorf("insufficient bank balance. Available: %.2f, Required: %.2f", balance.BankBalance, amount)
		}
		balance.BankBalance -= amount
	}

	// Update transaction tracking
	balance.LastTransactionAmount = amount
	balance.LastTransactionType = "payment"
	balance.LastTransactionSource = string(source)
	balance.LastUpdatedBy = adminID
	balance.Notes = notes

	err = lr.UpdateBalance(balance)
	if err != nil {
		return err
	}

	return nil
}

// ProcessReceive updates balance when money is received
func (lr *LedgerRepository) ProcessReceive(amount float64, source models.PaymentSource, adminID uint, notes string) error {
	balance, err := lr.GetCurrentBalance()
	if err != nil {
		return err
	}

	// Add to the appropriate balance
	if source == models.PaymentSourceCash {
		balance.CashInHand += amount
	} else if source == models.PaymentSourceBank {
		balance.BankBalance += amount
	}

	// Update transaction tracking
	balance.LastTransactionAmount = amount
	balance.LastTransactionType = "receive"
	balance.LastTransactionSource = string(source)
	balance.LastUpdatedBy = adminID
	balance.Notes = notes

	return lr.UpdateBalance(balance)
}
