package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime/multipart"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// VendorService handles vendor business logic
type VendorService struct {
	vendorRepo       *repositories.VendorRepository
	userRepo         *repositories.UserRepository
	validationHelper *utils.ValidationHelper
	cloudinary       *CloudinaryService
}

// NewVendorService creates a new vendor service
func NewVendorService() *VendorService {
	cloudinaryService, err := NewCloudinaryService()
	if err != nil {
		logrus.Warnf("Failed to initialize Cloudinary service: %v", err)
		cloudinaryService = nil
	}

	return &VendorService{
		vendorRepo:       repositories.NewVendorRepository(),
		userRepo:         repositories.NewUserRepository(),
		validationHelper: utils.NewValidationHelper(),
		cloudinary:       cloudinaryService,
	}
}

// CreateVendor creates a new vendor profile
func (vs *VendorService) CreateVendor(userID uint, req *models.CreateVendorRequest) (*models.Vendor, error) {
	// Validate user exists
	var user models.User
	if err := vs.userRepo.FindByID(&user, userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user has active subscription (except for admin users)
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to create vendor profiles")
	}

	// Convert services offered to JSONB
	servicesJSON, err := json.Marshal(req.ServicesOffered)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal services offered: %w", err)
	}

	// Convert business address to JSONB
	addressJSON, err := json.Marshal(req.BusinessAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal business address: %w", err)
	}

	// Convert business gallery to JSONB
	var galleryJSON []byte
	if len(req.BusinessGallery) > 0 {
		galleryJSON, err = json.Marshal(req.BusinessGallery)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal business gallery: %w", err)
		}
	}

	// Create vendor
	vendor := &models.Vendor{
		VendorName:         req.VendorName,
		BusinessDescription: req.BusinessDescription,
		ContactPersonName:  req.ContactPersonName,
		ContactPersonPhone: req.ContactPersonPhone,
		ContactPersonEmail: req.ContactPersonEmail,
		BusinessAddress:    string(addressJSON),
		BusinessType:       req.BusinessType,
		YearsInBusiness:    req.YearsInBusiness,
		ServicesOffered:    string(servicesJSON),
		ProfilePicture:     req.ProfilePicture,
		BusinessGallery:    string(galleryJSON),
		IsActive:           true,
		UserID:             userID,
	}

	if err := vs.vendorRepo.Create(vendor); err != nil {
		return nil, fmt.Errorf("failed to create vendor: %w", err)
	}

	// Reload with user data
	if err := vs.vendorRepo.GetByID(vendor, vendor.ID); err != nil {
		return nil, fmt.Errorf("failed to reload vendor: %w", err)
	}

	logrus.Infof("Created vendor profile %d for user %d", vendor.ID, userID)
	
	// Send notification to admins about new vendor profile
	
	return vendor, nil
}

// GetVendorByID gets a vendor by ID
func (vs *VendorService) GetVendorByID(vendorID uint) (*models.Vendor, error) {
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, fmt.Errorf("failed to get vendor: %w", err)
	}
	return &vendor, nil
}

// GetVendorByIDWithSubscriptionCheck gets a vendor by ID with subscription validation
func (vs *VendorService) GetVendorByIDWithSubscriptionCheck(userID uint, vendorID uint) (*models.Vendor, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	if err := vs.userRepo.FindByID(&user, userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Admin users can view any vendor
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view vendor profiles")
	}

	// Get vendor
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, fmt.Errorf("failed to get vendor: %w", err)
	}
	return &vendor, nil
}

// GetVendorsByUserID gets all vendors for a user
func (vs *VendorService) GetVendorsByUserID(userID uint) ([]models.Vendor, error) {
	var vendors []models.Vendor
	if err := vs.vendorRepo.GetByUserID(&vendors, userID); err != nil {
		return nil, fmt.Errorf("failed to get vendors: %w", err)
	}
	return vendors, nil
}

