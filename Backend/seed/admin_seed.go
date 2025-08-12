package seed

import (
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// SeedAdminUser seeds the admin user with the specified phone number
func SeedAdminUser(db *gorm.DB) error {
	// Check if admin user already exists
	var adminCount int64
	db.Model(&models.User{}).Where("phone = ?", "+918597831351").Count(&adminCount)
	
	if adminCount > 0 {
		logrus.Info("Admin user already exists")
		return nil
	}

	// Create admin user
	adminUser := models.User{
		Name:      "Admin",
		Phone:     "+918597831351",
		UserType:  "admin",
		IsActive:  true,
		IsVerified: true,
		KYCStatus: "verified",
	}

	if err := db.Create(&adminUser).Error; err != nil {
		logrus.Error("Failed to create admin user:", err)
		return err
	}

	logrus.Info("Admin user seeded successfully")
	return nil
}
