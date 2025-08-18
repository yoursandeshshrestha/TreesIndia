package services

import (
	"fmt"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// AdminConfigService handles business logic for admin configurations
type AdminConfigService struct {
	repo *repositories.AdminConfigRepository
}

// NewAdminConfigService creates a new admin config service
func NewAdminConfigService() *AdminConfigService {
	return &AdminConfigService{
		repo: repositories.NewAdminConfigRepository(),
	}
}

// GetByID retrieves an admin configuration by ID
func (s *AdminConfigService) GetByID(id uint) (*models.AdminConfig, error) {
	return s.repo.GetByID(id)
}

// GetAll retrieves all active admin configurations
func (s *AdminConfigService) GetAll() ([]models.AdminConfig, error) {
	return s.repo.GetAll()
}

// Update updates an admin configuration
func (s *AdminConfigService) Update(config *models.AdminConfig) error {
	// Validate the configuration
	if err := s.validateConfig(config); err != nil {
		return err
	}
	
	return s.repo.Update(config)
}



// GetConfigMap returns a map of all configurations
func (s *AdminConfigService) GetConfigMap() (map[string]string, error) {
	return s.repo.GetConfigMap()
}

// validateConfig validates a configuration
func (s *AdminConfigService) validateConfig(config *models.AdminConfig) error {
	if config.Key == "" {
		return fmt.Errorf("key is required")
	}
	
	if config.Value == "" {
		return fmt.Errorf("value is required")
	}
	
	if config.Type == "" {
		return fmt.Errorf("type is required")
	}
	
	if config.Category == "" {
		return fmt.Errorf("category is required")
	}
	
	// Validate the value based on the type
	return s.validateValue(config.Type, config.Value)
}

// validateValue validates a value based on its type
func (s *AdminConfigService) validateValue(valueType, value string) error {
	switch valueType {
	case "int":
		if _, err := strconv.Atoi(value); err != nil {
			return fmt.Errorf("invalid integer value: %s", value)
		}
	case "float":
		if _, err := strconv.ParseFloat(value, 64); err != nil {
			return fmt.Errorf("invalid float value: %s", value)
		}
	case "bool":
		if _, err := strconv.ParseBool(strings.ToLower(value)); err != nil {
			return fmt.Errorf("invalid boolean value: %s", value)
		}
	case "string":
		// String values are always valid
	default:
		return fmt.Errorf("unsupported type: %s", valueType)
	}
	
	return nil
}

// GetIntValue retrieves an integer configuration value
func (s *AdminConfigService) GetIntValue(key string) (int, error) {
	value, err := s.repo.GetValueByKey(key)
	if err != nil {
		return 0, err
	}
	
	intValue, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("invalid integer value for key %s: %s", key, value)
	}
	
	return intValue, nil
}

// GetFloatValue retrieves a float configuration value
func (s *AdminConfigService) GetFloatValue(key string) (float64, error) {
	value, err := s.repo.GetValueByKey(key)
	if err != nil {
		return 0, err
	}
	
	floatValue, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid float value for key %s: %s", key, value)
	}
	
	return floatValue, nil
}

// GetBoolValue retrieves a boolean configuration value
func (s *AdminConfigService) GetBoolValue(key string) (bool, error) {
	value, err := s.repo.GetValueByKey(key)
	if err != nil {
		return false, err
	}
	
	boolValue, err := strconv.ParseBool(strings.ToLower(value))
	if err != nil {
		return false, fmt.Errorf("invalid boolean value for key %s: %s", key, value)
	}
	
	return boolValue, nil
}

// GetMaxWalletBalance retrieves the maximum wallet balance
func (s *AdminConfigService) GetMaxWalletBalance() float64 {
	balance, err := s.GetFloatValue("max_wallet_balance")
	if err != nil {
		logrus.Warnf("Failed to get max wallet balance, using 0: %v", err)
		return 0
	}
	return balance
}

// GetMinRechargeAmount retrieves the minimum recharge amount
func (s *AdminConfigService) GetMinRechargeAmount() float64 {
	amount, err := s.GetFloatValue("min_recharge_amount")
	if err != nil {
		logrus.Warnf("Failed to get min recharge amount, using 100: %v", err)
		return 100
	}
	return amount
}

// GetMaxRechargeAmount retrieves the maximum recharge amount
func (s *AdminConfigService) GetMaxRechargeAmount() float64 {
	amount, err := s.GetFloatValue("max_recharge_amount")
	if err != nil {
		logrus.Warnf("Failed to get max recharge amount, using 0 (no limit): %v", err)
		return 0
	}
	return amount
}

