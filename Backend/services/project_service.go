package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// ProjectService handles project business logic
type ProjectService struct {
	projectRepo *repositories.ProjectRepository
	userRepo    *repositories.UserRepository
	cloudinary  *CloudinaryService
}

// NewProjectService creates a new project service
func NewProjectService(cloudinaryService *CloudinaryService) *ProjectService {
	return &ProjectService{
		projectRepo: repositories.NewProjectRepository(),
		userRepo:    repositories.NewUserRepository(),
		cloudinary:  cloudinaryService,
	}
}

// CreateProjectRequest represents the request to create a project
type CreateProjectRequest struct {
	Title               string                    `json:"title" form:"title" binding:"required"`
	Description         string                    `json:"description" form:"description"`
	ProjectType         models.ProjectType        `json:"project_type" form:"project_type" binding:"required,oneof=residential commercial infrastructure"`
	Status              models.ProjectStatus      `json:"status,omitempty" form:"status"`
	State               string                    `json:"state" form:"state" binding:"required"`
	City                string                    `json:"city" form:"city" binding:"required"`
	Address             string                    `json:"address" form:"address"`
	Pincode             string                    `json:"pincode" form:"pincode"`
	EstimatedDuration   int                       `json:"estimated_duration_days" form:"estimated_duration_days"`
	ContactInfo         models.JSONB              `json:"contact_info" form:"contact_info"`
	Images              models.JSONStringArray    `json:"images" form:"images"`
}

// UpdateProjectRequest represents the request to update a project
type UpdateProjectRequest struct {
	Title               *string                   `json:"title,omitempty" form:"title"`
	Description         *string                   `json:"description,omitempty" form:"description"`
	ProjectType         *models.ProjectType       `json:"project_type,omitempty" form:"project_type"`
	Status              *models.ProjectStatus     `json:"status,omitempty" form:"status"`
	State               *string                   `json:"state,omitempty" form:"state"`
	City                *string                   `json:"city,omitempty" form:"city"`
	Address             *string                   `json:"address,omitempty" form:"address"`
	Pincode             *string                   `json:"pincode,omitempty" form:"pincode"`
	EstimatedDuration   *int                      `json:"estimated_duration_days,omitempty" form:"estimated_duration_days"`
	ContactInfo         *models.JSONB             `json:"contact_info,omitempty" form:"contact_info"`
	Images              *models.JSONStringArray   `json:"images,omitempty" form:"images"`
}

// CreateProject creates a new project
func (ps *ProjectService) CreateProject(userID uint, req *CreateProjectRequest) (*models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can create projects without subscription
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to create projects")
	}

	// Generate slug from title
	slug := utils.GenerateSlug(req.Title)
	
	// Ensure slug is unique
	uniqueSlug, err := ps.ensureUniqueSlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to generate unique slug: %v", err)
	}

	// Create project
	project := &models.Project{
		Title:             req.Title,
		Description:       req.Description,
		Slug:              uniqueSlug,
		ProjectType:       req.ProjectType,
		Status:            req.Status,
		State:             req.State,
		City:              req.City,
		Address:           req.Address,
		Pincode:           req.Pincode,
		EstimatedDuration: req.EstimatedDuration,
		ContactInfo:       req.ContactInfo,
		Images:            req.Images,
		UserID:            userID,
		UploadedByAdmin:   user.UserType == models.UserTypeAdmin,
	}

	// Set default status if not provided
	if project.Status == "" {
		project.Status = models.ProjectStatusStartingSoon
	}

	// Validate project data
	if err := ps.validateProject(project); err != nil {
		return nil, fmt.Errorf("project validation failed: %v", err)
	}

	// Validate images
	if err := ps.validateImages(project.Images); err != nil {
		return nil, fmt.Errorf("image validation failed: %v", err)
	}

	// Create project in database
	if err := ps.projectRepo.Create(project); err != nil {
		return nil, fmt.Errorf("failed to create project: %v", err)
	}

	// Load user relationship
	project.User = &user

	return project, nil
}

// GetProject retrieves a project by ID
func (ps *ProjectService) GetProject(userID uint, projectID uint) (*models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can view any project
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view projects")
	}

	// Get project
	project, err := ps.projectRepo.GetByID(projectID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %v", err)
	}

	return project, nil
}

