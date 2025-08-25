package seed

import (
	"errors"
	"fmt"
	"strings"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// SeedAdminConfigurations seeds all admin configurations
func (sm *SeedManager) SeedAdminConfigurations() error {
	logrus.Info("Seeding admin configurations...")
	
	// Debug: Check database connection
	if sm.db == nil {
		logrus.Error("Database connection is nil!")
		return fmt.Errorf("database connection is nil")
	}
	
	// Debug: Test database connection
	sqlDB, err := sm.db.DB()
	if err != nil {
		logrus.Errorf("Failed to get underlying database: %v", err)
		return err
	}
	
	if err := sqlDB.Ping(); err != nil {
		logrus.Errorf("Database ping failed: %v", err)
		return err
	}
	
	logrus.Info("Database connection verified successfully")

	// Define configurations based on the registry schema
	configs := []models.AdminConfig{
		// System Feature Flags
		{
			Key:         "enable_avatar_upload",
			Value:       "true",
			Type:        "bool",
			Category:    "system",
			Description: "Allow users to upload profile pictures",
			IsActive:    true,
		},
		{
			Key:         "enable_booking_system",
			Value:       "true",
			Type:        "bool",
			Category:    "booking",
			Description: "Enable the booking system for users",
			IsActive:    true,
		},
		{
			Key:         "enable_user_registration",
			Value:       "true",
			Type:        "bool",
			Category:    "system",
			Description: "Allow new users to register accounts",
			IsActive:    true,
		},

		// User Management
		{
			Key:         "require_email_verification",
			Value:       "false",
			Type:        "bool",
			Category:    "system",
			Description: "Require email verification for new user accounts",
			IsActive:    true,
		},
		{
			Key:         "require_sms_verification",
			Value:       "false",
			Type:        "bool",
			Category:    "system",
			Description: "Require SMS verification for new user accounts",
			IsActive:    true,
		},

		// Session & Security
		{
			Key:         "session_timeout_minutes",
			Value:       "30",
			Type:        "int",
			Category:    "system",
			Description: "User session timeout in minutes",
			IsActive:    true,
		},
		{
			Key:         "max_login_attempts",
			Value:       "3",
			Type:        "int",
			Category:    "system",
			Description: "Maximum login attempts before account lockout",
			IsActive:    true,
		},

		// File Upload Limits
		{
			Key:         "avatar_max_size_mb",
			Value:       "5",
			Type:        "int",
			Category:    "system",
			Description: "Maximum file size for avatar uploads",
			IsActive:    true,
		},
		{
			Key:         "document_max_size_mb",
			Value:       "10",
			Type:        "int",
			Category:    "system",
			Description: "Maximum file size for document uploads",
			IsActive:    true,
		},

		// Wallet System
		{
			Key:         "min_recharge_amount",
			Value:       "100.0",
			Type:        "float",
			Category:    "wallet",
			Description: "Minimum amount for wallet recharge",
			IsActive:    true,
		},
		{
			Key:         "max_recharge_amount",
			Value:       "50000.0",
			Type:        "float",
			Category:    "wallet",
			Description: "Maximum amount for single wallet recharge",
			IsActive:    true,
		},

		// Property System
		{
			Key:         "property_expiry_days",
			Value:       "30",
			Type:        "int",
			Category:    "property",
			Description: "Days until property listing expires",
			IsActive:    true,
		},
		{
			Key:         "max_property_images",
			Value:       "5",
			Type:        "int",
			Category:    "property",
			Description: "Maximum images per property listing",
			IsActive:    true,
		},
		{
			Key:         "auto_approve_broker_properties",
			Value:       "true",
			Type:        "bool",
			Category:    "property",
			Description: "Automatically approve property listings from brokers",
			IsActive:    true,
		},

		// User Type Limits
		{
			Key:         "max_properties_normal",
			Value:       "0",
			Type:        "int",
			Category:    "property",
			Description: "Maximum properties for normal users (0 = unlimited)",
			IsActive:    true,
		},
		{
			Key:         "max_properties_broker",
			Value:       "1",
			Type:        "int",
			Category:    "property",
			Description: "Maximum properties for broker users",
			IsActive:    true,
		},

		// System Information
		{
			Key:         "support_email",
			Value:       "support@treesindiaservices.com",
			Type:        "string",
			Category:    "system",
			Description: "Support email address for user inquiries",
			IsActive:    true,
		},
		{
			Key:         "support_phone",
			Value:       "+91-8597831350",
			Type:        "string",
			Category:    "system",
			Description: "Support phone number for user inquiries",
			IsActive:    true,
		},

		// Working Hours Configuration
		{
			Key:         "working_hours_start",
			Value:       "09:00",
			Type:        "string",
			Category:    "booking",
			Description: "Start time for working hours (24-hour format: HH:MM)",
			IsActive:    true,
		},
		{
			Key:         "working_hours_end",
			Value:       "22:00",
			Type:        "string",
			Category:    "booking",
			Description: "End time for working hours (24-hour format: HH:MM)",
			IsActive:    true,
		},
		{
			Key:         "working_days",
			Value:       "1,2,3,4,5,6,7",
			Type:        "string",
			Category:    "booking",
			Description: "Working days (comma-separated: 1=Monday, 7=Sunday)",
			IsActive:    true,
		},
		{
			Key:         "booking_advance_days",
			Value:       "3",
			Type:        "int",
			Category:    "booking",
			Description: "How many days in advance users can book services",
			IsActive:    true,
		},
		{
			Key:         "booking_cancellation_hours",
			Value:       "24",
			Type:        "int",
			Category:    "booking",
			Description: "Hours before booking when cancellation is allowed",
			IsActive:    true,
		},
		{
			Key:         "booking_hold_time_minutes",
			Value:       "7",
			Type:        "int",
			Category:    "booking",
			Description: "Temporary hold time for booking slots in minutes (before payment)",
			IsActive:    true,
		},
		{
			Key:         "booking_buffer_time_minutes",
			Value:       "30",
			Type:        "int",
			Category:    "booking",
			Description: "Buffer time between consecutive bookings in minutes",
			IsActive:    true,
		},
		{
			Key:         "inquiry_booking_fee",
			Value:       "100",
			Type:        "int",
			Category:    "booking",
			Description: "Fee charged for inquiry-based bookings",
			IsActive:    true,
		},
	}

	logrus.Infof("Processing %d configurations...", len(configs))
	
	for _, config := range configs {
		
		// Use Upsert to create or update the configuration
		var existingConfig models.AdminConfig
		result := sm.db.Where("key = ?", config.Key).First(&existingConfig)
		
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Create new config
				if err := sm.db.Create(&config).Error; err != nil {
					logrus.Errorf("Failed to create config %s: %v", config.Key, err)
					return err
				}
				logrus.Infof("✅ Created new config: %s = %s", config.Key, config.Value)
			} else {
				logrus.Errorf("Failed to check existing config %s: %v", config.Key, result.Error)
				return result.Error
			}
		} else {
			// Check if any values have actually changed
			hasChanges := false
			changes := []string{}
			
			if existingConfig.Value != config.Value {
				hasChanges = true
				changes = append(changes, fmt.Sprintf("value: %s → %s", existingConfig.Value, config.Value))
			}
			if existingConfig.Type != config.Type {
				hasChanges = true
				changes = append(changes, fmt.Sprintf("type: %s → %s", existingConfig.Type, config.Type))
			}
			if existingConfig.Category != config.Category {
				hasChanges = true
				changes = append(changes, fmt.Sprintf("category: %s → %s", existingConfig.Category, config.Category))
			}
			if existingConfig.Description != config.Description {
				hasChanges = true
				changes = append(changes, fmt.Sprintf("description: %s → %s", existingConfig.Description, config.Description))
			}
			if existingConfig.IsActive != config.IsActive {
				hasChanges = true
				changes = append(changes, fmt.Sprintf("is_active: %t → %t", existingConfig.IsActive, config.IsActive))
			}
			
			if hasChanges {
				// Update existing config only if there are changes
				existingConfig.Value = config.Value
				existingConfig.Type = config.Type
				existingConfig.Category = config.Category
				existingConfig.Description = config.Description
				existingConfig.IsActive = config.IsActive
				
				if err := sm.db.Save(&existingConfig).Error; err != nil {
					logrus.Errorf("Failed to update config %s: %v", config.Key, err)
					return err
				}
				logrus.Infof("🔄 Updated config %s: %s", config.Key, strings.Join(changes, ", "))
			} else {
				logrus.Infof("⏭️  Skipped config %s (no changes)", config.Key)
			}
		}
	}

	logrus.Info("Admin configurations seeded successfully")
	
	// Debug: Verify the configurations were actually saved
	logrus.Info("Verifying seeded configurations...")
	var verifyConfigs []models.AdminConfig
	if err := sm.db.Find(&verifyConfigs).Error; err != nil {
		logrus.Errorf("Failed to verify configurations: %v", err)
	} else {
		logrus.Infof("Found %d total configurations in database", len(verifyConfigs))
		for _, cfg := range verifyConfigs {
			logrus.Infof("  - %s = %s (%s)", cfg.Key, cfg.Value, cfg.Type)
		}
	}
	
	return nil
}
