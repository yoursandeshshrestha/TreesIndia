package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
)

// SetupWorkerRoutes sets up worker-related routes
func SetupWorkerRoutes(router *gin.RouterGroup) {
	workerController := controllers.NewWorkerController()

	// Public worker routes (no authentication required)
	publicGroup := router.Group("/public")
	{
		publicWorkerGroup := publicGroup.Group("/workers")
		{
			// GET /api/v1/public/workers - Get public worker listings
			publicWorkerGroup.GET("", workerController.GetPublicWorkers)
			// GET /api/v1/public/workers/:id - Get worker by ID
			publicWorkerGroup.GET("/:id", workerController.GetWorkerByID)
		}
	}

	// Worker stats routes (no authentication required)
	workerStatsGroup := router.Group("/workers")
	{
		// GET /api/v1/workers/stats - Get worker statistics
		workerStatsGroup.GET("/stats", workerController.GetWorkerStats)
	}
}
