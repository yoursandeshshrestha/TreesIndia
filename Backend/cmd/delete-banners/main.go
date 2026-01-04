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

	logrus.Warn("⚠️  Starting deletion of all banner images...")

	// Count banner images before deletion
	var countBefore int64
	db.Model(&models.BannerImage{}).Count(&countBefore)
	logrus.Infof("Found %d banner images to delete", countBefore)

	if countBefore == 0 {
		logrus.Info("No banner images found to delete")
		return
	}

	// Delete all banner images (including soft-deleted ones)
	result := db.Unscoped().Where("1 = 1").Delete(&models.BannerImage{})
	if result.Error != nil {
		log.Fatal("Failed to delete banner images:", result.Error)
	}

	logrus.Infof("✅ Successfully deleted %d banner images", result.RowsAffected)
	logrus.Info("Banner images deletion completed successfully")
}
