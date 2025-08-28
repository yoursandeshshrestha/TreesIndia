package routes

import (
	"treesindia/controllers"
	"treesindia/database"
	"treesindia/repositories"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

func SetupHomepageCategoryIconRoutes(router *gin.RouterGroup) {
	// Initialize repositories
	iconRepo := repositories.NewHomepageCategoryIconRepository(database.GetDB())
	
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but continue - Cloudinary is optional for category icons
		cloudinaryService = nil
	}
	
	// Initialize services
	iconService := services.NewHomepageCategoryIconService(iconRepo, cloudinaryService)
	
	// Initialize controllers
	iconController := controllers.NewHomepageCategoryIconController(iconService)
	
	// Homepage category icon routes group
	iconGroup := router.Group("/homepage-icons")
	{
		// Public endpoints (for frontend)
		iconGroup.GET("/active", iconController.GetAllActive)
		
		// Admin endpoints
		iconGroup.GET("/", iconController.GetAll)
		iconGroup.PUT("/:name/icon", iconController.UpdateIcon) // Update icon by name
	}
}
