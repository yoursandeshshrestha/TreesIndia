package repositories

import (
	"treesindia/models"
	"treesindia/utils"
)

// PromotionBannerRepository handles promotion banner-specific database operations
type PromotionBannerRepository struct {
	*BaseRepository
	paginationHelper *utils.PaginationHelper
	validationHelper *utils.ValidationHelper
}

// NewPromotionBannerRepository creates a new promotion banner repository
func NewPromotionBannerRepository() *PromotionBannerRepository {
	return &PromotionBannerRepository{
		BaseRepository:   NewBaseRepository(),
		paginationHelper: utils.NewPaginationHelper(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// FindActiveBanners finds all active promotion banners
func (pbr *PromotionBannerRepository) FindActiveBanners(banners *[]models.PromotionBanner) error {
	return pbr.db.Where("is_active = ?", true).Order("created_at DESC").Find(banners).Error
}

// FindByActiveStatus finds banners by active status
func (pbr *PromotionBannerRepository) FindByActiveStatus(banners *[]models.PromotionBanner, isActive bool) error {
	return pbr.db.Where("is_active = ?", isActive).Order("created_at DESC").Find(banners).Error
}

// UpdateActiveStatus updates the active status of a banner
func (pbr *PromotionBannerRepository) UpdateActiveStatus(bannerID uint, isActive bool) error {
	return pbr.db.Model(&models.PromotionBanner{}).Where("id = ?", bannerID).Update("is_active", isActive).Error
}

// GetBannerStats gets banner statistics
func (pbr *PromotionBannerRepository) GetBannerStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total banners
	var total int64
	if err := pbr.db.Model(&models.PromotionBanner{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Active banners
	var active int64
	if err := pbr.db.Model(&models.PromotionBanner{}).Where("is_active = ?", true).Count(&active).Error; err != nil {
		return nil, err
	}
	stats["active"] = active
	
	return stats, nil
}
