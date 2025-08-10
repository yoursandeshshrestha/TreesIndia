package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRoutes configures all the routes with /api/v1 prefix
func SetupRoutes(r *gin.Engine) {
	// Swagger documentation route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	
	// API v1 routes group
	v1 := r.Group(APIVersion)
	{
		// Health check route
		setupHealthRoutes(v1)
		
		// Authentication routes
		SetupAuthRoutes(v1)
		
		// Admin routes
		SetupAdminRoutes(v1)
		
		// Category routes
		SetupCategoryRoutes(v1)
	}
}

// setupHealthRoutes sets up health-related routes
func setupHealthRoutes(group *gin.RouterGroup) {
	group.GET(HealthPath, controllers.HealthCheck)
}
