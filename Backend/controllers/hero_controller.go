package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type HeroController struct {
	heroService *services.HeroService
}

func NewHeroController(heroService *services.HeroService) *HeroController {
	return &HeroController{
		heroService: heroService,
	}
}

// GetHeroConfig retrieves the current hero configuration
func (c *HeroController) GetHeroConfig(ctx *gin.Context) {
	config, err := c.heroService.GetHeroConfig()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get hero config", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero config retrieved successfully", config))
}

// UpdateHeroConfig updates the hero configuration
func (c *HeroController) UpdateHeroConfig(ctx *gin.Context) {
	// Get the existing config first to preserve the ID
	existingConfig, err := c.heroService.GetHeroConfig()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get hero config", err.Error()))
		return
	}
	
	// Bind the request data to update the fields
	var updateData models.HeroConfig
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}
	
	// Update the existing config with new data
	existingConfig.Title = updateData.Title
	existingConfig.Description = updateData.Description
	existingConfig.PromptText = updateData.PromptText
	existingConfig.IsActive = updateData.IsActive
	
	err = c.heroService.UpdateHeroConfig(existingConfig)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update hero config", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero config updated successfully", existingConfig))
}

// GetHeroImages retrieves all hero images
func (c *HeroController) GetHeroImages(ctx *gin.Context) {
	config, err := c.heroService.GetHeroConfig()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get hero config", err.Error()))
		return
	}
	
	images, err := c.heroService.GetHeroImages(config.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get hero images", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero images retrieved successfully", images))
}

// CreateHeroImage creates a new hero image
func (c *HeroController) CreateHeroImage(ctx *gin.Context) {
	// Get the uploaded file
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("No image file provided", err.Error()))
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

	// Get hero config ID
	config, err := c.heroService.GetHeroConfig()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get hero config", err.Error()))
		return
	}

	// Create hero image with file upload
	image := models.HeroImage{
		IsActive:    true,
		HeroConfigID: config.ID,
	}

	err = c.heroService.CreateHeroImageWithFile(&image, file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create hero image", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero image created successfully", image))
}

// UpdateHeroImage updates an existing hero image
func (c *HeroController) UpdateHeroImage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}
	
	var image models.HeroImage
	if err := ctx.ShouldBindJSON(&image); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}
	
	image.ID = uint(id)
	err = c.heroService.UpdateHeroImage(&image)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update hero image", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero image updated successfully", image))
}

// DeleteHeroImage deletes a hero image
func (c *HeroController) DeleteHeroImage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}
	
	err = c.heroService.DeleteHeroImage(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete hero image", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Hero image deleted successfully", nil))
}



// isValidImageType checks if the content type is a valid image type
func isValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/webp",
	}
	
	for _, validType := range validTypes {
		if strings.EqualFold(contentType, validType) {
			return true
		}
	}
	return false
}
