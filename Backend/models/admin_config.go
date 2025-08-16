package models

import (
	"gorm.io/gorm"
)

// AdminConfig represents system-wide configuration settings
type AdminConfig struct {
	gorm.Model
	Key         string `json:"key" gorm:"uniqueIndex;not null"`
	Value       string `json:"value" gorm:"not null"`
	Type        string `json:"type" gorm:"not null"` // "string", "int", "float", "bool"
	Category    string `json:"category" gorm:"not null"` // "wallet", "property", "service", "system", "payment"
	Description string `json:"description"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for AdminConfig
func (AdminConfig) TableName() string {
	return "admin_configs"
}

// DefaultConfigs contains the default configuration values
var DefaultConfigs = []AdminConfig{

	
	// Wallet System
	{Key: "default_wallet_limit", Value: "100000", Type: "float", Category: "wallet", Description: "Default wallet limit in INR"},
	{Key: "min_recharge_amount", Value: "100", Type: "float", Category: "wallet", Description: "Minimum recharge amount"},
	{Key: "max_recharge_amount", Value: "50000", Type: "float", Category: "wallet", Description: "Maximum single recharge amount"},
	
	// Property System
	{Key: "property_expiry_days", Value: "30", Type: "int", Category: "property", Description: "Days until property listing expires"},
	{Key: "auto_approve_broker_properties", Value: "true", Type: "bool", Category: "property", Description: "Auto-approve broker property listings"},
	{Key: "require_property_approval", Value: "true", Type: "bool", Category: "property", Description: "Require admin approval for normal user properties"},
	
	// System Limits
	{Key: "max_property_images", Value: "5", Type: "int", Category: "system", Description: "Maximum images per property"},
	{Key: "max_normal_user_properties", Value: "0", Type: "int", Category: "system", Description: "Maximum properties per normal user (0 = unlimited)"},
	{Key: "max_broker_properties_without_subscription", Value: "1", Type: "int", Category: "system", Description: "Maximum properties broker can post without subscription"},
	{Key: "broker_property_priority", Value: "true", Type: "bool", Category: "system", Description: "Broker properties get priority listing"},
	
	// Payment System
	{Key: "razorpay_key_id", Value: "rzp_test_R5AUjoyz0QoYmH", Type: "string", Category: "payment", Description: "Razorpay Key ID"},
	{Key: "razorpay_secret_key", Value: "gtpRKsGGGD7ofEXWvaoKRfB4", Type: "string", Category: "payment", Description: "Razorpay Secret Key"},
	{Key: "razorpay_webhook_secret", Value: "", Type: "string", Category: "payment", Description: "Razorpay Webhook Secret"},
}
