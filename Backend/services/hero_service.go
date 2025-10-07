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

// UpdateHeroImageWithFile updates an existing hero image/video with file upload
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
	
	// Determine media type from the image model (should be set before calling this)
	mediaType := image.MediaType
	if mediaType == "" {
		mediaType = "image" // default to image
	}
	
	// Upload new media to Cloudinary
	mediaURL, err := s.cloudinaryService.UploadMedia(file, "hero-media", mediaType)
	if err != nil {
		return fmt.Errorf("failed to upload media to Cloudinary: %w", err)
	}
	
	// Set the new media URLs
	image.MediaURL = mediaURL
	image.ImageURL = mediaURL
	
	// Update in database
	err = s.heroRepo.UpdateHeroImage(image)
	if err != nil {
		return err
	}
	
	// Delete old media from Cloudinary if it exists
	if existingImage.MediaURL != "" {
		publicID := s.cloudinaryService.GetPublicIDFromURL(existingImage.MediaURL)
		resourceType := s.cloudinaryService.GetResourceTypeFromURL(existingImage.MediaURL)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteMedia(publicID, resourceType); deleteErr != nil {
				// Log error silently
			}
		}
	} else if existingImage.ImageURL != "" {
		// Fallback to ImageURL for backward compatibility
		publicID := s.cloudinaryService.GetPublicIDFromURL(existingImage.ImageURL)
		resourceType := s.cloudinaryService.GetResourceTypeFromURL(existingImage.ImageURL)
		if publicID != "" {
			// Try to delete from Cloudinary, but don't fail if it doesn't work
			if deleteErr := s.cloudinaryService.DeleteMedia(publicID, resourceType); deleteErr != nil {
				// Log error silently
			}
		}
	}
	
	return nil
}

// DeleteHeroImage deletes a hero image/video
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
	if s.cloudinaryService != nil {
		var urlToDelete string
		if image.MediaURL != "" {
			urlToDelete = image.MediaURL
		} else if image.ImageURL != "" {
			urlToDelete = image.ImageURL
		}
		
		if urlToDelete != "" {
			// Extract public ID and resource type from Cloudinary URL
			publicID := s.cloudinaryService.GetPublicIDFromURL(urlToDelete)
			resourceType := s.cloudinaryService.GetResourceTypeFromURL(urlToDelete)
			if publicID != "" {
				// Try to delete from Cloudinary, but don't fail if it doesn't work
				if deleteErr := s.cloudinaryService.DeleteMedia(publicID, resourceType); deleteErr != nil {
					// Log error silently
				}
			}
		}
	}
	
	return nil
}



// GetHeroImageByID retrieves a specific hero image by ID
func (s *HeroService) GetHeroImageByID(id uint) (*models.HeroImage, error) {
	return s.heroRepo.GetHeroImageByID(id)
}

// CreateHeroImageWithFile creates a new hero image/video with file upload
func (s *HeroService) CreateHeroImageWithFile(image *models.HeroImage, file *multipart.FileHeader) error {
	if file == nil {
		return errors.New("file is required")
	}
	
	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}
	
	// Determine media type from the image model (should be set before calling this)
	mediaType := image.MediaType
	if mediaType == "" {
		mediaType = "image" // default to image
	}
	
	// Upload media to Cloudinary
	mediaURL, err := s.cloudinaryService.UploadMedia(file, "hero-media", mediaType)
	if err != nil {
		return fmt.Errorf("failed to upload media to Cloudinary: %w", err)
	}
	
	// Set the media URLs (keep ImageURL for backward compatibility)
	image.MediaURL = mediaURL
	image.ImageURL = mediaURL
	
	return s.heroRepo.CreateHeroImage(image)
}
