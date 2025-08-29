package repositories

import (
	"treesindia/models"
)

type RoleApplicationRepository struct {
	*BaseRepository
}

func NewRoleApplicationRepository() *RoleApplicationRepository {
	return &RoleApplicationRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateApplication creates a new role application
func (r *RoleApplicationRepository) CreateApplication(application *models.RoleApplication) error {
	return r.Create(application)
}

// GetApplicationByUserID gets the role application for a user
func (r *RoleApplicationRepository) GetApplicationByUserID(userID uint) (*models.RoleApplication, error) {
	var application models.RoleApplication
	err := r.db.Where("user_id = ?", userID).First(&application).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

// GetApplicationByID gets a role application by ID with user data
func (r *RoleApplicationRepository) GetApplicationByID(id uint) (*models.RoleApplication, error) {
	var application models.RoleApplication
	err := r.db.Preload("User").
		Preload("ReviewedByUser").
		Preload("Worker").
		Preload("Broker").
		First(&application, id).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

// UpdateApplication updates a role application
func (r *RoleApplicationRepository) UpdateApplication(application *models.RoleApplication) error {
	return r.Update(application)
}

// DeleteApplication deletes a role application
func (r *RoleApplicationRepository) DeleteApplication(id uint) error {
	return r.DeleteByID(&models.RoleApplication{}, id)
}

// GetPendingApplications gets all pending applications
func (r *RoleApplicationRepository) GetPendingApplications() ([]models.RoleApplication, error) {
	var applications []models.RoleApplication
	err := r.db.Where("status = ?", models.ApplicationStatusPending).
		Preload("User").
		Preload("ReviewedByUser").
		Preload("Worker").
		Preload("Broker").
		Order("created_at DESC").
		Find(&applications).Error
	return applications, err
}

// GetApplicationsByStatus gets applications by status
func (r *RoleApplicationRepository) GetApplicationsByStatus(status models.ApplicationStatus) ([]models.RoleApplication, error) {
	var applications []models.RoleApplication
	err := r.db.Where("status = ?", status).
		Preload("User").
		Preload("ReviewedByUser").
		Preload("Worker").
		Preload("Broker").
		Order("created_at DESC").
		Find(&applications).Error
	return applications, err
}

// CheckUserHasApplication checks if a user already has an application
func (r *RoleApplicationRepository) CheckUserHasApplication(userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.RoleApplication{}).
		Where("user_id = ?", userID).
		Count(&count).Error
	return count > 0, err
}

// GetAllApplications gets all applications
func (r *RoleApplicationRepository) GetAllApplications() ([]models.RoleApplication, error) {
	var applications []models.RoleApplication
	err := r.db.Preload("User").
		Preload("ReviewedByUser").
		Preload("Worker").
		Preload("Broker").
		Order("created_at DESC").
		Find(&applications).Error
	return applications, err
}

// GetApplicationsWithFilters gets applications with pagination and filters
func (r *RoleApplicationRepository) GetApplicationsWithFilters(page, limit int, search, status, roleType, dateFrom, dateTo string) ([]models.RoleApplication, int64, error) {
	var applications []models.RoleApplication
	var total int64
	
	// Build the query with all necessary preloads
	query := r.db.Model(&models.RoleApplication{}).
		Preload("User").
		Preload("ReviewedByUser").
		Preload("Worker").
		Preload("Broker")
	
	// Apply filters
	if search != "" {
		query = query.Joins("JOIN users ON users.id = role_applications.user_id").
			Where("users.name ILIKE ? OR users.email ILIKE ? OR users.phone ILIKE ?", 
				"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	if status != "" {
		query = query.Where("role_applications.status = ?", status)
	}
	
	if roleType != "" {
		query = query.Where("role_applications.requested_role = ?", roleType)
	}
	
	if dateFrom != "" {
		query = query.Where("role_applications.created_at >= ?", dateFrom+" 00:00:00")
	}
	
	if dateTo != "" {
		query = query.Where("role_applications.created_at <= ?", dateTo+" 23:59:59")
	}
	
	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Apply pagination and get results
	offset := (page - 1) * limit
	err := query.Order("role_applications.created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&applications).Error
	
	return applications, total, err
}
