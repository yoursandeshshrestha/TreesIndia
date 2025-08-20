package models

import (
	"time"

	"gorm.io/gorm"
)

// BookingStatus represents the booking status
type BookingStatus string

const (
	BookingStatusPending        BookingStatus = "pending"
	BookingStatusPaymentPending BookingStatus = "payment_pending"
	BookingStatusConfirmed      BookingStatus = "confirmed"
	BookingStatusAssigned       BookingStatus = "assigned"
	BookingStatusInProgress     BookingStatus = "in_progress"
	BookingStatusCompleted      BookingStatus = "completed"
	BookingStatusTimeExpired    BookingStatus = "time_expired"
	BookingStatusCancelled      BookingStatus = "cancelled"
)

// BookingType represents the type of booking
type BookingType string

const (
	BookingTypeRegular BookingType = "regular"
	BookingTypeInquiry BookingType = "inquiry"
)

// PaymentStatus represents the payment status
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

// CompletionType represents how the service was completed
type CompletionType string

const (
	CompletionTypeManual      CompletionType = "manual"
	CompletionTypeTimeExpired CompletionType = "time_expired"
	CompletionTypeAdminForced CompletionType = "admin_forced"
)

// Booking represents the booking model
type Booking struct {
	gorm.Model
	// Basic Information
	BookingReference string        `json:"booking_reference" gorm:"uniqueIndex;not null"`
	UserID           uint          `json:"user_id" gorm:"not null"`
	ServiceID        uint          `json:"service_id" gorm:"not null"`
	
	// Status and Type
	Status           BookingStatus `json:"status" gorm:"default:'pending'"`
	PaymentStatus    PaymentStatus `json:"payment_status" gorm:"default:'pending'"`
	BookingType      BookingType   `json:"booking_type" gorm:"default:'regular'"`
	CompletionType   *CompletionType `json:"completion_type"`
	
	// Scheduling
	ScheduledDate    *time.Time    `json:"scheduled_date"`
	ScheduledTime    *time.Time    `json:"scheduled_time"`
	ScheduledEndTime *time.Time    `json:"scheduled_end_time"`
	
	// Actual Times
	ActualStartTime  *time.Time    `json:"actual_start_time"`
	ActualEndTime    *time.Time    `json:"actual_end_time"`
	ActualDurationMinutes *int     `json:"actual_duration_minutes"`
	
	// Service Details
	Address          *string       `json:"address"`
	Description      string        `json:"description"`
	ContactPerson    string        `json:"contact_person"`
	ContactPhone     string        `json:"contact_phone"`
	SpecialInstructions string     `json:"special_instructions"`
	
	// Pricing
	TotalAmount      *float64      `json:"total_amount"`
	
	// Payment Information
	PaymentID        *string       `json:"payment_id"`
	RazorpayOrderID  *string       `json:"razorpay_order_id"`
	PaymentCompletedAt *time.Time  `json:"payment_completed_at"`
	
	// Relationships
	User             User          `json:"user" gorm:"foreignKey:UserID"`
	Service          Service       `json:"service" gorm:"foreignKey:ServiceID"`
	WorkerAssignment *WorkerAssignment `json:"worker_assignment,omitempty" gorm:"foreignKey:BookingID"`
	BufferRequests   []BufferRequest `json:"buffer_requests,omitempty" gorm:"foreignKey:BookingID"`
}

// TableName returns the table name for Booking
func (Booking) TableName() string {
	return "bookings"
}

// CreateBookingRequest represents the request structure for creating a booking
type CreateBookingRequest struct {
	ServiceID            uint      `json:"service_id" binding:"required"`
	ScheduledDate        string    `json:"scheduled_date" binding:"required"`
	ScheduledTime        string    `json:"scheduled_time" binding:"required"`
	Address              string    `json:"address" binding:"required"`
	Description          string    `json:"description"`
	ContactPerson        string    `json:"contact_person"`
	ContactPhone         string    `json:"contact_phone"`
	SpecialInstructions  string    `json:"special_instructions"`
}

// VerifyPaymentRequest represents the request structure for verifying payment
type VerifyPaymentRequest struct {
	BookingID            uint   `json:"booking_id" binding:"required"`
	RazorpayPaymentID    string `json:"razorpay_payment_id" binding:"required"`
	RazorpayOrderID      string `json:"razorpay_order_id" binding:"required"`
	RazorpaySignature    string `json:"razorpay_signature"` // Optional - will be verified on backend
}

// VerifyPaymentAndCreateBookingRequest represents the request structure for verifying payment and creating booking
type VerifyPaymentAndCreateBookingRequest struct {
	CreateBookingRequest
	RazorpayPaymentID    string `json:"razorpay_payment_id"`
	RazorpayOrderID      string `json:"razorpay_order_id"`
	RazorpaySignature    string `json:"razorpay_signature"` // Optional - will be verified on backend
}

// VerifyInquiryPaymentRequest represents the request structure for verifying inquiry payment and creating booking
type VerifyInquiryPaymentRequest struct {
	ServiceID            uint   `json:"service_id" binding:"required"`
	RazorpayPaymentID    string `json:"razorpay_payment_id" binding:"required"`
	RazorpayOrderID      string `json:"razorpay_order_id" binding:"required"`
	RazorpaySignature    string `json:"razorpay_signature"` // Optional - will be verified on backend
}

// CancelBookingRequest represents the request structure for cancelling a booking
type CancelBookingRequest struct {
	Reason               string `json:"reason" binding:"required"`
	CancellationReason   string `json:"cancellation_reason"`
}

// ReviewBookingRequest represents the request structure for reviewing a booking
type ReviewBookingRequest struct {
	Rating               int                    `json:"rating" binding:"required,min=1,max=5"`
	Review               string                 `json:"review"`
	Categories           map[string]int         `json:"categories"`
}

// ContactWorkerRequest represents the request structure for contacting worker
type ContactWorkerRequest struct {
	ContactType          string `json:"contact_type" binding:"required,oneof=call message"`
	Message              string `json:"message"`
}

// CreateInquiryBookingRequest represents the request structure for creating an inquiry-based booking
type CreateInquiryBookingRequest struct {
	ServiceID uint `json:"service_id" binding:"required"`
}
