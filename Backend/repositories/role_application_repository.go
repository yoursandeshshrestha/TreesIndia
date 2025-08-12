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

// GetApplicationByID gets a role application by ID
func (r *RoleApplicationRepository) GetApplicationByID(id uint) (*models.RoleApplication, error) {
	var application models.RoleApplication
	err := r.FindByID(&application, id)
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
		Order("created_at DESC").
		Find(&applications).Error
	return applications, err
}

// GetApplicationsByStatus gets applications by status
func (r *RoleApplicationRepository) GetApplicationsByStatus(status models.ApplicationStatus) ([]models.RoleApplication, error) {
	var applications []models.RoleApplication
	err := r.db.Where("status = ?", status).
		Preload("User").
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
		Order("created_at DESC").
		Find(&applications).Error
	return applications, err
}
