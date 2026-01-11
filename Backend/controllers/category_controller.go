package controllers

import (
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"
)

type CategoryController struct {
	*BaseController
	categoryService  *services.CategoryService
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
	Icon        string      `json:"icon" form:"icon" binding:"max=255"` // Icon name or URL
	ParentID    interface{} `json:"parent_id" form:"parent_id"`         // Optional: NULL for root (Level 1)
	IsActive    interface{} `json:"is_active" form:"is_active"`         // Can be boolean or string
}

// GetCategories returns all categories with optional filtering
func (cc *CategoryController) GetCategories(c *gin.Context) {
	// Get query parameters
	parentID := c.Query("parent_id") // "root" or specific ID
	includeChildren := c.Query("include") == "children"
	isActive := c.Query("is_active")

	// Use service layer
	response, err := cc.categoryService.GetCategories(parentID, includeChildren, isActive)
	if err != nil {
		logrus.Error("Failed to fetch categories:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch categories", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Categories retrieved successfully", response.Categories))
}

// GetCategoryByID returns a specific category by ID
func (cc *CategoryController) GetCategoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	category, err := cc.categoryService.GetCategoryByID(uint(id))
	if err != nil {
		if err.Error() == "category not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Category not found", "Category with the specified ID does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Category retrieved successfully", category))
}

// CreateCategory creates a new category (supports all levels)
func (cc *CategoryController) CreateCategory(c *gin.Context) {
	contentType := c.GetHeader("Content-Type")
	var req CreateCategoryRequest
	var imageFile *multipart.FileHeader

	// Handle JSON or form-data
	if strings.Contains(contentType, "application/json") {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data with optional file upload
		if file, err := c.FormFile("image"); err == nil {
			imageFile = file
		}
		req.Name = c.PostForm("name")
		req.Description = c.PostForm("description")
		req.Icon = c.PostForm("icon")
		req.ParentID = c.PostForm("parent_id")
		req.IsActive = c.PostForm("is_active")
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Convert to service request
	serviceReq := &services.CreateCategoryRequest{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		ParentID:    req.ParentID,
		IsActive:    req.IsActive,
	}

	// Create category using service
	category, err := cc.categoryService.CreateCategory(serviceReq, imageFile)
	if err != nil {
		logrus.Error("Failed to create category:", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to create category", err.Error()))
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

	contentType := c.GetHeader("Content-Type")
	var req CreateCategoryRequest
	var imageFile *multipart.FileHeader

	// Handle JSON or form-data
	if strings.Contains(contentType, "application/json") {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data with optional file upload
		if file, err := c.FormFile("image"); err == nil {
			imageFile = file
		}
		req.Name = c.PostForm("name")
		req.Description = c.PostForm("description")
		req.Icon = c.PostForm("icon")
		req.ParentID = c.PostForm("parent_id")
		req.IsActive = c.PostForm("is_active")
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Convert to service request type
	serviceReq := &services.CreateCategoryRequest{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		ParentID:    req.ParentID,
		IsActive:    req.IsActive,
	}

	// Update category using service
	category, err := cc.categoryService.UpdateCategory(uint(id), serviceReq, imageFile)
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
