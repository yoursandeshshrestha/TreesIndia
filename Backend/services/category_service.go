package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
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
	Icon        string      `json:"icon" form:"icon" binding:"max=255"` // Icon name or URL
	ParentID    interface{} `json:"parent_id" form:"parent_id"`         // Optional: NULL for root (Level 1)
	IsActive    interface{} `json:"is_active" form:"is_active"`
}

// GetCategoriesResponse represents the response for getting categories
type GetCategoriesResponse struct {
	Categories []models.Category `json:"categories"`
	Filters    map[string]string `json:"filters,omitempty"`
}

// GetCategories gets categories with optional filtering
// parentID: optional filter by parent (empty string = root categories, specific ID = children of that parent)
// includeChildren: whether to include child categories
// isActive: filter by active status
func (cs *CategoryService) GetCategories(parentID string, includeChildren bool, isActive string) (*GetCategoriesResponse, error) {
	var categories []models.Category
	query := cs.categoryRepo.GetDB().Model(&models.Category{})

	// Apply filters
	filters := make(map[string]string)

	// Filter by parent_id
	if parentID != "" {
		if parentID == "root" || parentID == "null" {
			// Get root categories (Level 1)
			query = query.Where("parent_id IS NULL")
			filters["parent_id"] = "root"
		} else {
			// Get children of specific parent
			if parsedID, err := strconv.ParseUint(parentID, 10, 32); err == nil {
				query = query.Where("parent_id = ?", parsedID)
				filters["parent_id"] = parentID
			}
		}
	} else {
		// No parent filter - get all categories
	}

	if isActive != "" {
		filters["is_active"] = isActive
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	}

	// Get categories
	if err := query.Order("name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}

	// Include children if requested
	if includeChildren {
		for i := range categories {
			if err := cs.categoryRepo.GetDB().Preload("Children").Where("parent_id = ?", categories[i].ID).Find(&categories[i].Children).Error; err != nil {
				return nil, fmt.Errorf("failed to fetch category children: %w", err)
			}
		}
	}

	return &GetCategoriesResponse{
		Categories: categories,
		Filters:    filters,
	}, nil
}

// GetCategoryByID gets a category by ID with parent and children
func (cs *CategoryService) GetCategoryByID(id uint) (*models.Category, error) {
	var category models.Category
	if err := cs.categoryRepo.GetDB().Preload("Parent").Preload("Children").First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &category, nil
}

// CreateCategory creates a new category (supports all levels)
func (cs *CategoryService) CreateCategory(req *CreateCategoryRequest, imageFile *multipart.FileHeader) (*models.Category, error) {
	logrus.Info("CategoryService.CreateCategory called")
	logrus.Infof("Request data: Name=%s, Description=%s, Icon=%s, ParentID=%v, IsActive=%v",
		req.Name, req.Description, req.Icon, req.ParentID, req.IsActive)

	// Handle image upload if provided
	var iconURL string
	if imageFile != nil {
		logrus.Info("Image file provided, uploading to Cloudinary")
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
		iconURL, err = cs.cloudinaryService.UploadImage(imageFile, "categories")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		logrus.Infof("Image uploaded successfully: %s", iconURL)
	} else if req.Icon != "" {
		logrus.Infof("Using provided icon: %s", req.Icon)
		iconURL = req.Icon
	}

	// Convert ParentID from interface{} to *uint
	var parentID *uint
	if req.ParentID != nil {
		switch v := req.ParentID.(type) {
		case float64:
			if v > 0 && v == float64(uint(v)) {
				id := uint(v)
				parentID = &id
			} else {
				return nil, fmt.Errorf("parent ID must be a positive integer")
			}
		case string:
			if v == "" || v == "null" || v == "root" {
				parentID = nil // Root category
			} else {
				if parsed, err := strconv.ParseUint(v, 10, 32); err == nil {
					id := uint(parsed)
					parentID = &id
				} else {
					return nil, fmt.Errorf("parent ID must be a valid integer")
				}
			}
		default:
			parentID = nil // Default to root
		}

		// Validate parent exists if provided
		if parentID != nil {
			var parent models.Category
			if err := cs.categoryRepo.FindByID(&parent, *parentID); err != nil {
				return nil, fmt.Errorf("parent category not found")
			}
			// Optional: Check if parent is at level 2 (to enforce max 3 levels)
			level := parent.GetLevel()
			if level >= 3 {
				return nil, fmt.Errorf("cannot create category: maximum depth (3 levels) reached")
			}
		}
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
		Icon:        iconURL,
		ParentID:    parentID,
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
	logrus.Info("CategoryService.UpdateCategory called")
	var category models.Category
	if err := cs.categoryRepo.FindByID(&category, id); err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Handle image upload if provided
	if imageFile != nil {
		logrus.Info("Image file provided, uploading to Cloudinary")
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
		iconURL, err := cs.cloudinaryService.UploadImage(imageFile, "categories")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		category.Icon = iconURL
		logrus.Infof("Image uploaded successfully: %s", iconURL)
	} else if req.Icon != "" {
		category.Icon = req.Icon
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

	// Handle ParentID if provided
	if req.ParentID != nil {
		var parentID *uint
		switch v := req.ParentID.(type) {
		case float64:
			if v > 0 && v == float64(uint(v)) {
				id := uint(v)
				parentID = &id
			} else {
				return nil, fmt.Errorf("parent ID must be a positive integer")
			}
		case string:
			if v == "" || v == "null" || v == "root" {
				parentID = nil
			} else {
				if parsed, err := strconv.ParseUint(v, 10, 32); err == nil {
					id := uint(parsed)
					parentID = &id
				} else {
					return nil, fmt.Errorf("parent ID must be a valid integer")
				}
			}
		default:
			// Keep existing parent_id
			parentID = category.ParentID
		}

		// Validate parent exists if provided and prevent circular references
		if parentID != nil {
			if *parentID == id {
				return nil, fmt.Errorf("category cannot be its own parent")
			}
			var parent models.Category
			if err := cs.categoryRepo.FindByID(&parent, *parentID); err != nil {
				return nil, fmt.Errorf("parent category not found")
			}
			// Check if this would create a cycle
			if cs.wouldCreateCycle(id, *parentID) {
				return nil, fmt.Errorf("cannot update: would create circular reference")
			}
			// Check level limit
			level := parent.GetLevel()
			if level >= 3 {
				return nil, fmt.Errorf("cannot update: maximum depth (3 levels) reached")
			}
			category.ParentID = parentID
		} else {
			category.ParentID = nil
		}
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

	// Load the updated category with relationships
	if err := cs.categoryRepo.GetDB().Preload("Parent").Preload("Children").First(&category, category.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load updated category: %w", err)
	}

	return &category, nil
}

// wouldCreateCycle checks if setting parentID would create a circular reference
func (cs *CategoryService) wouldCreateCycle(categoryID uint, newParentID uint) bool {
	// Check if newParentID is a descendant of categoryID
	currentID := newParentID
	for i := 0; i < 10; i++ { // Max 10 levels to prevent infinite loop
		var parent models.Category
		if err := cs.categoryRepo.FindByID(&parent, currentID); err != nil {
			return false // Parent not found, no cycle
		}
		if parent.ParentID == nil {
			return false // Reached root, no cycle
		}
		if *parent.ParentID == categoryID {
			return true // Found cycle
		}
		currentID = *parent.ParentID
	}
	return false
}

// DeleteCategory deletes a category
func (cs *CategoryService) DeleteCategory(id uint) error {
	var category models.Category
	if err := cs.categoryRepo.FindByID(&category, id); err != nil {
		return fmt.Errorf("category not found: %w", err)
	}

	// Check if category has children
	var childrenCount int64
	if err := cs.categoryRepo.GetDB().Model(&models.Category{}).Where("parent_id = ?", id).Count(&childrenCount).Error; err != nil {
		return fmt.Errorf("failed to check category children: %w", err)
	}

	if childrenCount > 0 {
		return fmt.Errorf("cannot delete category with children")
	}

	// Check if category is used by any services
	var serviceCount int64
	if err := cs.categoryRepo.GetDB().Model(&models.Service{}).Where("category_id = ?", id).Count(&serviceCount).Error; err != nil {
		return fmt.Errorf("failed to check category services: %w", err)
	}

	if serviceCount > 0 {
		return fmt.Errorf("cannot delete category: it is used by %d service(s)", serviceCount)
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

// GetCategoryTree gets the complete category tree (all levels)
func (cs *CategoryService) GetCategoryTree() ([]models.Category, error) {
	return cs.categoryRepo.GetCategoryTree()
}

// GetRootCategories gets only root categories (Level 1)
func (cs *CategoryService) GetRootCategories() ([]models.Category, error) {
	var categories []models.Category
	if err := cs.categoryRepo.FindActiveRootCategories(&categories); err != nil {
		return nil, fmt.Errorf("failed to fetch root categories: %w", err)
	}
	return categories, nil
}

// GetChildrenByParentID gets all children of a specific parent category
func (cs *CategoryService) GetChildrenByParentID(parentID uint) ([]models.Category, error) {
	var categories []models.Category
	if err := cs.categoryRepo.FindActiveByParentID(&categories, parentID); err != nil {
		return nil, fmt.Errorf("failed to fetch children: %w", err)
	}
	return categories, nil
}

// GetCloudinaryService returns the Cloudinary service instance
func (cs *CategoryService) GetCloudinaryService() *CloudinaryService {
	return cs.cloudinaryService
}
