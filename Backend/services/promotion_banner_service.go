package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"gorm.io/gorm"
)

// PromotionBannerService handles promotion banner business logic
type PromotionBannerService struct {
	bannerRepo        *repositories.PromotionBannerRepository
	cloudinaryService *CloudinaryService
	validationHelper  *utils.ValidationHelper
}

// NewPromotionBannerService creates a new promotion banner service
func NewPromotionBannerService() (*PromotionBannerService, error) {
	cloudinaryService, err := NewCloudinaryService()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cloudinary service: %w", err)
	}

	return &PromotionBannerService{
		bannerRepo:        repositories.NewPromotionBannerRepository(),
		cloudinaryService: cloudinaryService,
		validationHelper:  utils.NewValidationHelper(),
	}, nil
}

// CreatePromotionBannerRequest represents the request for creating a promotion banner
type CreatePromotionBannerRequest struct {
	Title    string `json:"title" form:"title" binding:"required,min=2,max=100"`
	Image    string `json:"image" form:"image" binding:"max=255"`
	Link     string `json:"link" form:"link" binding:"max=500"`
	IsActive string `json:"is_active" form:"is_active"`
}

// UpdatePromotionBannerRequest represents the request for updating a promotion banner
type UpdatePromotionBannerRequest struct {
	Title    string `json:"title" form:"title" binding:"required,min=2,max=100"`
	Image    string `json:"image" form:"image" binding:"max=255"`
	Link     string `json:"link" form:"link" binding:"max=500"`
	IsActive string `json:"is_active" form:"is_active"`
}

// GetPromotionBannersResponse represents the response for getting promotion banners
type GetPromotionBannersResponse struct {
	Banners []models.PromotionBanner `json:"banners"`
	Filters map[string]string        `json:"filters,omitempty"`
}

// GetPromotionBanners gets promotion banners with optional filtering
func (pbs *PromotionBannerService) GetPromotionBanners(isActive string) (*GetPromotionBannersResponse, error) {
	var banners []models.PromotionBanner
	query := pbs.bannerRepo.GetDB().Model(&models.PromotionBanner{})

	// Apply filters
	filters := make(map[string]string)

	if isActive != "" {
		filters["is_active"] = isActive
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	}

	// Get banners
	if err := query.Order("created_at DESC").Find(&banners).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch promotion banners: %w", err)
	}

	return &GetPromotionBannersResponse{
		Banners: banners,
		Filters: filters,
	}, nil
}

// GetPromotionBannerByID gets a promotion banner by ID
func (pbs *PromotionBannerService) GetPromotionBannerByID(id uint) (*models.PromotionBanner, error) {
	var banner models.PromotionBanner
	if err := pbs.bannerRepo.GetDB().First(&banner, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("promotion banner not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	return &banner, nil
}

// CreatePromotionBanner creates a new promotion banner
func (pbs *PromotionBannerService) CreatePromotionBanner(req *CreatePromotionBannerRequest, imageFile *multipart.FileHeader) (*models.PromotionBanner, error) {
	// Handle image upload if provided
	var imageURL string
	if imageFile != nil {
		uploadedURL, err := pbs.cloudinaryService.UploadImage(imageFile, "promotion-banners")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		imageURL = uploadedURL
	} else if req.Image != "" {
		imageURL = req.Image
	} else {
		return nil, fmt.Errorf("image is required")
	}

	// Convert IsActive from string to bool
	var isActive bool
	if req.IsActive == "true" {
		isActive = true
	} else if req.IsActive == "false" {
		isActive = false
	} else {
		isActive = true // default to true
	}

	// Create banner
	banner := &models.PromotionBanner{
		Title:    req.Title,
		Image:    imageURL,
		Link:     req.Link,
		IsActive: isActive,
	}

	if err := pbs.bannerRepo.GetDB().Create(banner).Error; err != nil {
		return nil, fmt.Errorf("failed to create promotion banner: %w", err)
	}

	return banner, nil
}

// UpdatePromotionBanner updates an existing promotion banner
func (pbs *PromotionBannerService) UpdatePromotionBanner(id uint, req *UpdatePromotionBannerRequest, imageFile *multipart.FileHeader) (*models.PromotionBanner, error) {
	// Check if banner exists
	existingBanner, err := pbs.GetPromotionBannerByID(id)
	if err != nil {
		return nil, err
	}

	// Handle image upload if provided
	var imageURL string
	if imageFile != nil {
		uploadedURL, err := pbs.cloudinaryService.UploadImage(imageFile, "promotion-banners")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		imageURL = uploadedURL
	} else if req.Image != "" {
		imageURL = req.Image
	} else {
		imageURL = existingBanner.Image
	}

	// Convert IsActive from string to bool
	var isActive bool
	if req.IsActive == "true" {
		isActive = true
	} else if req.IsActive == "false" {
		isActive = false
	} else {
		isActive = existingBanner.IsActive // keep existing value
	}

	// Update banner
	updates := map[string]interface{}{
		"title":     req.Title,
		"image":     imageURL,
		"link":      req.Link,
		"is_active": isActive,
	}

	if err := pbs.bannerRepo.GetDB().Model(existingBanner).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update promotion banner: %w", err)
	}

	// Return updated banner
	return pbs.GetPromotionBannerByID(id)
}

// DeletePromotionBanner deletes a promotion banner
func (pbs *PromotionBannerService) DeletePromotionBanner(id uint) error {
	// Check if banner exists
	_, err := pbs.GetPromotionBannerByID(id)
	if err != nil {
		return err
	}

	if err := pbs.bannerRepo.GetDB().Delete(&models.PromotionBanner{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete promotion banner: %w", err)
	}

	return nil
}

// TogglePromotionBannerStatus toggles the active status of a promotion banner
func (pbs *PromotionBannerService) TogglePromotionBannerStatus(id uint) (*models.PromotionBanner, error) {
	// Check if banner exists
	banner, err := pbs.GetPromotionBannerByID(id)
	if err != nil {
		return nil, err
	}

	// Toggle status
	newStatus := !banner.IsActive
	if err := pbs.bannerRepo.UpdateActiveStatus(id, newStatus); err != nil {
		return nil, fmt.Errorf("failed to toggle promotion banner status: %w", err)
	}

	// Return updated banner
	return pbs.GetPromotionBannerByID(id)
}

// GetActivePromotionBanners gets all active promotion banners
func (pbs *PromotionBannerService) GetActivePromotionBanners() ([]models.PromotionBanner, error) {
	var banners []models.PromotionBanner
	if err := pbs.bannerRepo.FindActiveBanners(&banners); err != nil {
		return nil, fmt.Errorf("failed to fetch active promotion banners: %w", err)
	}
	return banners, nil
}
