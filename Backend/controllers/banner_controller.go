package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

type BannerController struct {
	bannerService *services.BannerService
}

func NewBannerController(bannerService *services.BannerService) *BannerController {
	return &BannerController{
		bannerService: bannerService,
	}
}

// GetBannerImages retrieves all banner images
func (c *BannerController) GetBannerImages(ctx *gin.Context) {
	images, err := c.bannerService.GetBannerImages()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get banner images", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner images retrieved successfully", images))
}

// CreateBannerImage creates a new banner image
func (c *BannerController) CreateBannerImage(ctx *gin.Context) {
	// Get the uploaded file
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("No image file provided", err.Error()))
		return
	}

	// Validate file type
	if !utils.IsValidImageType(file.Header.Get("Content-Type")) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPEG, PNG, and WebP images are allowed"))
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "Image size must be less than 5MB"))
		return
	}

	// Get title from form data
	title := ctx.PostForm("title")
	if title == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Title is required", "Title field is required"))
		return
	}

	// Get optional link from form data
	link := ctx.PostForm("link")

	// Create banner image with file upload
	image := models.BannerImage{
		Title:    title,
		Link:     link,
		IsActive: true,
	}

	err = c.bannerService.CreateBannerImageWithFile(&image, file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create banner image", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image created successfully", image))
}

// UpdateBannerImage updates an existing banner image
func (c *BannerController) UpdateBannerImage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}
	
	var image models.BannerImage
	if err := ctx.ShouldBindJSON(&image); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}
	
	image.ID = uint(id)
	err = c.bannerService.UpdateBannerImage(&image)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update banner image", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image updated successfully", image))
}

// UpdateBannerImageWithFile updates an existing banner image with file upload
func (c *BannerController) UpdateBannerImageWithFile(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}

	// Get the uploaded file
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("No image file provided", err.Error()))
		return
	}

	// Validate file type
	if !utils.IsValidImageType(file.Header.Get("Content-Type")) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only JPEG, PNG, and WebP images are allowed"))
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "Image size must be less than 5MB"))
		return
	}

	// Get title from form data
	title := ctx.PostForm("title")
	if title == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Title is required", "Title field is required"))
		return
	}

	// Get optional link from form data
	link := ctx.PostForm("link")

	// Create banner image with file upload
	image := models.BannerImage{
		ID:       uint(id),
		Title:    title,
		Link:     link,
		IsActive: true,
	}

	err = c.bannerService.UpdateBannerImageWithFile(uint(id), &image, file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update banner image", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image updated successfully", image))
}

// DeleteBannerImage deletes a banner image
func (c *BannerController) DeleteBannerImage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}
	
	err = c.bannerService.DeleteBannerImage(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete banner image", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image deleted successfully", nil))
}

// GetBannerImageByID retrieves a specific banner image by ID
func (c *BannerController) GetBannerImageByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}
	
	image, err := c.bannerService.GetBannerImageByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Banner image not found", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image retrieved successfully", image))
}

// UpdateBannerImageSortOrder updates the sort order of a banner image
func (c *BannerController) UpdateBannerImageSortOrder(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid image ID", err.Error()))
		return
	}

	var request struct {
		SortOrder int `json:"sort_order" binding:"required"`
	}
	
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}
	
	err = c.bannerService.UpdateBannerImageSortOrder(uint(id), request.SortOrder)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update sort order", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Sort order updated successfully", nil))
}

// GetBannerImageCount returns the count of banner images
func (c *BannerController) GetBannerImageCount(ctx *gin.Context) {
	count, err := c.bannerService.GetBannerImageCount()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get banner image count", err.Error()))
		return
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Banner image count retrieved successfully", gin.H{"count": count}))
}

