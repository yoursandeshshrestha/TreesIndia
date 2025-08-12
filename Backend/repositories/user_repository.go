package repositories

import (
	"fmt"
	"treesindia/models"
	"treesindia/utils"

	"gorm.io/gorm"
)

// UserRepository handles user-specific database operations
type UserRepository struct {
	*BaseRepository
	paginationHelper *utils.PaginationHelper
}

// NewUserRepository creates a new user repository
func NewUserRepository() *UserRepository {
	return &UserRepository{
		BaseRepository:   NewBaseRepository(),
		paginationHelper: utils.NewPaginationHelper(),
	}
}

// FindByPhone finds a user by phone number
func (ur *UserRepository) FindByPhone(user *models.User, phone string) error {
	return ur.FindByField(user, "phone", phone)
}

// FindByEmail finds a user by email
func (ur *UserRepository) FindByEmail(user *models.User, email string) error {
	return ur.FindByField(user, "email", email)
}

// FindByGoogleID finds a user by Google ID
func (ur *UserRepository) FindByGoogleID(user *models.User, googleID string) error {
	return ur.FindByField(user, "google_id", googleID)
}

// FindActiveUsers finds all active users
func (ur *UserRepository) FindActiveUsers(users *[]models.User) error {
	return ur.db.Where("is_active = ?", true).Find(users).Error
}

// FindByUserType finds users by user type
func (ur *UserRepository) FindByUserType(users *[]models.User, userType models.UserType) error {
	return ur.db.Where("user_type = ?", userType).Find(users).Error
}

// FindVerifiedUsers finds all verified users
func (ur *UserRepository) FindVerifiedUsers(users *[]models.User) error {
	return ur.db.Where("is_verified = ?", true).Find(users).Error
}

// FindByKYCStatus finds users by KYC status
func (ur *UserRepository) FindByKYCStatus(users *[]models.User, kycStatus models.KYCStatus) error {
	return ur.db.Where("kyc_status = ?", kycStatus).Find(users).Error
}

// FindWithKYC finds users with KYC information
func (ur *UserRepository) FindWithKYC(users *[]models.User) error {
	return ur.db.Preload("KYC").Find(users).Error
}

// FindWithSkills finds users with their skills
func (ur *UserRepository) FindWithSkills(users *[]models.User) error {
	return ur.db.Preload("Skills").Find(users).Error
}

// FindWithServiceAreas finds users with their service areas
func (ur *UserRepository) FindWithServiceAreas(users *[]models.User) error {
	return ur.db.Preload("ServiceAreas").Find(users).Error
}

// FindWithRates finds users with their rates
func (ur *UserRepository) FindWithRates(users *[]models.User) error {
	return ur.db.Preload("Rates").Find(users).Error
}

// FindWithAllRelations finds users with all related data
func (ur *UserRepository) FindWithAllRelations(users *[]models.User) error {
	return ur.db.Preload("KYC").Preload("Skills").Preload("ServiceAreas").Preload("Rates").Find(users).Error
}

// FindByLocation finds users within a certain radius of coordinates
// Note: This method is deprecated. Use LocationRepository.FindLocationsWithinRadius instead
func (ur *UserRepository) FindByLocation(users *[]models.User, lat, lng float64, radiusKm int) error {
	// This method is deprecated. Location-based queries should use the dedicated Location model
	return fmt.Errorf("deprecated method. Use LocationRepository.FindLocationsWithinRadius instead")
}

// UpdateLastLogin updates the last login timestamp
func (ur *UserRepository) UpdateLastLogin(userID uint) error {
	return ur.db.Model(&models.User{}).Where("id = ?", userID).Update("last_login_at", gorm.Expr("NOW()")).Error
}

// UpdateKYCStatus updates the KYC status of a user
func (ur *UserRepository) UpdateKYCStatus(userID uint, status models.KYCStatus) error {
	return ur.db.Model(&models.User{}).Where("id = ?", userID).Update("kyc_status", status).Error
}

// UpdateVerificationStatus updates the verification status of a user
func (ur *UserRepository) UpdateVerificationStatus(userID uint, isVerified bool) error {
	return ur.db.Model(&models.User{}).Where("id = ?", userID).Update("is_verified", isVerified).Error
}

// UpdateActiveStatus updates the active status of a user
func (ur *UserRepository) UpdateActiveStatus(userID uint, isActive bool) error {
	return ur.db.Model(&models.User{}).Where("id = ?", userID).Update("is_active", isActive).Error
}

// GetUserStats gets user statistics
func (ur *UserRepository) GetUserStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total users
	var total int64
	if err := ur.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Active users
	var active int64
	if err := ur.db.Model(&models.User{}).Where("is_active = ?", true).Count(&active).Error; err != nil {
		return nil, err
	}
	stats["active"] = active
	
	// Verified users
	var verified int64
	if err := ur.db.Model(&models.User{}).Where("is_verified = ?", true).Count(&verified).Error; err != nil {
		return nil, err
	}
	stats["verified"] = verified
	
	// Users by type
	for _, userType := range []models.UserType{models.UserTypeNormal, models.UserTypeWorker, models.UserTypeBroker, models.UserTypeAdmin} {
		var count int64
		if err := ur.db.Model(&models.User{}).Where("user_type = ?", userType).Count(&count).Error; err != nil {
			return nil, err
		}
		stats[string(userType)] = count
	}
	
	return stats, nil
}
