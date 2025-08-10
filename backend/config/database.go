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
		&models.KYC{},
		&models.Category{},
		&models.Skill{},
		&models.ServiceArea{},
		&models.Service{},
		&models.Rate{},
		&models.Location{},
		&models.Property{},
		&models.Visit{},
		&models.Booking{},
		&models.Inquiry{},
		&models.Review{},
	)

	if err != nil {
		logrus.Error("Failed to run migrations:", err)
		return err
	}

	logrus.Info("Database migrations completed successfully")
	return nil
}

// SeedInitialData seeds initial data into the database
func SeedInitialData(db *gorm.DB) error {
	return seed.SeedAll(db)
}


