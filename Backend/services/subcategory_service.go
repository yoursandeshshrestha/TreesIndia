package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"gorm.io/gorm"
)

// SubcategoryService handles subcategory business logic
type SubcategoryService struct {
	subcategoryRepo   *repositories.SubcategoryRepository
	categoryRepo      *repositories.CategoryRepository
	cloudinaryService *CloudinaryService
	validationHelper  *utils.ValidationHelper
}

// NewSubcategoryService creates a new subcategory service
func NewSubcategoryService() (*SubcategoryService, error) {
	cloudinaryService, err := NewCloudinaryService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cloudinary service: %w", err)
	}

	return &SubcategoryService{
		subcategoryRepo:   repositories.NewSubcategoryRepository(),
		categoryRepo:      repositories.NewCategoryRepository(),
		cloudinaryService: cloudinaryService,
		validationHelper:  utils.NewValidationHelper(),
	}, nil
}

// CreateSubcategoryRequest represents the request for creating a subcategory
type CreateSubcategoryRequest struct {
	Name        string      `json:"name" form:"name" binding:"required,min=2,max=100"`
	Description string      `json:"description" form:"description" binding:"max=500"`
	Image       string      `json:"image" form:"image" binding:"max=255"`
	ParentID    interface{} `json:"parent_id" form:"parent_id" binding:"required"`
	IsActive    interface{} `json:"is_active" form:"is_active"`
}

// GetSubcategoriesResponse represents the response for getting subcategories
type GetSubcategoriesResponse struct {
	Subcategories []models.Subcategory `json:"subcategories"`
	Filters       map[string]string    `json:"filters,omitempty"`
}

// GetSubcategories gets subcategories with optional filtering
func (ss *SubcategoryService) GetSubcategories(parentID string, isActive string) (*GetSubcategoriesResponse, error) {
	var subcategories []models.Subcategory
	query := ss.subcategoryRepo.GetDB().Model(&models.Subcategory{})

	// Apply filters
	filters := make(map[string]string)

	if parentID != "" {
		filters["parent_id"] = parentID
		query = query.Where("parent_id = ?", parentID)
	}

	if isActive != "" {
		filters["is_active"] = isActive
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	}

	// Get subcategories with parent information
	if err := query.Preload("Parent").Order("name ASC").Find(&subcategories).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch subcategories: %w", err)
	}

	return &GetSubcategoriesResponse{
		Subcategories: subcategories,
		Filters:       filters,
	}, nil
}

