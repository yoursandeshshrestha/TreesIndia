package models

import (
	"time"

	"gorm.io/gorm"
)

// InquiryStatus represents the status of a worker inquiry
type InquiryStatus string

const (
	InquiryStatusPending   InquiryStatus = "pending"
	InquiryStatusApproved  InquiryStatus = "approved"
	InquiryStatusRejected  InquiryStatus = "rejected"
	InquiryStatusCompleted InquiryStatus = "completed"
)

// CreateInquiryRequest represents the request structure for creating an inquiry
type CreateInquiryRequest struct {
	ProjectName   string `json:"project_name" binding:"required"`
	CompanyName   string `json:"company_name" binding:"required"`
	Location      string `json:"location" binding:"required"`
	ContactPerson string `json:"contact_person" binding:"required"`
	ContactPhone  string `json:"contact_phone" binding:"required"`
	ContactEmail  string `json:"contact_email"`
}

// WorkerInquiry represents inquiries from users to workers
type WorkerInquiry struct {
	gorm.Model
	UserID        uint          `json:"user_id" gorm:"not null"`
	WorkerID      uint          `json:"worker_id" gorm:"not null"`
	
	// Project Details
	ProjectName   string        `json:"project_name" gorm:"not null"`
	CompanyName   string        `json:"company_name" gorm:"not null"`
	Location      string        `json:"location" gorm:"not null"`
	
	// Contact Details
	ContactPerson string        `json:"contact_person" gorm:"not null"`
	ContactPhone  string        `json:"contact_phone" gorm:"not null"`
	ContactEmail  string        `json:"contact_email"`
	
	// Status and Admin Approval
	Status        InquiryStatus `json:"status" gorm:"default:'pending'"`
	IsApproved    bool          `json:"is_approved" gorm:"default:false"`
	ApprovedBy    *uint         `json:"approved_by"`                        // Admin ID who approved
	ApprovedAt    *time.Time    `json:"approved_at"`
	AdminNotes    string        `json:"admin_notes"`
	
	// Worker Response
	WorkerResponse  string        `json:"worker_response"`                    // Worker's response/notes
	WorkerContacted bool          `json:"worker_contacted" gorm:"default:false"`
	ContactedAt     *time.Time    `json:"contacted_at"`
	
	// Relationships
	User          User          `json:"user" gorm:"foreignKey:UserID"`
	Worker        Worker        `json:"worker" gorm:"foreignKey:WorkerID"`
	ApprovedByUser *User        `json:"approved_by_user" gorm:"foreignKey:ApprovedBy"`
}

// TableName returns the table name for WorkerInquiry
func (WorkerInquiry) TableName() string {
	return "worker_inquiries"
}
