package models

import (
	"time"

	"gorm.io/gorm"
)

// BufferRequestStatus represents the status of a buffer request
type BufferRequestStatus string

const (
	BufferRequestStatusPending  BufferRequestStatus = "pending"
	BufferRequestStatusApproved BufferRequestStatus = "approved"
	BufferRequestStatusRejected BufferRequestStatus = "rejected"
	BufferRequestStatusCancelled BufferRequestStatus = "cancelled"
)

// BufferRequest represents the buffer request model
type BufferRequest struct {
	gorm.Model
	// Basic Information
	BookingID                uint                `json:"booking_id" gorm:"not null"`
	WorkerID                 uint                `json:"worker_id" gorm:"not null"`
	
	// Request Details
	RequestedAdditionalMinutes int               `json:"requested_additional_minutes" gorm:"not null"`
	Reason                     string            `json:"reason" gorm:"not null"`
	Status                     BufferRequestStatus `json:"status" gorm:"default:'pending'"`
	
	// Admin Response
	AdminNotes                string            `json:"admin_notes"`
	ApprovedBy                *uint             `json:"approved_by"` // Admin ID
	ApprovedAt                *time.Time        `json:"approved_at"`
	
	// Relationships
	Booking                   Booking            `json:"booking" gorm:"foreignKey:BookingID"`
	Worker                    User               `json:"worker" gorm:"foreignKey:WorkerID"`
	ApprovedByUser            *User              `json:"approved_by_user" gorm:"foreignKey:ApprovedBy"`
}

// TableName returns the table name for BufferRequest
func (BufferRequest) TableName() string {
	return "buffer_requests"
}

// CreateBufferRequestRequest represents the request structure for creating a buffer request
type CreateBufferRequestRequest struct {
	AdditionalMinutes int    `json:"additional_minutes" binding:"required,min=1"`
	Reason            string `json:"reason" binding:"required"`
}

// HandleBufferRequestRequest represents the request structure for handling a buffer request
type HandleBufferRequestRequest struct {
	Notes             string `json:"notes"`
	AdditionalMinutes *int   `json:"additional_minutes"` // For approval, can override requested minutes
}
