package services

import (
	"fmt"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type LedgerService struct {
	ledgerRepo *repositories.LedgerRepository
}

func NewLedgerService() *LedgerService {
	return &LedgerService{
		ledgerRepo: repositories.NewLedgerRepository(),
	}
}

// Ledger Entry Operations

// CreateEntry creates a new ledger entry
func (ls *LedgerService) CreateEntry(req *models.CreateLedgerEntryRequest, adminID uint) (*models.LedgerEntry, error) {
	// Validate entry type specific fields
	if req.EntryType == models.LedgerEntryTypePay && req.AmountToBePaid == nil {
		return nil, fmt.Errorf("amount_to_be_paid is required for pay entries")
	}
	if req.EntryType == models.LedgerEntryTypeReceive && req.AmountToReceive == nil {
		return nil, fmt.Errorf("amount_to_receive is required for receive entries")
	}

	entry := &models.LedgerEntry{
		EntryType:        req.EntryType,
		Name:             req.Name,
		Description:      req.Description,
		AmountToBePaid:   req.AmountToBePaid,
		AmountToReceive:  req.AmountToReceive,
		AmountPaid:       req.AmountPaid,
		AmountReceived:   req.AmountReceived,
		PaymentSource:    req.PaymentSource,
		Notes:            req.Notes,
		CreatedBy:        adminID,
	}

	// Calculate initial status
	entry.Status = entry.CalculateStatus()

	err := ls.ledgerRepo.Create(entry)
	if err != nil {
		return nil, fmt.Errorf("failed to create ledger entry: %v", err)
	}

	logrus.Infof("Created ledger entry %d: %s - %s", entry.ID, entry.EntryType, entry.Name)
	return entry, nil
}

// GetEntry gets a ledger entry by ID
func (ls *LedgerService) GetEntry(id uint) (*models.LedgerEntry, error) {
	entry, err := ls.ledgerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("ledger entry not found: %v", err)
	}
	
	// Calculate remaining amount
	remainingAmount := entry.GetRemainingAmount()
	entry.RemainingAmount = &remainingAmount
	
	return entry, nil
}

// UpdateEntry updates a ledger entry
func (ls *LedgerService) UpdateEntry(id uint, req *models.UpdateLedgerEntryRequest, adminID uint) (*models.LedgerEntry, error) {
	entry, err := ls.ledgerRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("ledger entry not found: %v", err)
	}

	// Update fields if provided
	if req.Name != nil {
		entry.Name = *req.Name
	}
	if req.Description != nil {
		entry.Description = *req.Description
	}
	if req.AmountToBePaid != nil {
		entry.AmountToBePaid = req.AmountToBePaid
	}
	if req.AmountToReceive != nil {
		entry.AmountToReceive = req.AmountToReceive
	}
	if req.AmountPaid != nil {
		entry.AmountPaid = req.AmountPaid
	}
	if req.AmountReceived != nil {
		entry.AmountReceived = req.AmountReceived
	}
	if req.PaymentSource != nil {
		entry.PaymentSource = req.PaymentSource
	}
	if req.Notes != nil {
		entry.Notes = *req.Notes
	}

	// Update metadata
	entry.UpdatedBy = &adminID

	// Recalculate status
	entry.Status = entry.CalculateStatus()

	err = ls.ledgerRepo.Update(entry)
	if err != nil {
		return nil, fmt.Errorf("failed to update ledger entry: %v", err)
	}

	// Calculate remaining amount
	remainingAmount := entry.GetRemainingAmount()
	entry.RemainingAmount = &remainingAmount

	logrus.Infof("Updated ledger entry %d: %s - %s", entry.ID, entry.EntryType, entry.Name)
	return entry, nil
}

// DeleteEntry soft deletes a ledger entry
func (ls *LedgerService) DeleteEntry(id uint) error {
	entry, err := ls.ledgerRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("ledger entry not found: %v", err)
	}

	err = ls.ledgerRepo.Delete(id)
	if err != nil {
		return fmt.Errorf("failed to delete ledger entry: %v", err)
	}

	logrus.Infof("Deleted ledger entry %d: %s - %s", entry.ID, entry.EntryType, entry.Name)
	return nil
}

// GetAllEntries gets all ledger entries with pagination and filters
func (ls *LedgerService) GetAllEntries(offset, limit int, entryType *models.LedgerEntryType, status *models.LedgerStatus, search string) ([]models.LedgerEntry, int64, error) {
	entries, total, err := ls.ledgerRepo.GetAll(offset, limit, entryType, status, search)
	if err != nil {
		return nil, 0, err
	}
	
	// Calculate remaining amount for each entry
	for i := range entries {
		remainingAmount := entries[i].GetRemainingAmount()
		entries[i].RemainingAmount = &remainingAmount
	}
	
	return entries, total, nil
}

// GetPendingPayments gets all pending payment entries
func (ls *LedgerService) GetPendingPayments() ([]models.LedgerEntry, error) {
	entries, err := ls.ledgerRepo.GetPendingPayments()
	if err != nil {
		return nil, err
	}
	
	// Calculate remaining amount for each entry
	for i := range entries {
		remainingAmount := entries[i].GetRemainingAmount()
		entries[i].RemainingAmount = &remainingAmount
	}
	
	return entries, nil
}

// GetPendingReceivables gets all pending receivable entries
func (ls *LedgerService) GetPendingReceivables() ([]models.LedgerEntry, error) {
	entries, err := ls.ledgerRepo.GetPendingReceivables()
	if err != nil {
		return nil, err
	}
	
	// Calculate remaining amount for each entry
	for i := range entries {
		remainingAmount := entries[i].GetRemainingAmount()
		entries[i].RemainingAmount = &remainingAmount
	}
	
	return entries, nil
}

