package models

import (
	"time"

	"gorm.io/gorm"
)

// SubscriptionWarning represents subscription warning notifications
type SubscriptionWarning struct {
	gorm.Model
	UserID      uint      `json:"user_id" gorm:"not null"`
	User        User      `json:"user" gorm:"foreignKey:UserID"`
	DaysLeft    int       `json:"days_left" gorm:"not null"` // 1, 7 days before expiry
	WarningDate time.Time `json:"warning_date" gorm:"not null"`
	SentVia     string    `json:"sent_via" gorm:"not null"` // "email", "sms", "both"
}

// TableName returns the table name for SubscriptionWarning
func (SubscriptionWarning) TableName() string {
	return "subscription_warnings"
}

// Warning type constants
const (
	WarningTypeEmail = "email"
	WarningTypeSMS   = "sms"
	WarningTypeBoth  = "both"
)
