package main

import (
	"log"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load application configuration
	appConfig := config.LoadConfig()

	// Initialize database
	dsn := appConfig.GetDatabaseURL()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
		SkipDefaultTransaction:                   true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Set the database instance
	database.SetDB(db)

	logrus.Warn("⚠️  Starting deletion of all properties...")

	// Count properties before deletion
	var countBefore int64
	db.Model(&models.Property{}).Count(&countBefore)
	logrus.Infof("Found %d properties to delete", countBefore)

	if countBefore == 0 {
		logrus.Info("No properties found to delete")
		return
	}

	// Delete all properties (including soft-deleted ones)
	result := db.Unscoped().Where("1 = 1").Delete(&models.Property{})
	if result.Error != nil {
		log.Fatal("Failed to delete properties:", result.Error)
	}

	logrus.Infof("✅ Successfully deleted %d properties", result.RowsAffected)
	logrus.Info("Properties deletion completed successfully")
}

