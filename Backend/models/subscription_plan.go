package models

import (
	"gorm.io/gorm"
)

// SubscriptionPlan represents available subscription plans
type SubscriptionPlan struct {
	gorm.Model
	Name        string  `json:"name" gorm:"not null"`        // "Monthly Broker", "Yearly Broker", "One-time Broker"
	Duration    string  `json:"duration" gorm:"not null"`    // "monthly", "yearly", "one_time"
	Price       float64 `json:"price" gorm:"not null"`       // Admin set price
	IsActive    bool    `json:"is_active" gorm:"default:true"` // Admin can enable/disable
	Description string  `json:"description"`                 // Plan description
	
	// Relationships
	UserSubscriptions []UserSubscription `json:"user_subscriptions,omitempty" gorm:"foreignKey:PlanID"`
}

// TableName returns the table name for SubscriptionPlan
func (SubscriptionPlan) TableName() string {
	return "subscription_plans"
}

// Duration constants
const (
	DurationMonthly  = "monthly"
	DurationYearly   = "yearly"
	DurationOneTime  = "one_time"
)
