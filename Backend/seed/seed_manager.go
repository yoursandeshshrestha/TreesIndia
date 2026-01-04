package seed

import (
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// CloudinaryUploader is an interface for uploading images
// This allows us to avoid importing services package which would create a cycle
type CloudinaryUploader interface {
	UploadImageFromPath(filePath string, folder string) (string, error)
}

// SeedManager handles all seeding operations
type SeedManager struct {
	db                 *gorm.DB
	cloudinaryUploader CloudinaryUploader
}

// NewSeedManager creates a new seed manager
func NewSeedManager() *SeedManager {
	return &SeedManager{
		db: database.GetDB(),
	}
}

// SetCloudinaryUploader sets the Cloudinary uploader for image uploads
func (sm *SeedManager) SetCloudinaryUploader(uploader CloudinaryUploader) {
	sm.cloudinaryUploader = uploader
}

// SeedAll runs all seeding operations in the correct order
func (sm *SeedManager) SeedAll() error {
	logrus.Info("🚀 Starting centralized seeding process...")

	// Create JSON-based seed handler
	jsonSeeder := NewJSONBasedSeeder(sm)

	// Define seeding operations in dependency order
	seeders := []struct {
		name string
		fn   func() error
	}{
		{"Admin User", jsonSeeder.SeedAdminUser},
		{"Admin Configurations", jsonSeeder.SeedAdminConfigurations},
		{"Service Areas", jsonSeeder.SeedServiceAreas},
		{"Service Area Associations", jsonSeeder.SeedServiceAreaAssociations},
		{"Subscription Plans", jsonSeeder.SeedSubscriptionPlans},
	}

	// Execute seeders in order
	for _, seeder := range seeders {
		logrus.Infof("📦 Seeding: %s", seeder.name)
		if err := seeder.fn(); err != nil {
			logrus.Errorf("❌ Failed to seed %s: %v", seeder.name, err)
			return err
		}
		logrus.Infof("✅ Successfully seeded: %s", seeder.name)
	}

	logrus.Info("🎉 All seeding operations completed successfully")
	return nil
}

// GetDatabase returns the database instance
func (sm *SeedManager) GetDatabase() *gorm.DB {
	return sm.db
}

// SeedIndividualComponents allows seeding individual components
func (sm *SeedManager) SeedIndividualComponents(components ...string) error {
	logrus.Info("🔧 Starting individual component seeding...")

	// Create JSON-based seed handler
	jsonSeeder := NewJSONBasedSeeder(sm)

	// Create a map of available seeders
	seeders := map[string]func() error{
		"admin_user":                jsonSeeder.SeedAdminUser,
		"admin_configurations":      jsonSeeder.SeedAdminConfigurations,
		"service_areas":             jsonSeeder.SeedServiceAreas,
		"categories":                jsonSeeder.SeedCategories,
		"subcategories":             jsonSeeder.SeedSubcategories,
		"services":                  jsonSeeder.SeedServices,
		"service_area_associations": jsonSeeder.SeedServiceAreaAssociations,
		"subscription_plans":        jsonSeeder.SeedSubscriptionPlans,
		"workers":                   jsonSeeder.SeedWorkers,
		"promotion_banners":         jsonSeeder.SeedPromotionBanners,
		"banner_images":             jsonSeeder.SeedBannerImages,
		"properties":                jsonSeeder.SeedProperties,
		"projects":                  jsonSeeder.SeedProjects,
		"vendors":                   jsonSeeder.SeedVendors,
	}

	// Execute requested seeders
	for _, component := range components {
		if seeder, exists := seeders[component]; exists {
			logrus.Infof("📦 Seeding: %s", component)
			if err := seeder(); err != nil {
				logrus.Errorf("❌ Failed to seed %s: %v", component, err)
				return err
			}
			logrus.Infof("✅ Successfully seeded: %s", component)
		} else {
			logrus.Warnf("⚠️  Unknown component: %s", component)
		}
	}

	logrus.Info("🔧 Individual component seeding completed")
	return nil
}

// VerifySeeding verifies that all seeded data exists
func (sm *SeedManager) VerifySeeding() error {
	logrus.Info("🔍 Verifying seeded data...")

	// Verify admin user
	var adminCount int64
	sm.db.Model(&models.User{}).Where("user_type = ?", "admin").Count(&adminCount)
	if adminCount == 0 {
		logrus.Warn("⚠️  No admin users found")
	} else {
		logrus.Infof("✅ Found %d admin users", adminCount)
	}

	// Verify admin configurations
	var configCount int64
	sm.db.Model(&models.AdminConfig{}).Count(&configCount)
	if configCount == 0 {
		logrus.Warn("⚠️  No admin configurations found")
	} else {
		logrus.Infof("✅ Found %d admin configurations", configCount)
	}

	// Verify service areas
	var serviceAreaCount int64
	sm.db.Model(&models.ServiceArea{}).Count(&serviceAreaCount)
	if serviceAreaCount == 0 {
		logrus.Warn("⚠️  No service areas found")
	} else {
		logrus.Infof("✅ Found %d service areas", serviceAreaCount)
	}

	// Verify services
	var serviceCount int64
	sm.db.Model(&models.Service{}).Count(&serviceCount)
	if serviceCount == 0 {
		logrus.Warn("⚠️  No services found")
	} else {
		logrus.Infof("✅ Found %d services", serviceCount)
	}

	// Verify workers
	var workerCount int64
	sm.db.Model(&models.Worker{}).Count(&workerCount)
	if workerCount == 0 {
		logrus.Warn("⚠️  No workers found")
	} else {
		logrus.Infof("✅ Found %d workers", workerCount)
	}

	logrus.Info("🔍 Data verification completed")
	return nil
}

// CleanupSeeding removes all seeded data (use with caution)
func (sm *SeedManager) CleanupSeeding() error {
	logrus.Warn("🧹 Starting cleanup of seeded data...")

	// Cleanup in reverse dependency order
	cleanupOperations := []struct {
		name string
		fn   func() error
	}{
		{"Workers", sm.cleanupWorkers},
		{"Services", sm.cleanupServices},
		{"Service Areas", sm.cleanupServiceAreas},
		{"Admin Configurations", sm.cleanupAdminConfigurations},
		{"Admin Users", sm.cleanupAdminUsers},
	}

	for _, cleanup := range cleanupOperations {
		logrus.Infof("🧹 Cleaning up: %s", cleanup.name)
		if err := cleanup.fn(); err != nil {
			logrus.Errorf("❌ Failed to cleanup %s: %v", cleanup.name, err)
			return err
		}
		logrus.Infof("✅ Successfully cleaned up: %s", cleanup.name)
	}

	logrus.Info("🧹 All cleanup operations completed")
	return nil
}

// cleanupWorkers removes all workers
func (sm *SeedManager) cleanupWorkers() error {
	return sm.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Worker{}).Error
}

// cleanupServices removes all services
func (sm *SeedManager) cleanupServices() error {
	return sm.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Service{}).Error
}

// cleanupServiceAreas removes all service areas
func (sm *SeedManager) cleanupServiceAreas() error {
	return sm.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.ServiceArea{}).Error
}

// cleanupAdminConfigurations removes all admin configurations
func (sm *SeedManager) cleanupAdminConfigurations() error {
	return sm.db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.AdminConfig{}).Error
}

// cleanupAdminUsers removes admin users
func (sm *SeedManager) cleanupAdminUsers() error {
	return sm.db.Where("user_type = ?", "admin").Delete(&models.User{}).Error
}
