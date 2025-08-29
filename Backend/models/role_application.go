package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// RoleType represents the type of role application
type RoleType string

const (
	RoleTypeWorker RoleType = "worker"
	RoleTypeBroker RoleType = "broker"
)

// ApplicationStatus represents the status of role application
type ApplicationStatus string

const (
	ApplicationStatusPending  ApplicationStatus = "pending"
	ApplicationStatusApproved ApplicationStatus = "approved"
	ApplicationStatusRejected ApplicationStatus = "rejected"
)

// Enhanced JSON types for better frontend consumption
type ContactInfo struct {
	AlternativeNumber string `json:"alternative_number"`
}

type WorkerAddress struct {
	Street   string `json:"street"`
	City     string `json:"city"`
	State    string `json:"state"`
	Pincode  string `json:"pincode"`
	Landmark string `json:"landmark"`
}

type BankingInfo struct {
	AccountNumber     string `json:"account_number"`
	IfscCode         string `json:"ifsc_code"`
	BankName         string `json:"bank_name"`
	AccountHolderName string `json:"account_holder_name"`
}

type Documents struct {
	AadharCard        string `json:"aadhar_card"`
	PanCard          string `json:"pan_card"`
	ProfilePic       string `json:"profile_pic"`
	PoliceVerification string `json:"police_verification,omitempty"`
}

// Enhanced Worker with parsed JSON
type EnhancedWorker struct {
	gorm.Model
	UserID             uint       `json:"user_id"`
	RoleApplicationID  *uint      `json:"role_application_id"`
	WorkerType         WorkerType `json:"worker_type"`
	
	// Parsed JSON fields
	ContactInfo        ContactInfo    `json:"contact_info"`
	Address            WorkerAddress  `json:"address"`
	BankingInfo        BankingInfo    `json:"banking_info"`
	Documents          Documents   `json:"documents"`
	Skills             []string    `json:"skills"`
	
	// Regular fields
	Experience         int        `json:"experience_years"`
	IsAvailable        bool       `json:"is_available"`
	Rating             float64    `json:"rating"`
	TotalBookings      int        `json:"total_bookings"`
	Earnings           float64    `json:"earnings"`
	TotalJobs          int        `json:"total_jobs"`
	IsActive           bool       `json:"is_active"`
}

// Enhanced Broker with parsed JSON
type EnhancedBroker struct {
	gorm.Model
	UserID             uint    `json:"user_id"`
	RoleApplicationID  *uint   `json:"role_application_id"`
	
	// Parsed JSON fields
	ContactInfo        ContactInfo    `json:"contact_info"`
	Address            WorkerAddress  `json:"address"`
	Documents          Documents      `json:"documents"`
	
	// Broker specific
	License            string  `json:"license"`
	Agency             string  `json:"agency"`
	IsActive           bool    `json:"is_active"`
}

// Enhanced RoleApplication with parsed JSON data
type EnhancedRoleApplication struct {
	gorm.Model
	UserID           uint             `json:"user_id"`
	RequestedRole    string           `json:"requested_role"`
	Status           ApplicationStatus `json:"status"`
	SubmittedAt      time.Time        `json:"submitted_at"`
	ReviewedAt       *time.Time       `json:"reviewed_at"`
	ReviewedBy       *uint            `json:"reviewed_by"`
	
	// Relationships
	User             User             `json:"user"`
	ReviewedByUser   *User            `json:"reviewed_by_user"`
	Worker           *EnhancedWorker  `json:"worker,omitempty"`
	Broker           *EnhancedBroker  `json:"broker,omitempty"`
}

