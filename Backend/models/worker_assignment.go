package models

import (
	"time"

	"gorm.io/gorm"
)

// AssignmentStatus represents the status of a worker assignment
type AssignmentStatus string

const (
	AssignmentStatusReserved AssignmentStatus = "reserved"
	AssignmentStatusAssigned AssignmentStatus = "assigned"
	AssignmentStatusAccepted AssignmentStatus = "accepted"
	AssignmentStatusRejected AssignmentStatus = "rejected"
	AssignmentStatusInProgress AssignmentStatus = "in_progress"
	AssignmentStatusCompleted AssignmentStatus = "completed"
)

// WorkerAssignment represents the worker assignment model
type WorkerAssignment struct {
	gorm.Model
	// Basic Information
	BookingID    uint             `json:"booking_id" gorm:"not null"`
	WorkerID     uint             `json:"worker_id" gorm:"not null"`
	AssignedBy   uint             `json:"assigned_by" gorm:"not null"` // Admin ID
	
	// Status
	Status       AssignmentStatus `json:"status" gorm:"default:'assigned'"`
	
	// Assignment Details
	AssignedAt   time.Time        `json:"assigned_at" gorm:"not null"`
	AcceptedAt   *time.Time       `json:"accepted_at"`
	RejectedAt   *time.Time       `json:"rejected_at"`
	StartedAt    *time.Time       `json:"started_at"`
	CompletedAt  *time.Time       `json:"completed_at"`
	
	// Notes
	AssignmentNotes string        `json:"assignment_notes" gorm:"column:notes"`
	AcceptanceNotes string        `json:"acceptance_notes"`
	RejectionNotes  string        `json:"rejection_notes"`
	RejectionReason string        `json:"rejection_reason"`
	
	// Relationships
	Booking      Booking          `json:"booking" gorm:"foreignKey:BookingID"`
	Worker       User             `json:"worker" gorm:"foreignKey:WorkerID"`
	AssignedByUser User           `json:"assigned_by_user" gorm:"foreignKey:AssignedBy"`
}

// TableName returns the table name for WorkerAssignment
func (WorkerAssignment) TableName() string {
	return "worker_assignments"
}

// AcceptAssignmentRequest represents the request structure for accepting an assignment
type AcceptAssignmentRequest struct {
	Notes string `json:"notes"`
}

// RejectAssignmentRequest represents the request structure for rejecting an assignment
type RejectAssignmentRequest struct {
	Reason string `json:"reason" binding:"required"`
	Notes  string `json:"notes"`
}

// StartServiceRequest represents the request structure for starting a service
type StartServiceRequest struct {
	Notes string `json:"notes"`
}

// CompleteServiceRequest represents the request structure for completing a service
type CompleteServiceRequest struct {
	Notes        string   `json:"notes"`
	MaterialsUsed []string `json:"materials_used"`
	Photos       []string `json:"photos"`
}

// WorkerAssignmentFilters represents filters for worker assignments
type WorkerAssignmentFilters struct {
	Status string `json:"status"`
	Date   string `json:"date"`
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
}

// WorkerAssignmentResponse represents a worker assignment response with privacy protection
type WorkerAssignmentResponse struct {
	gorm.Model
	// Basic Information
	BookingID    uint             `json:"booking_id" gorm:"not null"`
	WorkerID     uint             `json:"worker_id" gorm:"not null"`
	AssignedBy   uint             `json:"assigned_by" gorm:"not null"` // Admin ID
	
	// Status
	Status       AssignmentStatus `json:"status" gorm:"default:'assigned'"`
	
	// Assignment Details
	AssignedAt   time.Time        `json:"assigned_at" gorm:"not null"`
	AcceptedAt   *time.Time       `json:"accepted_at"`
	RejectedAt   *time.Time       `json:"rejected_at"`
	StartedAt    *time.Time       `json:"started_at"`
	CompletedAt  *time.Time       `json:"completed_at"`
	
	// Notes
	AssignmentNotes string        `json:"assignment_notes" gorm:"column:notes"`
	AcceptanceNotes string        `json:"acceptance_notes"`
	RejectionNotes  string        `json:"rejection_notes"`
	RejectionReason string        `json:"rejection_reason"`
	
	// Relationships (with privacy protection)
	Booking      WorkerAssignmentBookingResponse `json:"booking" gorm:"foreignKey:BookingID"`
	Worker       User                            `json:"worker" gorm:"foreignKey:WorkerID"`
	AssignedByUser User                          `json:"assigned_by_user" gorm:"foreignKey:AssignedBy"`
}

// WorkerAssignmentBookingResponse represents booking info for worker assignments (privacy protected)
type WorkerAssignmentBookingResponse struct {
	gorm.Model
	BookingReference string      `json:"booking_reference"`
	UserID           uint        `json:"user_id"`
	ServiceID        uint        `json:"service_id"`
	Status           string      `json:"status"`
	PaymentStatus    string      `json:"payment_status"`
	BookingType      string      `json:"booking_type"`
	CompletionType   *string     `json:"completion_type"`
	ScheduledDate    *time.Time  `json:"scheduled_date"`
	ScheduledTime    *time.Time  `json:"scheduled_time"`
	ScheduledEndTime *time.Time  `json:"scheduled_end_time"`
	ActualStartTime  *time.Time  `json:"actual_start_time"`
	ActualEndTime    *time.Time  `json:"actual_end_time"`
	ActualDurationMinutes *int   `json:"actual_duration_minutes"`
	Address          *string     `json:"address"`
	Description      string      `json:"description"`
	ContactPerson    string      `json:"contact_person"`
	ContactPhone     string      `json:"contact_phone"`
	SpecialInstructions string   `json:"special_instructions"`
	HoldExpiresAt    *time.Time  `json:"hold_expires_at"`
	QuoteAmount      *float64    `json:"quote_amount"`
	QuoteNotes       string      `json:"quote_notes"`
	QuoteProvidedBy  *uint       `json:"quote_provided_by"`
	QuoteProvidedAt  *time.Time  `json:"quote_provided_at"`
	QuoteAcceptedAt  *time.Time  `json:"quote_accepted_at"`
	QuoteExpiresAt   *time.Time  `json:"quote_expires_at"`
	
	// Relationships (privacy protected - no phone number)
	User             WorkerAssignmentUserResponse `json:"user" gorm:"foreignKey:UserID"`
	Service          Service                     `json:"service" gorm:"foreignKey:ServiceID"`
}

// WorkerAssignmentUserResponse represents user info for worker assignments (privacy protected)
type WorkerAssignmentUserResponse struct {
	ID                      uint       `json:"ID"`
	Name                    string     `json:"name"`
	Email                   *string    `json:"email"`
	// Phone field is intentionally excluded for privacy
	UserType                string     `json:"user_type"`
	Avatar                  string     `json:"avatar"`
	Gender                  string     `json:"gender"`
	IsActive                bool       `json:"is_active"`
	LastLoginAt             *time.Time `json:"last_login_at"`
	RoleApplicationStatus   string     `json:"role_application_status"`
	ApplicationDate         *time.Time `json:"application_date"`
	ApprovalDate            *time.Time `json:"approval_date"`
	WalletBalance           float64    `json:"wallet_balance"`
	SubscriptionID          *uint      `json:"subscription_id"`
	Subscription            *string    `json:"subscription"`
	HasActiveSubscription   bool       `json:"has_active_subscription"`
	SubscriptionExpiryDate  *time.Time `json:"subscription_expiry_date"`
	NotificationSettings    *string    `json:"notification_settings"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
} 