package routes

import (
	"treesindia/controllers"
	"treesindia/database"
	"treesindia/repositories"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

func SetupBannerRoutes(router *gin.RouterGroup) {
	// Initialize repositories
	bannerRepo := repositories.NewBannerRepository(database.GetDB())
	
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but continue - Cloudinary is optional for banner images
		cloudinaryService = nil
	}
	
	// Initialize services
	bannerService := services.NewBannerService(bannerRepo, cloudinaryService)
	
	// Initialize controllers
	bannerController := controllers.NewBannerController(bannerService)
	
	// Banner routes group
	bannerGroup := router.Group("/banner")
	{
		// Banner images
		bannerGroup.GET("/images", bannerController.GetBannerImages)
		bannerGroup.POST("/images", bannerController.CreateBannerImage)
		bannerGroup.GET("/images/:id", bannerController.GetBannerImageByID)
		bannerGroup.PUT("/images/:id", bannerController.UpdateBannerImage)
		bannerGroup.PUT("/images/:id/file", bannerController.UpdateBannerImageWithFile)
		bannerGroup.DELETE("/images/:id", bannerController.DeleteBannerImage)
		bannerGroup.PUT("/images/:id/sort", bannerController.UpdateBannerImageSortOrder)
		bannerGroup.GET("/count", bannerController.GetBannerImageCount)
	}
}
