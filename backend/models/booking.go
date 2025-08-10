package models

import (
	"time"
	"gorm.io/gorm"
)

// BookingStatus represents the status of a service booking
type BookingStatus string

const (
	BookingStatusPending   BookingStatus = "pending"
	BookingStatusApproved  BookingStatus = "approved"
	BookingStatusRejected  BookingStatus = "rejected"
	BookingStatusAssigned  BookingStatus = "assigned"
	BookingStatusInProgress BookingStatus = "in_progress"
	BookingStatusCompleted BookingStatus = "completed"
	BookingStatusCancelled BookingStatus = "cancelled"
)

// PaymentStatus represents the payment status
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusPaid      PaymentStatus = "paid"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

// Booking represents a service booking
type Booking struct {
	gorm.Model
	UserID        uint          `json:"user_id" gorm:"not null"`
	User          User          `json:"user" gorm:"foreignKey:UserID"`
	ServiceID     uint          `json:"service_id" gorm:"not null"`
	Service       Service       `json:"service" gorm:"foreignKey:ServiceID"`
	WorkerID      *uint         `json:"worker_id"`
	Worker        *User         `json:"worker" gorm:"foreignKey:WorkerID"`
	
	// Booking Details
	Status        BookingStatus `json:"status" gorm:"default:'pending'"`
	ScheduledDate time.Time     `json:"scheduled_date" gorm:"not null"`
	Address       string        `json:"address" gorm:"not null"`
	Description   string        `json:"description"`
	Latitude      float64       `json:"latitude"`
	Longitude     float64       `json:"longitude"`
	
	// Pricing
	Price         float64       `json:"price" gorm:"not null"`
	PaymentStatus PaymentStatus `json:"payment_status" gorm:"default:'pending'"`
	PaymentID     string        `json:"payment_id"` // Razorpay payment ID
	
	// Service Completion
	OTP           string        `json:"otp"` // For service completion verification
	StartedAt     *time.Time    `json:"started_at"`
	CompletedAt   *time.Time    `json:"completed_at"`
	
	// Admin Notes
	AdminNotes    string        `json:"admin_notes"`
	RejectionReason string      `json:"rejection_reason"`
	
	// Relationships
	Reviews       []Review      `json:"reviews,omitempty" gorm:"foreignKey:BookingID"`
}

// Inquiry represents a property inquiry
type Inquiry struct {
	gorm.Model
	PropertyID    uint      `json:"property_id" gorm:"not null"`
	Property      Property  `json:"property" gorm:"foreignKey:PropertyID"`
	UserID        uint      `json:"user_id" gorm:"not null"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
	
	// Inquiry Details
	Message       string    `json:"message"`
	ContactPreference string `json:"contact_preference"` // call, chat, email
	PreferredTime string    `json:"preferred_time"`
	
	// Status
	Status        string    `json:"status" gorm:"default:'pending'"` // pending, responded, closed
	RespondedAt   *time.Time `json:"responded_at"`
	
	// Masked Call Details
	MaskedCallID  string    `json:"masked_call_id"`
	CallDuration  int       `json:"call_duration"` // in seconds
}

// Review represents a service review
type Review struct {
	gorm.Model
	UserID      uint    `json:"user_id" gorm:"not null"`
	User        User    `json:"user" gorm:"foreignKey:UserID"`
	WorkerID    uint    `json:"worker_id" gorm:"not null"`
	Worker      User    `json:"worker" gorm:"foreignKey:WorkerID"`
	BookingID   uint    `json:"booking_id" gorm:"not null"`
	Booking     Booking `json:"booking" gorm:"foreignKey:BookingID"`
	
	// Review Details
	Rating      int     `json:"rating" gorm:"not null"` // 1-5 stars
	Comment     string  `json:"comment"`
	IsPublished bool    `json:"is_published" gorm:"default:true"`
	
	// Admin Moderation
	IsModerated bool    `json:"is_moderated" gorm:"default:false"`
	ModeratedBy *uint   `json:"moderated_by"`
	ModeratedAt *time.Time `json:"moderated_at"`
}

// TableName returns the table name for Booking
func (Booking) TableName() string {
	return "bookings"
}

// TableName returns the table name for Inquiry
func (Inquiry) TableName() string {
	return "inquiries"
}

// TableName returns the table name for Review
func (Review) TableName() string {
	return "reviews"
}
