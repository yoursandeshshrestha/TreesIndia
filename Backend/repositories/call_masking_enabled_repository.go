package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// CallMaskingEnabledRepository handles call masking enabled database operations
type CallMaskingEnabledRepository struct {
	db *gorm.DB
}

// NewCallMaskingEnabledRepository creates a new call masking enabled repository
func NewCallMaskingEnabledRepository() *CallMaskingEnabledRepository {
	return &CallMaskingEnabledRepository{
		db: database.GetDB(),
	}
}

// Create creates a new call masking enabled record
func (cmer *CallMaskingEnabledRepository) Create(callMasking *models.CallMaskingEnabled) error {
	return cmer.db.Create(callMasking).Error
}

// GetByID retrieves a call masking enabled record by ID
func (cmer *CallMaskingEnabledRepository) GetByID(id uint) (*models.CallMaskingEnabled, error) {
	var callMasking models.CallMaskingEnabled
	err := cmer.db.Preload("Booking").Preload("Worker").Preload("Customer").First(&callMasking, id).Error
	if err != nil {
		return nil, err
	}
	return &callMasking, nil
}

// GetByBookingID retrieves a call masking enabled record by booking ID
func (cmer *CallMaskingEnabledRepository) GetByBookingID(bookingID uint) (*models.CallMaskingEnabled, error) {
	var callMasking models.CallMaskingEnabled
	err := cmer.db.Where("booking_id = ?", bookingID).First(&callMasking).Error
	if err != nil {
		return nil, err
	}
	return &callMasking, nil
}

// Update updates a call masking enabled record
func (cmer *CallMaskingEnabledRepository) Update(callMasking *models.CallMaskingEnabled) error {
	return cmer.db.Save(callMasking).Error
}

// Delete deletes a call masking enabled record
func (cmer *CallMaskingEnabledRepository) Delete(id uint) error {
	return cmer.db.Delete(&models.CallMaskingEnabled{}, id).Error
}

// GetEnabledRecords retrieves all enabled call masking records
func (cmer *CallMaskingEnabledRepository) GetEnabledRecords() ([]models.CallMaskingEnabled, error) {
	var records []models.CallMaskingEnabled
	err := cmer.db.Where("disabled_at IS NULL").
		Preload("Booking").Preload("Worker").Preload("Customer").
		Find(&records).Error
	return records, err
}

// GetRecordsByUserID retrieves call masking records for a specific user
func (cmer *CallMaskingEnabledRepository) GetRecordsByUserID(userID uint) ([]models.CallMaskingEnabled, error) {
	var records []models.CallMaskingEnabled
	err := cmer.db.Where("worker_id = ? OR customer_id = ?", userID, userID).
		Preload("Booking").Preload("Worker").Preload("Customer").
		Order("created_at DESC").
		Find(&records).Error
	return records, err
}

// GetStats retrieves call masking statistics
func (cmer *CallMaskingEnabledRepository) GetStats() (map[string]interface{}, error) {
	var stats map[string]interface{} = make(map[string]interface{})

	// Total records
	var totalRecords int64
	cmer.db.Model(&models.CallMaskingEnabled{}).Count(&totalRecords)
	stats["total_records"] = totalRecords

	// Enabled records
	var enabledRecords int64
	cmer.db.Model(&models.CallMaskingEnabled{}).Where("disabled_at IS NULL").Count(&enabledRecords)
	stats["enabled_records"] = enabledRecords

	// Disabled records
	var disabledRecords int64
	cmer.db.Model(&models.CallMaskingEnabled{}).Where("disabled_at IS NOT NULL").Count(&disabledRecords)
	stats["disabled_records"] = disabledRecords

	// Total call duration
	var totalDuration int64
	cmer.db.Model(&models.CallMaskingEnabled{}).Select("COALESCE(SUM(total_call_duration), 0)").Scan(&totalDuration)
	stats["total_call_duration"] = totalDuration

	// Total calls
	var totalCalls int64
	cmer.db.Model(&models.CallMaskingEnabled{}).Select("COALESCE(SUM(call_count), 0)").Scan(&totalCalls)
	stats["total_calls"] = totalCalls

	return stats, nil
}
