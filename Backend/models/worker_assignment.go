package models

import (
	"time"

	"gorm.io/gorm"
)

// AssignmentStatus represents the status of a worker assignment
type AssignmentStatus string

const (
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
	AssignmentNotes string        `json:"assignment_notes"`
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