package main

import (
	"log"
	"treesindia/services"

	"github.com/sirupsen/logrus"
)

func main() {
	logrus.Info("🗑️  Starting Cloudinary cleanup...")

	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Warnf("Cloudinary service not available: %v", err)
		logrus.Info("⚠️  Skipping Cloudinary cleanup (CLOUDINARY_URL not configured)")
		return
	}

	// Delete all resources
	if err := cloudinaryService.DeleteAllResources(); err != nil {
		log.Fatal("Failed to clear Cloudinary:", err)
	}

	logrus.Info("✅ Cloudinary cleanup completed successfully")
}

