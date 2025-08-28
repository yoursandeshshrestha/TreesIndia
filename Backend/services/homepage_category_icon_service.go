package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
)

type HomepageCategoryIconService struct {
	iconRepo           *repositories.HomepageCategoryIconRepository
	cloudinaryService  *CloudinaryService
}

func NewHomepageCategoryIconService(iconRepo *repositories.HomepageCategoryIconRepository, cloudinaryService *CloudinaryService) *HomepageCategoryIconService {
	return &HomepageCategoryIconService{
		iconRepo:          iconRepo,
		cloudinaryService: cloudinaryService,
	}
}

// GetAllActive retrieves all active category icons
func (s *HomepageCategoryIconService) GetAllActive() ([]models.HomepageCategoryIcon, error) {
	return s.iconRepo.GetAllActive()
}

// GetAll retrieves all category icons (including inactive)
func (s *HomepageCategoryIconService) GetAll() ([]models.HomepageCategoryIcon, error) {
	return s.iconRepo.GetAll()
}

// GetByID retrieves a category icon by ID
func (s *HomepageCategoryIconService) GetByID(id uint) (*models.HomepageCategoryIcon, error) {
	return s.iconRepo.GetByID(id)
}

// GetByName retrieves a category icon by name
func (s *HomepageCategoryIconService) GetByName(name string) (*models.HomepageCategoryIcon, error) {
	return s.iconRepo.GetByName(name)
}

// UpdateIconWithFile updates a category icon's image with file upload
func (s *HomepageCategoryIconService) UpdateIconWithFile(name string, file *multipart.FileHeader) error {
	// Get the existing icon
	icon, err := s.iconRepo.GetByName(name)
	if err != nil {
		return fmt.Errorf("category icon not found: %w", err)
	}

	// Check if Cloudinary service is available
	if s.cloudinaryService == nil {
		return errors.New("cloudinary service is not available")
	}

	// Upload image to Cloudinary
	iconURL, err := s.cloudinaryService.UploadImage(file, "category-icons")
	if err != nil {
		return fmt.Errorf("failed to upload image to Cloudinary: %w", err)
	}

	// Update the icon URL
	icon.IconURL = iconURL

	return s.iconRepo.Update(icon)
}

// ToggleActive toggles the active status of a category icon
func (s *HomepageCategoryIconService) ToggleActive(id uint) error {
	return s.iconRepo.ToggleActive(id)
}
