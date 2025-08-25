package models

import (
	"time"

	"gorm.io/gorm"
)

// BookingStatus represents the booking status (workflow status)
type BookingStatus string

const (
	BookingStatusPending        BookingStatus = "pending"        // Initial status for inquiry bookings
	BookingStatusQuoteProvided  BookingStatus = "quote_provided"  // Admin provided quote
	BookingStatusQuoteAccepted  BookingStatus = "quote_accepted"  // Customer accepted quote
	BookingStatusConfirmed      BookingStatus = "confirmed"      // Booking confirmed and ready for scheduling
	BookingStatusScheduled      BookingStatus = "scheduled"      // Service scheduled
	BookingStatusAssigned       BookingStatus = "assigned"       // Worker assigned
	BookingStatusInProgress     BookingStatus = "in_progress"    // Service in progress
	BookingStatusCompleted      BookingStatus = "completed"      // Service completed
	BookingStatusCancelled      BookingStatus = "cancelled"      // Booking cancelled
	BookingStatusRejected       BookingStatus = "rejected"       // Quote rejected
	BookingStatusTemporaryHold  BookingStatus = "temporary_hold" // Temporary hold for payment verification
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
	PaymentStatusPending   PaymentStatus = "pending"   // Payment pending
	PaymentStatusCompleted PaymentStatus = "completed" // Payment completed
	PaymentStatusFailed    PaymentStatus = "failed"    // Payment failed
	PaymentStatusRefunded  PaymentStatus = "refunded"  // Payment refunded
	PaymentStatusAbandoned PaymentStatus = "abandoned" // Payment abandoned
	PaymentStatusExpired   PaymentStatus = "expired"   // Payment expired
	PaymentStatusHold      PaymentStatus = "hold"      // Payment on hold (for inquiry fees)
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
	Address          *string       `json:"address" gorm:"type:jsonb"` // Store complete address object as JSON
	Description      string        `json:"description"`
	ContactPerson    string        `json:"contact_person"`
	ContactPhone     string        `json:"contact_phone"`
	SpecialInstructions string     `json:"special_instructions"`
	
	// Hold Management
	HoldExpiresAt    *time.Time    `json:"hold_expires_at" gorm:"index"`
	
	// Quote Management (for inquiry bookings)
	QuoteAmount      *float64      `json:"quote_amount"`                    // Final quote amount
	QuoteNotes       string        `json:"quote_notes"`                     // Admin notes with quote
	QuoteProvidedBy  *uint         `json:"quote_provided_by"`               // Admin ID who provided quote
	QuoteProvidedAt  *time.Time    `json:"quote_provided_at"`               // When quote was provided
	QuoteAcceptedAt  *time.Time    `json:"quote_accepted_at"`               // When customer accepted quote
	QuoteExpiresAt   *time.Time    `json:"quote_expires_at"`                // Quote expiration date
	
	// Relationships
	User             User          `json:"user" gorm:"foreignKey:UserID"`
	Service          Service       `json:"service" gorm:"foreignKey:ServiceID"`
	WorkerAssignment *WorkerAssignment `json:"worker_assignment,omitempty" gorm:"foreignKey:BookingID"`
	BufferRequests   []BufferRequest `json:"buffer_requests,omitempty" gorm:"foreignKey:BookingID"`
	Payment          *Payment       `json:"payment,omitempty" gorm:"-"` // Will be loaded manually
}

// TableName returns the table name for Booking
func (Booking) TableName() string {
	return "bookings"
}

