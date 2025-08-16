package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type TimeSlotRepository struct {
	db *gorm.DB
}

func NewTimeSlotRepository() *TimeSlotRepository {
	return &TimeSlotRepository{
		db: database.GetDB(),
	}
}

// GetByID gets a time slot by ID
func (tsr *TimeSlotRepository) GetByID(id uint) (*models.TimeSlot, error) {
	var slot models.TimeSlot
	err := tsr.db.Preload("Service").First(&slot, id).Error
	if err != nil {
		return nil, err
	}
	return &slot, nil
}

// DecreaseAvailableWorkers decreases the available workers count
func (tsr *TimeSlotRepository) DecreaseAvailableWorkers(slotID uint) error {
	return tsr.db.Model(&models.TimeSlot{}).Where("id = ?", slotID).
		UpdateColumn("available_workers", gorm.Expr("available_workers - ?", 1)).Error
}

// IncreaseAvailableWorkers increases the available workers count
func (tsr *TimeSlotRepository) IncreaseAvailableWorkers(slotID uint) error {
	return tsr.db.Model(&models.TimeSlot{}).Where("id = ?", slotID).
		UpdateColumn("available_workers", gorm.Expr("available_workers + ?", 1)).Error
}

// GetAvailableSlots gets available slots for a service on a specific date
func (tsr *TimeSlotRepository) GetAvailableSlots(serviceID uint, date string) ([]models.TimeSlot, error) {
	var slots []models.TimeSlot
	err := tsr.db.Where("service_id = ? AND date = ? AND is_active = ? AND available_workers > 0", 
		serviceID, date, true).Preload("Service").Find(&slots).Error
	return slots, err
}

type ServiceConfigRepository struct {
	db *gorm.DB
}

func NewServiceConfigRepository() *ServiceConfigRepository {
	return &ServiceConfigRepository{
		db: database.GetDB(),
	}
}

// GetByServiceID gets service configuration by service ID
func (scr *ServiceConfigRepository) GetByServiceID(serviceID uint) (*models.ServiceConfig, error) {
	var config models.ServiceConfig
	err := scr.db.Where("service_id = ? AND is_active = ?", serviceID, true).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// Create creates a new service configuration
func (scr *ServiceConfigRepository) Create(config *models.ServiceConfig) error {
	return scr.db.Create(config).Error
}

// Update updates a service configuration
func (scr *ServiceConfigRepository) Update(config *models.ServiceConfig) error {
	return scr.db.Save(config).Error
}
