package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerRepository struct {
	db *gorm.DB
}

func NewWorkerRepository() *WorkerRepository {
	return &WorkerRepository{
		db: database.GetDB(),
	}
}

// GetByUserID gets a worker by user ID
func (wr *WorkerRepository) GetByUserID(userID uint) (*models.Worker, error) {
	var worker models.Worker
	err := wr.db.Where("user_id = ?", userID).First(&worker).Error
	if err != nil {
		return nil, err
	}
	return &worker, nil
}

// GetByID gets a worker by ID
func (wr *WorkerRepository) GetByID(id uint) (*models.Worker, error) {
	var worker models.Worker
	err := wr.db.First(&worker, id).Error
	if err != nil {
		return nil, err
	}
	return &worker, nil
}

// Update updates a worker
func (wr *WorkerRepository) Update(worker *models.Worker) error {
	return wr.db.Save(worker).Error
}

// IncrementCompletedJob increments the worker's completed job count and earnings
func (wr *WorkerRepository) IncrementCompletedJob(workerID uint, earnings float64) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Updates(map[string]interface{}{
			"total_jobs":     gorm.Expr("total_jobs + 1"),
			"total_bookings": gorm.Expr("total_bookings + 1"),
			"earnings":       gorm.Expr("earnings + ?", earnings),
		}).Error
}

// UpdateRating updates the worker's rating
func (wr *WorkerRepository) UpdateRating(workerID uint, newRating float64) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Update("rating", newRating).Error
}

// UpdateAvailability updates the worker's availability status
func (wr *WorkerRepository) UpdateAvailability(workerID uint, isAvailable bool) error {
	return wr.db.Model(&models.Worker{}).
		Where("id = ?", workerID).
		Update("is_available", isAvailable).Error
}

// GetAllWorkers gets all workers with optional filters
func (wr *WorkerRepository) GetAllWorkers(filters *WorkerFilters) ([]models.Worker, error) {
	var workers []models.Worker
	query := wr.db.Model(&models.Worker{})

	if filters != nil {
		if filters.IsActive != nil {
			query = query.Where("is_active = ?", *filters.IsActive)
		}
		if filters.IsAvailable != nil {
			query = query.Where("is_available = ?", *filters.IsAvailable)
		}
		if filters.WorkerType != "" {
			query = query.Where("worker_type = ?", filters.WorkerType)
		}
	}

	err := query.Find(&workers).Error
	return workers, err
}

// WorkerFilters represents filters for worker queries
type WorkerFilters struct {
	IsActive    *bool              `json:"is_active"`
	IsAvailable *bool              `json:"is_available"`
	WorkerType  models.WorkerType  `json:"worker_type"`
}
