package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerInquiryRepository struct {
	db *gorm.DB
}

func NewWorkerInquiryRepository() *WorkerInquiryRepository {
	return &WorkerInquiryRepository{
		db: database.GetDB(),
	}
}

// Create creates a new worker inquiry
func (wir *WorkerInquiryRepository) Create(inquiry *models.WorkerInquiry) error {
	return wir.db.Create(inquiry).Error
}

// GetByID gets a worker inquiry by ID
func (wir *WorkerInquiryRepository) GetByID(id uint) (*models.WorkerInquiry, error) {
	var inquiry models.WorkerInquiry
	err := wir.db.Preload("User").Preload("Worker.User").Preload("ApprovedByUser").First(&inquiry, id).Error
	if err != nil {
		return nil, err
	}
	return &inquiry, nil
}

// GetUserInquiries gets inquiries sent by a user
func (wir *WorkerInquiryRepository) GetUserInquiries(userID uint, filters *WorkerInquiryFilters) ([]models.WorkerInquiry, *Pagination, error) {
	var inquiries []models.WorkerInquiry
	var total int64

	query := wir.db.Where("user_id = ?", userID)

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}

	// Count total
	err := query.Model(&models.WorkerInquiry{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Worker.User")

	// Execute query
	err = query.Order("created_at DESC").Find(&inquiries).Error
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

	return inquiries, pagination, nil
}

// GetWorkerInquiries gets inquiries received by a worker
func (wir *WorkerInquiryRepository) GetWorkerInquiries(workerID uint, filters *WorkerInquiryFilters) ([]models.WorkerInquiry, *Pagination, error) {
	var inquiries []models.WorkerInquiry
	var total int64

	query := wir.db.Where("worker_id = ?", workerID)

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}

	// Count total
	err := query.Model(&models.WorkerInquiry{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("User")

	// Execute query
	err = query.Order("created_at DESC").Find(&inquiries).Error
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

	return inquiries, pagination, nil
}

// GetAllInquiries gets all inquiries with admin filters
func (wir *WorkerInquiryRepository) GetAllInquiries(filters *AdminInquiryFilters) ([]models.WorkerInquiry, *Pagination, error) {
	var inquiries []models.WorkerInquiry
	var total int64

	query := wir.db

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.WorkerID != 0 {
		query = query.Where("worker_id = ?", filters.WorkerID)
	}
	if filters.UserID != 0 {
		query = query.Where("user_id = ?", filters.UserID)
	}

	// Count total
	err := query.Model(&models.WorkerInquiry{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("User").Preload("Worker.User").Preload("ApprovedByUser")

	// Execute query
	err = query.Order("created_at DESC").Find(&inquiries).Error
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

	return inquiries, pagination, nil
}

// Update updates a worker inquiry
func (wir *WorkerInquiryRepository) Update(inquiry *models.WorkerInquiry) error {
	return wir.db.Save(inquiry).Error
}

// WorkerInquiryFilters represents filters for worker inquiries
type WorkerInquiryFilters struct {
	Status string `json:"status"`
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
}

// AdminInquiryFilters represents admin filters for worker inquiries
type AdminInquiryFilters struct {
	Status   string `json:"status"`
	WorkerID uint   `json:"worker_id"`
	UserID   uint   `json:"user_id"`
	Page     int    `json:"page"`
	Limit    int    `json:"limit"`
}
