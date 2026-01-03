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

	logrus.Warn("⚠️  Starting deletion of services and nested category children...")

	// First, delete all services
	var serviceCount int64
	db.Model(&models.Service{}).Count(&serviceCount)
	logrus.Infof("Found %d services to delete", serviceCount)

	if serviceCount > 0 {
		result := db.Unscoped().Where("1 = 1").Delete(&models.Service{})
		if result.Error != nil {
			log.Fatal("Failed to delete services:", result.Error)
		}
		logrus.Infof("✅ Successfully deleted %d services", result.RowsAffected)
	}

	// Delete service-service area associations
	var assocCount int64
	db.Table("service_service_areas").Count(&assocCount)
	if assocCount > 0 {
		result := db.Exec("DELETE FROM service_service_areas")
		if result.Error != nil {
			logrus.Warnf("Failed to delete service-service area associations: %v", result.Error)
		} else {
			logrus.Infof("✅ Successfully deleted %d service-service area associations", result.RowsAffected)
		}
	}

	// Find Home Services and Construction Services root categories
	var homeServiceCategory models.Category
	var constructionServiceCategory models.Category

	if err := db.Where("name = ? AND parent_id IS NULL", "Home Services").First(&homeServiceCategory).Error; err == nil {
		logrus.Infof("Found Home Services category (ID: %d)", homeServiceCategory.ID)
		deleteCategoryChildren(db, homeServiceCategory.ID, "Home Services")
	} else {
		logrus.Warn("Home Services category not found")
	}

	if err := db.Where("name = ? AND parent_id IS NULL", "Construction Services").First(&constructionServiceCategory).Error; err == nil {
		logrus.Infof("Found Construction Services category (ID: %d)", constructionServiceCategory.ID)
		deleteCategoryChildren(db, constructionServiceCategory.ID, "Construction Services")
	} else {
		logrus.Warn("Construction Services category not found")
	}

	logrus.Info("Services and nested category children deletion completed successfully")
}

// deleteCategoryChildren recursively deletes all children categories
func deleteCategoryChildren(db *gorm.DB, parentID uint, categoryName string) {
	var children []models.Category
	if err := db.Where("parent_id = ?", parentID).Find(&children).Error; err != nil {
		logrus.Warnf("Failed to fetch children of %s: %v", categoryName, err)
		return
	}

	if len(children) == 0 {
		logrus.Infof("No children found for %s", categoryName)
		return
	}

	logrus.Infof("Found %d children for %s, deleting recursively...", len(children), categoryName)

	for _, child := range children {
		// Recursively delete children of this child
		deleteCategoryChildren(db, child.ID, child.Name)
		
		// Delete this child category
		result := db.Unscoped().Delete(&child)
		if result.Error != nil {
			logrus.Warnf("Failed to delete category %s (ID: %d): %v", child.Name, child.ID, result.Error)
		} else {
			logrus.Infof("✅ Deleted category: %s (ID: %d)", child.Name, child.ID)
		}
	}
}

