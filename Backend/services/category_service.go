package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"strings"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"gorm.io/gorm"
)

// CategoryService handles category business logic
type CategoryService struct {
	categoryRepo     *repositories.CategoryRepository
	cloudinaryService *CloudinaryService
	validationHelper  *utils.ValidationHelper
}

// NewCategoryService creates a new category service
func NewCategoryService() (*CategoryService, error) {
	cloudinaryService, err := NewCloudinaryService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cloudinary service: %w", err)
	}

	return &CategoryService{
		categoryRepo:     repositories.NewCategoryRepository(),
		cloudinaryService: cloudinaryService,
		validationHelper:  utils.NewValidationHelper(),
	}, nil
}

// CreateCategoryRequest represents the request for creating a category
type CreateCategoryRequest struct {
	Name        string      `json:"name" form:"name" binding:"required,min=2,max=100"`
	Description string      `json:"description" form:"description" binding:"max=500"`
	Image       string      `json:"image" form:"image" binding:"max=255"`
	IsActive    interface{} `json:"is_active" form:"is_active"`
}

// GetCategoriesResponse represents the response for getting categories
type GetCategoriesResponse struct {
	Categories []models.Category `json:"categories"`
	Filters    map[string]string `json:"filters,omitempty"`
}

// GetCategories gets categories with optional filtering
func (cs *CategoryService) GetCategories(includeSubcategories bool, isActive string) (*GetCategoriesResponse, error) {
	var categories []models.Category
	query := cs.categoryRepo.GetDB().Model(&models.Category{})

	// Apply filters
	filters := make(map[string]string)

	if isActive != "" {
		filters["is_active"] = isActive
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	}

	// Get categories
	if err := query.Order("name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}

	// Include subcategories if requested
	if includeSubcategories {
		for i := range categories {
			if err := cs.categoryRepo.GetDB().Where("parent_id = ?", categories[i].ID).Find(&categories[i].Subcategories).Error; err != nil {
				return nil, fmt.Errorf("failed to fetch category subcategories: %w", err)
			}
		}
	}

	return &GetCategoriesResponse{
		Categories: categories,
		Filters:    filters,
	}, nil
}

// GetCategoryByID gets a category by ID
func (cs *CategoryService) GetCategoryByID(id uint) (*models.Category, error) {
	var category models.Category
	if err := cs.categoryRepo.GetDB().Preload("Subcategories").First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &category, nil
}

// CreateCategory creates a new category
func (cs *CategoryService) CreateCategory(req *CreateCategoryRequest, imageFile *multipart.FileHeader) (*models.Category, error) {
	// Handle image upload if provided
	var imageURL string
	if imageFile != nil {
		// Validate file size (max 10MB)
		if err := cs.validationHelper.ValidateFileSize(imageFile.Size, 10*1024*1024); err != nil {
			return nil, fmt.Errorf("file too large: %w", err)
		}

		// Validate file type
		fileContentType := imageFile.Header.Get("Content-Type")
		if err := cs.validationHelper.ValidateFileType(fileContentType, []string{"image/"}); err != nil {
			return nil, fmt.Errorf("invalid file type: %w", err)
		}

		// Upload image to Cloudinary
		var err error
		imageURL, err = cs.cloudinaryService.UploadImage(imageFile, "categories")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
	} else if req.Image != "" {
		imageURL = req.Image
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

	// Generate unique slug
	slug, err := cs.categoryRepo.GenerateUniqueSlug(req.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to generate slug: %w", err)
	}

	// Create category
	category := models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Image:       imageURL,
		IsActive:    isActive,
	}

	if err := cs.categoryRepo.Create(&category); err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	// Load the created category with relationships
	if err := cs.categoryRepo.GetDB().Preload("Parent").Preload("Children").First(&category, category.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load created category: %w", err)
	}

	return &category, nil
}

// ToggleStatus toggles the active status of a category
func (cs *CategoryService) ToggleStatus(id uint) (*models.Category, error) {
	var category models.Category
	if err := cs.categoryRepo.FindByID(&category, id); err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Toggle the status
	category.IsActive = !category.IsActive

	if err := cs.categoryRepo.Update(&category); err != nil {
		return nil, fmt.Errorf("failed to update category status: %w", err)
	}

	return &category, nil
}

// UpdateCategory updates a category
func (cs *CategoryService) UpdateCategory(id uint, req *CreateCategoryRequest, imageFile *multipart.FileHeader) (*models.Category, error) {
	var category models.Category
	if err := cs.categoryRepo.FindByID(&category, id); err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Handle image upload if provided
	var imageURL string
	if imageFile != nil {
		// Validate file size (max 10MB)
		if imageFile.Size > 10*1024*1024 {
			return nil, fmt.Errorf("file too large, must be less than 10MB")
		}
		
		// Validate file type
		fileContentType := imageFile.Header.Get("Content-Type")
		if !strings.HasPrefix(fileContentType, "image/") {
			return nil, fmt.Errorf("only image files are allowed")
		}
		
		// Upload image to Cloudinary
		uploadedURL, err := cs.cloudinaryService.UploadImage(imageFile, "categories")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		
		imageURL = uploadedURL
	}

	// Update fields
	if req.Name != "" {
		category.Name = req.Name
		// Generate new slug if name changed
		slug, err := cs.categoryRepo.GenerateUniqueSlug(req.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to generate slug: %w", err)
		}
		category.Slug = slug
	}

	if req.Description != "" {
		category.Description = req.Description
	}

	if imageURL != "" {
		category.Image = imageURL
	} else if req.Image != "" {
		category.Image = req.Image
	}

	// Handle IsActive
	if req.IsActive != nil {
		switch v := req.IsActive.(type) {
		case bool:
			category.IsActive = v
		case string:
			category.IsActive = v == "true"
		}
	}

	if err := cs.categoryRepo.Update(&category); err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	return &category, nil
}

// DeleteCategory deletes a category
func (cs *CategoryService) DeleteCategory(id uint) error {
	var category models.Category
	if err := cs.categoryRepo.FindByID(&category, id); err != nil {
		return fmt.Errorf("category not found: %w", err)
	}

	// Check if category has subcategories
	var subcategoryCount int64
	if err := cs.categoryRepo.GetDB().Model(&models.Subcategory{}).Where("parent_id = ?", id).Count(&subcategoryCount).Error; err != nil {
		return fmt.Errorf("failed to check category subcategories: %w", err)
	}

	if subcategoryCount > 0 {
		return fmt.Errorf("cannot delete category with subcategories")
	}

	if err := cs.categoryRepo.Delete(&category); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}

// GetCategoryStats gets category statistics
func (cs *CategoryService) GetCategoryStats() (map[string]int64, error) {
	return cs.categoryRepo.GetCategoryStats()
}

// GetCategoryTree gets the complete category tree
func (cs *CategoryService) GetCategoryTree() ([]models.Category, error) {
	return cs.categoryRepo.GetCategoryTree()
}

// GetCloudinaryService returns the Cloudinary service instance
func (cs *CategoryService) GetCloudinaryService() *CloudinaryService {
	return cs.cloudinaryService
}
