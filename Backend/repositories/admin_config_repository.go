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
	err := r.db.Where("key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
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

// Create creates a new admin configuration
func (r *AdminConfigRepository) Create(config *models.AdminConfig) error {
	return r.db.Create(config).Error
}

// GetValueByKey retrieves the value of a configuration by key
func (r *AdminConfigRepository) GetValueByKey(key string) (string, error) {
	config, err := r.GetByKey(key)
	if err != nil {
		return "", err
	}
	return config.Value, nil
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
