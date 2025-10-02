package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
)

type BannerService struct {
	bannerRepo *repositories.BannerRepository
	cloudinaryService *CloudinaryService
}

func NewBannerService(bannerRepo *repositories.BannerRepository, cloudinaryService *CloudinaryService) *BannerService {
	return &BannerService{
		bannerRepo: bannerRepo,
		cloudinaryService: cloudinaryService,
	}
}

// GetBannerImages retrieves all active banner images
func (s *BannerService) GetBannerImages() ([]models.BannerImage, error) {
	return s.bannerRepo.GetBannerImages()
}

// CreateBannerImage creates a new banner image
func (s *BannerService) CreateBannerImage(image *models.BannerImage) error {
	if image.Image == "" {
		return errors.New("image URL is required")
	}
	if image.Title == "" {
		return errors.New("title is required")
	}
	
	return s.bannerRepo.CreateBannerImage(image)
}

// UpdateBannerImage updates an existing banner image
func (s *BannerService) UpdateBannerImage(image *models.BannerImage) error {
	if image.Image == "" {
		return errors.New("image URL is required")
	}
	if image.Title == "" {
		return errors.New("title is required")
	}
	
	return s.bannerRepo.UpdateBannerImage(image)
}

// UpdateBannerImageWithFile updates an existing banner image with file upload
func (s *BannerService) UpdateBannerImageWithFile(id uint, image *models.BannerImage, file *multipart.FileHeader) error {
	// Get the existing image to get the old Cloudinary URL
	existingImage, err := s.bannerRepo.GetBannerImageByID(id)
	if err != nil {
		return err
	}
	
	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}
	
	// Upload new image to Cloudinary
	imageURL, err := s.cloudinaryService.UploadImage(file, "banner-images")
	if err != nil {
		return fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}
	
	// Set the new image URL
	image.Image = imageURL
	
	// Update in database
	err = s.bannerRepo.UpdateBannerImage(image)
	if err != nil {
		return err
	}
	
	// Delete old image from Cloudinary if it exists
	if existingImage.Image != "" {
		publicID := s.cloudinaryService.GetPublicIDFromURL(existingImage.Image)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteImage(publicID); deleteErr != nil {
				// Log error silently
			}
		}
	}
	
	return nil
}

// DeleteBannerImage deletes a banner image
func (s *BannerService) DeleteBannerImage(id uint) error {
	// Get the image first to get the Cloudinary URL
	image, err := s.bannerRepo.GetBannerImageByID(id)
	if err != nil {
		return err
	}
	
	// Delete from database first
	err = s.bannerRepo.DeleteBannerImage(id)
	if err != nil {
		return err
	}
	
	// Delete from Cloudinary if service is available and URL is from Cloudinary
	if s.cloudinaryService != nil && image.Image != "" {
		// Extract public ID from Cloudinary URL
		publicID := s.cloudinaryService.GetPublicIDFromURL(image.Image)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteImage(publicID); deleteErr != nil {
				// Log error silently
			}
		}
	}
	
	return nil
}

// GetBannerImageByID retrieves a specific banner image by ID
func (s *BannerService) GetBannerImageByID(id uint) (*models.BannerImage, error) {
	return s.bannerRepo.GetBannerImageByID(id)
}

// CreateBannerImageWithFile creates a new banner image with file upload
func (s *BannerService) CreateBannerImageWithFile(image *models.BannerImage, file *multipart.FileHeader) error {
	if file == nil {
		return errors.New("file is required")
	}
	if image.Title == "" {
		return errors.New("title is required")
	}
	
	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}
	
	// Upload image to Cloudinary
	imageURL, err := s.cloudinaryService.UploadImage(file, "banner-images")
	if err != nil {
		return fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}
	
	// Set the image URL
	image.Image = imageURL
	
	return s.bannerRepo.CreateBannerImage(image)
}

// GetBannerImageCount returns the count of active banner images
func (s *BannerService) GetBannerImageCount() (int64, error) {
	return s.bannerRepo.GetBannerImageCount()
}

// UpdateBannerImageSortOrder updates the sort order of a banner image
func (s *BannerService) UpdateBannerImageSortOrder(id uint, sortOrder int) error {
	if sortOrder < 0 || sortOrder > 2 {
		return errors.New("sort order must be between 0 and 2 (max 3 images)")
	}
	
	return s.bannerRepo.UpdateBannerImageSortOrder(id, sortOrder)
}
