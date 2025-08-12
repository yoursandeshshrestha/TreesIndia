package models

import (
	"time"

	"gorm.io/gorm"
)

// ApplicationStatus represents the status of a role application
type ApplicationStatus string

const (
	ApplicationStatusPending  ApplicationStatus = "pending"
	ApplicationStatusApproved ApplicationStatus = "approved"
	ApplicationStatusRejected ApplicationStatus = "rejected"
)

// RoleApplication represents a user's application for role change
type RoleApplication struct {
	ID            uint               `json:"id" gorm:"primaryKey"`
	UserID        uint               `json:"user_id" gorm:"not null;uniqueIndex"`
	User          User               `json:"-" gorm:"foreignKey:UserID"`
	RequestedRole UserType           `json:"requested_role" gorm:"not null"`
	Status        ApplicationStatus  `json:"status" gorm:"not null;default:'pending'"`
	AdminNotes    string             `json:"admin_notes"`
	SubmittedAt   time.Time          `json:"submitted_at"`
	ReviewedAt    *time.Time         `json:"reviewed_at"`
	ReviewedBy    *uint              `json:"reviewed_by"`
	Admin         *User              `json:"-" gorm:"foreignKey:ReviewedBy"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
	DeletedAt     gorm.DeletedAt     `json:"deleted_at,omitempty" gorm:"index"`
}

// TableName returns the table name for RoleApplication
func (RoleApplication) TableName() string {
	return "role_applications"
}

// CreateRoleApplicationRequest represents the comprehensive request structure for creating a role application
type CreateRoleApplicationRequest struct {
	AccountType string   `json:"account_type" binding:"required,oneof=worker broker"`
	
	// Optional user profile information (if not already set in user profile)
	Email  *string `json:"email" binding:"omitempty,email"`
	Gender string  `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
	
	// Document URLs (uploaded separately and provided as URLs)
	AadhaarCardFront  string `json:"aadhaar_card_front" binding:"required"`
	AadhaarCardBack   string `json:"aadhaar_card_back" binding:"required"`
	PanCardFront      string `json:"pan_card_front" binding:"required"`
	PanCardBack       string `json:"pan_card_back" binding:"required"`
	Avatar            string `json:"avatar" binding:"omitempty"` // Optional if user already has avatar
	
	// Skills (array of skill names)
	Skills []string `json:"skills" binding:"required,min=1"`
	
	// Location information (optional if user already has location)
	Location *CreateLocationRequest `json:"location" binding:"omitempty"`
}

// CreateBrokerApplicationRequest represents the simplified request structure for broker applications
type CreateBrokerApplicationRequest struct {
	Email         *string `json:"email" binding:"omitempty,email"`
	Name          *string `json:"name" binding:"omitempty"`
	BrokerLicense string  `json:"broker_license" binding:"required"`
	BrokerAgency  string  `json:"broker_agency" binding:"required"`
}

// CreateWorkerApplicationRequest represents the request structure for worker applications
type CreateWorkerApplicationRequest struct {
	// Optional user profile information (if not already set in user profile)
	Email  *string `json:"email" binding:"omitempty,email"`
	Gender string  `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
	
	// Document URLs (uploaded separately and provided as URLs)
	AadhaarCardFront  string `json:"aadhaar_card_front" binding:"required"`
	AadhaarCardBack   string `json:"aadhaar_card_back" binding:"required"`
	PanCardFront      string `json:"pan_card_front" binding:"required"`
	PanCardBack       string `json:"pan_card_back" binding:"required"`
	Avatar            string `json:"avatar" binding:"omitempty"` // Optional if user already has avatar
	
	// Skills (array of skill names)
	Skills []string `json:"skills" binding:"required,min=1"`
	
	// Location information (optional if user already has location)
	Location *CreateLocationRequest `json:"location" binding:"omitempty"`
}

// UpdateRoleApplicationRequest represents the request structure for updating a role application (admin only)
type UpdateRoleApplicationRequest struct {
	Status     ApplicationStatus `json:"status" binding:"required,oneof=pending approved rejected"`
	AdminNotes string            `json:"admin_notes"`
}

// RoleApplicationDetail represents a detailed role application with all related information
type RoleApplicationDetail struct {
	*RoleApplication
	User     *UserDetail     `json:"user"`
	Location *Location       `json:"location"`
	Documents []UserDocument `json:"documents"`
	Skills   []UserSkill     `json:"skills"`
}

// UserDetail represents user information for role application details
type UserDetail struct {
	ID                    uint       `json:"id"`
	Name                  string     `json:"name"`
	Email                 *string    `json:"email"`
	Phone                 string     `json:"phone"`
	UserType              UserType   `json:"user_type"`
	Avatar                string     `json:"avatar"`
	IsActive              bool       `json:"is_active"`
	IsVerified            bool       `json:"is_verified"`
	KYCStatus             KYCStatus  `json:"kyc_status"`
	RoleApplicationStatus string     `json:"role_application_status"`
	ApplicationDate       *time.Time `json:"application_date"`
	ApprovalDate          *time.Time `json:"approval_date"`
	CreatedAt             time.Time  `json:"created_at"`
}