// ProcessPayment processes a payment and updates balances
func (ls *LedgerService) ProcessPayment(entryID uint, req *models.ProcessPaymentRequest, adminID uint) (*models.LedgerEntry, error) {
	// Get the ledger entry
	entry, err := ls.ledgerRepo.GetByID(entryID)
	if err != nil {
		return nil, fmt.Errorf("ledger entry not found: %v", err)
	}

	// Validate entry type
	if entry.EntryType != models.LedgerEntryTypePay {
		return nil, fmt.Errorf("can only process payments for pay entries")
	}

	// Validate amount
	if entry.AmountToBePaid != nil && req.Amount > *entry.AmountToBePaid {
		return nil, fmt.Errorf("payment amount %.2f exceeds amount to be paid %.2f", req.Amount, *entry.AmountToBePaid)
	}

	// Process payment in balance
	err = ls.ledgerRepo.ProcessPayment(req.Amount, req.PaymentSource, adminID, req.Notes)
	if err != nil {
		return nil, fmt.Errorf("failed to process payment: %v", err)
	}

	// Update ledger entry
	entry.AmountPaid = &req.Amount
	entry.PaymentSource = &req.PaymentSource
	entry.Status = entry.CalculateStatus()
	entry.UpdatedBy = &adminID
	entry.Notes = req.Notes

	err = ls.ledgerRepo.Update(entry)
	if err != nil {
		return nil, fmt.Errorf("failed to update ledger entry: %v", err)
	}

	// Calculate remaining amount
	remainingAmount := entry.GetRemainingAmount()
	entry.RemainingAmount = &remainingAmount

	logrus.Infof("Processed payment for entry %d: %.2f from %s", entryID, req.Amount, req.PaymentSource)
	return entry, nil
}

// ProcessReceive processes a receive and updates balances
func (ls *LedgerService) ProcessReceive(entryID uint, req *models.ProcessPaymentRequest, adminID uint) (*models.LedgerEntry, error) {
	// Get the ledger entry
	entry, err := ls.ledgerRepo.GetByID(entryID)
	if err != nil {
		return nil, fmt.Errorf("ledger entry not found: %v", err)
	}

	// Validate entry type
	if entry.EntryType != models.LedgerEntryTypeReceive {
		return nil, fmt.Errorf("can only process receives for receive entries")
	}

	// Validate amount
	if entry.AmountToReceive != nil && req.Amount > *entry.AmountToReceive {
		return nil, fmt.Errorf("receive amount %.2f exceeds amount to be received %.2f", req.Amount, *entry.AmountToReceive)
	}

	// Process receive in balance
	err = ls.ledgerRepo.ProcessReceive(req.Amount, req.PaymentSource, adminID, req.Notes)
	if err != nil {
		return nil, fmt.Errorf("failed to process receive: %v", err)
	}

	// Update ledger entry
	entry.AmountReceived = &req.Amount
	entry.PaymentSource = &req.PaymentSource
	entry.Status = entry.CalculateStatus()
	entry.UpdatedBy = &adminID
	entry.Notes = req.Notes

	err = ls.ledgerRepo.Update(entry)
	if err != nil {
		return nil, fmt.Errorf("failed to update ledger entry: %v", err)
	}

	// Calculate remaining amount
	remainingAmount := entry.GetRemainingAmount()
	entry.RemainingAmount = &remainingAmount

	logrus.Infof("Processed receive for entry %d: %.2f to %s", entryID, req.Amount, req.PaymentSource)
	return entry, nil
}

// Cash/Bank Balance Operations

// GetCurrentBalance gets the current cash/bank balance
func (ls *LedgerService) GetCurrentBalance() (*models.CashBankBalance, error) {
	return ls.ledgerRepo.GetCurrentBalance()
}

// UpdateBalance updates the cash/bank balance
func (ls *LedgerService) UpdateBalance(req *models.UpdateBalanceRequest, adminID uint) (*models.CashBankBalance, error) {
	balance, err := ls.ledgerRepo.GetCurrentBalance()
	if err != nil {
		return nil, fmt.Errorf("failed to get current balance: %v", err)
	}

	// Update fields if provided
	if req.CashInHand != nil {
		balance.CashInHand = *req.CashInHand
	}
	if req.BankBalance != nil {
		balance.BankBalance = *req.BankBalance
	}
	balance.Notes = req.Notes
	balance.LastUpdatedBy = adminID

	err = ls.ledgerRepo.UpdateBalance(balance)
	if err != nil {
		return nil, fmt.Errorf("failed to update balance: %v", err)
	}

	logrus.Infof("Updated balance: Cash=%.2f, Bank=%.2f", balance.CashInHand, balance.BankBalance)
	return balance, nil
}

// GetSummary gets the financial summary
func (ls *LedgerService) GetSummary() (*models.LedgerSummaryResponse, error) {
	summary, err := ls.ledgerRepo.GetSummary()
	if err != nil {
		return nil, fmt.Errorf("failed to get summary: %v", err)
	}

	// Get current balance
	balance, err := ls.ledgerRepo.GetCurrentBalance()
	if err != nil {
		return nil, fmt.Errorf("failed to get current balance: %v", err)
	}

	summary.CashInHand = balance.CashInHand
	summary.BankBalance = balance.BankBalance
	summary.TotalAvailable = balance.GetTotalBalance()

	return summary, nil
}

// CreateInitialBalance creates the initial balance record if it doesn't exist
func (ls *LedgerService) CreateInitialBalance(adminID uint) error {
	return ls.ledgerRepo.CreateInitialBalance(adminID)
}
