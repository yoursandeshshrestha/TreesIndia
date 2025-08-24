package seed

import (
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// SeedManager handles all seeding operations
type SeedManager struct {
	db *gorm.DB
}

// NewSeedManager creates a new seed manager
func NewSeedManager() *SeedManager {
	return &SeedManager{
		db: database.GetDB(),
	}
}

// SeedAll runs all seeding operations
func (sm *SeedManager) SeedAll() error {
	logrus.Info("Starting seeding process...")

	// Seed in order of dependencies
	seeders := []func() error{
		sm.SeedAdminUser,
		sm.SeedAdminConfigurations,
		sm.SeedMainData,
	}

	for _, seeder := range seeders {
		if err := seeder(); err != nil {
			logrus.Errorf("Seeding failed: %v", err)
			return err
		}
	}

	logrus.Info("All seeding operations completed successfully")
	return nil
}

// SeedAdminUser seeds the admin user
func (sm *SeedManager) SeedAdminUser() error {
	return SeedAdminUser(sm.db)
}

// SeedMainData seeds the main application data
func (sm *SeedManager) SeedMainData() error {
	return sm.seedMainData()
}

// SeedServiceAreas seeds service areas for all services
func (sm *SeedManager) SeedServiceAreas() error {
	return sm.SeedServiceAreasData()
}

// SeedAdminConfigurations seeds all admin configurations
func (sm *SeedManager) SeedAdminConfigurations() error {
	logrus.Info("Seeding admin configurations...")

	configs := []models.AdminConfig{
		// System Feature Flags
		{
			Key:         "enable_booking_system",
			Value:       "true",
			Type:        "bool",
			Category:    "booking",
			Description: "Enable the booking system for users",
			IsActive:    true,
		},
		{
			Key:         "enable_avatar_upload",
			Value:       "true",
			Type:        "bool",
			Category:    "system",
			Description: "Allow users to upload profile pictures",
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
			Key:         "max_wallet_balance",
			Value:       "100000",
			Type:        "float",
			Category:    "wallet",
			Description: "Maximum wallet balance for all users",
			IsActive:    true,
		},
		{
			Key:         "min_recharge_amount",
			Value:       "100",
			Type:        "float",
			Category:    "wallet",
			Description: "Minimum amount for wallet recharge",
			IsActive:    true,
		},
		{
			Key:         "max_recharge_amount",
			Value:       "50000",
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
		{
			Key:         "require_property_approval",
			Value:       "true",
			Type:        "bool",
			Category:    "property",
			Description: "Require admin approval for normal user properties",
			IsActive:    true,
		},

		// User Type Limits
		{
			Key:         "max_normal_user_properties",
			Value:       "0",
			Type:        "int",
			Category:    "system",
			Description: "Maximum properties per normal user (0 = unlimited)",
			IsActive:    true,
		},
		{
			Key:         "max_broker_properties_without_subscription",
			Value:       "1",
			Type:        "int",
			Category:    "system",
			Description: "Maximum properties broker can post without subscription",
			IsActive:    true,
		},
		{
			Key:         "broker_property_priority",
			Value:       "true",
			Type:        "bool",
			Category:    "system",
			Description: "Broker properties get priority listing",
			IsActive:    true,
		},
		{
			Key:         "require_property_approval_for_normaluser",
			Value:       "true",
			Type:        "bool",
			Category:    "property",
			Description: "Require admin approval for normal user properties",
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
			Value:       "+91-XXXXXXXXXX",
			Type:        "string",
			Category:    "system",
			Description: "Support phone number for user inquiries",
			IsActive:    true,
		},

		// Payment System
		{
			Key:         "payment_gateway_timeout",
			Value:       "30",
			Type:        "int",
			Category:    "payment",
			Description: "Payment gateway timeout in seconds",
			IsActive:    true,
		},
		{
			Key:         "enable_payment_retry",
			Value:       "true",
			Type:        "bool",
			Category:    "payment",
			Description: "Enable automatic payment retry on failure",
			IsActive:    true,
		},
		{
			Key:         "payment_currency",
			Value:       "INR",
			Type:        "string",
			Category:    "payment",
			Description: "Default payment currency",
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
			Key:         "booking_buffer_time_minutes",
			Value:       "30",
			Type:        "int",
			Category:    "booking",
			Description: "Buffer time between bookings in minutes",
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
			Key:         "wallet_payment_timeout_minutes",
			Value:       "30",
			Type:        "int",
			Category:    "wallet",
			Description: "Time in minutes before a pending wallet payment is considered abandoned",
			IsActive:    true,
		},
	}

	for _, config := range configs {
		if err := sm.db.Where("key = ?", config.Key).FirstOrCreate(&config).Error; err != nil {
			logrus.Errorf("Failed to seed config %s: %v", config.Key, err)
			return err
		}
	}

	// Add auto-assignment configuration
	autoAssignConfig := models.AdminConfig{
		Key:         "auto_assign_workers_on_booking",
		Value:       "true",
		Type:        "bool",
		Category:    "booking",
		Description: "Automatically reserve workers from pool when bookings are created",
		IsActive:    true,
	}

	if err := sm.db.Where("key = ?", autoAssignConfig.Key).FirstOrCreate(&autoAssignConfig).Error; err != nil {
		logrus.Error("Failed to create auto-assignment config:", err)
		return err
	}

	logrus.Info("Auto-assignment configuration seeded successfully")

	logrus.Info("Admin configurations seeded successfully")
	return nil
}


