package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// ProjectRepository handles project database operations
type ProjectRepository struct {
	db *gorm.DB
}

// NewProjectRepository creates a new project repository
func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{
		db: database.GetDB(),
	}
}

// Create creates a new project
func (pr *ProjectRepository) Create(project *models.Project) error {
	return pr.db.Create(project).Error
}

// GetByID retrieves a project by ID
func (pr *ProjectRepository) GetByID(id uint) (*models.Project, error) {
	var project models.Project
	err := pr.db.Preload("User").First(&project, id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetBySlug retrieves a project by slug
func (pr *ProjectRepository) GetBySlug(slug string) (*models.Project, error) {
	var project models.Project
	err := pr.db.Preload("User").Where("slug = ?", slug).First(&project).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetAll retrieves all projects with pagination
func (pr *ProjectRepository) GetAll(limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// GetByUserID retrieves all projects by user ID
func (pr *ProjectRepository) GetByUserID(userID uint, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Where("user_id = ?", userID).
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// GetByProjectType retrieves projects by project type
func (pr *ProjectRepository) GetByProjectType(projectType models.ProjectType, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Where("project_type = ?", projectType).
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// GetByStatus retrieves projects by status
func (pr *ProjectRepository) GetByStatus(status models.ProjectStatus, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Where("status = ?", status).
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// GetByLocation retrieves projects by location (state and city)
func (pr *ProjectRepository) GetByLocation(state, city string, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	query := pr.db.Preload("User")
	
	if state != "" {
		query = query.Where("state = ?", state)
	}
	if city != "" {
		query = query.Where("city = ?", city)
	}
	
	err := query.Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// Search searches projects by title and description
func (pr *ProjectRepository) Search(query string, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}

// Update updates a project
func (pr *ProjectRepository) Update(project *models.Project) error {
	return pr.db.Save(project).Error
}

// Delete soft deletes a project
func (pr *ProjectRepository) Delete(id uint) error {
	return pr.db.Delete(&models.Project{}, id).Error
}

// Count returns the total count of projects
func (pr *ProjectRepository) Count() (int64, error) {
	var count int64
	err := pr.db.Model(&models.Project{}).Count(&count).Error
	return count, err
}

// CountByUserID returns the count of projects by user ID
func (pr *ProjectRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := pr.db.Model(&models.Project{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// CountByProjectType returns the count of projects by project type
func (pr *ProjectRepository) CountByProjectType(projectType models.ProjectType) (int64, error) {
	var count int64
	err := pr.db.Model(&models.Project{}).Where("project_type = ?", projectType).Count(&count).Error
	return count, err
}

// CountByStatus returns the count of projects by status
func (pr *ProjectRepository) CountByStatus(status models.ProjectStatus) (int64, error) {
	var count int64
	err := pr.db.Model(&models.Project{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// GetRecentProjects retrieves recent projects
func (pr *ProjectRepository) GetRecentProjects(limit int) ([]models.Project, error) {
	var projects []models.Project
	err := pr.db.Preload("User").
		Order("created_at DESC").
		Limit(limit).
		Find(&projects).Error
	return projects, err
}

// GetProjectsByFilters retrieves projects with multiple filters
func (pr *ProjectRepository) GetProjectsByFilters(filters map[string]interface{}, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	query := pr.db.Preload("User")
	
	// Apply filters
	if projectType, ok := filters["project_type"].(models.ProjectType); ok {
		query = query.Where("project_type = ?", projectType)
	}
	if status, ok := filters["status"].(models.ProjectStatus); ok {
		query = query.Where("status = ?", status)
	}
	if state, ok := filters["state"].(string); ok && state != "" {
		query = query.Where("state = ?", state)
	}
	if city, ok := filters["city"].(string); ok && city != "" {
		query = query.Where("city = ?", city)
	}
	if userID, ok := filters["user_id"].(uint); ok {
		query = query.Where("user_id = ?", userID)
	}
	
	err := query.Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error
	return projects, err
}
