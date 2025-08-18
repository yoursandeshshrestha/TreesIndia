package config

import (
	"treesindia/models"
	"treesindia/seed"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// RunMigrations runs database migrations
func RunMigrations(db *gorm.DB) error {
	logrus.Info("Running database migrations...")

	// Auto migrate all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Subcategory{},
		&models.Service{},
		&models.Worker{},
		&models.WorkerInquiry{},
		&models.Broker{},
	
		&models.UserRole{},
		&models.UserDocument{},
		&models.UserSkill{},
		&models.UserNotificationSettings{},
		&models.Location{},
		&models.RoleApplication{},
		&models.Property{},
		&models.AdminConfig{},
		&models.WalletTransaction{},
	)

	if err != nil {
		logrus.Error("Failed to run migrations:", err)
		return err
	}

	logrus.Info("Database migrations completed successfully")
	return nil
}

// SeedInitialData seeds initial data into the database
// DEPRECATED: Use seed.NewSeedManager().SeedAll() instead
func SeedInitialData(db *gorm.DB) error {
	seedManager := seed.NewSeedManager()
	return seedManager.SeedAll()
}


