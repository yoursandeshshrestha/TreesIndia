package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type BookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository() *BookingRepository {
	return &BookingRepository{
		db: database.GetDB(),
	}
}

// Create creates a new booking
func (br *BookingRepository) Create(booking *models.Booking) (*models.Booking, error) {
	err := br.db.Create(booking).Error
	if err != nil {
		return nil, err
	}
	return booking, nil
}

// GetByID gets a booking by ID
func (br *BookingRepository) GetByID(id uint) (*models.Booking, error) {
	var booking models.Booking
	err := br.db.Preload("User").Preload("Service").Preload("TimeSlot").Preload("WorkerAssignment").Preload("BufferRequests").First(&booking, id).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

// Update updates a booking
func (br *BookingRepository) Update(booking *models.Booking) error {
	return br.db.Save(booking).Error
}

// GetUserBookings gets bookings for a user with filters
func (br *BookingRepository) GetUserBookings(userID uint, filters *UserBookingFilters) ([]models.Booking, *Pagination, error) {
	var bookings []models.Booking
	var total int64

	query := br.db.Where("user_id = ?", userID)

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.DateFrom != "" {
		query = query.Where("scheduled_date >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Where("scheduled_date <= ?", filters.DateTo)
	}

	// Count total
	err := query.Model(&models.Booking{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Service").Preload("TimeSlot").Preload("WorkerAssignment.Worker")

	// Execute query
	err = query.Order("created_at DESC").Find(&bookings).Error
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

	return bookings, pagination, nil
}

// GetBookingsWithFilters gets all bookings with admin filters
func (br *BookingRepository) GetBookingsWithFilters(filters *AdminBookingFilters) ([]models.Booking, *Pagination, error) {
	var bookings []models.Booking
	var total int64

	query := br.db

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.DateFrom != "" {
		query = query.Where("scheduled_date >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Where("scheduled_date <= ?", filters.DateTo)
	}
	if filters.ServiceID != "" {
		query = query.Where("service_id = ?", filters.ServiceID)
	}
	if filters.WorkerID != "" {
		query = query.Joins("JOIN worker_assignments ON bookings.id = worker_assignments.booking_id").
			Where("worker_assignments.worker_id = ?", filters.WorkerID)
	}
	if filters.PaymentStatus != "" {
		query = query.Where("payment_status = ?", filters.PaymentStatus)
	}
	if filters.Search != "" {
		query = query.Joins("JOIN users ON bookings.user_id = users.id").
			Where("users.name ILIKE ? OR users.phone ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	// Count total
	err := query.Model(&models.Booking{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("User").Preload("Service").Preload("TimeSlot").Preload("WorkerAssignment.Worker")

	// Apply sorting
	if filters.Sort != "" {
		query = query.Order(filters.Sort)
	} else {
		query = query.Order("created_at DESC")
	}

	// Execute query
	err = query.Find(&bookings).Error
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

	return bookings, pagination, nil
}

// UserBookingFilters represents filters for user bookings
type UserBookingFilters struct {
	Status   string `json:"status"`
	DateFrom string `json:"date_from"`
	DateTo   string `json:"date_to"`
	Page     int    `json:"page"`
	Limit    int    `json:"limit"`
}

// AdminBookingFilters represents filters for admin bookings
type AdminBookingFilters struct {
	Status        string `json:"status"`
	DateFrom      string `json:"date_from"`
	DateTo        string `json:"date_to"`
	ServiceID     string `json:"service_id"`
	WorkerID      string `json:"worker_id"`
	PaymentStatus string `json:"payment_status"`
	Search        string `json:"search"`
	Page          int    `json:"page"`
	Limit         int    `json:"limit"`
	Sort          string `json:"sort"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
