package seed

import (
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// SeedAdminConfigs seeds the default admin configurations
func SeedAdminConfigs(db *gorm.DB) error {
	logrus.Info("Seeding admin configurations...")

	// Get all default configurations
	defaultConfigs := models.DefaultConfigs

	// Check and create/update each configuration
	for _, config := range defaultConfigs {
		var existingConfig models.AdminConfig
		result := db.Where("key = ?", config.Key).First(&existingConfig)
		
		if result.Error != nil {
			// Config doesn't exist, create it
			if err := db.Create(&config).Error; err != nil {
				logrus.Errorf("Failed to create admin config %s: %v", config.Key, err)
				return err
			}
			logrus.Infof("Created admin config: %s = %s", config.Key, config.Value)
		} else {
			// Config exists, update it if needed
			if existingConfig.Value != config.Value || existingConfig.Type != config.Type || existingConfig.Category != config.Category {
				existingConfig.Value = config.Value
				existingConfig.Type = config.Type
				existingConfig.Category = config.Category
				existingConfig.Description = config.Description
				
				if err := db.Save(&existingConfig).Error; err != nil {
					logrus.Errorf("Failed to update admin config %s: %v", config.Key, err)
					return err
				}
				logrus.Infof("Updated admin config: %s = %s", config.Key, config.Value)
			} else {
				logrus.Infof("Admin config already exists: %s = %s", config.Key, config.Value)
			}
		}
	}

	logrus.Info("Admin configurations seeded successfully")
	return nil
}
