package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"gorm.io/gorm"
)

// JSONB represents a JSONB field that can be null
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("cannot scan non-byte value into JSONB")
	}
	
	return json.Unmarshal(bytes, j)
}

// SubscriptionPlan represents available subscription plans
type SubscriptionPlan struct {
	gorm.Model
	Name        string  `json:"name" gorm:"not null"`        // "Monthly Broker", "Yearly Broker", "One-time Broker"
	DurationDays int    `json:"duration_days" gorm:"not null"` // Duration in days
	Price       float64 `json:"price" gorm:"not null"`       // Admin set price
	IsActive    bool    `json:"is_active" gorm:"default:true"` // Admin can enable/disable
	Description string  `json:"description"`                 // Plan description
	Features    JSONB   `json:"features" gorm:"type:jsonb"`  // Plan features as JSON
	
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