// BookingAddress represents the address structure for bookings
type BookingAddress struct {
	Name        string  `json:"name"`
	Address     string  `json:"address"`
	City        string  `json:"city"`
	State       string  `json:"state"`
	Country     string  `json:"country"`
	PostalCode  string  `json:"postal_code"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Landmark    string  `json:"landmark"`
	HouseNumber string  `json:"house_number"`
}

// CreateBookingRequest represents the request structure for creating a booking
type CreateBookingRequest struct {
	ServiceID            uint            `json:"service_id" binding:"required"`
	ScheduledDate        string          `json:"scheduled_date" binding:"required"`
	ScheduledTime        string          `json:"scheduled_time" binding:"required"`
	Address              BookingAddress  `json:"address" binding:"required"`
	Description          string          `json:"description"`
	ContactPerson        string          `json:"contact_person"`
	ContactPhone         string          `json:"contact_phone"`
	SpecialInstructions  string          `json:"special_instructions"`
}

// CreateBookingWithPaymentRequest represents the request structure for creating a booking with payment
type CreateBookingWithPaymentRequest struct {
	CreateBookingRequest
	RazorpayPaymentID    string `json:"razorpay_payment_id" binding:"required"`
	RazorpayOrderID      string `json:"razorpay_order_id" binding:"required"`
	RazorpaySignature    string `json:"razorpay_signature" binding:"required"`
}

// VerifyPaymentRequest represents the request structure for verifying payment
type VerifyPaymentRequest struct {
	BookingID            uint   `json:"booking_id"` // Optional - set from URL parameter
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
	ServiceID            uint            `json:"service_id" binding:"required"`
	Address              BookingAddress  `json:"address" binding:"required"`
	Description          string          `json:"description"`
	ContactPerson        string          `json:"contact_person"`
	ContactPhone         string          `json:"contact_phone"`
	SpecialInstructions  string          `json:"special_instructions"`
}

// OptimizedBookingResponse represents the optimized booking response for listings
type OptimizedBookingResponse struct {
	ID                    uint                    `json:"id"`
	BookingReference      string                  `json:"booking_reference"`
	Status                BookingStatus           `json:"status"`
	BookingType           BookingType             `json:"booking_type"`
	ScheduledDate         *time.Time              `json:"scheduled_date"`
	ScheduledTime         *time.Time              `json:"scheduled_time"`
	ScheduledEndTime      *time.Time              `json:"scheduled_end_time"`
	ActualStartTime       *time.Time              `json:"actual_start_time"`
	ActualEndTime         *time.Time              `json:"actual_end_time"`
	ActualDurationMinutes *int                    `json:"actual_duration_minutes"`
	HoldExpiresAt         *time.Time              `json:"hold_expires_at"`
	CreatedAt             time.Time               `json:"created_at"`
	UpdatedAt             time.Time               `json:"updated_at"`
	
	Service               *OptimizedServiceInfo   `json:"service"`
	User                  *OptimizedUserInfo      `json:"user"`
	Address               *BookingAddress         `json:"address"`
	Contact               *OptimizedContactInfo   `json:"contact"`
	Payment               *OptimizedPaymentInfo   `json:"payment"`
	WorkerAssignment      *OptimizedWorkerAssignment `json:"worker_assignment"`
}

// OptimizedServiceInfo represents minimal service information
type OptimizedServiceInfo struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	PriceType   string  `json:"price_type"`
	Price       *float64 `json:"price"`
	Duration    *string `json:"duration"`
}

// OptimizedUserInfo represents minimal user information
type OptimizedUserInfo struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	UserType string `json:"user_type"`
}

// OptimizedContactInfo represents contact information
type OptimizedContactInfo struct {
	Person              string `json:"person"`
	Phone               string `json:"phone"`
	Description         string `json:"description"`
	SpecialInstructions string `json:"special_instructions"`
}

// OptimizedPaymentInfo represents payment information
type OptimizedPaymentInfo struct {
	Status              string  `json:"status"`
	Amount              float64 `json:"amount"`
	Currency            string  `json:"currency"`
	PaymentMethod       *string `json:"payment_method"`
	RazorpayOrderID     *string `json:"razorpay_order_id"`
	RazorpayPaymentID   *string `json:"razorpay_payment_id"`
	CreatedAt           *time.Time `json:"created_at"`
}

// OptimizedWorkerAssignment represents worker assignment information
type OptimizedWorkerAssignment struct {
	WorkerID    *uint   `json:"worker_id"`
	Status      *string `json:"status"`
	Worker      *OptimizedUserInfo `json:"worker"`
}

// DetailedBookingResponse represents the detailed booking response
type DetailedBookingResponse struct {
	ID                    uint                    `json:"id"`
	BookingReference      string                  `json:"booking_reference"`
	Status                BookingStatus           `json:"status"`
	BookingType           BookingType             `json:"booking_type"`
	CompletionType        *CompletionType         `json:"completion_type"`
	ScheduledDate         *time.Time              `json:"scheduled_date"`
	ScheduledTime         *time.Time              `json:"scheduled_time"`
	ScheduledEndTime      *time.Time              `json:"scheduled_end_time"`
	ActualStartTime       *time.Time              `json:"actual_start_time"`
	ActualEndTime         *time.Time              `json:"actual_end_time"`
	ActualDurationMinutes *int                    `json:"actual_duration_minutes"`
	HoldExpiresAt         *time.Time              `json:"hold_expires_at"`
	CreatedAt             time.Time               `json:"created_at"`
	UpdatedAt             time.Time               `json:"updated_at"`
	DeletedAt             *time.Time              `json:"deleted_at"`
	
	Service               *DetailedServiceInfo    `json:"service"`
	User                  *DetailedUserInfo       `json:"user"`
	Address               *BookingAddress         `json:"address"`
	Contact               *OptimizedContactInfo   `json:"contact"`
	Payment               *DetailedPaymentInfo    `json:"payment"`
	WorkerAssignment      *DetailedWorkerAssignment `json:"worker_assignment"`
	BufferRequests        []BufferRequest         `json:"buffer_requests"`
	Reviews               []Review                `json:"reviews"`
	ChatMessages          []ChatMessageInfo       `json:"chat_messages"`
	ActivityLog           []ActivityLog           `json:"activity_log"`
	Disputes              []Dispute               `json:"disputes"`
	RelatedBookings       []RelatedBooking        `json:"related_bookings"`
	Statistics            *BookingStatistics      `json:"statistics"`
}

// DetailedServiceInfo represents complete service information
type DetailedServiceInfo struct {
	ID          uint                `json:"id"`
	Name        string              `json:"name"`
	Slug        string              `json:"slug"`
	Description string              `json:"description"`
	Images      []string            `json:"images"`
	PriceType   string              `json:"price_type"`
	Price       *float64            `json:"price"`
	Duration    *string             `json:"duration"`
	Category    *DetailedCategory   `json:"category"`
	Subcategory *DetailedSubcategory `json:"subcategory"`
	IsActive    bool                `json:"is_active"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

// DetailedCategory represents category information
type DetailedCategory struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	IsActive    bool      `json:"is_active"`
}