// GetProjectBySlug retrieves a project by slug
func (ps *ProjectService) GetProjectBySlug(userID uint, slug string) (*models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can view any project
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view projects")
	}

	// Get project
	project, err := ps.projectRepo.GetBySlug(slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %v", err)
	}

	return project, nil
}

// GetProjects retrieves projects with pagination and filters
func (ps *ProjectService) GetProjects(userID uint, filters map[string]interface{}, limit, offset int) ([]models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can view any projects
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view projects")
	}

	// Get projects with filters
	projects, err := ps.projectRepo.GetProjectsByFilters(filters, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %v", err)
	}

	return projects, nil
}

// GetUserProjects retrieves projects created by a specific user
func (ps *ProjectService) GetUserProjects(userID uint, targetUserID uint, limit, offset int) ([]models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can view any user's projects
	// Users can only view their own projects
	if user.UserType != models.UserTypeAdmin {
		if !user.HasActiveSubscription {
			return nil, errors.New("active subscription required to view projects")
		}
		if userID != targetUserID {
			return nil, errors.New("can only view your own projects")
		}
	}

	// Get user projects
	projects, err := ps.projectRepo.GetByUserID(targetUserID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user projects: %v", err)
	}

	return projects, nil
}

// UpdateProject updates a project
func (ps *ProjectService) UpdateProject(userID uint, projectID uint, req *UpdateProjectRequest) (*models.Project, error) {
	// Get project
	project, err := ps.projectRepo.GetByID(projectID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %v", err)
	}

	// Check permissions
	var user models.User
	err = ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can update any project
	// Users can only update their own projects
	if user.UserType != models.UserTypeAdmin && project.UserID != userID {
		return nil, errors.New("can only update your own projects")
	}

	// Update fields
	if req.Title != nil {
		project.Title = *req.Title
		// Generate new slug if title changed
		newSlug := utils.GenerateSlug(*req.Title)
		uniqueSlug, err := ps.ensureUniqueSlug(newSlug)
		if err != nil {
			return nil, fmt.Errorf("failed to generate unique slug: %v", err)
		}
		project.Slug = uniqueSlug
	}
	if req.Description != nil {
		project.Description = *req.Description
	}
	if req.ProjectType != nil {
		project.ProjectType = *req.ProjectType
	}
	if req.Status != nil {
		project.Status = *req.Status
	}
	if req.State != nil {
		project.State = *req.State
	}
	if req.City != nil {
		project.City = *req.City
	}
	if req.Address != nil {
		project.Address = *req.Address
	}
	if req.Pincode != nil {
		project.Pincode = *req.Pincode
	}
	if req.EstimatedDuration != nil {
		project.EstimatedDuration = *req.EstimatedDuration
	}
	if req.ContactInfo != nil {
		project.ContactInfo = *req.ContactInfo
	}
	if req.Images != nil {
		project.Images = *req.Images
	}

	// Update project in database
	if err := ps.projectRepo.Update(project); err != nil {
		return nil, fmt.Errorf("failed to update project: %v", err)
	}

	return project, nil
}

// DeleteProject deletes a project
func (ps *ProjectService) DeleteProject(userID uint, projectID uint) error {
	// Get project
	project, err := ps.projectRepo.GetByID(projectID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("project not found")
		}
		return fmt.Errorf("failed to get project: %v", err)
	}

	// Check permissions
	var user models.User
	err = ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}

	// Admin users can delete any project
	// Users can only delete their own projects
	if user.UserType != models.UserTypeAdmin && project.UserID != userID {
		return errors.New("can only delete your own projects")
	}

	// Delete project
	if err := ps.projectRepo.Delete(projectID); err != nil {
		return fmt.Errorf("failed to delete project: %v", err)
	}

	return nil
}

// SearchProjects searches projects by query
func (ps *ProjectService) SearchProjects(userID uint, query string, limit, offset int) ([]models.Project, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can search any projects
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to search projects")
	}

	// Search projects
	projects, err := ps.projectRepo.Search(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search projects: %v", err)
	}

	return projects, nil
}

