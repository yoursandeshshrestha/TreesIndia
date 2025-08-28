package routes

import (
	"treesindia/controllers"
	"treesindia/database"
	"treesindia/repositories"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

func SetupHeroRoutes(router *gin.RouterGroup) {
	// Initialize repositories
	heroRepo := repositories.NewHeroRepository(database.GetDB())
	
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but continue - Cloudinary is optional for hero images
		cloudinaryService = nil
	}
	
	// Initialize services
	heroService := services.NewHeroService(heroRepo, cloudinaryService)
	
	// Initialize controllers
	heroController := controllers.NewHeroController(heroService)
	
	// Hero routes group
	heroGroup := router.Group("/hero")
	{
		// Hero configuration
		heroGroup.GET("/config", heroController.GetHeroConfig)
		heroGroup.PUT("/config", heroController.UpdateHeroConfig)
		
		// Hero images
		heroGroup.GET("/images", heroController.GetHeroImages)
		heroGroup.POST("/images", heroController.CreateHeroImage)
		heroGroup.PUT("/images/:id", heroController.UpdateHeroImage)
		heroGroup.DELETE("/images/:id", heroController.DeleteHeroImage)
	}
}
