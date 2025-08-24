package services

import (
	"fmt"
)

// ConfigSchema defines the structure of a configuration
type ConfigSchema struct {
	Key         string      `json:"key"`
	Type        string      `json:"type"`
	Category    string      `json:"category"`
	Description string      `json:"description"`
	DefaultValue interface{} `json:"default_value"`
	Example     interface{} `json:"example"`
	Required    bool        `json:"required"`
	Options     []string    `json:"options,omitempty"`
	MinValue    interface{} `json:"min_value,omitempty"`
	MaxValue    interface{} `json:"max_value,omitempty"`
	Unit        string      `json:"unit,omitempty"`
}

// ConfigRegistry holds all available configuration schemas
type ConfigRegistry struct {
	schemas map[string]ConfigSchema
}

// NewConfigRegistry creates a new configuration registry
func NewConfigRegistry() *ConfigRegistry {
	registry := &ConfigRegistry{
		schemas: make(map[string]ConfigSchema),
	}
	registry.registerDefaultSchemas()
	return registry
}

// registerDefaultSchemas registers all default configuration schemas
func (cr *ConfigRegistry) registerDefaultSchemas() {
	// System Feature Flags
	cr.registerSchema(ConfigSchema{
		Key:         "enable_avatar_upload",
		Type:        "bool",
		Category:    "system",
		Description: "Allow users to upload profile pictures",
		DefaultValue: true,
		Example:     false,
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "enable_booking_system",
		Type:        "bool",
		Category:    "booking",
		Description: "Enable the booking system for users",
		DefaultValue: true,
		Example:     false,
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "enable_user_registration",
		Type:        "bool",
		Category:    "system",
		Description: "Allow new users to register accounts",
		DefaultValue: true,
		Example:     true,
		Required:    false,
	})

	// User Management
	cr.registerSchema(ConfigSchema{
		Key:         "require_email_verification",
		Type:        "bool",
		Category:    "system",
		Description: "Require email verification for new user accounts",
		DefaultValue: false,
		Example:     true,
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "require_sms_verification",
		Type:        "bool",
		Category:    "system",
		Description: "Require SMS verification for new user accounts",
		DefaultValue: false,
		Example:     false,
		Required:    false,
	})

	// Session & Security
	cr.registerSchema(ConfigSchema{
		Key:         "session_timeout_minutes",
		Type:        "int",
		Category:    "system",
		Description: "User session timeout in minutes",
		DefaultValue: 30,
		Example:     60,
		Required:    false,
		MinValue:    5,
		MaxValue:    1440,
		Unit:        "minutes",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "max_login_attempts",
		Type:        "int",
		Category:    "system",
		Description: "Maximum login attempts before account lockout",
		DefaultValue: 3,
		Example:     5,
		Required:    false,
		MinValue:    1,
		MaxValue:    10,
	})

	// File Upload Limits
	cr.registerSchema(ConfigSchema{
		Key:         "avatar_max_size_mb",
		Type:        "int",
		Category:    "system",
		Description: "Maximum file size for avatar uploads",
		DefaultValue: 5,
		Example:     10,
		Required:    false,
		MinValue:    1,
		MaxValue:    50,
		Unit:        "MB",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "document_max_size_mb",
		Type:        "int",
		Category:    "system",
		Description: "Maximum file size for document uploads",
		DefaultValue: 10,
		Example:     20,
		Required:    false,
		MinValue:    1,
		MaxValue:    100,
		Unit:        "MB",
	})

	// Wallet System


	cr.registerSchema(ConfigSchema{
		Key:         "min_recharge_amount",
		Type:        "float",
		Category:    "wallet",
		Description: "Minimum amount for wallet recharge",
		DefaultValue: 100.0,
		Example:     50.0,
		Required:    false,
		MinValue:    1.0,
		MaxValue:    10000.0,
		Unit:        "INR",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "max_recharge_amount",
		Type:        "float",
		Category:    "wallet",
		Description: "Maximum amount for single wallet recharge",
		DefaultValue: 50000.0,
		Example:     100000.0,
		Required:    false,
		MinValue:    100.0,
		MaxValue:    1000000.0,
		Unit:        "INR",
	})

	// Property System
	cr.registerSchema(ConfigSchema{
		Key:         "property_expiry_days",
		Type:        "int",
		Category:    "property",
		Description: "Days until property listing expires",
		DefaultValue: 30,
		Example:     60,
		Required:    false,
		MinValue:    1,
		MaxValue:    365,
		Unit:        "days",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "max_property_images",
		Type:        "int",
		Category:    "property",
		Description: "Maximum images per property listing",
		DefaultValue: 5,
		Example:     10,
		Required:    false,
		MinValue:    1,
		MaxValue:    20,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "auto_approve_broker_properties",
		Type:        "bool",
		Category:    "property",
		Description: "Automatically approve property listings from brokers",
		DefaultValue: true,
		Example:     false,
		Required:    false,
	})

	// User Type Limits
	cr.registerSchema(ConfigSchema{
		Key:         "max_properties_normal",
		Type:        "int",
		Category:    "property",
		Description: "Maximum properties for normal users (0 = unlimited)",
		DefaultValue: 0,
		Example:     2,
		Required:    false,
		MinValue:    0,
		MaxValue:    100,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "max_properties_broker",
		Type:        "int",
		Category:    "property",
		Description: "Maximum properties for broker users",
		DefaultValue: 1,
		Example:     5,
		Required:    false,
		MinValue:    1,
		MaxValue:    100,
	})

	// System Information
	cr.registerSchema(ConfigSchema{
		Key:         "support_email",
		Type:        "string",
		Category:    "system",
		Description: "Support email address for user inquiries",
		DefaultValue: "support@treesindiaservices.com",
		Example:     "help@treesindiaservices.com",
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "support_phone",
		Type:        "string",
		Category:    "system",
		Description: "Support phone number for user inquiries",
		DefaultValue: "+91-XXXXXXXXXX",
		Example:     "+91-9876543210",
		Required:    false,
	})



	// Working Hours Configuration
	cr.registerSchema(ConfigSchema{
		Key:         "working_hours_start",
		Type:        "string",
		Category:    "booking",
		Description: "Start time for working hours (24-hour format: HH:MM)",
		DefaultValue: "09:00",
		Example:     "08:00",
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "working_hours_end",
		Type:        "string",
		Category:    "booking",
		Description: "End time for working hours (24-hour format: HH:MM)",
		DefaultValue: "22:00",
		Example:     "21:00",
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "working_days",
		Type:        "string",
		Category:    "booking",
		Description: "Working days (comma-separated: 1=Monday, 7=Sunday)",
		DefaultValue: "1,2,3,4,5,6,7",
		Example:     "1,2,3,4,5,6",
		Required:    false,
	})

	cr.registerSchema(ConfigSchema{
		Key:         "booking_advance_days",
		Type:        "int",
		Category:    "booking",
		Description: "How many days in advance users can book services",
		DefaultValue: 3,
		Example:     7,
		Required:    false,
		MinValue:    1,
		MaxValue:    365,
		Unit:        "days",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "booking_cancellation_hours",
		Type:        "int",
		Category:    "booking",
		Description: "Hours before booking when cancellation is allowed",
		DefaultValue: 24,
		Example:     12,
		Required:    false,
		MinValue:    1,
		MaxValue:    168,
		Unit:        "hours",
	})

	cr.registerSchema(ConfigSchema{
		Key:         "booking_hold_time_minutes",
		Type:        "int",
		Category:    "booking",
		Description: "Temporary hold time for booking slots in minutes (before payment)",
		DefaultValue: 7,
		Example:     10,
		Required:    false,
		MinValue:    1,
		MaxValue:    60,
		Unit:        "minutes",
	})

	// Wallet Configuration
}

