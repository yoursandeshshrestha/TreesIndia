package seed

import (
	"strings"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// SeedAll runs all seed functions
func SeedAll(db *gorm.DB) error {
	logrus.Info("Starting database seeding...")

	// Seed admin user
	if err := seedAdminUser(db); err != nil {
		return err
	}

	// Seed initial categories
	if err := seedInitialCategories(db); err != nil {
		return err
	}

	logrus.Info("Database seeding completed successfully")
	return nil
}

// seedAdminUser seeds the admin user
func seedAdminUser(db *gorm.DB) error {
	// Check if admin user already exists
	var adminCount int64
	db.Model(&models.User{}).Where("phone = ?", "+918597831351").Count(&adminCount)
	
	if adminCount > 0 {
		logrus.Info("Admin user already exists")
		return nil
	}

	// Create admin user
	adminEmail := "admin@treesindia.com"
	adminUser := models.User{
		Name:        "Admin",
		Email:       &adminEmail,
		Phone:       "+918597831351",
		UserType:    models.UserTypeAdmin,
		IsActive:    true,
		IsVerified:  true,
		KYCStatus:   models.KYCStatusNotNeeded,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		// Check if it's a duplicate key error (race condition)
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			logrus.Info("Admin user already exists (race condition)")
			return nil
		}
		return err
	}

	logrus.Info("Admin user seeded successfully")
	return nil
}

// seedInitialCategories seeds initial categories
func seedInitialCategories(db *gorm.DB) error {
	// Check if categories already exist
	var categoryCount int64
	db.Model(&models.Category{}).Count(&categoryCount)
	
	if categoryCount > 0 {
		logrus.Info("Categories already exist")
		return nil
	}

	// Initial categories
	categories := []models.Category{
		{
			Name:        "Plumbing",
			Description: "Professional plumbing services for homes and offices",
			Image:       "/images/categories/plumbing.jpg",
			SortOrder:   1,
			IsActive:    true,
		},
		{
			Name:        "Electrical",
			Description: "Licensed electrical services and installations",
			Image:       "/images/categories/electrical.jpg",
			SortOrder:   2,
			IsActive:    true,
		},
		{
			Name:        "Cleaning",
			Description: "Professional cleaning and sanitization services",
			Image:       "/images/categories/cleaning.jpg",
			SortOrder:   3,
			IsActive:    true,
		},
		{
			Name:        "Pest Control",
			Description: "Effective pest control and extermination services",
			Image:       "/images/categories/pest-control.jpg",
			SortOrder:   4,
			IsActive:    true,
		},
		{
			Name:        "AC Service",
			Description: "AC installation, repair, and maintenance services",
			Image:       "/images/categories/ac-service.jpg",
			SortOrder:   5,
			IsActive:    true,
		},
		{
			Name:        "Carpentry",
			Description: "Professional carpentry and woodwork services",
			Image:       "/images/categories/carpentry.jpg",
			SortOrder:   6,
			IsActive:    true,
		},
		{
			Name:        "Painting",
			Description: "Interior and exterior painting services",
			Image:       "/images/categories/painting.jpg",
			SortOrder:   7,
			IsActive:    true,
		},
		{
			Name:        "Renovation",
			Description: "Complete home renovation and remodeling services",
			Image:       "/images/categories/renovation.jpg",
			SortOrder:   8,
			IsActive:    true,
		},
		{
			Name:        "Interior Design",
			Description: "Professional interior design and decoration services",
			Image:       "/images/categories/interior-design.jpg",
			SortOrder:   9,
			IsActive:    true,
		},
		{
			Name:        "Security",
			Description: "Security system installation and monitoring services",
			Image:       "/images/categories/security.jpg",
			SortOrder:   10,
			IsActive:    true,
		},
	}

	if err := db.Create(&categories).Error; err != nil {
		return err
	}

	logrus.Info("Initial categories seeded successfully")
	return nil
}
