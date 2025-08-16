package models

import (
	"time"

	"gorm.io/gorm"
)

// UserType represents the type of user
type UserType string

const (
	UserTypeNormal    UserType = "normal"
	UserTypeWorker    UserType = "worker"
	UserTypeBroker    UserType = "broker"
	UserTypeAdmin     UserType = "admin"
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
	
	// Status
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	LastLoginAt *time.Time `json:"last_login_at"`
	
	// Role application fields
	RoleApplicationStatus string    `json:"role_application_status" gorm:"default:'none'"` // "none", "pending", "approved", "rejected"
	ApplicationDate       *time.Time `json:"application_date"`
	ApprovalDate          *time.Time `json:"approval_date"`
	
	// Wallet System
	WalletBalance    float64 `json:"wallet_balance" gorm:"default:0"`    // Wallet balance
	WalletLimit      float64 `json:"wallet_limit" gorm:"default:100000"` // Admin configurable wallet limit
	
	// Subscription fields
	SubscriptionID      *uint             `json:"subscription_id"`
	Subscription        *UserSubscription `json:"subscription" gorm:"foreignKey:SubscriptionID"`
	HasActiveSubscription bool            `json:"has_active_subscription" gorm:"default:false"`
	SubscriptionExpiryDate *time.Time     `json:"subscription_expiry_date"`
	
	// Relationships
	UserNotificationSettings *UserNotificationSettings `json:"notification_settings" gorm:"foreignKey:UserID"`
	UserRoles                []UserRole                `json:"user_roles,omitempty" gorm:"foreignKey:UserID"`
	UserSubscriptions        []UserSubscription        `json:"user_subscriptions,omitempty" gorm:"foreignKey:UserID"`
	SubscriptionWarnings     []SubscriptionWarning     `json:"subscription_warnings,omitempty" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}