// GetSubcategoryByID gets a subcategory by ID
func (ss *SubcategoryService) GetSubcategoryByID(id uint) (*models.Subcategory, error) {
	var subcategory models.Subcategory
	if err := ss.subcategoryRepo.GetDB().First(&subcategory, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("subcategory not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &subcategory, nil
}

// CreateSubcategory creates a new subcategory
func (ss *SubcategoryService) CreateSubcategory(req *CreateSubcategoryRequest, imageFile *multipart.FileHeader) (*models.Subcategory, error) {
	// Handle image upload if provided
	var imageURL string
	if imageFile != nil {
		// Validate file size (max 10MB)
		if err := ss.validationHelper.ValidateFileSize(imageFile.Size, 10*1024*1024); err != nil {
			return nil, fmt.Errorf("file too large: %w", err)
		}

		// Validate file type
		fileContentType := imageFile.Header.Get("Content-Type")
		if err := ss.validationHelper.ValidateFileType(fileContentType, []string{"image/"}); err != nil {
			return nil, fmt.Errorf("invalid file type: %w", err)
		}

		// Upload image to Cloudinary
		var err error
		imageURL, err = ss.cloudinaryService.UploadImage(imageFile, "subcategories")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
	} else if req.Image != "" {
		imageURL = req.Image
	}

	// Convert ParentID from interface{} to uint
	var parentID uint
	switch v := req.ParentID.(type) {
	case float64:
		if v > 0 && v == float64(uint(v)) {
			parentID = uint(v)
		} else {
			return nil, fmt.Errorf("parent ID must be a positive integer")
		}
	case string:
		if v == "" {
			return nil, fmt.Errorf("parent ID is required")
		}
		if parsed, err := strconv.ParseUint(v, 10, 32); err == nil {
			parentID = uint(parsed)
		} else {
			return nil, fmt.Errorf("parent ID must be a valid integer")
		}
	default:
		return nil, fmt.Errorf("parent ID must be a number")
	}

	// Convert IsActive from interface{} to bool
	var isActive bool
	switch v := req.IsActive.(type) {
	case bool:
		isActive = v
	case string:
		if v == "true" {
			isActive = true
		} else if v == "false" {
			isActive = false
		} else {
			return nil, fmt.Errorf("is_active must be true or false")
		}
	default:
		isActive = true // default to true
	}

	// Validate parent category exists
	if !ss.subcategoryRepo.CheckParentExists(parentID) {
		return nil, fmt.Errorf("parent category not found")
	}

	// Generate unique slug
	slug, err := ss.subcategoryRepo.GenerateUniqueSlug(req.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to generate slug: %w", err)
	}

	// Create subcategory
	subcategory := models.Subcategory{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Image:       imageURL,
		ParentID:    parentID,
		IsActive:    isActive,
	}

	if err := ss.subcategoryRepo.Create(&subcategory); err != nil {
		return nil, fmt.Errorf("failed to create subcategory: %w", err)
	}

	// Load the created subcategory with parent relationship
	if err := ss.subcategoryRepo.GetDB().Preload("Parent").First(&subcategory, subcategory.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load created subcategory: %w", err)
	}

	return &subcategory, nil
}

// ToggleStatus toggles the active status of a subcategory
func (ss *SubcategoryService) ToggleStatus(id uint) (*models.Subcategory, error) {
	var subcategory models.Subcategory
	if err := ss.subcategoryRepo.FindByID(&subcategory, id); err != nil {
		return nil, fmt.Errorf("subcategory not found: %w", err)
	}

	// Toggle the status
	subcategory.IsActive = !subcategory.IsActive

	if err := ss.subcategoryRepo.Update(&subcategory); err != nil {
		return nil, fmt.Errorf("failed to update subcategory status: %w", err)
	}

	// Load the updated subcategory with parent relationship
	if err := ss.subcategoryRepo.GetDB().Preload("Parent").First(&subcategory, subcategory.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load updated subcategory: %w", err)
	}

	return &subcategory, nil
}

// UpdateSubcategory updates a subcategory
func (ss *SubcategoryService) UpdateSubcategory(id uint, req *CreateSubcategoryRequest) (*models.Subcategory, error) {
	var subcategory models.Subcategory
	if err := ss.subcategoryRepo.FindByID(&subcategory, id); err != nil {
		return nil, fmt.Errorf("subcategory not found: %w", err)
	}

	// Update fields
	if req.Name != "" {
		subcategory.Name = req.Name
		// Generate new slug if name changed
		slug, err := ss.subcategoryRepo.GenerateUniqueSlug(req.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to generate slug: %w", err)
		}
		subcategory.Slug = slug
	}

	if req.Description != "" {
		subcategory.Description = req.Description
	}

	if req.Image != "" {
		subcategory.Image = req.Image
	}

	// Handle ParentID if provided
	if req.ParentID != nil {
		var parentID uint
		switch v := req.ParentID.(type) {
		case float64:
			if v > 0 && v == float64(uint(v)) {
				parentID = uint(v)
			} else {
				return nil, fmt.Errorf("parent ID must be a positive integer")
			}
		case string:
			if v == "" {
				return nil, fmt.Errorf("parent ID is required")
			}
			if parsed, err := strconv.ParseUint(v, 10, 32); err == nil {
				parentID = uint(parsed)
			} else {
				return nil, fmt.Errorf("parent ID must be a valid integer")
			}
		default:
			return nil, fmt.Errorf("parent ID must be a number")
		}

		// Validate parent category exists
		if !ss.subcategoryRepo.CheckParentExists(parentID) {
			return nil, fmt.Errorf("parent category not found")
		}

		subcategory.ParentID = parentID
	}

	// Handle IsActive
	if req.IsActive != nil {
		switch v := req.IsActive.(type) {
		case bool:
			subcategory.IsActive = v
		case string:
			subcategory.IsActive = v == "true"
		}
	}

	if err := ss.subcategoryRepo.Update(&subcategory); err != nil {
		return nil, fmt.Errorf("failed to update subcategory: %w", err)
	}

	// Load the updated subcategory with parent relationship
	if err := ss.subcategoryRepo.GetDB().Preload("Parent").First(&subcategory, subcategory.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load updated subcategory: %w", err)
	}

	return &subcategory, nil
}

// DeleteSubcategory deletes a subcategory
func (ss *SubcategoryService) DeleteSubcategory(id uint) error {
	var subcategory models.Subcategory
	if err := ss.subcategoryRepo.FindByID(&subcategory, id); err != nil {
		return fmt.Errorf("subcategory not found: %w", err)
	}

	if err := ss.subcategoryRepo.Delete(&subcategory); err != nil {
		return fmt.Errorf("failed to delete subcategory: %w", err)
	}

	return nil
}

// GetSubcategoryStats gets subcategory statistics
func (ss *SubcategoryService) GetSubcategoryStats() (map[string]int64, error) {
	return ss.subcategoryRepo.GetSubcategoryStats()
}

// GetSubcategoriesByCategory gets all subcategories for a specific category
func (ss *SubcategoryService) GetSubcategoriesByCategory(categoryID uint, excludeInactive bool) ([]models.Subcategory, error) {
	return ss.subcategoryRepo.GetSubcategoriesByCategory(categoryID, excludeInactive)
}

// GetCloudinaryService returns the Cloudinary service instance
func (ss *SubcategoryService) GetCloudinaryService() *CloudinaryService {
	return ss.cloudinaryService
}
