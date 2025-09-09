package models

import (
	"time"

	"gorm.io/gorm"
)

// UserSubscription represents user subscription records
type UserSubscription struct {
	gorm.Model
	UserID          uint      `json:"user_id" gorm:"not null"`
	User            User      `json:"user" gorm:"foreignKey:UserID"`
	PlanID          uint      `json:"plan_id" gorm:"column:subscription_plan_id;not null"`
	Plan            SubscriptionPlan `json:"plan" gorm:"foreignKey:PlanID"`
	StartDate       time.Time `json:"start_date" gorm:"not null"`
	EndDate         time.Time `json:"end_date" gorm:"not null"`
	Status          string    `json:"status" gorm:"default:'active'"` // "active", "expired"
	PaymentMethod   string    `json:"payment_method" gorm:"not null"` // "wallet", "razorpay"
	PaymentID       string    `json:"payment_id"` // Razorpay payment ID
	Amount          float64   `json:"amount" gorm:"not null"`
}

// TableName returns the table name for UserSubscription
func (UserSubscription) TableName() string {
	return "user_subscriptions"
}

// Status constants
const (
	SubscriptionStatusActive  = "active"
	SubscriptionStatusExpired = "expired"
)

// Payment method constants
const (
	PaymentMethodWallet  = "wallet"
	PaymentMethodRazorpay = "razorpay"
)
