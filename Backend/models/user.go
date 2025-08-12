package models

import (
	"time"

	"gorm.io/gorm"
)

// UserType represents the type of user
type UserType string

const (
	UserTypeNormal UserType = "normal"
	UserTypeWorker UserType = "worker"
	UserTypeBroker UserType = "broker"
	UserTypeAdmin  UserType = "admin"
)

// KYCStatus represents the KYC verification status
type KYCStatus string

const (
	KYCStatusPending   KYCStatus = "pending"
	KYCStatusApproved  KYCStatus = "approved"
	KYCStatusRejected  KYCStatus = "rejected"
	KYCStatusNotNeeded KYCStatus = "not_needed"
)

// User represents the main user model
type User struct {
	gorm.Model
	// Basic Information
	Name        string    `json:"name"`
	Email       *string   `json:"email" gorm:"uniqueIndex"`
	Phone       string    `json:"phone" gorm:"uniqueIndex;not null"`
	UserType    UserType  `json:"user_type" gorm:"not null;default:'normal'"`
	Avatar      string    `json:"avatar"`
	Gender      string    `json:"gender"` // "male", "female", "other", "prefer_not_to_say"
	
	// Location Information - Now handled by dedicated Location model
	
	// Status and Verification
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	IsVerified  bool      `json:"is_verified" gorm:"default:false"`
	KYCStatus   KYCStatus `json:"kyc_status" gorm:"default:'not_needed'"`
	
	// Authentication
	Password    string    `json:"-"` // Hashed password (optional for phone auth)
	GoogleID    *string   `json:"google_id" gorm:"uniqueIndex"`
	LastLoginAt *time.Time `json:"last_login_at"`
	
	// Worker-specific fields
	Earnings    float64   `json:"earnings" gorm:"default:0"`
	Rating      float64   `json:"rating" gorm:"default:0"`
	TotalJobs   int       `json:"total_jobs" gorm:"default:0"`
	
	// Broker-specific fields
	BrokerLicense string   `json:"broker_license"`
	BrokerAgency  string   `json:"broker_agency"`
	
	// Role application fields
	RoleApplicationStatus string    `json:"role_application_status" gorm:"default:'none'"` // "none", "pending", "approved", "rejected"
	ApplicationDate       *time.Time `json:"application_date"`
	ApprovalDate          *time.Time `json:"approval_date"`
	
	// Relationships
	UserNotificationSettings *UserNotificationSettings `json:"notification_settings" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}
