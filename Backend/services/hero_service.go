package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
)

type HeroService struct {
	heroRepo *repositories.HeroRepository
	cloudinaryService *CloudinaryService
}

func NewHeroService(heroRepo *repositories.HeroRepository, cloudinaryService *CloudinaryService) *HeroService {
	return &HeroService{
		heroRepo: heroRepo,
		cloudinaryService: cloudinaryService,
	}
}

// GetHeroConfig retrieves the current hero configuration
func (s *HeroService) GetHeroConfig() (*models.HeroConfig, error) {
	return s.heroRepo.GetHeroConfig()
}

// UpdateHeroConfig updates the hero configuration
func (s *HeroService) UpdateHeroConfig(config *models.HeroConfig) error {
	if config.Title == "" {
		return errors.New("title is required")
	}
	if config.PromptText == "" {
		return errors.New("prompt text is required")
	}
	
	return s.heroRepo.UpdateHeroConfig(config)
}

// GetHeroImages retrieves all active hero images for a config
func (s *HeroService) GetHeroImages(heroConfigID uint) ([]models.HeroImage, error) {
	return s.heroRepo.GetHeroImages(heroConfigID)
}

// CreateHeroImage creates a new hero image
func (s *HeroService) CreateHeroImage(image *models.HeroImage) error {
	if image.ImageURL == "" {
		return errors.New("image URL is required")
	}
	if image.HeroConfigID == 0 {
		return errors.New("hero config ID is required")
	}
	
	return s.heroRepo.CreateHeroImage(image)
}

// UpdateHeroImage updates an existing hero image
func (s *HeroService) UpdateHeroImage(image *models.HeroImage) error {
	if image.ImageURL == "" {
		return errors.New("image URL is required")
	}
	
	return s.heroRepo.UpdateHeroImage(image)
}

// UpdateHeroImageWithFile updates an existing hero image with file upload
func (s *HeroService) UpdateHeroImageWithFile(id uint, image *models.HeroImage, file *multipart.FileHeader) error {
	// Get the existing image to get the old Cloudinary URL
	existingImage, err := s.heroRepo.GetHeroImageByID(id)
	if err != nil {
		return err
	}
	
	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}
	
	// Upload new image to Cloudinary
	imageURL, err := s.cloudinaryService.UploadImage(file, "hero-images")
	if err != nil {
		return fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}
	
	// Set the new image URL
	image.ImageURL = imageURL
	
	// Update in database
	err = s.heroRepo.UpdateHeroImage(image)
	if err != nil {
		return err
	}
	
	// Delete old image from Cloudinary if it exists
	if existingImage.ImageURL != "" {
		publicID := s.cloudinaryService.GetPublicIDFromURL(existingImage.ImageURL)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteImage(publicID); deleteErr != nil {
				fmt.Printf("Warning: Failed to delete old image from Cloudinary: %v\n", deleteErr)
			}
		}
	}
	
	return nil
}

// DeleteHeroImage deletes a hero image
func (s *HeroService) DeleteHeroImage(id uint) error {
	// Get the image first to get the Cloudinary URL
	image, err := s.heroRepo.GetHeroImageByID(id)
	if err != nil {
		return err
	}
	
	// Delete from database first
	err = s.heroRepo.DeleteHeroImage(id)
	if err != nil {
		return err
	}
	
	// Delete from Cloudinary if service is available and URL is from Cloudinary
	if s.cloudinaryService != nil && image.ImageURL != "" {
		// Extract public ID from Cloudinary URL
		publicID := s.cloudinaryService.GetPublicIDFromURL(image.ImageURL)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteImage(publicID); deleteErr != nil {
				// Log the error but don't return it since the database deletion was successful
				fmt.Printf("Warning: Failed to delete image from Cloudinary: %v\n", deleteErr)
			}
		}
	}
	
	return nil
}



// GetHeroImageByID retrieves a specific hero image by ID
func (s *HeroService) GetHeroImageByID(id uint) (*models.HeroImage, error) {
	return s.heroRepo.GetHeroImageByID(id)
}

// CreateHeroImageWithFile creates a new hero image with file upload
func (s *HeroService) CreateHeroImageWithFile(image *models.HeroImage, file *multipart.FileHeader) error {
	if file == nil {
		return errors.New("file is required")
	}
	
	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}
	
	// Upload image to Cloudinary
	imageURL, err := s.cloudinaryService.UploadImage(file, "hero-images")
	if err != nil {
		return fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}
	
	// Set the image URL
	image.ImageURL = imageURL
	
	return s.heroRepo.CreateHeroImage(image)
}
