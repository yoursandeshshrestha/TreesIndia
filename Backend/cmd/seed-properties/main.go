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

	// Create seed manager
	seedManager := seed.NewSeedManager()

	// Initialize Cloudinary service for image uploads
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Warnf("Cloudinary service not available, properties will be created without images: %v", err)
	} else {
		// Set Cloudinary uploader in seed manager
		seedManager.SetCloudinaryUploader(cloudinaryService)
		logrus.Info("Cloudinary service initialized for property seeding")
	}

	// Seed only properties
	if err := seedManager.SeedIndividualComponents("properties"); err != nil {
		log.Fatal("Failed to seed properties:", err)
	}

	logrus.Info("Properties seeding completed successfully")
}