// GetVendorsByUserIDWithSubscriptionCheck gets all vendors for a user with subscription validation
func (vs *VendorService) GetVendorsByUserIDWithSubscriptionCheck(userID uint) ([]models.Vendor, error) {
	// Check if user has active subscription (except for admin users)
	var user models.User
	if err := vs.userRepo.FindByID(&user, userID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Admin users can view any vendors
	if user.UserType != models.UserTypeAdmin && !user.HasActiveSubscription {
		return nil, errors.New("active subscription required to view vendor profiles")
	}

	var vendors []models.Vendor
	if err := vs.vendorRepo.GetByUserID(&vendors, userID); err != nil {
		return nil, fmt.Errorf("failed to get vendors: %w", err)
	}
	return vendors, nil
}

// GetActiveVendorsByUserID gets all active vendors for a user
func (vs *VendorService) GetActiveVendorsByUserID(userID uint) ([]models.Vendor, error) {
	var vendors []models.Vendor
	if err := vs.vendorRepo.GetActiveByUserID(&vendors, userID); err != nil {
		return nil, fmt.Errorf("failed to get active vendors: %w", err)
	}
	return vendors, nil
}

// UpdateVendor updates a vendor profile
func (vs *VendorService) UpdateVendor(vendorID, userID uint, req *models.UpdateVendorRequest) (*models.Vendor, error) {
	// Get existing vendor
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, fmt.Errorf("failed to get vendor: %w", err)
	}

	// Check if user owns this vendor
	if vendor.UserID != userID {
		return nil, errors.New("unauthorized: you can only update your own vendor profiles")
	}

	// Update fields if provided
	if req.VendorName != nil {
		vendor.VendorName = *req.VendorName
	}
	if req.BusinessDescription != nil {
		vendor.BusinessDescription = *req.BusinessDescription
	}
	if req.ContactPersonName != nil {
		vendor.ContactPersonName = *req.ContactPersonName
	}
	if req.ContactPersonPhone != nil {
		vendor.ContactPersonPhone = *req.ContactPersonPhone
	}
	if req.ContactPersonEmail != nil {
		vendor.ContactPersonEmail = *req.ContactPersonEmail
	}
	if req.BusinessAddress != nil {
		addressJSON, err := json.Marshal(*req.BusinessAddress)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal business address: %w", err)
		}
		vendor.BusinessAddress = string(addressJSON)
	}
	if req.BusinessType != nil {
		vendor.BusinessType = *req.BusinessType
	}
	if req.YearsInBusiness != nil {
		vendor.YearsInBusiness = *req.YearsInBusiness
	}
	if req.ServicesOffered != nil {
		servicesJSON, err := json.Marshal(req.ServicesOffered)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal services offered: %w", err)
		}
		vendor.ServicesOffered = string(servicesJSON)
	}
	if req.ProfilePicture != nil {
		vendor.ProfilePicture = *req.ProfilePicture
	}
	if req.BusinessGallery != nil {
		galleryJSON, err := json.Marshal(req.BusinessGallery)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal business gallery: %w", err)
		}
		vendor.BusinessGallery = string(galleryJSON)
	}
	if req.IsActive != nil {
		vendor.IsActive = *req.IsActive
	}

	// Save changes
	if err := vs.vendorRepo.Update(&vendor); err != nil {
		return nil, fmt.Errorf("failed to update vendor: %w", err)
	}

	// Reload with user data
	if err := vs.vendorRepo.GetByID(&vendor, vendor.ID); err != nil {
		return nil, fmt.Errorf("failed to reload vendor: %w", err)
	}

	logrus.Infof("Updated vendor profile %d for user %d", vendor.ID, userID)
	return &vendor, nil
}

// DeleteVendor deletes a vendor profile
func (vs *VendorService) DeleteVendor(vendorID, userID uint) error {
	// Get existing vendor
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("vendor not found")
		}
		return fmt.Errorf("failed to get vendor: %w", err)
	}

	// Check if user owns this vendor
	if vendor.UserID != userID {
		return errors.New("unauthorized: you can only delete your own vendor profiles")
	}

	// Delete vendor
	if err := vs.vendorRepo.Delete(&vendor); err != nil {
		return fmt.Errorf("failed to delete vendor: %w", err)
	}

	logrus.Infof("Deleted vendor profile %d for user %d", vendor.ID, userID)
	return nil
}

// GetAllVendors gets all vendors with pagination (admin only)
func (vs *VendorService) GetAllVendors(page, limit int) ([]models.Vendor, int64, error) {
	var vendors []models.Vendor
	total, err := vs.vendorRepo.GetAll(&vendors, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get vendors: %w", err)
	}
	return vendors, total, nil
}

