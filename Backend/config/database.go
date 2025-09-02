package config

import (
	"treesindia/seed"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// RunMigrations runs database migrations
// DEPRECATED: Migrations are now handled by Goose in main.go
// This function is kept for backward compatibility but should not be used
func RunMigrations(db *gorm.DB) error {
	logrus.Info("Migrations are now handled by Goose - this function is deprecated")
	logrus.Info("Database migrations completed successfully")
	return nil
}

// SeedInitialData seeds initial data into the database
// DEPRECATED: Use seed.NewSeedManager().SeedAll() instead
func SeedInitialData(db *gorm.DB) error {
	seedManager := seed.NewSeedManager()
	return seedManager.SeedAll()
}


