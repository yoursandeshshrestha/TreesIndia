package models

import (
	"gorm.io/gorm"
)

// WorkerType represents the type of worker
type WorkerType string

const (
	WorkerTypeNormal        WorkerType = "normal"
	WorkerTypeTreesIndia    WorkerType = "treesindia_worker"
)

// Worker represents the worker model
type Worker struct {
	gorm.Model
	UserID             uint       `json:"user_id" gorm:"not null;uniqueIndex"`
	RoleApplicationID  *uint      `json:"role_application_id"`
	
	// Worker Type
	WorkerType         WorkerType `json:"worker_type" gorm:"default:'normal'"`
	
	// JSON Objects
	ContactInfo        string     `json:"contact_info"`        // JSONB: {"alternative_number": "string"}
	Address            string     `json:"address"`             // JSONB: {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
	BankingInfo        string     `json:"banking_info"`        // JSONB: {"account_number": "string", "ifsc_code": "string", "bank_name": "string", "account_holder_name": "string"}
	Documents          string     `json:"documents"`           // JSONB: {"aadhar_card": "cloudinary_url", "pan_card": "cloudinary_url", "profile_pic": "cloudinary_url", "police_verification": "cloudinary_url"}
	
	// Skills & Experience
	Skills             string     `json:"skills"`              // JSONB array of skill names
	Experience         int        `json:"experience_years" gorm:"column:experience_years"` // Years of experience
	
	// Operational Data
	IsAvailable        bool       `json:"is_available" gorm:"default:false"`
	Rating             float64    `json:"rating" gorm:"default:0"`
	TotalBookings      int        `json:"total_bookings" gorm:"default:0"`
	Earnings           float64    `json:"earnings" gorm:"default:0"`
	TotalJobs          int        `json:"total_jobs" gorm:"default:0"`
	IsActive           bool       `json:"is_active" gorm:"default:false"`
	
	// Relationships
	User               User            `json:"-" gorm:"foreignKey:UserID"` // Exclude to avoid circular reference
	RoleApplication    *RoleApplication `json:"role_application" gorm:"foreignKey:RoleApplicationID"`
}

// TableName returns the table name for Worker
func (Worker) TableName() string {
	return "workers"
}
