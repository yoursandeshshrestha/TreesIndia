package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// SubscriptionPlanRepository handles subscription plan database operations
type SubscriptionPlanRepository struct {
	db *gorm.DB
}

// NewSubscriptionPlanRepository creates a new subscription plan repository
func NewSubscriptionPlanRepository() *SubscriptionPlanRepository {
	return &SubscriptionPlanRepository{
		db: database.GetDB(),
	}
}

// Create creates a new subscription plan
func (spr *SubscriptionPlanRepository) Create(plan *models.SubscriptionPlan) error {
	return spr.db.Create(plan).Error
}

// GetByID retrieves a subscription plan by ID
func (spr *SubscriptionPlanRepository) GetByID(id uint) (*models.SubscriptionPlan, error) {
	var plan models.SubscriptionPlan
	err := spr.db.First(&plan, id).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetAll retrieves all subscription plans
func (spr *SubscriptionPlanRepository) GetAll() ([]models.SubscriptionPlan, error) {
	var plans []models.SubscriptionPlan
	err := spr.db.Find(&plans).Error
	return plans, err
}

// GetActive retrieves all active subscription plans
func (spr *SubscriptionPlanRepository) GetActive() ([]models.SubscriptionPlan, error) {
	var plans []models.SubscriptionPlan
	err := spr.db.Where("is_active = ?", true).Find(&plans).Error
	return plans, err
}

// Update updates a subscription plan
func (spr *SubscriptionPlanRepository) Update(plan *models.SubscriptionPlan) error {
	return spr.db.Save(plan).Error
}

// Delete deletes a subscription plan
func (spr *SubscriptionPlanRepository) Delete(id uint) error {
	return spr.db.Delete(&models.SubscriptionPlan{}, id).Error
}

// GetByDuration retrieves subscription plans by duration
func (spr *SubscriptionPlanRepository) GetByDuration(duration string) ([]models.SubscriptionPlan, error) {
	var plans []models.SubscriptionPlan
	err := spr.db.Where("duration = ? AND is_active = ?", duration, true).Find(&plans).Error
	return plans, err
}
