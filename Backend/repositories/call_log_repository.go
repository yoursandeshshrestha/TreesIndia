package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// CallLogRepository handles call log database operations
type CallLogRepository struct {
	db *gorm.DB
}

// NewCallLogRepository creates a new call log repository
func NewCallLogRepository() *CallLogRepository {
	return &CallLogRepository{
		db: database.GetDB(),
	}
}

// Create creates a new call log
func (clr *CallLogRepository) Create(callLog *models.CallLog) error {
	return clr.db.Create(callLog).Error
}

// GetByID retrieves a call log by ID
func (clr *CallLogRepository) GetByID(id uint) (*models.CallLog, error) {
	var callLog models.CallLog
	err := clr.db.Preload("Session").Preload("Caller").First(&callLog, id).Error
	if err != nil {
		return nil, err
	}
	return &callLog, nil
}

// GetByCallMaskingID retrieves call logs for a specific call masking record
func (clr *CallLogRepository) GetByCallMaskingID(callMaskingID uint) ([]models.CallLog, error) {
	var callLogs []models.CallLog
	err := clr.db.Where("call_masking_id = ?", callMaskingID).
		Preload("Caller").
		Order("created_at DESC").
		Find(&callLogs).Error
	return callLogs, err
}

// GetByExotelCallSID retrieves a call log by Exotel call SID
func (clr *CallLogRepository) GetByExotelCallSID(callSID string) (*models.CallLog, error) {
	var callLog models.CallLog
	err := clr.db.Where("exotel_call_sid = ?", callSID).First(&callLog).Error
	if err != nil {
		return nil, err
	}
	return &callLog, nil
}

// Update updates a call log
func (clr *CallLogRepository) Update(callLog *models.CallLog) error {
	return clr.db.Save(callLog).Error
}

// Delete deletes a call log
func (clr *CallLogRepository) Delete(id uint) error {
	return clr.db.Delete(&models.CallLog{}, id).Error
}

// GetCallLogsByUserID retrieves call logs for a specific user
func (clr *CallLogRepository) GetCallLogsByUserID(userID uint) ([]models.CallLog, error) {
	var callLogs []models.CallLog
	err := clr.db.Where("caller_id = ?", userID).
		Preload("CallMasking.Booking").
		Order("created_at DESC").
		Find(&callLogs).Error
	return callLogs, err
}

// GetCallLogsByStatus retrieves call logs by status
func (clr *CallLogRepository) GetCallLogsByStatus(status models.CallStatus) ([]models.CallLog, error) {
	var callLogs []models.CallLog
	err := clr.db.Where("call_status = ?", status).
		Preload("CallMasking").Preload("Caller").
		Order("created_at DESC").
		Find(&callLogs).Error
	return callLogs, err
}

// GetCallLogStats retrieves call log statistics
func (clr *CallLogRepository) GetCallLogStats() (map[string]interface{}, error) {
	var stats map[string]interface{} = make(map[string]interface{})

	// Total calls
	var totalCalls int64
	clr.db.Model(&models.CallLog{}).Count(&totalCalls)
	stats["total_calls"] = totalCalls

	// Completed calls
	var completedCalls int64
	clr.db.Model(&models.CallLog{}).Where("call_status = ?", models.CallStatusCompleted).Count(&completedCalls)
	stats["completed_calls"] = completedCalls

	// Failed calls
	var failedCalls int64
	clr.db.Model(&models.CallLog{}).Where("call_status = ?", models.CallStatusFailed).Count(&failedCalls)
	stats["failed_calls"] = failedCalls

	// Missed calls
	var missedCalls int64
	clr.db.Model(&models.CallLog{}).Where("call_status = ?", models.CallStatusMissed).Count(&missedCalls)
	stats["missed_calls"] = missedCalls

	// Total call duration
	var totalDuration int64
	clr.db.Model(&models.CallLog{}).Select("COALESCE(SUM(call_duration), 0)").Scan(&totalDuration)
	stats["total_duration"] = totalDuration

	// Average call duration
	var avgDuration float64
	clr.db.Model(&models.CallLog{}).Where("call_status = ?", models.CallStatusCompleted).
		Select("COALESCE(AVG(call_duration), 0)").Scan(&avgDuration)
	stats["avg_duration"] = avgDuration

	return stats, nil
}

// GetRecentCallLogs retrieves recent call logs
func (clr *CallLogRepository) GetRecentCallLogs(limit int) ([]models.CallLog, error) {
	var callLogs []models.CallLog
	err := clr.db.Preload("CallMasking.Booking").Preload("Caller").
		Order("created_at DESC").
		Limit(limit).
		Find(&callLogs).Error
	return callLogs, err
}

// GetCallLogsByDateRange retrieves call logs within a date range
func (clr *CallLogRepository) GetCallLogsByDateRange(startDate, endDate string) ([]models.CallLog, error) {
	var callLogs []models.CallLog
	err := clr.db.Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Preload("CallMasking.Booking").Preload("Caller").
		Order("created_at DESC").
		Find(&callLogs).Error
	return callLogs, err
}
