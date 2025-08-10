package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all the routes with /api/v1 prefix
func SetupRoutes(r *gin.Engine) {
	// API v1 routes group
	v1 := r.Group(APIVersion)
	{
		// Health check route
		setupHealthRoutes(v1)
	}
}

// setupHealthRoutes sets up health-related routes
func setupHealthRoutes(group *gin.RouterGroup) {
	group.GET(HealthPath, controllers.HealthCheck)
}
