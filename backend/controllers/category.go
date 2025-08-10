package controllers

import (
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"treesindia/config"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CategoryController handles category operations
type CategoryController struct {
	db *gorm.DB
	cloudinaryService *services.CloudinaryService
}

// NewCategoryController creates a new category controller
func NewCategoryController() *CategoryController {
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but don't fail - Cloudinary is optional
		cloudinaryService = nil
	}

	return &CategoryController{
		db: config.GetDB(),
		cloudinaryService: cloudinaryService,
	}
}

// CreateCategoryRequest represents the request body for creating a category
type CreateCategoryRequest struct {
	Name        string `form:"name" binding:"required"`
	Description string `form:"description"`
	SortOrder   int    `form:"sort_order"`
}

// UpdateCategoryRequest represents the request body for updating a category
type UpdateCategoryRequest struct {
	Name        string `form:"name"`
	Description string `form:"description"`
	SortOrder   int    `form:"sort_order"`
	Image       string `form:"image"` // For handling image URL updates
}

// GetAllCategories godoc
// @Summary Get all categories
// @Description Get all categories with pagination
// @Tags Admin Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param limit query int false "Number of items per page"
// @Success 200 {object} models.Response "Categories retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/categories [get]
func (cc *CategoryController) GetAllCategories(c *gin.Context) {
	page := 1
	limit := 10

	// Parse query parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	offset := (page - 1) * limit

	var categories []models.Category
	var total int64

	// Get total count
	cc.db.Model(&models.Category{}).Count(&total)

	// Get categories with pagination, ordered by sort_order and name
	if err := cc.db.Order("sort_order ASC, name ASC").Offset(offset).Limit(limit).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch categories", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Categories retrieved successfully", gin.H{
		"categories": categories,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
			"has_next":    int64(page*limit) < total,
			"has_prev":    page > 1,
		},
	}))
}

// CreateCategory godoc
// @Summary Create new category
// @Description Create a new service category
// @Tags Admin Categories
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param name formData string true "Category name"
// @Param description formData string false "Category description"
// @Param sort_order formData int false "Sort order"
// @Param image formData file false "Category image"
// @Success 201 {object} models.Response "Category created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 409 {object} models.Response "Category already exists"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/categories [post]
func (cc *CategoryController) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Check if category already exists
	var existingCategory models.Category
	if err := cc.db.Where("name = ?", req.Name).First(&existingCategory).Error; err == nil {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("Category already exists", "A category with this name already exists"))
		return
	}

	// Handle image upload
	var imageURL string
	file, err := c.FormFile("image")
	if err == nil && file != nil {
		// Validate file type
		if !isValidImageFile(file.Filename) {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPG, PNG, GIF, and WebP files are allowed"))
			return
		}

		// Upload to Cloudinary if service is available
		if cc.cloudinaryService != nil {
			imageURL, err = cc.cloudinaryService.UploadImage(file, "categories")
			if err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload image", err.Error()))
				return
			}
		} else {
			// Fallback: just store the filename
			imageURL = "/uploads/categories/" + file.Filename
		}
	}

	// Create category
	category := models.Category{
		Name:        req.Name,
		Description: req.Description,
		Image:       imageURL,
		SortOrder:   req.SortOrder,
		IsActive:    true,
	}

	if err := cc.db.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create category", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Category created successfully", category))
}

// UpdateCategory godoc
// @Summary Update category
// @Description Update an existing category
// @Tags Admin Categories
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Param name formData string false "Category name"
// @Param description formData string false "Category description"
// @Param sort_order formData int false "Sort order"
// @Param image formData file false "Category image"
// @Success 200 {object} models.Response "Category updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 404 {object} models.Response "Category not found"
// @Failure 409 {object} models.Response "Category name already exists"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/categories/{id} [put]
func (cc *CategoryController) UpdateCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Check if category exists
	var category models.Category
	if err := cc.db.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Category not found", "Category does not exist"))
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch category", err.Error()))
		}
		return
	}

	// Check if name is being changed and if it conflicts with existing category
	if req.Name != "" && req.Name != category.Name {
		var existingCategory models.Category
		if err := cc.db.Where("name = ? AND id != ?", req.Name, id).First(&existingCategory).Error; err == nil {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Category name already exists", "A category with this name already exists"))
			return
		}
	}

	// Handle image upload
	file, err := c.FormFile("image")
	if err == nil && file != nil {
		// Validate file type
		if !isValidImageFile(file.Filename) {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPG, PNG, GIF, and WebP files are allowed"))
			return
		}

		// Upload to Cloudinary if service is available
		if cc.cloudinaryService != nil {
			imageURL, err := cc.cloudinaryService.UploadImage(file, "categories")
			if err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload image", err.Error()))
				return
			}
			req.Image = imageURL
		} else {
			// Fallback: just store the filename
			req.Image = "/uploads/categories/" + file.Filename
		}
	}

	// Update category fields
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	updates["sort_order"] = req.SortOrder

	if err := cc.db.Model(&category).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update category", err.Error()))
		return
	}

	// Fetch updated category
	cc.db.First(&category, id)

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category updated successfully", category))
}

// DeleteCategory godoc
// @Summary Delete category
// @Description Delete a category (soft delete)
// @Tags Admin Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} models.Response "Category deleted successfully"
// @Failure 400 {object} models.Response "Invalid category ID"
// @Failure 404 {object} models.Response "Category not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/categories/{id} [delete]
func (cc *CategoryController) DeleteCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	// Check if category exists
	var category models.Category
	if err := cc.db.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Category not found", "Category does not exist"))
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch category", err.Error()))
		}
		return
	}

	// Check if category has associated services
	var serviceCount int64
	cc.db.Model(&models.Service{}).Where("category_id = ?", id).Count(&serviceCount)
	if serviceCount > 0 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Cannot delete category", "Category has associated services"))
		return
	}

	// Check if category has associated skills
	var skillCount int64
	cc.db.Model(&models.Skill{}).Where("category_id = ?", id).Count(&skillCount)
	if skillCount > 0 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Cannot delete category", "Category has associated skills"))
		return
	}

	// Soft delete category
	if err := cc.db.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete category", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category deleted successfully", nil))
}

// ToggleCategoryStatus godoc
// @Summary Toggle category status
// @Description Toggle category active/inactive status
// @Tags Admin Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} models.Response "Category status updated successfully"
// @Failure 400 {object} models.Response "Invalid category ID"
// @Failure 404 {object} models.Response "Category not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/categories/{id}/status [put]
func (cc *CategoryController) ToggleCategoryStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	// Check if category exists
	var category models.Category
	if err := cc.db.First(&category, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Category not found", "Category does not exist"))
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch category", err.Error()))
		}
		return
	}

	// Toggle status
	category.IsActive = !category.IsActive

	if err := cc.db.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update category status", err.Error()))
		return
	}

	statusText := "activated"
	if !category.IsActive {
		statusText = "deactivated"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category "+statusText+" successfully", category))
}

// isValidImageFile checks if the file is a valid image
func isValidImageFile(filename string) bool {
	validExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	ext := strings.ToLower(filepath.Ext(filename))
	
	for _, validExt := range validExtensions {
		if ext == validExt {
			return true
		}
	}
	return false
}
