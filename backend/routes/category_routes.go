package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupCategoryRoutes sets up category-related routes
func SetupCategoryRoutes(r *gin.RouterGroup) {
	categoryController := controllers.NewCategoryController()

	// Public category routes (no authentication required)
	publicCategories := r.Group("/categories")
	{
		publicCategories.GET("", categoryController.GetAllCategories)
	}

	// Admin category routes (admin authentication required)
	adminCategories := r.Group("/admin/categories")
	adminCategories.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminCategories.POST("", categoryController.CreateCategory)
		adminCategories.PUT("/:id", categoryController.UpdateCategory)
		adminCategories.DELETE("/:id", categoryController.DeleteCategory)
		adminCategories.PUT("/:id/status", categoryController.ToggleCategoryStatus)
	}
}
