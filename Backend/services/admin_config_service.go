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

// Create creates a new admin configuration
func (s *AdminConfigService) Create(config *models.AdminConfig) error {
	// Validate the configuration
	if err := s.validateConfig(config); err != nil {
		return err
	}
	
	return s.repo.Create(config)
}

// GetByID retrieves an admin configuration by ID
func (s *AdminConfigService) GetByID(id uint) (*models.AdminConfig, error) {
	return s.repo.GetByID(id)
}

// GetByKey retrieves an admin configuration by key
func (s *AdminConfigService) GetByKey(key string) (*models.AdminConfig, error) {
	return s.repo.GetByKey(key)
}

// GetByCategory retrieves all admin configurations by category
func (s *AdminConfigService) GetByCategory(category string) ([]models.AdminConfig, error) {
	return s.repo.GetByCategory(category)
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

// Delete soft deletes an admin configuration
func (s *AdminConfigService) Delete(id uint) error {
	return s.repo.Delete(id)
}

// InitializeDefaults initializes default configurations
func (s *AdminConfigService) InitializeDefaults() error {
	return s.repo.InitializeDefaults()
}

// ResetToDefaults resets all configurations to default values
func (s *AdminConfigService) ResetToDefaults() error {
	return s.repo.ResetToDefaults()
}

// GetValueByKey retrieves the value of a configuration by key
func (s *AdminConfigService) GetValueByKey(key string) (string, error) {
	return s.repo.GetValueByKey(key)
}

// SetValueByKey sets the value of a configuration by key
func (s *AdminConfigService) SetValueByKey(key, value string) error {
	// Get the existing config to validate the type
	config, err := s.repo.GetByKey(key)
	if err != nil {
		return err
	}
	
	// Validate the value based on the type
	if err := s.validateValue(config.Type, value); err != nil {
		return err
	}
	
	return s.repo.SetValueByKey(key, value)
}

// GetConfigMap returns a map of all configurations
func (s *AdminConfigService) GetConfigMap() (map[string]string, error) {
	return s.repo.GetConfigMap()
}

// GetIntValue retrieves an integer configuration value
func (s *AdminConfigService) GetIntValue(key string) (int, error) {
	value, err := s.GetValueByKey(key)
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
	value, err := s.GetValueByKey(key)
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
	value, err := s.GetValueByKey(key)
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

// GetMaxUserProperties retrieves the maximum properties per user
func (s *AdminConfigService) GetMaxUserProperties() int {
	properties, err := s.GetIntValue("max_user_properties")
	if err != nil {
		logrus.Warnf("Failed to get max user properties, using 1: %v", err)
		return 1
	}
	return properties
}

// validateConfig validates a configuration before saving
func (s *AdminConfigService) validateConfig(config *models.AdminConfig) error {
	// Validate required fields
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
	
	// Validate type
	validTypes := []string{"string", "int", "float", "bool"}
	typeValid := false
	for _, validType := range validTypes {
		if config.Type == validType {
			typeValid = true
			break
		}
	}
	if !typeValid {
		return fmt.Errorf("invalid type: %s. Valid types are: %v", config.Type, validTypes)
	}
	
	// Validate category
	validCategories := []string{"wallet", "property", "service", "system", "payment"}
	categoryValid := false
	for _, validCategory := range validCategories {
		if config.Category == validCategory {
			categoryValid = true
			break
		}
	}
	if !categoryValid {
		return fmt.Errorf("invalid category: %s. Valid categories are: %v", config.Category, validCategories)
	}
	
	// Validate value based on type
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
		return fmt.Errorf("unknown type: %s", valueType)
	}
	
	return nil
}