// RoleApplication represents the simplified role application model
type RoleApplication struct {
	gorm.Model
	UserID           uint             `json:"user_id" gorm:"not null"`
	RequestedRole    string           `json:"requested_role" gorm:"not null"`
	Status           ApplicationStatus `json:"status" gorm:"default:'pending'"`
	SubmittedAt      time.Time        `json:"submitted_at" gorm:"default:NOW()"`
	ReviewedAt       *time.Time       `json:"reviewed_at"`
	ReviewedBy       *uint            `json:"reviewed_by"`
	
	// Relationships
	User             User             `json:"user" gorm:"foreignKey:UserID"`
	ReviewedByUser   *User            `json:"reviewed_by_user" gorm:"foreignKey:ReviewedBy"`
	Worker           *Worker          `json:"worker,omitempty" gorm:"foreignKey:RoleApplicationID"`
	Broker           *Broker          `json:"broker,omitempty" gorm:"foreignKey:RoleApplicationID"`
}

// TableName returns the table name for RoleApplication
func (RoleApplication) TableName() string {
	return "role_applications"
}

// ConvertToEnhanced converts a RoleApplication to EnhancedRoleApplication with parsed JSON
func (ra *RoleApplication) ConvertToEnhanced() *EnhancedRoleApplication {
	enhanced := &EnhancedRoleApplication{
		Model:         ra.Model,
		UserID:        ra.UserID,
		RequestedRole: ra.RequestedRole,
		Status:        ra.Status,
		SubmittedAt:   ra.SubmittedAt,
		ReviewedAt:    ra.ReviewedAt,
		ReviewedBy:    ra.ReviewedBy,
		User:          ra.User,
		ReviewedByUser: ra.ReviewedByUser,
	}

	// Convert Worker data if exists
	if ra.Worker != nil {
		enhancedWorker := &EnhancedWorker{
			Model:            ra.Worker.Model,
			UserID:           ra.Worker.UserID,
			RoleApplicationID: ra.Worker.RoleApplicationID,
			WorkerType:       ra.Worker.WorkerType,
			Experience:       ra.Worker.Experience,
			IsAvailable:      ra.Worker.IsAvailable,
			Rating:           ra.Worker.Rating,
			TotalBookings:    ra.Worker.TotalBookings,
			Earnings:         ra.Worker.Earnings,
			TotalJobs:        ra.Worker.TotalJobs,
			IsActive:         ra.Worker.IsActive,
		}

		// Parse JSON fields
		if ra.Worker.ContactInfo != "" {
			json.Unmarshal([]byte(ra.Worker.ContactInfo), &enhancedWorker.ContactInfo)
		}
		if ra.Worker.Address != "" {
			json.Unmarshal([]byte(ra.Worker.Address), &enhancedWorker.Address)
		}
		if ra.Worker.BankingInfo != "" {
			json.Unmarshal([]byte(ra.Worker.BankingInfo), &enhancedWorker.BankingInfo)
		}
		if ra.Worker.Documents != "" {
			json.Unmarshal([]byte(ra.Worker.Documents), &enhancedWorker.Documents)
		}
		if ra.Worker.Skills != "" {
			json.Unmarshal([]byte(ra.Worker.Skills), &enhancedWorker.Skills)
		}

		enhanced.Worker = enhancedWorker
	}

	// Convert Broker data if exists
	if ra.Broker != nil {
		enhancedBroker := &EnhancedBroker{
			Model:            ra.Broker.Model,
			UserID:           ra.Broker.UserID,
			RoleApplicationID: ra.Broker.RoleApplicationID,
			License:          ra.Broker.License,
			Agency:           ra.Broker.Agency,
			IsActive:         ra.Broker.IsActive,
		}

		// Parse JSON fields
		if ra.Broker.ContactInfo != "" {
			json.Unmarshal([]byte(ra.Broker.ContactInfo), &enhancedBroker.ContactInfo)
		}
		if ra.Broker.Address != "" {
			json.Unmarshal([]byte(ra.Broker.Address), &enhancedBroker.Address)
		}
		if ra.Broker.Documents != "" {
			json.Unmarshal([]byte(ra.Broker.Documents), &enhancedBroker.Documents)
		}

		enhanced.Broker = enhancedBroker
	}

	return enhanced
}


