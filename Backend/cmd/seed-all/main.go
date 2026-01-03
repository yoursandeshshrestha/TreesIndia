package main

import (
	"log"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"
	"treesindia/seed"
	"treesindia/services"

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

	logrus.Info("🚀 Starting master seed process...")
	logrus.Warn("⚠️  This will DELETE all existing data and reseed everything!")

	// Step 1: Delete all data in reverse dependency order
	logrus.Info("🗑️  Step 1: Deleting all existing data...")

	// Delete services and service associations
	logrus.Info("Deleting services...")
	db.Unscoped().Where("1 = 1").Delete(&models.Service{})
	db.Exec("DELETE FROM service_service_areas")

	// Delete nested category children for Home Services and Construction Services
	deleteCategoryChildrenRecursive(db, "Home Services")
	deleteCategoryChildrenRecursive(db, "Construction Services")

	// Delete projects
	logrus.Info("Deleting projects...")
	db.Unscoped().Where("1 = 1").Delete(&models.Project{})

	// Delete properties
	logrus.Info("Deleting properties...")
	db.Unscoped().Where("1 = 1").Delete(&models.Property{})

	// Delete vendors
	logrus.Info("Deleting vendors...")
	db.Unscoped().Where("1 = 1").Delete(&models.Vendor{})

	// Delete workers
	logrus.Info("Deleting workers...")
	db.Unscoped().Where("1 = 1").Delete(&models.Worker{})
	db.Unscoped().Where("user_type = ?", "worker").Delete(&models.User{})

	// Delete vendor users
	logrus.Info("Deleting vendor users...")
	db.Unscoped().Where("user_type = ?", "vendor").Delete(&models.User{})

	logrus.Info("✅ All data deleted successfully")

	// Step 2: Seed everything
	logrus.Info("🌱 Step 2: Seeding all data...")

	// Initialize Cloudinary service for image uploads
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Warnf("Cloudinary service not available, some items will be created without images: %v", err)
	}

	// Create seed manager
	seedManager := seed.NewSeedManager()
	if cloudinaryService != nil {
		seedManager.SetCloudinaryUploader(cloudinaryService)
		logrus.Info("Cloudinary service initialized for seeding")
	}

	// Seed in dependency order
	seedComponents := []string{
		"admin_user",
		"admin_configurations",
		"service_areas",
		"categories",
		"subcategories",
		"services",
		"service_area_associations",
		"subscription_plans",
		"workers",
		"promotion_banners",
		"properties",
		"projects",
		"vendors",
	}

	if err := seedManager.SeedIndividualComponents(seedComponents...); err != nil {
		log.Fatal("Failed to seed data:", err)
	}

	logrus.Info("🎉 Master seed process completed successfully!")
}

// deleteCategoryChildrenRecursive deletes all children of a category recursively
func deleteCategoryChildrenRecursive(db *gorm.DB, rootCategoryName string) {
	var rootCategory models.Category
	if err := db.Where("name = ? AND parent_id IS NULL", rootCategoryName).First(&rootCategory).Error; err != nil {
		logrus.Warnf("Root category '%s' not found, skipping deletion", rootCategoryName)
		return
	}

	logrus.Infof("Deleting nested children of '%s'...", rootCategoryName)
	deleteChildren(db, rootCategory.ID)
}

func deleteChildren(db *gorm.DB, parentID uint) {
	var children []models.Category
	if err := db.Where("parent_id = ?", parentID).Find(&children).Error; err != nil {
		return
	}

	for _, child := range children {
		// Recursively delete children first
		deleteChildren(db, child.ID)
		// Then delete this category
		db.Unscoped().Delete(&child)
		logrus.Debugf("Deleted category: %s (ID: %d)", child.Name, child.ID)
	}
}

