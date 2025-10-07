package models

import (
	"time"

	"gorm.io/gorm"
)

// OTP represents an OTP record
type OTP struct {
	gorm.Model
	Phone      string    `json:"phone" gorm:"not null;index"`
	Code       string    `json:"code" gorm:"not null"`
	ExpiresAt  time.Time `json:"expires_at" gorm:"not null;index"`
	IsVerified bool      `json:"is_verified" gorm:"default:false"`
	Purpose    string    `json:"purpose" gorm:"not null"` // "login", "registration", "account_deletion", etc.
	Attempts   int       `json:"attempts" gorm:"default:0"` // Track verification attempts
}

// IsExpired checks if the OTP has expired
func (o *OTP) IsExpired() bool {
	return time.Now().After(o.ExpiresAt)
}

// IsValid checks if the OTP is valid (not expired and not verified)
func (o *OTP) IsValid() bool {
	return !o.IsExpired() && !o.IsVerified
}

