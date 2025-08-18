package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupCategoryRoutes sets up category-related routes
func SetupCategoryRoutes(router *gin.RouterGroup) {
	categoryController := controllers.NewCategoryController()

	// Public category routes (no authentication required)
	categories := router.Group("/categories")
	{
		// GET /api/v1/categories - Get all categories with optional filtering
		categories.GET("", categoryController.GetCategories)
		
		// GET /api/v1/categories/:id - Get category by ID
		categories.GET("/:id", categoryController.GetCategoryByID)
	}

	// Admin category routes (protected by auth and admin middleware)
	adminCategories := router.Group("/admin/categories")
	adminCategories.Use(middleware.AuthMiddleware())
	adminCategories.Use(middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/categories - Get all categories for admin (includes inactive)
		adminCategories.GET("", categoryController.GetCategories)
		
		// POST /api/v1/admin/categories - Create new category or subcategory
		adminCategories.POST("", categoryController.CreateCategory)
		
		// PUT /api/v1/admin/categories/:id - Update existing category
		adminCategories.PUT("/:id", categoryController.UpdateCategory)
		
		// DELETE /api/v1/admin/categories/:id - Delete existing category
		adminCategories.DELETE("/:id", categoryController.DeleteCategory)
		
		// PATCH /api/v1/admin/categories/:id/status - Toggle category status
		adminCategories.PATCH("/:id/status", categoryController.ToggleStatus)
	}
}