// registerSchema registers a configuration schema
func (cr *ConfigRegistry) registerSchema(schema ConfigSchema) {
	cr.schemas[schema.Key] = schema
}

// GetSchema gets a configuration schema by key
func (cr *ConfigRegistry) GetSchema(key string) (ConfigSchema, bool) {
	schema, exists := cr.schemas[key]
	return schema, exists
}

// GetAllSchemas gets all configuration schemas
func (cr *ConfigRegistry) GetAllSchemas() map[string]ConfigSchema {
	return cr.schemas
}

// GetSchemasByCategory gets all schemas for a specific category
func (cr *ConfigRegistry) GetSchemasByCategory(category string) map[string]ConfigSchema {
	result := make(map[string]ConfigSchema)
	for key, schema := range cr.schemas {
		if schema.Category == category {
			result[key] = schema
		}
	}
	return result
}

// ValidateConfiguration validates a configuration against its schema
func (cr *ConfigRegistry) ValidateConfiguration(key, value, configType string) error {
	schema, exists := cr.GetSchema(key)
	if !exists {
		return fmt.Errorf("unknown configuration key: %s", key)
	}

	// Type validation
	if schema.Type != configType {
		return fmt.Errorf("invalid type for key %s: expected %s, got %s", key, schema.Type, configType)
	}

	// Value validation based on type
	switch configType {
	case "int":
		return cr.validateIntValue(key, value, schema)
	case "float":
		return cr.validateFloatValue(key, value, schema)
	case "bool":
		return cr.validateBoolValue(key, value, schema)
	case "string":
		return cr.validateStringValue(key, value, schema)
	}

	return nil
}

// validateIntValue validates integer values
func (cr *ConfigRegistry) validateIntValue(_ string, _ string, _ ConfigSchema) error {
	// Add integer validation logic here
	return nil
}

// validateFloatValue validates float values
func (cr *ConfigRegistry) validateFloatValue(_ string, _ string, _ ConfigSchema) error {
	// Add float validation logic here
	return nil
}

// validateBoolValue validates boolean values
func (cr *ConfigRegistry) validateBoolValue(_ string, _ string, _ ConfigSchema) error {
	// Add boolean validation logic here
	return nil
}

// validateStringValue validates string values
func (cr *ConfigRegistry) validateStringValue(_ string, _ string, _ ConfigSchema) error {
	// Add string validation logic here
	return nil
}

// GetConfigurationTemplate returns a template for creating new configurations
func (cr *ConfigRegistry) GetConfigurationTemplate() map[string]interface{} {
	return map[string]interface{}{
		"available_keys": cr.GetAllSchemas(),
		"categories": []string{"system", "wallet", "property", "service", "payment"},
		"types": []string{"string", "int", "float", "bool"},
		"examples": map[string]interface{}{
			"feature_flag": map[string]interface{}{
				"key": "enable_new_feature",
				"value": "true",
				"type": "bool",
				"category": "system",
				"description": "Enable new feature for users",
				"is_active": true,
			},
			"limit": map[string]interface{}{
				"key": "max_items_per_user",
				"value": "10",
				"type": "int",
				"category": "system",
				"description": "Maximum items a user can have",
				"is_active": true,
			},
		},
	}
}
