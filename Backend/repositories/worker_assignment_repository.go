package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
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
	// Preload relationships
	err := war.db.
		Preload("Booking.Service.Category").
		Preload("Booking.User").
		Preload("Worker").
		Preload("AssignedByUser").
		First(&assignment, id).Error
	if err != nil {
		logrus.Errorf("Failed to get worker assignment by ID %d: %v", id, err)
		return nil, err
	}
	logrus.Infof("Retrieved assignment ID %d with status: %s, worker_id: %d", assignment.ID, assignment.Status, assignment.WorkerID)
	return &assignment, nil
}

// GetByBookingID gets worker assignment by booking ID
func (war *WorkerAssignmentRepository) GetByBookingID(bookingID uint) (*models.WorkerAssignment, error) {
	var assignment models.WorkerAssignment
	err := war.db.Where("booking_id = ?", bookingID).Preload("Booking.Service.Category").Preload("Booking.User").Preload("Worker").Preload("AssignedByUser").First(&assignment).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// GetByWorkerAndBooking gets worker assignment by worker ID and booking ID
func (war *WorkerAssignmentRepository) GetByWorkerAndBooking(workerID uint, bookingID uint) (*models.WorkerAssignment, error) {
	var assignment models.WorkerAssignment
	err := war.db.Where("worker_id = ? AND booking_id = ?", workerID, bookingID).
		Preload("Booking.Service.Category").
		Preload("Booking.User").
		Preload("Worker").
		Preload("AssignedByUser").
		First(&assignment).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// Update updates an existing worker assignment
func (war *WorkerAssignmentRepository) Update(assignment *models.WorkerAssignment) error {
	// Use Omit to exclude preloaded relationships from being saved
	// This prevents issues when assignment has preloaded Booking, Worker, etc.
	return war.db.Model(assignment).
		Omit("Booking", "Worker", "AssignedByUser", "CreatedAt").
		Save(assignment).Error
}

// Delete deletes a worker assignment by ID
func (war *WorkerAssignmentRepository) Delete(id uint) error {
	return war.db.Delete(&models.WorkerAssignment{}, id).Error
}

// GetWorkerAssignments gets assignments for a worker
func (war *WorkerAssignmentRepository) GetWorkerAssignments(workerID uint, filters *WorkerAssignmentFilters) ([]models.WorkerAssignment, *Pagination, error) {
	var assignments []models.WorkerAssignment
	var total int64

	// Set default values if not provided
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 {
		filters.Limit = 10 // Default limit
	}

	// Build base query for counting
	countQuery := war.db.Model(&models.WorkerAssignment{}).Where("worker_id = ?", workerID)

	// Build query for fetching data
	query := war.db.Model(&models.WorkerAssignment{}).Where("worker_id = ?", workerID)

	// Apply filters
	if filters.Status != "" {
		countQuery = countQuery.Where("status = ?", filters.Status)
		query = query.Where("status = ?", filters.Status)
	}
	if filters.Date != "" {
		// Use raw SQL subquery to avoid conflicts with preloads
		countQuery = countQuery.Where("booking_id IN (SELECT id FROM bookings WHERE scheduled_date = ?)", filters.Date)
		query = query.Where("booking_id IN (SELECT id FROM bookings WHERE scheduled_date = ?)", filters.Date)
	}

	// Count total
	err := countQuery.Count(&total).Error
	if err != nil {
		logrus.Errorf("Failed to count worker assignments: %v", err)
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Booking.Service.Category").Preload("Booking.User").Preload("Worker").Preload("AssignedByUser")

	// Execute query
	err = query.Order("created_at DESC").Find(&assignments).Error
	if err != nil {
		logrus.Errorf("Failed to find worker assignments: %v", err)
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

// WorkerAssignmentFilters represents filters for worker assignments
type WorkerAssignmentFilters struct {
	Status string `json:"status"`
	Date   string `json:"date"`
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
}