// GetProjectStats returns project statistics
func (ps *ProjectService) GetProjectStats(userID uint) (map[string]interface{}, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	err := ps.userRepo.FindByID(&user, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	// Admin users can view any stats
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view project statistics")
	}

	// Get counts
	totalCount, err := ps.projectRepo.Count()
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %v", err)
	}

	residentialCount, err := ps.projectRepo.CountByProjectType(models.ProjectTypeResidential)
	if err != nil {
		return nil, fmt.Errorf("failed to get residential count: %v", err)
	}

	commercialCount, err := ps.projectRepo.CountByProjectType(models.ProjectTypeCommercial)
	if err != nil {
		return nil, fmt.Errorf("failed to get commercial count: %v", err)
	}

	infrastructureCount, err := ps.projectRepo.CountByProjectType(models.ProjectTypeInfrastructure)
	if err != nil {
		return nil, fmt.Errorf("failed to get infrastructure count: %v", err)
	}

	activeCount, err := ps.projectRepo.CountByStatus(models.ProjectStatusOnGoing)
	if err != nil {
		return nil, fmt.Errorf("failed to get active count: %v", err)
	}

	completedCount, err := ps.projectRepo.CountByStatus(models.ProjectStatusCompleted)
	if err != nil {
		return nil, fmt.Errorf("failed to get completed count: %v", err)
	}

	stats := map[string]interface{}{
		"total":         totalCount,
		"residential":   residentialCount,
		"commercial":    commercialCount,
		"infrastructure": infrastructureCount,
		"active":        activeCount,
		"completed":     completedCount,
	}

	return stats, nil
}

// UploadProjectImages uploads project images to Cloudinary
func (ps *ProjectService) UploadProjectImages(imageFiles []*multipart.FileHeader) ([]string, error) {
	logrus.Infof("ProjectService.UploadProjectImages called with %d images", len(imageFiles))
	
	// Upload images to Cloudinary
	var imageURLs []string
	if ps.cloudinary != nil {
		for _, file := range imageFiles {
			if file != nil {
				logrus.Infof("ProjectService.UploadProjectImages uploading image: %s", file.Filename)
				url, err := ps.cloudinary.UploadImage(file, "projects")
				if err != nil {
					logrus.Errorf("ProjectService.UploadProjectImages image upload error: %v", err)
					return nil, err
				}
				imageURLs = append(imageURLs, url)
				logrus.Infof("ProjectService.UploadProjectImages image uploaded: %s", url)
			}
		}
	} else {
		logrus.Warn("ProjectService.UploadProjectImages cloudinary service is nil, skipping image upload")
		return nil, fmt.Errorf("cloudinary service not available")
	}
	
	logrus.Infof("ProjectService.UploadProjectImages successfully uploaded %d images", len(imageURLs))
	return imageURLs, nil
}

// ensureUniqueSlug ensures the slug is unique by appending a number if necessary
func (ps *ProjectService) ensureUniqueSlug(baseSlug string) (string, error) {
	slug := baseSlug
	counter := 1

	for {
		// Check if slug exists
		_, err := ps.projectRepo.GetBySlug(slug)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// Slug is unique
				return slug, nil
			}
			return "", err
		}

		// Slug exists, try with counter
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++

		// Prevent infinite loop
		if counter > 1000 {
			return "", errors.New("unable to generate unique slug")
		}
	}
}

// validateProject validates project data
func (ps *ProjectService) validateProject(project *models.Project) error {
	if project.Title == "" {
		return fmt.Errorf("title is required")
	}
	
	if project.Description == "" {
		return fmt.Errorf("description is required")
	}
	
	if project.ProjectType == "" {
		return fmt.Errorf("project type is required")
	}
	
	if project.State == "" {
		return fmt.Errorf("state is required")
	}
	
	if project.City == "" {
		return fmt.Errorf("city is required")
	}
	
	if project.Address == "" {
		return fmt.Errorf("address is required")
	}
	
	if project.Pincode == "" {
		return fmt.Errorf("pincode is required")
	}
	
	if project.ContactInfo == nil {
		return fmt.Errorf("contact info is required")
	}
	
	return nil
}

// validateImages validates project images
func (ps *ProjectService) validateImages(images models.JSONStringArray) error {
	if len(images) < 2 {
		return fmt.Errorf("at least 2 images are required")
	}
	
	if len(images) > 7 {
		return fmt.Errorf("maximum 7 images allowed")
	}
	
	// TODO: Add image URL validation if needed
	
	return nil
}
