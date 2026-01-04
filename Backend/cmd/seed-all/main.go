package main

import (
	"log"
	"treesindia/config"
	"treesindia/database"
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
	logrus.Info("🌱 Seeding all data (idempotent - will skip if already exists)...")

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

	// Seed in dependency order (all components for seed:all)
	// Note: promotion_banners is for admin dashboard (/dashboard/banners)
	// banner_images is for website management (different page) - not included in seed:all
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
		"promotion_banners", // Admin dashboard banners
		"properties",
		"projects",
		"vendors",
	}

	if err := seedManager.SeedIndividualComponents(seedComponents...); err != nil {
		log.Fatal("Failed to seed data:", err)
	}

	logrus.Info("🎉 Master seed process completed successfully!")
}

