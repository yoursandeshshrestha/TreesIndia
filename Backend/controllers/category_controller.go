package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"treesindia/database"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"
)

type CategoryController struct {
	*BaseController
	categoryService *services.CategoryService
	validationHelper *utils.ValidationHelper
}

func NewCategoryController() *CategoryController {
	categoryService, err := services.NewCategoryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CategoryService: %v", err)
		return &CategoryController{
			BaseController:   NewBaseController(),
			categoryService:  nil,
			validationHelper: utils.NewValidationHelper(),
		}
	}
	
	return &CategoryController{
		BaseController:   NewBaseController(),
		categoryService:  categoryService,
		validationHelper: utils.NewValidationHelper(),
	}
}

// CreateCategoryRequest represents the request body for creating a category
type CreateCategoryRequest struct {
	Name        string      `json:"name" form:"name" binding:"required,min=2,max=100"`
	Description string      `json:"description" form:"description" binding:"max=500"`
	IsActive    interface{} `json:"is_active" form:"is_active"` // Can be boolean or string
}

// GetCategories returns all categories with optional filtering
func (cc *CategoryController) GetCategories(c *gin.Context) {
	db := database.GetDB()

	// Get query parameters
	includeSubcategories := c.Query("include") == "subcategories"
	isActive := c.Query("is_active")
	excludeInactive := c.Query("exclude_inactive") == "true"

	// Build query
	query := db.Model(&models.Category{})

	// Filter by active status
	if isActive != "" {
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	} else if excludeInactive {
		// If exclude_inactive is true, only show active categories
		query = query.Where("is_active = ?", true)
	}

	// Get categories
	var categories []models.Category
	if err := query.Order("name ASC").Find(&categories).Error; err != nil {
		logrus.Error("Failed to fetch categories:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch categories", err.Error()))
		return
	}

	// Include subcategories if requested
	if includeSubcategories {
		for i := range categories {
			subQuery := db.Where("parent_id = ?", categories[i].ID)
			if excludeInactive {
				// Also exclude inactive subcategories if exclude_inactive is true
				subQuery = subQuery.Where("is_active = ?", true)
			}
			if err := subQuery.Find(&categories[i].Subcategories).Error; err != nil {
				logrus.Error("Failed to fetch category subcategories:", err)
			}
		}
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Categories retrieved successfully", categories))
}

// GetCategoryByID returns a specific category by ID
func (cc *CategoryController) GetCategoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	db := database.GetDB()

	var category models.Category
	if err := db.Preload("Subcategories").First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Category not found", "Category with the specified ID does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category retrieved successfully", category))
}

// CreateCategory creates a new category
func (cc *CategoryController) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	
	// Handle JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
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
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid is_active", "IsActive must be true or false"))
			return
		}
	default:
		isActive = true // default to true
	}

	// Generate slug from name using global slug utility
	slug := utils.GenerateSlug(req.Name)

	// Check if slug already exists
	db := database.GetDB()
	var existingCategory models.Category
	if err := db.Where("slug = ?", slug).First(&existingCategory).Error; err == nil {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("Category already exists", "A category with this name already exists"))
		return
	}

	// Create category
	category := models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		IsActive:    isActive,
	}

	if err := db.Create(&category).Error; err != nil {
		logrus.Error("Failed to create category:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create category", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Category created successfully", category))
}

// UpdateCategory updates an existing category
func (cc *CategoryController) UpdateCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	var req CreateCategoryRequest
	
	// Handle JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Convert to service request type
	serviceReq := &services.CreateCategoryRequest{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    req.IsActive,
	}

	// Update category using service
	category, err := cc.categoryService.UpdateCategory(uint(id), serviceReq)
	if err != nil {
		logrus.Error("Failed to update category:", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update category", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category updated successfully", category))
}

// DeleteCategory deletes an existing category
func (cc *CategoryController) DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	// Delete category using service
	err = cc.categoryService.DeleteCategory(uint(id))
	if err != nil {
		logrus.Error("Failed to delete category:", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to delete category", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category deleted successfully", nil))
}

// ToggleStatus toggles the active status of a category
func (cc *CategoryController) ToggleStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	// Toggle status using service
	category, err := cc.categoryService.ToggleStatus(uint(id))
	if err != nil {
		logrus.Error("Failed to toggle category status:", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to toggle category status", err.Error()))
		return
	}

	statusText := "enabled"
	if !category.IsActive {
		statusText = "disabled"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category "+statusText+" successfully", category))
}


