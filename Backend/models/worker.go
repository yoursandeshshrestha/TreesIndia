package models

import (
	"time"

	"gorm.io/gorm"
)

// WorkerType represents the type of worker
type WorkerType string

const (
	WorkerTypeTreesIndia   WorkerType = "treesindia"
	WorkerTypeIndependent  WorkerType = "independent"
)

// DocumentVerificationStatus represents the status of document verification
type DocumentVerificationStatus string

const (
	DocumentVerificationStatusPending  DocumentVerificationStatus = "pending"
	DocumentVerificationStatusVerified DocumentVerificationStatus = "verified"
	DocumentVerificationStatusRejected DocumentVerificationStatus = "rejected"
)

// Worker represents the worker model
type Worker struct {
	gorm.Model
	UserID          uint    `json:"user_id" gorm:"not null;uniqueIndex"`
	
	// Worker Type
	WorkerType      WorkerType `json:"worker_type" gorm:"default:'treesindia'"` // treesindia or independent
	
	// Professional Information
	Skills          string  `json:"skills"`                          // JSON array of specific skills
	Experience      int     `json:"experience_years"`                // Years of experience
	ServiceAreas    string  `json:"service_areas"`                   // JSON array of preferred service areas (optional)
	
	// Contact Information (for independent workers)
	ContactPhone    string  `json:"contact_phone"`
	ContactEmail    string  `json:"contact_email"`
	
	// Availability
	IsAvailable     bool    `json:"is_available" gorm:"default:true"`
	
	// Bank Account Details (required for all workers)
	BankAccountHolder   string  `json:"bank_account_holder"`
	BankAccountNumber   string  `json:"bank_account_number"`
	BankIFSCCode        string  `json:"bank_ifsc_code"`
	BankName            string  `json:"bank_name"`
	BankBranch          string  `json:"bank_branch"`
	
	// Document Verification
	PoliceVerificationStatus DocumentVerificationStatus `json:"police_verification_status" gorm:"default:'pending'"`
	PoliceVerificationDocuments string `json:"police_verification_documents"` // JSON array of document URLs
	AadhaarCardFront    string  `json:"aadhaar_card_front"`
	AadhaarCardBack     string  `json:"aadhaar_card_back"`
	PanCardFront        string  `json:"pan_card_front"`
	PanCardBack         string  `json:"pan_card_back"`
	DocumentVerifiedAt  *time.Time `json:"document_verified_at"`
	DocumentVerifiedBy  *uint     `json:"document_verified_by"`
	
	// Statistics
	Earnings    float64 `json:"earnings" gorm:"default:0"`
	Rating      float64 `json:"rating" gorm:"default:0"`
	TotalJobs   int     `json:"total_jobs" gorm:"default:0"`
	IsActive    bool    `json:"is_active" gorm:"default:true"`
	
	// Relationships
	User            User    `json:"user" gorm:"foreignKey:UserID"`
	DocumentVerifiedByUser *User `json:"document_verified_by_user" gorm:"foreignKey:DocumentVerifiedBy"`
}

// TableName returns the table name for Worker
func (Worker) TableName() string {
	return "workers"
}
