package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// AdminConfigRepository handles database operations for admin configurations
type AdminConfigRepository struct {
	db *gorm.DB
}

// NewAdminConfigRepository creates a new admin config repository
func NewAdminConfigRepository() *AdminConfigRepository {
	return &AdminConfigRepository{
		db: database.GetDB(),
	}
}

// Create creates a new admin configuration
func (r *AdminConfigRepository) Create(config *models.AdminConfig) error {
	return r.db.Create(config).Error
}

// GetByID retrieves an admin configuration by ID
func (r *AdminConfigRepository) GetByID(id uint) (*models.AdminConfig, error) {
	var config models.AdminConfig
	err := r.db.First(&config, id).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetByKey retrieves an admin configuration by key
func (r *AdminConfigRepository) GetByKey(key string) (*models.AdminConfig, error) {
	var config models.AdminConfig
	err := r.db.Where("key = ? AND is_active = ?", key, true).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetByCategory retrieves all admin configurations by category
func (r *AdminConfigRepository) GetByCategory(category string) ([]models.AdminConfig, error) {
	var configs []models.AdminConfig
	err := r.db.Where("category = ? AND is_active = ?", category, true).Find(&configs).Error
	return configs, err
}

// GetAll retrieves all active admin configurations
func (r *AdminConfigRepository) GetAll() ([]models.AdminConfig, error) {
	var configs []models.AdminConfig
	err := r.db.Where("is_active = ?", true).Order("category, key").Find(&configs).Error
	return configs, err
}

// Update updates an admin configuration
func (r *AdminConfigRepository) Update(config *models.AdminConfig) error {
	return r.db.Save(config).Error
}

// Delete soft deletes an admin configuration
func (r *AdminConfigRepository) Delete(id uint) error {
	return r.db.Model(&models.AdminConfig{}).Where("id = ?", id).Update("is_active", false).Error
}

// HardDelete permanently deletes an admin configuration
func (r *AdminConfigRepository) HardDelete(id uint) error {
	return r.db.Delete(&models.AdminConfig{}, id).Error
}

// GetValueByKey retrieves the value of a configuration by key
func (r *AdminConfigRepository) GetValueByKey(key string) (string, error) {
	config, err := r.GetByKey(key)
	if err != nil {
		return "", err
	}
	return config.Value, nil
}

// SetValueByKey sets the value of a configuration by key
func (r *AdminConfigRepository) SetValueByKey(key, value string) error {
	config, err := r.GetByKey(key)
	if err != nil {
		return err
	}
	config.Value = value
	return r.Update(config)
}

// InitializeDefaults creates default configurations if they don't exist
func (r *AdminConfigRepository) InitializeDefaults() error {
	for _, defaultConfig := range models.DefaultConfigs {
		// Check if config already exists
		existing, err := r.GetByKey(defaultConfig.Key)
		if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}
		
		// If config doesn't exist, create it
		if err == gorm.ErrRecordNotFound {
			if err := r.Create(&defaultConfig); err != nil {
				return err
			}
		}
		
		// If config exists but is inactive, reactivate it
		if existing != nil && !existing.IsActive {
			existing.IsActive = true
			existing.Value = defaultConfig.Value
			existing.Description = defaultConfig.Description
			if err := r.Update(existing); err != nil {
				return err
			}
		}
	}
	return nil
}

// ResetToDefaults resets all configurations to their default values
func (r *AdminConfigRepository) ResetToDefaults() error {
	// First, deactivate all existing configs
	if err := r.db.Model(&models.AdminConfig{}).Update("is_active", false).Error; err != nil {
		return err
	}
	
	// Then initialize defaults
	return r.InitializeDefaults()
}

// GetConfigMap returns a map of all configurations for easy access
func (r *AdminConfigRepository) GetConfigMap() (map[string]string, error) {
	configs, err := r.GetAll()
	if err != nil {
		return nil, err
	}
	
	configMap := make(map[string]string)
	for _, config := range configs {
		configMap[config.Key] = config.Value
	}
	
	return configMap, nil
}
