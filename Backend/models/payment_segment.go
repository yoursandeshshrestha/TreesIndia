package models

import (
	"time"

	"gorm.io/gorm"
)

// PaymentSegmentStatus represents the status of a payment segment
type PaymentSegmentStatus string

const (
	PaymentSegmentStatusPending  PaymentSegmentStatus = "pending"
	PaymentSegmentStatusPaid     PaymentSegmentStatus = "paid"
	PaymentSegmentStatusOverdue  PaymentSegmentStatus = "overdue"
	PaymentSegmentStatusCancelled PaymentSegmentStatus = "cancelled"
)

// PaymentSegment represents the payment segment model
type PaymentSegment struct {
	gorm.Model
	// Basic Information
	BookingID      uint                  `json:"booking_id" gorm:"not null"`
	SegmentNumber  int                   `json:"segment_number" gorm:"not null"`
	
	// Payment Details
	Amount         float64               `json:"amount" gorm:"not null"`
	DueDate        *time.Time            `json:"due_date"`
	Status         PaymentSegmentStatus  `json:"status" gorm:"default:'pending'"`
	
	// Payment Reference
	PaymentID      *uint                 `json:"payment_id"` // Reference to actual payment when paid
	PaidAt         *time.Time            `json:"paid_at"`
	
	// Additional Information
	Notes          string                `json:"notes"`
	
	// Relationships
	Booking        Booking               `json:"booking" gorm:"foreignKey:BookingID"`
	Payment        *Payment              `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}

// TableName returns the table name for PaymentSegment
func (PaymentSegment) TableName() string {
	return "payment_segments"
}

// PaymentSegmentRequest represents the request structure for creating a payment segment
type PaymentSegmentRequest struct {
	Amount   float64    `json:"amount" binding:"required,min=0"`
	DueDate  *time.Time `json:"due_date,omitempty"`
	Notes    string     `json:"notes,omitempty"`
}

// CreateSegmentPaymentRequest represents the request to create payment for a specific segment
type CreateSegmentPaymentRequest struct {
	SegmentNumber  int     `json:"segment_number" binding:"required,min=1"`
	Amount         float64 `json:"amount" binding:"required,min=0"`
	PaymentMethod  string  `json:"payment_method" binding:"required,oneof=razorpay wallet"`
}

// VerifySegmentPaymentRequest represents the request to verify segment payment
type VerifySegmentPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// PaymentSegmentInfo represents payment segment information in responses
type PaymentSegmentInfo struct {
	ID            uint                  `json:"id"`
	SegmentNumber int                   `json:"segment_number"`
	Amount        float64               `json:"amount"`
	DueDate       *time.Time            `json:"due_date"`
	Status        PaymentSegmentStatus  `json:"status"`
	PaidAt        *time.Time            `json:"paid_at"`
	Notes         string                `json:"notes"`
	PaymentID     *uint                 `json:"payment_id"`
	IsOverdue     bool                  `json:"is_overdue"`
	DaysUntilDue  *int                  `json:"days_until_due"`
}

// PaymentProgress represents the overall payment progress for a booking
type PaymentProgress struct {
	TotalAmount     float64               `json:"total_amount"`
	PaidAmount      float64               `json:"paid_amount"`
	RemainingAmount float64               `json:"remaining_amount"`
	TotalSegments   int                   `json:"total_segments"`
	PaidSegments    int                   `json:"paid_segments"`
	RemainingSegments int                 `json:"remaining_segments"`
	ProgressPercentage float64            `json:"progress_percentage"`
	Segments        []PaymentSegmentInfo  `json:"segments"`
}