// GetActiveVendors gets all active vendors with pagination
func (vs *VendorService) GetActiveVendors(page, limit int) ([]models.Vendor, int64, error) {
	logrus.Infof("[DEBUG] GetActiveVendors called with page=%d, limit=%d", page, limit)
	var vendors []models.Vendor
	total, err := vs.vendorRepo.GetActive(&vendors, page, limit)
	if err != nil {
		logrus.Errorf("[DEBUG] Error getting active vendors: %v", err)
		return nil, 0, fmt.Errorf("failed to get active vendors: %w", err)
	}
	logrus.Infof("[DEBUG] Found %d active vendors (total=%d)", len(vendors), total)
	return vendors, total, nil
}

// GetVendorsByBusinessType gets vendors by business type with pagination
func (vs *VendorService) GetVendorsByBusinessType(businessType string, page, limit int) ([]models.Vendor, int64, error) {
	var vendors []models.Vendor
	total, err := vs.vendorRepo.GetByBusinessType(&vendors, businessType, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get vendors by business type: %w", err)
	}
	return vendors, total, nil
}

// SearchVendors searches vendors by name or description
func (vs *VendorService) SearchVendors(query string, page, limit int) ([]models.Vendor, int64, error) {
	var vendors []models.Vendor
	total, err := vs.vendorRepo.SearchVendors(&vendors, query, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search vendors: %w", err)
	}
	return vendors, total, nil
}

// UploadProfilePicture uploads a profile picture for a vendor
func (vs *VendorService) UploadProfilePicture(vendorID, userID uint, file *multipart.FileHeader) (*models.Vendor, error) {
	// Get existing vendor
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, fmt.Errorf("failed to get vendor: %w", err)
	}

	// Check if user owns this vendor
	if vendor.UserID != userID {
		return nil, errors.New("unauthorized: you can only update your own vendor profiles")
	}

	// Upload to Cloudinary if available
	if vs.cloudinary != nil {
		url, err := vs.cloudinary.UploadImage(file, "vendors/profiles")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}
		vendor.ProfilePicture = url
	} else {
		// Fallback: store as base64 or handle differently
		return nil, errors.New("image upload service not available")
	}

	// Update vendor
	if err := vs.vendorRepo.Update(&vendor); err != nil {
		return nil, fmt.Errorf("failed to update vendor: %w", err)
	}

	logrus.Infof("Updated profile picture for vendor %d", vendor.ID)
	return &vendor, nil
}

// UploadGalleryImages uploads gallery images for a vendor
func (vs *VendorService) UploadGalleryImages(vendorID, userID uint, file *multipart.FileHeader) (*models.Vendor, error) {
	// Get existing vendor
	var vendor models.Vendor
	if err := vs.vendorRepo.GetByID(&vendor, vendorID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, fmt.Errorf("failed to get vendor: %w", err)
	}

	// Check if user owns this vendor
	if vendor.UserID != userID {
		return nil, errors.New("unauthorized: you can only update your own vendor profiles")
	}

	// Upload to Cloudinary if available
	if vs.cloudinary != nil {
		url, err := vs.cloudinary.UploadImage(file, "vendors/gallery")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %w", err)
		}

		// Parse existing gallery
		var gallery []string
		if vendor.BusinessGallery != "" {
			if err := json.Unmarshal([]byte(vendor.BusinessGallery), &gallery); err != nil {
				gallery = []string{}
			}
		}

		// Add new image to gallery
		gallery = append(gallery, url)

		// Convert back to JSON
		galleryJSON, err := json.Marshal(gallery)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal gallery: %w", err)
		}
		vendor.BusinessGallery = string(galleryJSON)
	} else {
		return nil, errors.New("image upload service not available")
	}

	// Update vendor
	if err := vs.vendorRepo.Update(&vendor); err != nil {
		return nil, fmt.Errorf("failed to update vendor: %w", err)
	}

	logrus.Infof("Updated gallery for vendor %d", vendor.ID)
	return &vendor, nil
}

// GetVendorStats gets vendor statistics (admin only)
func (vs *VendorService) GetVendorStats() (map[string]interface{}, error) {
	stats, err := vs.vendorRepo.GetVendorStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get vendor stats: %w", err)
	}
	return stats, nil
}

// GetVendorStatsForUser gets vendor statistics (public for authenticated users)
func (vs *VendorService) GetVendorStatsForUser(userID uint) (map[string]interface{}, error) {
	// No subscription check required - stats are publicly available
	stats, err := vs.vendorRepo.GetVendorStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get vendor stats: %w", err)
	}
	return stats, nil
}

// GetCloudinaryService returns the cloudinary service instance
func (vs *VendorService) GetCloudinaryService() *CloudinaryService {
	return vs.cloudinary
}
