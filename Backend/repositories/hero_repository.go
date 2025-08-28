package repositories

import (
	"errors"
	"treesindia/models"

	"gorm.io/gorm"
)

type HeroRepository struct {
	db *gorm.DB
}

func NewHeroRepository(db *gorm.DB) *HeroRepository {
	return &HeroRepository{db: db}
}

// HeroConfig methods
func (r *HeroRepository) GetHeroConfig() (*models.HeroConfig, error) {
	var config models.HeroConfig
	err := r.db.Where("is_active = ?", true).First(&config).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create default config if none exists
			config = models.HeroConfig{
				Title:      "Your Trusted Partner for All Services",
				Description: "Find reliable and professional services for all your needs",
				PromptText: "What are you looking for?",
				IsActive:   true,
			}
			err = r.db.Create(&config).Error
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	return &config, nil
}

func (r *HeroRepository) UpdateHeroConfig(config *models.HeroConfig) error {
	return r.db.Save(config).Error
}

// HeroImage methods
func (r *HeroRepository) GetHeroImages(heroConfigID uint) ([]models.HeroImage, error) {
	var images []models.HeroImage
	err := r.db.Where("hero_config_id = ? AND is_active = ?", heroConfigID, true).
		Order("created_at ASC").
		Find(&images).Error
	return images, err
}

func (r *HeroRepository) CreateHeroImage(image *models.HeroImage) error {
	return r.db.Create(image).Error
}

func (r *HeroRepository) UpdateHeroImage(image *models.HeroImage) error {
	return r.db.Save(image).Error
}

func (r *HeroRepository) DeleteHeroImage(id uint) error {
	return r.db.Delete(&models.HeroImage{}, id).Error
}



func (r *HeroRepository) GetHeroImageByID(id uint) (*models.HeroImage, error) {
	var image models.HeroImage
	err := r.db.First(&image, id).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}
