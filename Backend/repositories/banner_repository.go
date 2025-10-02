package repositories

import (
	"errors"
	"treesindia/models"

	"gorm.io/gorm"
)

type BannerRepository struct {
	db *gorm.DB
}

func NewBannerRepository(db *gorm.DB) *BannerRepository {
	return &BannerRepository{db: db}
}

// BannerImage methods
func (r *BannerRepository) GetBannerImages() ([]models.BannerImage, error) {
	var images []models.BannerImage
	err := r.db.Where("is_active = ?", true).
		Order("sort_order ASC").
		Find(&images).Error
	return images, err
}

func (r *BannerRepository) CreateBannerImage(image *models.BannerImage) error {
	// Check if we already have 3 images (max limit)
	var count int64
	err := r.db.Model(&models.BannerImage{}).
		Where("deleted_at IS NULL").
		Count(&count).Error
	if err != nil {
		return err
	}
	
	if count >= 3 {
		return errors.New("maximum of 3 banner images allowed")
	}
	
	// If no sort_order specified, set it to the next available order
	if image.SortOrder == 0 {
		var maxOrder int
		err = r.db.Model(&models.BannerImage{}).
			Where("deleted_at IS NULL").
			Select("COALESCE(MAX(sort_order), -1) + 1").
			Scan(&maxOrder).Error
		if err != nil {
			return err
		}
		image.SortOrder = maxOrder
	}
	
	return r.db.Create(image).Error
}

func (r *BannerRepository) UpdateBannerImage(image *models.BannerImage) error {
	return r.db.Save(image).Error
}

func (r *BannerRepository) DeleteBannerImage(id uint) error {
	return r.db.Delete(&models.BannerImage{}, id).Error
}

func (r *BannerRepository) GetBannerImageByID(id uint) (*models.BannerImage, error) {
	var image models.BannerImage
	err := r.db.First(&image, id).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}

// GetBannerImageCount returns the count of active banner images
func (r *BannerRepository) GetBannerImageCount() (int64, error) {
	var count int64
	err := r.db.Model(&models.BannerImage{}).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

// UpdateBannerImageSortOrder updates the sort order of a banner image
func (r *BannerRepository) UpdateBannerImageSortOrder(id uint, sortOrder int) error {
	return r.db.Model(&models.BannerImage{}).
		Where("id = ?", id).
		Update("sort_order", sortOrder).Error
}
