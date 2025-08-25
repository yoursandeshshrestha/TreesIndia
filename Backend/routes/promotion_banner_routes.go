package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupPromotionBannerRoutes sets up promotion banner-related routes
func SetupPromotionBannerRoutes(router *gin.RouterGroup) {
	promotionBannerController := controllers.NewPromotionBannerController()

	// Public promotion banner routes (no authentication required)
	promotionBanners := router.Group("/promotion-banners")
	{
		// GET /api/v1/promotion-banners - Get all active promotion banners
		promotionBanners.GET("", promotionBannerController.GetActivePromotionBanners)
		
		// GET /api/v1/promotion-banners/:id - Get promotion banner by ID
		promotionBanners.GET("/:id", promotionBannerController.GetPromotionBannerByID)
	}

	// Admin promotion banner routes (protected by auth and admin middleware)
	adminPromotionBanners := router.Group("/admin/promotion-banners")
	adminPromotionBanners.Use(middleware.AuthMiddleware())
	adminPromotionBanners.Use(middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/promotion-banners - Get all promotion banners for admin (includes inactive)
		adminPromotionBanners.GET("", promotionBannerController.GetPromotionBanners)
		
		// POST /api/v1/admin/promotion-banners - Create new promotion banner
		adminPromotionBanners.POST("", promotionBannerController.CreatePromotionBanner)
		
		// PUT /api/v1/admin/promotion-banners/:id - Update existing promotion banner
		adminPromotionBanners.PUT("/:id", promotionBannerController.UpdatePromotionBanner)
		
		// DELETE /api/v1/admin/promotion-banners/:id - Delete existing promotion banner
		adminPromotionBanners.DELETE("/:id", promotionBannerController.DeletePromotionBanner)
		
		// PATCH /api/v1/admin/promotion-banners/:id/status - Toggle promotion banner status
		adminPromotionBanners.PATCH("/:id/status", promotionBannerController.TogglePromotionBannerStatus)
	}
}
