package services

import (
	"fmt"

	"github.com/sirupsen/logrus"
)

// DynamicFeaturesService demonstrates how to use dynamic configurations
type DynamicFeaturesService struct {
	configChecker *DynamicConfigChecker
}

// NewDynamicFeaturesService creates a new dynamic features service
func NewDynamicFeaturesService() *DynamicFeaturesService {
	return &DynamicFeaturesService{
		configChecker: NewDynamicConfigChecker(),
	}
}

// CheckUserRegistration checks if user registration is enabled
func (dfs *DynamicFeaturesService) CheckUserRegistration() bool {
	return dfs.configChecker.IsFeatureEnabled("enable_user_registration", true)
}

// CheckEmailVerification checks if email verification is required
func (dfs *DynamicFeaturesService) CheckEmailVerification() bool {
	return dfs.configChecker.IsFeatureEnabled("require_email_verification", false)
}

// CheckSMSVerification checks if SMS verification is required
func (dfs *DynamicFeaturesService) CheckSMSVerification() bool {
	return dfs.configChecker.IsFeatureEnabled("require_sms_verification", false)
}

// GetMaxLoginAttempts gets maximum login attempts
func (dfs *DynamicFeaturesService) GetMaxLoginAttempts() int {
	return dfs.configChecker.GetLimit("max_login_attempts", "int", 5).(int)
}

// GetSessionTimeout gets session timeout in minutes
func (dfs *DynamicFeaturesService) GetSessionTimeout() int {
	return dfs.configChecker.GetLimit("session_timeout_minutes", "int", 30).(int)
}

// CheckBookingSystem checks if booking system is enabled
func (dfs *DynamicFeaturesService) CheckBookingSystem() bool {
	return dfs.configChecker.IsBookingEnabled()
}

// GetFileUploadLimits gets file upload limits
func (dfs *DynamicFeaturesService) GetFileUploadLimits() map[string]interface{} {
	return map[string]interface{}{
		"avatar_max_size_mb":    dfs.configChecker.GetLimit("avatar_max_size_mb", "int", 5),
		"document_max_size_mb":  dfs.configChecker.GetLimit("document_max_size_mb", "int", 10),
		"image_max_size_mb":     dfs.configChecker.GetLimit("image_max_size_mb", "int", 5),
		"video_max_size_mb":     dfs.configChecker.GetLimit("video_max_size_mb", "int", 50),
	}
}

// GetRateLimits gets rate limiting settings
func (dfs *DynamicFeaturesService) GetRateLimits() map[string]interface{} {
	return map[string]interface{}{
		"api_requests_per_minute": dfs.configChecker.GetLimit("api_requests_per_minute", "int", 100),
		"login_attempts_per_hour": dfs.configChecker.GetLimit("login_attempts_per_hour", "int", 10),
		"upload_requests_per_hour": dfs.configChecker.GetLimit("upload_requests_per_hour", "int", 50),
	}
}

// GetFeatureFlags gets all feature flags
func (dfs *DynamicFeaturesService) GetFeatureFlags() map[string]bool {
	return map[string]bool{
		"enable_avatar_upload":        dfs.configChecker.IsFeatureEnabled("enable_avatar_upload", true),
		"enable_user_registration":    dfs.configChecker.IsFeatureEnabled("enable_user_registration", true),
		"enable_email_notifications":  dfs.configChecker.IsFeatureEnabled("enable_email_notifications", true),
		"enable_sms_notifications":    dfs.configChecker.IsFeatureEnabled("enable_sms_notifications", true),
		"enable_push_notifications":   dfs.configChecker.IsFeatureEnabled("enable_push_notifications", true),
		"enable_property_approval":    dfs.configChecker.IsFeatureEnabled("enable_property_approval", true),
		"enable_service_booking":      dfs.configChecker.IsFeatureEnabled("enable_service_booking", true),
		"enable_wallet_transactions":  dfs.configChecker.IsFeatureEnabled("enable_wallet_transactions", true),
		"enable_user_reviews":         dfs.configChecker.IsFeatureEnabled("enable_user_reviews", true),
		"enable_admin_dashboard":      dfs.configChecker.IsFeatureEnabled("enable_admin_dashboard", true),
	}
}

// GetSystemConfig gets system-wide configuration
func (dfs *DynamicFeaturesService) GetSystemConfig() map[string]interface{} {
	return map[string]interface{}{
		"app_name":                    dfs.configChecker.GetSystemConfig("app_name", "TREESINDIA"),
		"support_email":               dfs.configChecker.GetSystemConfig("support_email", "support@treesindiaservices.com"),
		"support_phone":               dfs.configChecker.GetSystemConfig("support_phone", "+91-XXXXXXXXXX"),
		"booking_system_enabled":      dfs.configChecker.IsBookingEnabled(),
		"default_language":            dfs.configChecker.GetSystemConfig("default_language", "en"),
		"default_timezone":            dfs.configChecker.GetSystemConfig("default_timezone", "Asia/Kolkata"),
		"max_file_upload_size_mb":     dfs.configChecker.GetLimit("max_file_upload_size_mb", "int", 10),
		"session_timeout_minutes":     dfs.configChecker.GetLimit("session_timeout_minutes", "int", 30),
	}
}

// ValidateFeatureAccess validates if a user can access a specific feature
func (dfs *DynamicFeaturesService) ValidateFeatureAccess(featureName string, userType string) (bool, string) {
	// Check if feature is globally enabled
	if !dfs.configChecker.IsFeatureEnabled(fmt.Sprintf("enable_%s", featureName), true) {
		return false, "This feature is currently disabled"
	}

	// Check user type specific permissions
	userTypeKey := fmt.Sprintf("enable_%s_for_%s", featureName, userType)
	if !dfs.configChecker.IsFeatureEnabled(userTypeKey, true) {
		return false, fmt.Sprintf("This feature is not available for %s users", userType)
	}

	return true, ""
}

// GetUserLimits gets user-specific limits based on user type
func (dfs *DynamicFeaturesService) GetUserLimits(userType string) map[string]interface{} {
	limits := make(map[string]interface{})
	
	// Common limits
	limits["max_properties"] = dfs.configChecker.GetLimit(fmt.Sprintf("max_properties_%s", userType), "int", 0)
	limits["max_services"] = dfs.configChecker.GetLimit(fmt.Sprintf("max_services_%s", userType), "int", 0)
	limits["max_bookings"] = dfs.configChecker.GetLimit(fmt.Sprintf("max_bookings_%s", userType), "int", 0)
	

	
	return limits
}

// LogConfigurationAccess logs when configurations are accessed (for debugging)
func (dfs *DynamicFeaturesService) LogConfigurationAccess(key string, value interface{}) {
	logrus.Infof("Dynamic config accessed - Key: %s, Value: %v", key, value)
}
