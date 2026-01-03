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

	logrus.Warn("⚠️  Starting deletion of all projects...")

	// Count projects before deletion
	var countBefore int64
	db.Model(&models.Project{}).Count(&countBefore)
	logrus.Infof("Found %d projects to delete", countBefore)

	if countBefore == 0 {
		logrus.Info("No projects found to delete")
		return
	}

	// Delete all projects (including soft-deleted ones)
	result := db.Unscoped().Where("1 = 1").Delete(&models.Project{})
	if result.Error != nil {
		log.Fatal("Failed to delete projects:", result.Error)
	}

	logrus.Infof("✅ Successfully deleted %d projects", result.RowsAffected)
	logrus.Info("Projects deletion completed successfully")
}

