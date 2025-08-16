package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type BufferRequestRepository struct {
	db *gorm.DB
}

func NewBufferRequestRepository() *BufferRequestRepository {
	return &BufferRequestRepository{
		db: database.GetDB(),
	}
}

// Create creates a new buffer request
func (brr *BufferRequestRepository) Create(request *models.BufferRequest) error {
	return brr.db.Create(request).Error
}

// GetByID gets a buffer request by ID
func (brr *BufferRequestRepository) GetByID(id uint) (*models.BufferRequest, error) {
	var request models.BufferRequest
	err := brr.db.Preload("Booking").Preload("Worker").Preload("ApprovedByUser").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

// GetPendingByBooking gets pending buffer requests for a booking
func (brr *BufferRequestRepository) GetPendingByBooking(bookingID uint) ([]models.BufferRequest, error) {
	var requests []models.BufferRequest
	err := brr.db.Where("booking_id = ? AND status = ?", bookingID, models.BufferRequestStatusPending).Find(&requests).Error
	return requests, err
}

// GetPendingByWorker gets pending buffer requests for a worker
func (brr *BufferRequestRepository) GetPendingByWorker(workerID uint) ([]models.BufferRequest, error) {
	var requests []models.BufferRequest
	err := brr.db.Where("worker_id = ? AND status = ?", workerID, models.BufferRequestStatusPending).
		Preload("Booking.Service").Find(&requests).Error
	return requests, err
}

// GetPendingRequests gets all pending buffer requests
func (brr *BufferRequestRepository) GetPendingRequests(filters *BufferRequestFilters) ([]models.BufferRequest, *Pagination, error) {
	var requests []models.BufferRequest
	var total int64

	query := brr.db.Where("status = ?", models.BufferRequestStatusPending)

	// Apply filters
	if filters.WorkerID != "" {
		query = query.Where("worker_id = ?", filters.WorkerID)
	}
	if filters.DateFrom != "" {
		query = query.Joins("JOIN bookings ON buffer_requests.booking_id = bookings.id").
			Where("bookings.scheduled_date >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Joins("JOIN bookings ON buffer_requests.booking_id = bookings.id").
			Where("bookings.scheduled_date <= ?", filters.DateTo)
	}

	// Count total
	err := query.Model(&models.BufferRequest{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Booking.Service").Preload("Booking.User").Preload("Worker")

	// Execute query
	err = query.Order("created_at DESC").Find(&requests).Error
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

	return requests, pagination, nil
}

// Update updates a buffer request
func (brr *BufferRequestRepository) Update(request *models.BufferRequest) error {
	return brr.db.Save(request).Error
}

// BufferRequestFilters represents filters for buffer requests
type BufferRequestFilters struct {
	WorkerID string `json:"worker_id"`
	DateFrom string `json:"date_from"`
	DateTo   string `json:"date_to"`
	Page     int    `json:"page"`
	Limit    int    `json:"limit"`
}
