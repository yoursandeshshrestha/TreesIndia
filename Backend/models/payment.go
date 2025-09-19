package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// PaymentType represents the type of payment
type PaymentType string

const (
	PaymentTypeBooking     PaymentType = "booking"
	PaymentTypeSubscription PaymentType = "subscription"
	PaymentTypeWalletRecharge PaymentType = "wallet_recharge"
	PaymentTypeWalletDebit PaymentType = "wallet_debit"
	PaymentTypeRefund      PaymentType = "refund"
	PaymentTypeSegmentPay  PaymentType = "segment_pay"
	PaymentTypeQuote       PaymentType = "quote"
	PaymentTypeManual      PaymentType = "manual"
)




// JSONMap represents a JSON object that can be stored in the database
type JSONMap map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, j)
	case string:
		return json.Unmarshal([]byte(v), j)
	default:
		return nil
	}
}



// Payment represents the payment model
type Payment struct {
	gorm.Model
	// Basic Information
	PaymentReference string        `json:"payment_reference" gorm:"uniqueIndex;not null"`
	UserID           uint          `json:"user_id" gorm:"not null"`
	
	// Payment Details
	Amount           float64       `json:"amount" gorm:"not null"`
	Currency         string        `json:"currency" gorm:"default:'INR'"`
	Status           PaymentStatus `json:"status" gorm:"default:'pending'"`
	Type             PaymentType   `json:"type" gorm:"not null"`
	Method           string        `json:"method" gorm:"not null"`
	
	// Related Entity (Booking, Subscription, etc.)
	RelatedEntityType string       `json:"related_entity_type"` // "booking", "subscription", etc.
	RelatedEntityID   uint         `json:"related_entity_id"`   // ID of the related entity
	
	// Razorpay Details
	RazorpayOrderID   *string      `json:"razorpay_order_id"`
	RazorpayPaymentID *string      `json:"razorpay_payment_id"`
	RazorpaySignature *string      `json:"razorpay_signature"`
	
	// Payment Timing
	InitiatedAt      time.Time     `json:"initiated_at" gorm:"not null"`
	CompletedAt      *time.Time    `json:"completed_at"`
	FailedAt         *time.Time    `json:"failed_at"`
	RefundedAt       *time.Time    `json:"refunded_at"`
	
	// Wallet-specific fields (for wallet operations)
	BalanceAfter     *float64      `json:"balance_after"` // User's wallet balance after this transaction
	
	// Refund Information
	RefundAmount     *float64      `json:"refund_amount"`
	RefundReason     *string       `json:"refund_reason"`
	RefundMethod     *string        `json:"refund_method"`
	
	// Additional Information
	Description      string        `json:"description"`
	Notes            string        `json:"notes"`
	Metadata         *JSONMap      `json:"metadata" gorm:"type:jsonb"` // Additional data as JSON
	
	// Relationships
	User             User          `json:"user" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for Payment
func (Payment) TableName() string {
	return "payments"
}

// CreatePaymentRequest represents the request structure for creating a payment
type CreatePaymentRequest struct {
	UserID             uint          `json:"user_id" binding:"required"`
	Amount             float64       `json:"amount" binding:"required"`
	Currency           string        `json:"currency"`
	Type               PaymentType   `json:"type" binding:"required"`
	Method             string        `json:"method" binding:"required"`
	RelatedEntityType  string        `json:"related_entity_type" binding:"required"`
	RelatedEntityID    uint          `json:"related_entity_id" binding:"required"`
	Description        string        `json:"description"`
	Notes              string        `json:"notes"`
	Metadata           *JSONMap      `json:"metadata"`
}

// UpdatePaymentStatusRequest represents the request structure for updating payment status
type UpdatePaymentStatusRequest struct {
	Status        PaymentStatus `json:"status" binding:"required"`
	RazorpayOrderID   *string    `json:"razorpay_order_id"`
	RazorpayPaymentID *string    `json:"razorpay_payment_id"`
	RazorpaySignature *string    `json:"razorpay_signature"`
	Notes         string        `json:"notes"`
}

// RefundPaymentRequest represents the request structure for refunding a payment
type RefundPaymentRequest struct {
	RefundAmount  float64       `json:"refund_amount" binding:"required"`
	RefundReason  string        `json:"refund_reason" binding:"required"`
	RefundMethod  string        `json:"refund_method"`
	Notes         string        `json:"notes"`
}

// PaymentFilters represents filters for payment queries
type PaymentFilters struct {
	UserID            *uint          `json:"user_id"`
	Status            PaymentStatus  `json:"status"`
	Type              PaymentType    `json:"type"`
	Method            string         `json:"method"`
	RelatedEntityType string         `json:"related_entity_type"`
	RelatedEntityID   *uint          `json:"related_entity_id"`
	StartDate         string         `json:"start_date"`
	EndDate           string         `json:"end_date"`
	Page              int            `json:"page"`
	Limit             int            `json:"limit"`
}

// AdminPaymentFilters represents comprehensive filters for admin payment queries
type AdminPaymentFilters struct {
	PaymentFilters
	Search            string         `json:"search"`            // Search in payment reference, description, user name
	MinAmount         *float64       `json:"min_amount"`        // Minimum amount filter
	MaxAmount         *float64       `json:"max_amount"`        // Maximum amount filter
	UserEmail         string         `json:"user_email"`        // Filter by user email
	UserPhone         string         `json:"user_phone"`        // Filter by user phone
	SortBy            string         `json:"sort_by"`           // Sort field (amount, created_at, etc.)
	SortOrder         string         `json:"sort_order"`        // Sort order (asc, desc)
}

// AdminTransactionStats represents essential transaction statistics for admin dashboard
type AdminTransactionStats struct {
	TotalTransactions     int64   `json:"total_transactions"`
	TotalAmount           float64 `json:"total_amount"`
	CompletedTransactions int64   `json:"completed_transactions"`
	PendingTransactions   int64   `json:"pending_transactions"`
	FailedTransactions    int64   `json:"failed_transactions"`
}

// TransactionExportRequest represents request for exporting transactions
type TransactionExportRequest struct {
	Filters            AdminPaymentFilters `json:"filters"`
	Format             string              `json:"format"`              // csv, excel
	IncludeUserDetails bool                `json:"include_user_details"` // Include user name, email, phone
	IncludeMetadata    bool                `json:"include_metadata"`    // Include payment metadata
}

// ManualTransactionRequest represents the request structure for creating a manual transaction
type ManualTransactionRequest struct {
	UserID             uint          `json:"user_id,omitempty"`
	Amount             float64       `json:"amount" binding:"required"`
	Currency           string        `json:"currency"`
	Type               PaymentType   `json:"type" binding:"required"`
	Method             string        `json:"method" binding:"required"`
	RelatedEntityType  string        `json:"related_entity_type"`
	RelatedEntityID    uint          `json:"related_entity_id"`
	Description        string        `json:"description" binding:"required"`
	Notes              string        `json:"notes"`
	Metadata           *JSONMap      `json:"metadata"`
	Status             PaymentStatus `json:"status"` // For manual transactions, can be set directly
}