// DetailedSubcategory represents subcategory information
type DetailedSubcategory struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	IsActive    bool      `json:"is_active"`
}

// DetailedUserInfo represents complete user information
type DetailedUserInfo struct {
	ID                      uint       `json:"id"`
	Name                    string     `json:"name"`
	Email                   *string    `json:"email"`
	Phone                   string     `json:"phone"`
	UserType                string     `json:"user_type"`
	Avatar                  string     `json:"avatar"`
	Gender                  string     `json:"gender"`
	IsActive                bool       `json:"is_active"`
	LastLoginAt             *time.Time `json:"last_login_at"`
	RoleApplicationStatus   string     `json:"role_application_status"`
	WalletBalance           float64    `json:"wallet_balance"`
	HasActiveSubscription   bool       `json:"has_active_subscription"`
	SubscriptionExpiryDate  *time.Time `json:"subscription_expiry_date"`
	CreatedAt               time.Time  `json:"created_at"`
	UpdatedAt               time.Time  `json:"updated_at"`
}

// DetailedPaymentInfo represents complete payment information
type DetailedPaymentInfo struct {
	ID                uint       `json:"id"`
	Status            string     `json:"status"`
	Amount            float64    `json:"amount"`
	Currency          string     `json:"currency"`
	PaymentMethod     *string    `json:"payment_method"`
	RazorpayOrderID   *string    `json:"razorpay_order_id"`
	RazorpayPaymentID *string    `json:"razorpay_payment_id"`
	RazorpaySignature *string    `json:"razorpay_signature"`
	Metadata          map[string]interface{} `json:"metadata"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// DetailedWorkerAssignment represents complete worker assignment information
type DetailedWorkerAssignment struct {
	ID               uint       `json:"id"`
	WorkerID         *uint      `json:"worker_id"`
	AssignedBy       *uint      `json:"assigned_by"`
	Status           *string    `json:"status"`
	AssignedAt       *time.Time `json:"assigned_at"`
	AcceptedAt       *time.Time `json:"accepted_at"`
	RejectedAt       *time.Time `json:"rejected_at"`
	StartedAt        *time.Time `json:"started_at"`
	CompletedAt      *time.Time `json:"completed_at"`
	AssignmentNotes  *string    `json:"assignment_notes"`
	AcceptanceNotes  *string    `json:"acceptance_notes"`
	RejectionNotes   *string    `json:"rejection_notes"`
	RejectionReason  *string    `json:"rejection_reason"`
	Worker           *DetailedUserInfo `json:"worker"`
	AssignedByUser   *DetailedUserInfo `json:"assigned_by_user"`
}

// RelatedBooking represents related booking information
type RelatedBooking struct {
	ID               uint      `json:"id"`
	BookingReference string    `json:"booking_reference"`
	Status           string    `json:"status"`
	ServiceName      string    `json:"service_name"`
	CreatedAt        time.Time `json:"created_at"`
}

// BookingStatistics represents booking statistics
type BookingStatistics struct {
	TotalMessages    int     `json:"total_messages"`
	TotalReviews     int     `json:"total_reviews"`
	AverageRating    float64 `json:"average_rating"`
	CompletionTime   *int    `json:"completion_time"`
	WorkerRating     *float64 `json:"worker_rating"`
}

// ActivityLog represents activity log entry
type ActivityLog struct {
	ID            uint      `json:"id"`
	Action        string    `json:"action"`
	Description   string    `json:"description"`
	PerformedBy   string    `json:"performed_by"`
	PerformedByID *uint     `json:"performed_by_id"`
	CreatedAt     time.Time `json:"created_at"`
}

// ChatMessageInfo represents chat message information for booking details
type ChatMessageInfo struct {
	ID        uint      `json:"id"`
	SenderType string   `json:"sender_type"`
	SenderID  uint      `json:"sender_id"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// Review represents review information
type Review struct {
	ID         uint                    `json:"id"`
	Rating     int                     `json:"rating"`
	Review     string                  `json:"review"`
	Categories map[string]int          `json:"categories"`
	CreatedAt  time.Time               `json:"created_at"`
}

// Dispute represents dispute information
type Dispute struct {
	ID         uint      `json:"id"`
	Reason     string    `json:"reason"`
	Status     string    `json:"status"`
	Resolution *string   `json:"resolution"`
	CreatedAt  time.Time `json:"created_at"`
}

// Quote Management Request/Response Models

// ProvideQuoteRequest represents the request to provide a quote for an inquiry booking
type ProvideQuoteRequest struct {
	Amount      float64 `json:"amount" binding:"required,min=0"`
	Notes       string  `json:"notes"`
	ExpiresIn   *int    `json:"expires_in"` // Days until quote expires (optional)
}

// UpdateQuoteRequest represents the request to update an existing quote
type UpdateQuoteRequest struct {
	Amount      float64 `json:"amount" binding:"required,min=0"`
	Notes       string  `json:"notes"`
	ExpiresIn   *int    `json:"expires_in"` // Days until quote expires (optional)
}

// AcceptQuoteRequest represents the request to accept a quote
type AcceptQuoteRequest struct {
	Notes string `json:"notes"` // Optional customer notes
}

// RejectQuoteRequest represents the request to reject a quote
type RejectQuoteRequest struct {
	Reason string `json:"reason" binding:"required"` // Reason for rejection
}

// ScheduleAfterQuoteRequest represents the request to schedule after quote acceptance
type ScheduleAfterQuoteRequest struct {
	ScheduledDate string `json:"scheduled_date" binding:"required"` // YYYY-MM-DD format
	ScheduledTime string `json:"scheduled_time" binding:"required"` // HH:MM format
	Notes         string `json:"notes"`
}

// CreateQuotePaymentRequest represents the request to create payment for quote acceptance
type CreateQuotePaymentRequest struct {
	ScheduledDate string  `json:"scheduled_date" binding:"required"` // YYYY-MM-DD format
	ScheduledTime string  `json:"scheduled_time" binding:"required"` // HH:MM format
	Amount        float64 `json:"amount" binding:"required,min=0"`   // Quote amount to pay
}

// VerifyQuotePaymentRequest represents the request to verify payment for quote acceptance
type VerifyQuotePaymentRequest struct {
	RazorpayPaymentID   string `json:"razorpay_payment_id" binding:"required"`
	RazorpayOrderID     string `json:"razorpay_order_id" binding:"required"`
	RazorpaySignature   string `json:"razorpay_signature" binding:"required"`
}

// QuoteInfo represents quote information in booking responses
type QuoteInfo struct {
	Amount         float64    `json:"amount"`
	Notes          string     `json:"notes"`
	ProvidedBy     *uint      `json:"provided_by"`
	ProvidedAt     *time.Time `json:"provided_at"`
	AcceptedAt     *time.Time `json:"accepted_at"`
	ExpiresAt      *time.Time `json:"expires_at"`
	IsExpired      bool       `json:"is_expired"`
	DaysUntilExpiry *int      `json:"days_until_expiry"`
}
