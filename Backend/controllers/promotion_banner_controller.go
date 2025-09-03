package controllers

import (
	"mime/multipart"
	"net/http"
	"strconv"

	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type PromotionBannerController struct {
	*BaseController
	bannerService    *services.PromotionBannerService
	validationHelper *utils.ValidationHelper
}

func NewPromotionBannerController() *PromotionBannerController {
	bannerService, err := services.NewPromotionBannerService()
	if err != nil {
		logrus.Errorf("Failed to initialize PromotionBannerService: %v", err)
		logrus.Error("This is likely due to missing Cloudinary configuration")
		logrus.Error("Please ensure CLOUDINARY_URL is set in your environment variables")
		return &PromotionBannerController{
			BaseController:   NewBaseController(),
			bannerService:    nil,
			validationHelper: utils.NewValidationHelper(),
		}
	}
	
	return &PromotionBannerController{
		BaseController:   NewBaseController(),
		bannerService:    bannerService,
		validationHelper: utils.NewValidationHelper(),
	}
}

// CreatePromotionBannerRequest represents the request body for creating a promotion banner
type CreatePromotionBannerRequest struct {
	Title    string `json:"title" form:"title" binding:"required,min=2,max=100"`
	Image    string `json:"image" form:"image" binding:"max=255"`
	Link     string `json:"link" form:"link" binding:"max=500"`
	IsActive string `json:"is_active" form:"is_active"` // Will be "true" or "false" string
}

// GetPromotionBanners returns all promotion banners with optional filtering
func (pbc *PromotionBannerController) GetPromotionBanners(c *gin.Context) {
	// Get query parameters
	isActive := c.Query("is_active")

	// Get banners
	response, err := pbc.bannerService.GetPromotionBanners(isActive)
	if err != nil {
		logrus.Error("Failed to fetch promotion banners:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch promotion banners", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Promotion banners retrieved successfully", response))
}

// GetPromotionBannerByID returns a specific promotion banner by ID
func (pbc *PromotionBannerController) GetPromotionBannerByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid banner ID", "Banner ID must be a valid number"))
		return
	}

	banner, err := pbc.bannerService.GetPromotionBannerByID(uint(id))
	if err != nil {
		if err.Error() == "promotion banner not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Promotion banner not found", "The requested promotion banner does not exist"))
			return
		}
		logrus.Error("Failed to fetch promotion banner:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch promotion banner", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Promotion banner retrieved successfully", banner))
}

// CreatePromotionBanner creates a new promotion banner
func (pbc *PromotionBannerController) CreatePromotionBanner(c *gin.Context) {
	var req CreatePromotionBannerRequest
	
	// Check if it's a multipart form (file upload)
	if c.ContentType() == "multipart/form-data" {
		// Manually extract form fields to avoid FileHeader binding issues
		req.Title = c.PostForm("title")
		req.Link = c.PostForm("link")
		req.IsActive = c.PostForm("is_active")
		
		// Validate required fields
		if req.Title == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", "title is required"))
			return
		}
	} else {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	}

	// Get image file if uploaded
	var imageFile *multipart.FileHeader
	if c.ContentType() == "multipart/form-data" {
		file, err := c.FormFile("image")
		if err != nil && err.Error() != "http: no such file" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file upload", err.Error()))
			return
		}
		imageFile = file
	}

	// Create banner
	banner, err := pbc.bannerService.CreatePromotionBanner(&services.CreatePromotionBannerRequest{
		Title:    req.Title,
		Image:    req.Image,
		Link:     req.Link,
		IsActive: req.IsActive,
	}, imageFile)

	if err != nil {
		logrus.Error("Failed to create promotion banner:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create promotion banner", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Promotion banner created successfully", banner))
}

// UpdatePromotionBanner updates an existing promotion banner
func (pbc *PromotionBannerController) UpdatePromotionBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid banner ID", "Banner ID must be a valid number"))
		return
	}

	var req CreatePromotionBannerRequest
	
	// Check if it's a multipart form (file upload)
	if c.ContentType() == "multipart/form-data" {
		// Manually extract form fields to avoid FileHeader binding issues
		req.Title = c.PostForm("title")
		req.Link = c.PostForm("link")
		req.IsActive = c.PostForm("is_active")
		
		// Validate required fields
		if req.Title == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", "title is required"))
			return
		}
	} else {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	}

	// Get image file if uploaded
	var imageFile *multipart.FileHeader
	if c.ContentType() == "multipart/form-data" {
		file, err := c.FormFile("image")
		if err != nil && err.Error() != "http: no such file" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file upload", err.Error()))
			return
		}
		imageFile = file
	}

	// Update banner
	banner, err := pbc.bannerService.UpdatePromotionBanner(uint(id), &services.UpdatePromotionBannerRequest{
		Title:    req.Title,
		Image:    req.Image,
		Link:     req.Link,
		IsActive: req.IsActive,
	}, imageFile)

	if err != nil {
		if err.Error() == "promotion banner not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Promotion banner not found", "The requested promotion banner does not exist"))
			return
		}
		logrus.Error("Failed to update promotion banner:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update promotion banner", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Promotion banner updated successfully", banner))
}

// DeletePromotionBanner deletes a promotion banner
func (pbc *PromotionBannerController) DeletePromotionBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid banner ID", "Banner ID must be a valid number"))
		return
	}

	err = pbc.bannerService.DeletePromotionBanner(uint(id))
	if err != nil {
		if err.Error() == "promotion banner not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Promotion banner not found", "The requested promotion banner does not exist"))
			return
		}
		logrus.Error("Failed to delete promotion banner:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete promotion banner", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Promotion banner deleted successfully", nil))
}

// TogglePromotionBannerStatus toggles the active status of a promotion banner
func (pbc *PromotionBannerController) TogglePromotionBannerStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid banner ID", "Banner ID must be a valid number"))
		return
	}

	banner, err := pbc.bannerService.TogglePromotionBannerStatus(uint(id))
	if err != nil {
		if err.Error() == "promotion banner not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Promotion banner not found", "The requested promotion banner does not exist"))
			return
		}
		logrus.Error("Failed to toggle promotion banner status:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to toggle promotion banner status", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Promotion banner status toggled successfully", banner))
}

// GetActivePromotionBanners returns all active promotion banners (public endpoint)
func (pbc *PromotionBannerController) GetActivePromotionBanners(c *gin.Context) {
	banners, err := pbc.bannerService.GetActivePromotionBanners()
	if err != nil {
		logrus.Error("Failed to fetch active promotion banners:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch active promotion banners", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Active promotion banners retrieved successfully", banners))
}
