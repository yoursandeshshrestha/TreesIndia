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

// SeedAll runs all seeding operations in the correct order
func (sm *SeedManager) SeedAll() error {
	logrus.Info("🚀 Starting centralized seeding process...")

	// Define seeding operations in dependency order
	seeders := []struct {
		name string
		fn   func() error
	}{
		{"Admin User", sm.SeedAdminUser},
		{"Admin Configurations", sm.SeedAdminConfigurations},
		{"Service Areas", sm.SeedServiceAreasData},
		{"Main Application Data", sm.SeedMainData},
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

// GetDatabase returns the database instance
func (sm *SeedManager) GetDatabase() *gorm.DB {
	return sm.db
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
