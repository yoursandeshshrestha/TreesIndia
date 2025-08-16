package repositories

import (
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// UserSubscriptionRepository handles user subscription database operations
type UserSubscriptionRepository struct {
	db *gorm.DB
}

// NewUserSubscriptionRepository creates a new user subscription repository
func NewUserSubscriptionRepository() *UserSubscriptionRepository {
	return &UserSubscriptionRepository{
		db: database.GetDB(),
	}
}

// Create creates a new user subscription
func (usr *UserSubscriptionRepository) Create(subscription *models.UserSubscription) error {
	return usr.db.Create(subscription).Error
}

// GetByID retrieves a user subscription by ID
func (usr *UserSubscriptionRepository) GetByID(id uint) (*models.UserSubscription, error) {
	var subscription models.UserSubscription
	err := usr.db.Preload("User").Preload("Plan").First(&subscription, id).Error
	if err != nil {
		return nil, err
	}
	return &subscription, nil
}

// GetActiveByUserID retrieves active subscription for a user
func (usr *UserSubscriptionRepository) GetActiveByUserID(userID uint) (*models.UserSubscription, error) {
	var subscription models.UserSubscription
	err := usr.db.Preload("Plan").
		Where("user_id = ? AND status = ? AND end_date > ?", userID, models.SubscriptionStatusActive, time.Now()).
		First(&subscription).Error
	if err != nil {
		return nil, err
	}
	return &subscription, nil
}

// GetAllByUserID retrieves all subscriptions for a user
func (usr *UserSubscriptionRepository) GetAllByUserID(userID uint) ([]models.UserSubscription, error) {
	var subscriptions []models.UserSubscription
	err := usr.db.Preload("Plan").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&subscriptions).Error
	return subscriptions, err
}

// Update updates a user subscription
func (usr *UserSubscriptionRepository) Update(subscription *models.UserSubscription) error {
	return usr.db.Save(subscription).Error
}

// GetExpiredSubscriptions retrieves all expired subscriptions
func (usr *UserSubscriptionRepository) GetExpiredSubscriptions() ([]models.UserSubscription, error) {
	var subscriptions []models.UserSubscription
	err := usr.db.Preload("User").Preload("Plan").
		Where("status = ? AND end_date <= ?", models.SubscriptionStatusActive, time.Now()).
		Find(&subscriptions).Error
	return subscriptions, err
}

// GetExpiringSubscriptions retrieves subscriptions expiring within specified days
func (usr *UserSubscriptionRepository) GetExpiringSubscriptions(expiryDate time.Time) ([]models.UserSubscription, error) {
	var subscriptions []models.UserSubscription
	err := usr.db.Preload("User").Preload("Plan").
		Where("status = ? AND end_date <= ? AND end_date > ?", 
			models.SubscriptionStatusActive, expiryDate, time.Now()).
		Find(&subscriptions).Error
	return subscriptions, err
}

// GetAll retrieves all user subscriptions with pagination
func (usr *UserSubscriptionRepository) GetAll(page, pageSize int) ([]models.UserSubscription, int64, error) {
	var subscriptions []models.UserSubscription
	var total int64
	
	// Get total count
	err := usr.db.Model(&models.UserSubscription{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	// Get paginated results
	offset := (page - 1) * pageSize
	err = usr.db.Preload("User").Preload("Plan").
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&subscriptions).Error
	
	return subscriptions, total, err
}

// GetByStatus retrieves subscriptions by status
func (usr *UserSubscriptionRepository) GetByStatus(status string) ([]models.UserSubscription, error) {
	var subscriptions []models.UserSubscription
	err := usr.db.Preload("User").Preload("Plan").
		Where("status = ?", status).
		Order("created_at DESC").
		Find(&subscriptions).Error
	return subscriptions, err
}

// HasActiveSubscription checks if a user has an active subscription
func (usr *UserSubscriptionRepository) HasActiveSubscription(userID uint) (bool, error) {
	var count int64
	err := usr.db.Model(&models.UserSubscription{}).
		Where("user_id = ? AND status = ? AND end_date > ?", userID, models.SubscriptionStatusActive, time.Now()).
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}
