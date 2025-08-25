package seed

import (
	"treesindia/models"
	"treesindia/repositories"
)

// SeedPromotionBanners seeds the database with sample promotion banners
func SeedPromotionBanners() error {
	bannerRepo := repositories.NewPromotionBannerRepository()
	
	// Sample promotion banners using local images
	banners := []models.PromotionBanner{
		{
			Title:    "Professional Cleaning Services",
			Image:    "/images/banner/one.webp",
			Link:     "/services/cleaning",
			IsActive: true,
		},
		{
			Title:    "Expert Plumbing Solutions",
			Image:    "/images/banner/two.webp",
			Link:     "/services/plumbing",
			IsActive: true,
		},
		{
			Title:    "Home Maintenance Specialists",
			Image:    "/images/banner/three.webp",
			Link:     "/services/maintenance",
			IsActive: true,
		},
		{
			Title:    "Quality Construction Services",
			Image:    "/images/banner/four.webp",
			Link:     "/services/construction",
			IsActive: true,
		},
		{
			Title:    "Reliable Home Services",
			Image:    "/images/banner/five.webp",
			Link:     "/services",
			IsActive: false,
		},
	}

	// Create banners
	for _, banner := range banners {
		// Check if banner already exists
		var existingBanner models.PromotionBanner
		if err := bannerRepo.GetDB().Where("title = ?", banner.Title).First(&existingBanner).Error; err == nil {
			// Banner already exists, skip
			continue
		}

		// Create new banner
		if err := bannerRepo.GetDB().Create(&banner).Error; err != nil {
			return err
		}
	}

	return nil
}
