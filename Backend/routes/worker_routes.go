package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupWorkerRoutes sets up worker-related routes
func SetupWorkerRoutes(router *gin.RouterGroup) {
	workerController := controllers.NewWorkerController()

	// Authenticated worker routes (subscription required)
	workersGroup := router.Group("/workers")
	workersGroup.Use(middleware.AuthMiddleware())
	{
		// GET /api/v1/workers - Get worker listings with filters (requires subscription)
		workersGroup.GET("", workerController.GetWorkers)
		// GET /api/v1/workers/stats - Get worker statistics
		workersGroup.GET("/stats", workerController.GetWorkerStats)
		// GET /api/v1/workers/:id - Get worker by ID (requires subscription)
		workersGroup.GET("/:id", workerController.GetWorkerByID)
	}
}
