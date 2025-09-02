package services

import (
	"fmt"
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// DeviceManagementService handles device token operations
type DeviceManagementService struct {
	db          *gorm.DB
	fcmService  *FCMService
}

// DeviceRegistrationRequest represents a device registration request
type DeviceRegistrationRequest struct {
	UserID      uint   `json:"user_id" binding:"required"`
	Token       string `json:"token" binding:"required"`
	Platform    string `json:"platform" binding:"required"`
	AppVersion  string `json:"app_version"`
	DeviceModel string `json:"device_model"`
	OSVersion   string `json:"os_version"`
}

// NewDeviceManagementService creates a new device management service
func NewDeviceManagementService(fcmService *FCMService) *DeviceManagementService {
	return &DeviceManagementService{
		db:         database.GetDB(),
		fcmService: fcmService,
	}
}

// RegisterDevice registers a new device token for a user
func (d *DeviceManagementService) RegisterDevice(req *DeviceRegistrationRequest) error {
	// Validate token length (FCM tokens are typically 140-160 characters)
	if len(req.Token) < 50 || len(req.Token) > 500 {
		return fmt.Errorf("invalid token length: token must be between 50 and 500 characters, got %d", len(req.Token))
	}

	// Check if user exists
	var user models.User
	if err := d.db.First(&user, req.UserID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Check if user has push notifications enabled
	var notificationSettings models.UserNotificationSettings
	if err := d.db.Where("user_id = ?", req.UserID).First(&notificationSettings).Error; err != nil {
		// Create default notification settings if they don't exist
		notificationSettings = models.UserNotificationSettings{
			UserID:            req.UserID,
			PushNotifications: true,
			EmailNotifications: true,
			SMSNotifications:   true,
			MarketingEmails:    false,
			BookingReminders:   true,
			ServiceUpdates:     true,
		}
		if err := d.db.Create(&notificationSettings).Error; err != nil {
			return fmt.Errorf("failed to create notification settings: %w", err)
		}
	}

	if !notificationSettings.PushNotifications {
		return fmt.Errorf("push notifications are disabled for this user")
	}

	// Check if token already exists
	var existingToken models.DeviceToken
	if err := d.db.Where("token = ?", req.Token).First(&existingToken).Error; err == nil {
		// Token exists, update it
		updates := map[string]interface{}{
			"user_id":           req.UserID,
			"platform":          req.Platform,
			"app_version":       req.AppVersion,
			"device_model":      req.DeviceModel,
			"os_version":        req.OSVersion,
			"is_active":         true,
			"last_used_at":      time.Now(),
			"updated_at":        time.Now(),
		}
		
		if err := d.db.Model(&existingToken).Updates(updates).Error; err != nil {
			return fmt.Errorf("failed to update existing token: %w", err)
		}
		return nil
	}

	// Create new device token
	deviceToken := models.DeviceToken{
		UserID:      req.UserID,
		Token:       req.Token,
		Platform:    models.DevicePlatform(req.Platform),
		AppVersion:  req.AppVersion,
		DeviceModel: req.DeviceModel,
		OSVersion:   req.OSVersion,
		IsActive:    true,
		LastUsedAt:  nil, // Will be set when first used
	}

	if err := d.db.Create(&deviceToken).Error; err != nil {
		return fmt.Errorf("failed to create device token: %w", err)
	}

	return nil
}

// UnregisterDevice removes a device token
func (d *DeviceManagementService) UnregisterDevice(userID uint, token string) error {
	result := d.db.Where("user_id = ? AND token = ?", userID, token).Delete(&models.DeviceToken{})
	if result.Error != nil {
		return fmt.Errorf("failed to unregister device: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("device token not found")
	}
	
	return nil
}

// GetUserDevices returns all active devices for a user
func (d *DeviceManagementService) GetUserDevices(userID uint) ([]models.DeviceToken, error) {
	var devices []models.DeviceToken
	if err := d.db.Where("user_id = ? AND is_active = ?", userID, true).Find(&devices).Error; err != nil {
		return nil, fmt.Errorf("failed to get user devices: %w", err)
	}
	
	return devices, nil
}

// GetUserDeviceTokens returns just the token strings for a user
func (d *DeviceManagementService) GetUserDeviceTokens(userID uint) ([]string, error) {
	var tokens []string
	if err := d.db.Model(&models.DeviceToken{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Pluck("token", &tokens).Error; err != nil {
		return nil, fmt.Errorf("failed to get user device tokens: %w", err)
	}
	
	return tokens, nil
}

// ValidateAndCleanupTokens validates all tokens and marks invalid ones as inactive
func (d *DeviceManagementService) ValidateAndCleanupTokens() error {
	var tokens []models.DeviceToken
	if err := d.db.Where("is_active = ?", true).Find(&tokens).Error; err != nil {
		return fmt.Errorf("failed to fetch active tokens: %w", err)
	}

	var invalidTokens []uint
	for _, token := range tokens {
		isValid, err := d.fcmService.ValidateToken(token.Token)
		if err != nil {
			// Log error but continue with other tokens - don't mark as invalid for FCM errors
			fmt.Printf("Warning: FCM validation error for token %s: %v\n", token.Token[:10]+"...", err)
			continue
		}
		
		if !isValid {
			invalidTokens = append(invalidTokens, token.ID)
			fmt.Printf("Invalid token found: %s (user: %d)\n", token.Token[:10]+"...", token.UserID)
		}
	}

	// Mark invalid tokens as inactive
	if len(invalidTokens) > 0 {
		if err := d.db.Model(&models.DeviceToken{}).
			Where("id IN ?", invalidTokens).
			Update("is_active", false).Error; err != nil {
			return fmt.Errorf("failed to mark invalid tokens as inactive: %w", err)
		}
		
		fmt.Printf("Marked %d invalid tokens as inactive\n", len(invalidTokens))
	} else {
		fmt.Printf("No invalid tokens found\n")
	}

	return nil
}

// UpdateDeviceLastUsed updates the last used timestamp for a device
func (d *DeviceManagementService) UpdateDeviceLastUsed(token string) error {
	now := time.Now()
	if err := d.db.Model(&models.DeviceToken{}).
		Where("token = ?", token).
		Update("last_used_at", now).Error; err != nil {
		return fmt.Errorf("failed to update device last used: %w", err)
	}
	
	return nil
}

// GetDeviceStats returns statistics about device registrations
func (d *DeviceManagementService) GetDeviceStats() (map[string]interface{}, error) {
	var totalDevices int64
	var activeDevices int64
	var androidDevices int64
	var iosDevices int64
	var webDevices int64

	if err := d.db.Model(&models.DeviceToken{}).Count(&totalDevices).Error; err != nil {
		return nil, err
	}
	
	if err := d.db.Model(&models.DeviceToken{}).Where("is_active = ?", true).Count(&activeDevices).Error; err != nil {
		return nil, err
	}
	
	if err := d.db.Model(&models.DeviceToken{}).Where("platform = ?", models.DevicePlatformAndroid).Count(&androidDevices).Error; err != nil {
		return nil, err
	}
	
	if err := d.db.Model(&models.DeviceToken{}).Where("platform = ?", models.DevicePlatformIOS).Count(&iosDevices).Error; err != nil {
		return nil, err
	}
	
	if err := d.db.Model(&models.DeviceToken{}).Where("platform = ?", models.DevicePlatformWeb).Count(&webDevices).Error; err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_devices":   totalDevices,
		"active_devices":  activeDevices,
		"android_devices": androidDevices,
		"ios_devices":     iosDevices,
		"web_devices":     webDevices,
		"inactive_devices": totalDevices - activeDevices,
	}, nil
}


