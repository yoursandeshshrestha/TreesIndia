package models

import (
	"time"

	"gorm.io/gorm"
)

// CallMaskingEnabled represents call masking availability for a booking
type CallMaskingEnabled struct {
	gorm.Model
	// Booking and user references
	BookingID  uint `json:"booking_id" gorm:"not null"`
	WorkerID   uint `json:"worker_id" gorm:"not null"`
	CustomerID uint `json:"customer_id" gorm:"not null"`
	
	// Call tracking
	CallCount           int        `json:"call_count" gorm:"default:0"`
	TotalCallDuration   int        `json:"total_call_duration" gorm:"default:0"` // in seconds
	DisabledAt          *time.Time `json:"disabled_at"`
	
	// Relationships
	Booking  Booking `json:"booking" gorm:"foreignKey:BookingID"`
	Worker   User    `json:"worker" gorm:"foreignKey:WorkerID"`
	Customer User    `json:"customer" gorm:"foreignKey:CustomerID"`
	CallLogs []CallLog `json:"call_logs,omitempty" gorm:"foreignKey:CallMaskingID"`
}

// TableName returns the table name for CallMaskingEnabled
func (CallMaskingEnabled) TableName() string {
	return "call_masking_enabled"
}

// CallStatus represents the status of a call
type CallStatus string

const (
	CallStatusRinging  CallStatus = "ringing"
	CallStatusCompleted CallStatus = "completed"
	CallStatusFailed   CallStatus = "failed"
	CallStatusMissed   CallStatus = "missed"
)

// CallLog represents a log entry for a call
type CallLog struct {
	gorm.Model
	// Call masking reference
	CallMaskingID uint `json:"call_masking_id" gorm:"not null"`
	CallerID      uint `json:"caller_id" gorm:"not null"`
	
	// Call details
	CallDuration   int        `json:"call_duration" gorm:"not null"` // in seconds
	CallStatus     CallStatus `json:"call_status" gorm:"not null"`
	ExotelCallSID  string     `json:"exotel_call_sid"`
	
	// Call metadata
	StartedAt *time.Time `json:"started_at"`
	EndedAt   *time.Time `json:"ended_at"`
	
	// Relationships
	CallMasking CallMaskingEnabled `json:"call_masking" gorm:"foreignKey:CallMaskingID"`
	Caller      User               `json:"caller" gorm:"foreignKey:CallerID"`
}

// TableName returns the table name for CallLog
func (CallLog) TableName() string {
	return "call_logs"
}

// InitiateCallRequest represents the request structure for initiating a call
type InitiateCallRequest struct {
	BookingID uint `json:"booking_id" binding:"required"`
}

// InitiateCallForBookingRequest represents the request structure for initiating a call for a booking
type InitiateCallForBookingRequest struct {
	BookingID uint `json:"booking_id" binding:"required"`
}

// CloudShopeCallRequest represents the request structure for CloudShope calls
type CloudShopeCallRequest struct {
	FromNumber   string `json:"from_number" binding:"required"`
	MobileNumber string `json:"mobile_number" binding:"required"`
}

// CloudShopeCallResponse represents the response structure for CloudShope calls
type CloudShopeCallResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Mobile string `json:"mobile"`
	} `json:"data"`
}

// CallMaskingEnabledResponse represents the response structure for call masking
type CallMaskingEnabledResponse struct {
	ID                uint       `json:"id"`
	BookingID         uint       `json:"booking_id"`
	WorkerID          uint       `json:"worker_id"`
	CustomerID        uint       `json:"customer_id"`
	CallCount         int        `json:"call_count"`
	TotalCallDuration int        `json:"total_call_duration"`
	CreatedAt         time.Time  `json:"created_at"`
	DisabledAt        *time.Time `json:"disabled_at"`
}

// CallLogResponse represents the response structure for call logs
type CallLogResponse struct {
	ID           uint       `json:"id"`
	CallerID     uint       `json:"caller_id"`
	CallerName   string     `json:"caller_name"`
	CallDuration int        `json:"call_duration"`
	CallStatus   CallStatus `json:"call_status"`
	StartedAt    *time.Time `json:"started_at"`
	EndedAt      *time.Time `json:"ended_at"`
	CreatedAt    time.Time  `json:"created_at"`
}
