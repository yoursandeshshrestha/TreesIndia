package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerAssignmentRepository struct {
	db *gorm.DB
}

func NewWorkerAssignmentRepository() *WorkerAssignmentRepository {
	return &WorkerAssignmentRepository{
		db: database.GetDB(),
	}
}

// GetDB returns the underlying database connection
func (war *WorkerAssignmentRepository) GetDB() *gorm.DB {
	return war.db
}

// Create creates a new worker assignment
func (war *WorkerAssignmentRepository) Create(assignment *models.WorkerAssignment) error {
	return war.db.Create(assignment).Error
}

// GetByID gets a worker assignment by ID
func (war *WorkerAssignmentRepository) GetByID(id uint) (*models.WorkerAssignment, error) {
	var assignment models.WorkerAssignment
	err := war.db.Preload("Booking").Preload("Worker").Preload("AssignedByUser").First(&assignment, id).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// GetByBookingID gets worker assignment by booking ID
func (war *WorkerAssignmentRepository) GetByBookingID(bookingID uint) (*models.WorkerAssignment, error) {
	var assignment models.WorkerAssignment
	err := war.db.Where("booking_id = ?", bookingID).Preload("Worker").First(&assignment).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// GetWorkerAssignments gets assignments for a worker
func (war *WorkerAssignmentRepository) GetWorkerAssignments(workerID uint, filters *WorkerAssignmentFilters) ([]models.WorkerAssignment, *Pagination, error) {
	var assignments []models.WorkerAssignment
	var total int64

	query := war.db.Where("worker_id = ?", workerID)

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.Date != "" {
		query = query.Joins("JOIN bookings ON worker_assignments.booking_id = bookings.id").
			Where("bookings.scheduled_date = ?", filters.Date)
	}

	// Count total
	err := query.Model(&models.WorkerAssignment{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Booking.Service").Preload("Booking.User")

	// Execute query
	err = query.Order("created_at DESC").Find(&assignments).Error
	if err != nil {
		return nil, nil, err
	}

	// Calculate pagination
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))
	pagination := &Pagination{
		Page:       filters.Page,
		Limit:      filters.Limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return assignments, pagination, nil
}

// Update updates a worker assignment
func (war *WorkerAssignmentRepository) Update(assignment *models.WorkerAssignment) error {
	return war.db.Save(assignment).Error
}

// WorkerAssignmentFilters represents filters for worker assignments
type WorkerAssignmentFilters struct {
	Status string `json:"status"`
	Date   string `json:"date"`
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
}