// GetPropertyExpiryDays retrieves the property expiry days
func (s *AdminConfigService) GetPropertyExpiryDays() int {
	days, err := s.GetIntValue("property_expiry_days")
	if err != nil {
		logrus.Warnf("Failed to get property expiry days, using 30: %v", err)
		return 30
	}
	return days
}

// GetMaxPropertyImages retrieves the maximum property images
func (s *AdminConfigService) GetMaxPropertyImages() int {
	images, err := s.GetIntValue("max_property_images")
	if err != nil {
		logrus.Warnf("Failed to get max property images, using 5: %v", err)
		return 5
	}
	return images
}

// GetMaxNormalUserProperties retrieves the maximum properties for normal users
func (s *AdminConfigService) GetMaxNormalUserProperties() int {
	properties, err := s.GetIntValue("max_normal_user_properties")
	if err != nil {
		logrus.Warnf("Failed to get max normal user properties, using 0 (unlimited): %v", err)
		return 0
	}
	return properties
}

// GetMaxBrokerPropertiesWithoutSubscription retrieves the maximum properties for brokers without subscription
func (s *AdminConfigService) GetMaxBrokerPropertiesWithoutSubscription() int {
	properties, err := s.GetIntValue("max_broker_properties_without_subscription")
	if err != nil {
		logrus.Warnf("Failed to get max broker properties without subscription, using 1: %v", err)
		return 1
	}
	return properties
}

// GetBrokerPropertyPriority retrieves the broker property priority setting
func (s *AdminConfigService) GetBrokerPropertyPriority() bool {
	priority, err := s.GetBoolValue("broker_property_priority")
	if err != nil {
		logrus.Warnf("Failed to get broker property priority, using true: %v", err)
		return true
	}
	return priority
}

// GetAutoApproveBrokerProperties retrieves the auto approve broker properties setting
func (s *AdminConfigService) GetAutoApproveBrokerProperties() bool {
	approve, err := s.GetBoolValue("auto_approve_broker_properties")
	if err != nil {
		logrus.Warnf("Failed to get auto approve broker properties, using true: %v", err)
		return true
	}
	return approve
}

// GetRequirePropertyApproval retrieves the require property approval setting
func (s *AdminConfigService) GetRequirePropertyApproval() bool {
	require, err := s.GetBoolValue("require_property_approval")
	if err != nil {
		logrus.Warnf("Failed to get require property approval, using true: %v", err)
		return true
	}
	return require
}

// DynamicConfigChecker provides dynamic configuration checking capabilities
type DynamicConfigChecker struct {
	service *AdminConfigService
}

// NewDynamicConfigChecker creates a new dynamic config checker
func NewDynamicConfigChecker() *DynamicConfigChecker {
	return &DynamicConfigChecker{
		service: NewAdminConfigService(),
	}
}

// IsFeatureEnabled checks if a feature is enabled by configuration
func (dc *DynamicConfigChecker) IsFeatureEnabled(featureKey string, defaultValue bool) bool {
	enabled, err := dc.service.GetBoolValue(featureKey)
	if err != nil {
		// If config doesn't exist, return default value
		return defaultValue
	}
	return enabled
}

// CheckPermission checks if a permission/action is allowed
func (dc *DynamicConfigChecker) CheckPermission(permissionKey string, defaultValue bool) bool {
	return dc.IsFeatureEnabled(permissionKey, defaultValue)
}

// GetLimit gets a numeric limit with fallback
func (dc *DynamicConfigChecker) GetLimit(limitKey string, limitType string, defaultValue interface{}) interface{} {
	switch limitType {
	case "int":
		if value, err := dc.service.GetIntValue(limitKey); err == nil {
			return value
		}
		if defaultInt, ok := defaultValue.(int); ok {
			return defaultInt
		}
		return 0
	case "float":
		if value, err := dc.service.GetFloatValue(limitKey); err == nil {
			return value
		}
		if defaultFloat, ok := defaultValue.(float64); ok {
			return defaultFloat
		}
		return 0.0
	default:
		return defaultValue
	}
}

// IsBookingEnabled checks if booking system is enabled
func (dc *DynamicConfigChecker) IsBookingEnabled() bool {
	return dc.IsFeatureEnabled("enable_booking_system", true)
}

// GetSystemConfig gets system-wide configuration with fallback
func (dc *DynamicConfigChecker) GetSystemConfig(key string, defaultValue interface{}) interface{} {
	switch v := defaultValue.(type) {
	case bool:
		return dc.IsFeatureEnabled(key, v)
	case int:
		if value, err := dc.service.GetIntValue(key); err == nil {
			return value
		}
		return v
	case float64:
		if value, err := dc.service.GetFloatValue(key); err == nil {
			return value
		}
		return v
	case string:
		if value, err := dc.service.repo.GetValueByKey(key); err == nil {
			return value
		}
		return v
	default:
		return defaultValue
	}
}
