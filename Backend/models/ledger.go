package models

import (
	"time"

	"gorm.io/gorm"
)

// LedgerEntryType represents the type of ledger entry
type LedgerEntryType string

const (
	LedgerEntryTypePay     LedgerEntryType = "pay"
	LedgerEntryTypeReceive LedgerEntryType = "receive"
)

// LedgerStatus represents the status of a ledger entry
type LedgerStatus string

const (
	LedgerStatusPending   LedgerStatus = "pending"
	LedgerStatusPartial   LedgerStatus = "partial"
	LedgerStatusCompleted LedgerStatus = "completed"
)

// PaymentSource represents the source of payment
type PaymentSource string

const (
	PaymentSourceCash PaymentSource = "cash"
	PaymentSourceBank PaymentSource = "bank"
)

// LedgerEntry represents a ledger entry model
type LedgerEntry struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	
	// Entry Details
	EntryType   LedgerEntryType `json:"entry_type" gorm:"not null"` // "pay" or "receive"
	Name        string          `json:"name" gorm:"not null"`       // "Sandesh Shrestha"
	Description string          `json:"description"`                  // "this is a salary"
	
	// Financial Details - For PAY entries
	AmountToBePaid *float64 `json:"amount_to_be_paid"` // 50000
	AmountPaid     *float64 `json:"amount_paid"`       // 10000
	
	// Financial Details - For RECEIVE entries
	AmountToReceive *float64 `json:"amount_to_receive"` // 100000
	AmountReceived  *float64 `json:"amount_received"`   // 50000
	
	// Calculated remaining amount (not stored in DB, calculated on demand)
	RemainingAmount *float64 `json:"remaining_amount" gorm:"-"` // Calculated field
	
	// Payment Source (for pay entries)
	PaymentSource *PaymentSource `json:"payment_source"` // "cash" or "bank"
	
	// Status
	Status LedgerStatus `json:"status" gorm:"default:'pending'"`
	
	// Additional Info
	Notes     string `json:"notes"`
	CreatedBy uint   `json:"created_by" gorm:"not null"`
	UpdatedBy *uint  `json:"updated_by"`
	
	// Relationships
	CreatedByUser User  `json:"created_by_user" gorm:"foreignKey:CreatedBy"`
	UpdatedByUser *User `json:"updated_by_user,omitempty" gorm:"foreignKey:UpdatedBy"`
}

// TableName returns the table name for LedgerEntry
func (LedgerEntry) TableName() string {
	return "ledger_entries"
}

// CalculateStatus calculates the status based on amounts
func (le *LedgerEntry) CalculateStatus() LedgerStatus {
	if le.EntryType == LedgerEntryTypePay {
		if le.AmountPaid == nil || *le.AmountPaid == 0 {
			return LedgerStatusPending
		}
		if le.AmountToBePaid != nil && *le.AmountPaid >= *le.AmountToBePaid {
			return LedgerStatusCompleted
		}
		return LedgerStatusPartial
	} else { // Receive
		if le.AmountReceived == nil || *le.AmountReceived == 0 {
			return LedgerStatusPending
		}
		if le.AmountToReceive != nil && *le.AmountReceived >= *le.AmountToReceive {
			return LedgerStatusCompleted
		}
		return LedgerStatusPartial
	}
}

// GetRemainingAmount calculates the remaining amount to be paid or received
func (le *LedgerEntry) GetRemainingAmount() float64 {
	if le.EntryType == LedgerEntryTypePay {
		if le.AmountToBePaid == nil {
			return 0
		}
		amountPaid := 0.0
		if le.AmountPaid != nil {
			amountPaid = *le.AmountPaid
		}
		remaining := *le.AmountToBePaid - amountPaid
		if remaining < 0 {
			return 0
		}
		return remaining
	} else { // Receive
		if le.AmountToReceive == nil {
			return 0
		}
		amountReceived := 0.0
		if le.AmountReceived != nil {
			amountReceived = *le.AmountReceived
		}
		remaining := *le.AmountToReceive - amountReceived
		if remaining < 0 {
			return 0
		}
		return remaining
	}
}

// CashBankBalance represents the cash and bank balance model
type CashBankBalance struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	
	// Balance Details
	CashInHand  float64 `json:"cash_in_hand" gorm:"default:0"`  // 500000
	BankBalance float64 `json:"bank_balance" gorm:"default:0"`  // 100000
	
	// Track changes
	LastTransactionAmount float64 `json:"last_transaction_amount"`
	LastTransactionType   string  `json:"last_transaction_type"`   // "payment", "receive", "adjustment"
	LastTransactionSource string  `json:"last_transaction_source"` // "cash", "bank"
	
	// Additional Info
	LastUpdatedBy uint   `json:"last_updated_by" gorm:"not null"`
	Notes         string `json:"notes"`
	
	// Relationships
	LastUpdatedByUser User `json:"last_updated_by_user" gorm:"foreignKey:LastUpdatedBy"`
}

// TableName returns the table name for CashBankBalance
func (CashBankBalance) TableName() string {
	return "cash_bank_balances"
}

// GetTotalBalance returns the total available balance
func (cbb *CashBankBalance) GetTotalBalance() float64 {
	return cbb.CashInHand + cbb.BankBalance
}

// Request structures for API
type CreateLedgerEntryRequest struct {
	EntryType        LedgerEntryType `json:"entry_type" binding:"required"`
	Name             string          `json:"name" binding:"required"`
	Description      string          `json:"description"`
	AmountToBePaid   *float64        `json:"amount_to_be_paid"`
	AmountToReceive  *float64        `json:"amount_to_receive"`
	AmountPaid       *float64        `json:"amount_paid"`
	AmountReceived   *float64        `json:"amount_received"`
	PaymentSource    *PaymentSource  `json:"payment_source"`
	Notes            string          `json:"notes"`
}

type UpdateLedgerEntryRequest struct {
	Name             *string         `json:"name"`
	Description      *string         `json:"description"`
	AmountToBePaid   *float64        `json:"amount_to_be_paid"`
	AmountToReceive  *float64        `json:"amount_to_receive"`
	AmountPaid       *float64        `json:"amount_paid"`
	AmountReceived   *float64        `json:"amount_received"`
	PaymentSource    *PaymentSource  `json:"payment_source"`
	Notes            *string         `json:"notes"`
}

type ProcessPaymentRequest struct {
	Amount        float64       `json:"amount" binding:"required"`
	PaymentSource PaymentSource `json:"payment_source" binding:"required"`
	Notes         string        `json:"notes"`
}

type UpdateBalanceRequest struct {
	CashInHand  *float64 `json:"cash_in_hand"`
	BankBalance *float64 `json:"bank_balance"`
	Notes       string   `json:"notes"`
}

// Response structures
type LedgerSummaryResponse struct {
	TotalToBePaid     float64 `json:"total_to_be_paid"`     // Remaining amount to be paid (after deducting paid amounts)
	TotalToBeReceived float64 `json:"total_to_be_received"` // Remaining amount to be received (after deducting received amounts)
	TotalPaid         float64 `json:"total_paid"`           // Total amount already paid
	TotalReceived     float64 `json:"total_received"`       // Total amount already received
	CashInHand        float64 `json:"cash_in_hand"`
	BankBalance       float64 `json:"bank_balance"`
	TotalAvailable    float64 `json:"total_available"`
}
