package models

import (
	"time"

	"gorm.io/gorm"
)

// TransactionType represents the type of wallet transaction
type TransactionType string

const (
	TransactionTypeRecharge       TransactionType = "recharge"
	TransactionTypeServicePayment TransactionType = "service_payment"
	TransactionTypeRefund         TransactionType = "refund"
	TransactionTypeAdminAdjustment TransactionType = "admin_adjustment"
	TransactionTypeSubscription   TransactionType = "subscription"
)

// TransactionStatus represents the status of a wallet transaction
type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCompleted TransactionStatus = "completed"
	TransactionStatusFailed    TransactionStatus = "failed"
	TransactionStatusCancelled TransactionStatus = "cancelled"
)

// PaymentMethod represents the payment method used
type PaymentMethod string

const (
	PaymentMethodAdmin PaymentMethod = "admin"
)

// WalletTransaction represents a wallet transaction
type WalletTransaction struct {
	gorm.Model
	// Basic Information
	UserID          uint              `json:"user_id" gorm:"not null"`
	TransactionType TransactionType   `json:"transaction_type" gorm:"not null"`
	Status          TransactionStatus `json:"status" gorm:"not null;default:'pending'"`
	
	// Amount Information
	Amount          float64 `json:"amount" gorm:"not null"`           // Transaction amount
	BalanceAfter    float64 `json:"balance_after" gorm:"not null"`    // User's balance after transaction (current schema)
	
	// Reference Information
	ReferenceID     string  `json:"reference_id" gorm:"uniqueIndex"` // External payment reference (Razorpay order ID, etc.)
	Description     string  `json:"description"`                      // Human-readable description
	
	// Related Entities (optional)
	RelatedUserID   *uint   `json:"related_user_id"` // For transfers between users
	ServiceID       *uint   `json:"service_id"`       // For service payments
	PropertyID      *uint   `json:"property_id"`      // For property-related transactions
	SubscriptionID  *uint   `json:"subscription_id"`  // For subscription payments
	
	// Relationships
	User            *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	RelatedUser     *User     `json:"related_user,omitempty" gorm:"foreignKey:RelatedUserID"`
	Service         *Service  `json:"service,omitempty" gorm:"foreignKey:ServiceID"`
	Property        *Property `json:"property,omitempty" gorm:"foreignKey:PropertyID"`
	Subscription    *UserSubscription `json:"subscription,omitempty" gorm:"foreignKey:SubscriptionID"`
}

// TableName returns the table name for WalletTransaction
func (WalletTransaction) TableName() string {
	return "wallet_transactions"
}

// BeforeCreate is a GORM hook that runs before creating a transaction
func (wt *WalletTransaction) BeforeCreate(tx *gorm.DB) error {
	// Generate reference ID if not provided
	if wt.ReferenceID == "" {
		wt.ReferenceID = generateTransactionReference()
	}
	
	return nil
}

// IsDebit checks if this transaction reduces the wallet balance
func (wt *WalletTransaction) IsDebit() bool {
	return wt.TransactionType == TransactionTypeServicePayment ||
		   wt.TransactionType == TransactionTypeSubscription
}

// IsCredit checks if this transaction increases the wallet balance
func (wt *WalletTransaction) IsCredit() bool {
	return wt.TransactionType == TransactionTypeRecharge ||
		   wt.TransactionType == TransactionTypeRefund ||
		   wt.TransactionType == TransactionTypeAdminAdjustment
}

// GetTransactionDescription returns a human-readable description
func (wt *WalletTransaction) GetTransactionDescription() string {
	if wt.Description != "" {
		return wt.Description
	}
	
	switch wt.TransactionType {
	case TransactionTypeRecharge:
		return "Wallet recharge"
	case TransactionTypeServicePayment:
		return "Service payment"
	case TransactionTypeRefund:
		return "Refund"
	case TransactionTypeAdminAdjustment:
		return "Admin adjustment"
	case TransactionTypeSubscription:
		return "Subscription payment"
	default:
		return "Wallet transaction"
	}
}

// generateTransactionReference generates a unique transaction reference
func generateTransactionReference() string {
	// Simple implementation - in production, use a more robust method
	return "TXN" + time.Now().Format("20060102150405") + generateRandomString(6)
}

// generateRandomString generates a random string of specified length
func generateRandomString(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
