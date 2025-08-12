package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupSubcategoryRoutes sets up subcategory-related routes
func SetupSubcategoryRoutes(router *gin.RouterGroup) {
	subcategoryController := controllers.NewSubcategoryController()

	// Public subcategory routes (no authentication required)
	subcategories := router.Group("/subcategories")
	{
		// GET /api/v1/subcategories - Get all subcategories with optional filtering
		subcategories.GET("", subcategoryController.GetSubcategories)
		
		// GET /api/v1/subcategories/:id - Get subcategory by ID
		subcategories.GET("/:id", subcategoryController.GetSubcategoryByID)
		
		// GET /api/v1/subcategories/category/:categoryId - Get subcategories by category ID
		subcategories.GET("/category/:categoryId", subcategoryController.GetSubcategoriesByCategory)
	}

	// Admin subcategory routes (protected by auth and admin middleware)
	adminSubcategories := router.Group("/admin/subcategories")
	adminSubcategories.Use(middleware.AuthMiddleware())
	adminSubcategories.Use(middleware.AdminMiddleware())
	{
		// POST /api/v1/admin/subcategories - Create new subcategory
		adminSubcategories.POST("", subcategoryController.CreateSubcategory)
		
		// PUT /api/v1/admin/subcategories/:id - Update existing subcategory
		adminSubcategories.PUT("/:id", subcategoryController.UpdateSubcategory)
		
		// DELETE /api/v1/admin/subcategories/:id - Delete existing subcategory
		adminSubcategories.DELETE("/:id", subcategoryController.DeleteSubcategory)
		
		// PATCH /api/v1/admin/subcategories/:id/status - Toggle subcategory status
		adminSubcategories.PATCH("/:id/status", subcategoryController.ToggleStatus)
	}
}
