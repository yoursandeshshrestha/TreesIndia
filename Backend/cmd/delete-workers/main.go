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

	logrus.Warn("⚠️  Starting deletion of all workers...")

	// Count workers before deletion
	var countBefore int64
	db.Model(&models.Worker{}).Count(&countBefore)
	logrus.Infof("Found %d workers to delete", countBefore)

	if countBefore == 0 {
		logrus.Info("No workers found to delete")
		return
	}

	// Delete all workers (including soft-deleted ones)
	result := db.Unscoped().Where("1 = 1").Delete(&models.Worker{})
	if result.Error != nil {
		log.Fatal("Failed to delete workers:", result.Error)
	}

	logrus.Infof("✅ Successfully deleted %d workers", result.RowsAffected)
	logrus.Info("Workers deletion completed successfully")
	
	// Optionally delete worker users as well
	logrus.Warn("⚠️  Starting deletion of worker users...")
	
	var userCountBefore int64
	db.Model(&models.User{}).Where("user_type = ?", "worker").Count(&userCountBefore)
	logrus.Infof("Found %d worker users to delete", userCountBefore)
	
	if userCountBefore > 0 {
		userResult := db.Unscoped().Where("user_type = ?", "worker").Delete(&models.User{})
		if userResult.Error != nil {
			logrus.Warnf("Failed to delete worker users: %v", userResult.Error)
		} else {
			logrus.Infof("✅ Successfully deleted %d worker users", userResult.RowsAffected)
		}
	}
}

