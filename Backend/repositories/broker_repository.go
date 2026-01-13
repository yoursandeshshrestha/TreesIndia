package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type BrokerRepository struct {
	db *gorm.DB
}

func NewBrokerRepository() *BrokerRepository {
	return &BrokerRepository{
		db: database.GetDB(),
	}
}

// GetByUserID gets a broker by user ID
func (br *BrokerRepository) GetByUserID(userID uint) (*models.Broker, error) {
	var broker models.Broker
	err := br.db.Preload("User").Where("user_id = ?", userID).First(&broker).Error
	if err != nil {
		return nil, err
	}
	return &broker, nil
}

// GetByID gets a broker by ID
func (br *BrokerRepository) GetByID(id uint) (*models.Broker, error) {
	var broker models.Broker
	err := br.db.Preload("User").First(&broker, id).Error
	if err != nil {
		return nil, err
	}
	return &broker, nil
}

// Update updates a broker
func (br *BrokerRepository) Update(broker *models.Broker) error {
	return br.db.Save(broker).Error
}

// CheckLicenseExists checks if a license already exists for a different broker
func (br *BrokerRepository) CheckLicenseExists(license string, excludeBrokerID uint) (bool, error) {
	var count int64
	err := br.db.Model(&models.Broker{}).
		Where("license = ? AND id != ?", license, excludeBrokerID).
		Count(&count).Error
	return count > 0, err
}
