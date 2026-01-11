package controllers

import (
	"net/http"
	"strconv"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type HomepageCategoryIconController struct {
	iconService *services.HomepageCategoryIconService
}

func NewHomepageCategoryIconController(iconService *services.HomepageCategoryIconService) *HomepageCategoryIconController {
	return &HomepageCategoryIconController{
		iconService: iconService,
	}
}

// GetAllActive retrieves all active category icons
func (c *HomepageCategoryIconController) GetAllActive(ctx *gin.Context) {
	icons, err := c.iconService.GetAllActive()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get category icons", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Category icons retrieved successfully", icons))
}

// GetAll retrieves all category icons (including inactive)
func (c *HomepageCategoryIconController) GetAll(ctx *gin.Context) {
	icons, err := c.iconService.GetAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get category icons", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Category icons retrieved successfully", icons))
}

// GetByID retrieves a category icon by ID
func (c *HomepageCategoryIconController) GetByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid icon ID", err.Error()))
		return
	}

	icon, err := c.iconService.GetByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Category icon not found", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Category icon retrieved successfully", icon))
}

// UpdateIcon updates a category icon's image by name
func (c *HomepageCategoryIconController) UpdateIcon(ctx *gin.Context) {
	name := ctx.Param("name")
	if name == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Category name is required", "Please provide a valid category name"))
		return
	}

	// Get the uploaded file
	file, err := ctx.FormFile("icon")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("No icon file provided", err.Error()))
		return
	}

	// Validate file type
	if !isValidImageType(file.Header.Get("Content-Type")) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPEG, PNG, and WebP images are allowed"))
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "Image size must be less than 5MB"))
		return
	}

	// Update icon with file upload
	err = c.iconService.UpdateIconWithFile(name, file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update category icon", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Category icon updated successfully", nil))
}

// ToggleActive toggles the active status of a category icon
func (c *HomepageCategoryIconController) ToggleActive(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid icon ID", err.Error()))
		return
	}

	err = c.iconService.ToggleActive(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to toggle active status", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Active status toggled successfully", nil))
}
