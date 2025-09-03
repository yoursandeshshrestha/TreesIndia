package repositories

import (
	"fmt"
	"strings"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerLocationRepository struct {
	db *gorm.DB
}

func NewWorkerLocationRepository() *WorkerLocationRepository {
	return &WorkerLocationRepository{
		db: database.GetDB(),
	}
}

// GetDB returns the underlying database connection
func (wlr *WorkerLocationRepository) GetDB() *gorm.DB {
	return wlr.db
}

// Create creates a new worker location record
func (wlr *WorkerLocationRepository) Create(location *models.WorkerLocation) error {
	return wlr.db.Create(location).Error
}

// Update updates an existing worker location record
func (wlr *WorkerLocationRepository) Update(location *models.WorkerLocation) error {
	return wlr.db.Save(location).Error
}

// GetByID gets a worker location by ID
func (wlr *WorkerLocationRepository) GetByID(id uint) (*models.WorkerLocation, error) {
	var location models.WorkerLocation
	err := wlr.db.Preload("Worker").Preload("Assignment").Preload("Booking").First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// GetActiveByWorkerID gets the active location for a worker
func (wlr *WorkerLocationRepository) GetActiveByWorkerID(workerID uint) (*models.WorkerLocation, error) {
	var location models.WorkerLocation
	err := wlr.db.Where("worker_id = ? AND is_active = ?", workerID, true).
		Preload("Worker").Preload("Assignment").Preload("Booking").
		First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// GetActiveByAssignmentID gets the active location for a specific assignment
func (wlr *WorkerLocationRepository) GetActiveByAssignmentID(assignmentID uint) (*models.WorkerLocation, error) {
	var location models.WorkerLocation
	err := wlr.db.Where("assignment_id = ? AND is_active = ?", assignmentID, true).
		Preload("Worker").Preload("Assignment").Preload("Booking").
		First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// IsLocationTrackingActive checks if location tracking is active for an assignment
func (wlr *WorkerLocationRepository) IsLocationTrackingActive(assignmentID uint) (bool, error) {
	// First check if the table exists
	if err := wlr.db.Raw("SELECT 1 FROM worker_locations LIMIT 1").Error; err != nil {
		if strings.Contains(err.Error(), "doesn't exist") || strings.Contains(err.Error(), "relation") {
			return false, fmt.Errorf("worker_locations table not found: %w", err)
		}
		return false, fmt.Errorf("database error checking table existence: %w", err)
	}

	var count int64
	err := wlr.db.Model(&models.WorkerLocation{}).
		Where("assignment_id = ? AND is_active = ?", assignmentID, true).
		Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("database error checking location tracking: %w", err)
	}
	return count > 0, nil
}

// GetActiveLocationByAssignmentID gets the active location without preloading relationships (for performance)
func (wlr *WorkerLocationRepository) GetActiveLocationByAssignmentID(assignmentID uint) (*models.WorkerLocation, error) {
	var location models.WorkerLocation
	err := wlr.db.Where("assignment_id = ? AND is_active = ?", assignmentID, true).
		First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// CheckTableExists checks if the worker_locations table exists
func (wlr *WorkerLocationRepository) CheckTableExists() error {
	return wlr.db.Raw("SELECT 1 FROM worker_locations LIMIT 1").Error
}

// GetActiveByBookingID gets the active location for a specific booking
func (wlr *WorkerLocationRepository) GetActiveByBookingID(bookingID uint) (*models.WorkerLocation, error) {
	var location models.WorkerLocation
	err := wlr.db.Where("booking_id = ? AND is_active = ?", bookingID, true).
		Preload("Worker").Preload("Assignment").Preload("Booking").
		First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// UpdateLocation updates the location for a worker's active assignment
// This is the legacy method - use CreateLocation or UpdateExistingLocation instead
func (wlr *WorkerLocationRepository) UpdateLocation(workerID uint, assignmentID uint, latitude, longitude, accuracy float64) error {
	// First, get the assignment to retrieve the booking ID
	var assignment struct{ BookingID uint }
	err := wlr.db.Model(&models.WorkerAssignment{}).Select("booking_id").Where("id = ?", assignmentID).First(&assignment).Error
	if err != nil {
		return fmt.Errorf("failed to get assignment %d: %w", assignmentID, err)
	}

	// Use a transaction to ensure data consistency
	return wlr.db.Transaction(func(tx *gorm.DB) error {
		// First, deactivate any existing active location for this worker and assignment
		err = tx.Model(&models.WorkerLocation{}).
			Where("worker_id = ? AND assignment_id = ? AND is_active = ?", workerID, assignmentID, true).
			Update("is_active", false).Error
		if err != nil {
			return fmt.Errorf("failed to deactivate existing location: %w", err)
		}

		// Create new location record
		location := &models.WorkerLocation{
			WorkerID:     workerID,
			AssignmentID: assignmentID,
			BookingID:    assignment.BookingID,
			Latitude:     latitude,
			Longitude:    longitude,
			Accuracy:     accuracy,
			Status:       "tracking",
			LastUpdated:  wlr.db.NowFunc(),
			IsActive:     true,
		}

		err = tx.Create(location).Error
		if err != nil {
			return fmt.Errorf("failed to create location record: %w", err)
		}

		return nil
	})
}

// CreateLocation creates a new location record for a worker's assignment
func (wlr *WorkerLocationRepository) CreateLocation(workerID uint, assignmentID uint, bookingID uint, latitude, longitude, accuracy float64) error {
	location := &models.WorkerLocation{
		WorkerID:     workerID,
		AssignmentID: assignmentID,
		BookingID:    bookingID,
		Latitude:     latitude,
		Longitude:    longitude,
		Accuracy:     accuracy,
		Status:       "tracking",
		LastUpdated:  wlr.db.NowFunc(),
		IsActive:     true,
	}

	return wlr.db.Create(location).Error
}

// UpdateExistingLocation updates an existing location record
func (wlr *WorkerLocationRepository) UpdateExistingLocation(locationID uint, latitude, longitude, accuracy float64) error {
	return wlr.db.Model(&models.WorkerLocation{}).
		Where("id = ?", locationID).
		Updates(map[string]interface{}{
			"latitude":      latitude,
			"longitude":     longitude,
			"accuracy":      accuracy,
			"last_updated": wlr.db.NowFunc(),
		}).Error
}

// StopTracking stops location tracking for a worker's assignment
func (wlr *WorkerLocationRepository) StopTracking(workerID uint, assignmentID uint) error {
	return wlr.db.Model(&models.WorkerLocation{}).
		Where("worker_id = ? AND assignment_id = ? AND is_active = ?", workerID, assignmentID, true).
		Updates(map[string]interface{}{
			"is_active":     false,
			"status":        "stopped",
			"last_updated":  wlr.db.NowFunc(),
		}).Error
}

// GetLocationHistory gets location history for a worker's assignment
func (wlr *WorkerLocationRepository) GetLocationHistory(workerID uint, assignmentID uint) ([]models.WorkerLocation, error) {
	var locations []models.WorkerLocation
	err := wlr.db.Where("worker_id = ? AND assignment_id = ?", workerID, assignmentID).
		Order("last_updated DESC").
		Find(&locations).Error
	return locations, err
}

// CleanupOldLocations removes old location records (older than 30 days)
func (wlr *WorkerLocationRepository) CleanupOldLocations() error {
	thirtyDaysAgo := wlr.db.NowFunc().AddDate(0, 0, -30)
	return wlr.db.Where("created_at < ? AND is_active = ?", thirtyDaysAgo, false).
		Delete(&models.WorkerLocation{}).Error
}
