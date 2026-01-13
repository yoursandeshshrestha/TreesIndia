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

	// Worker profile management (requires worker role)
	workerProfileGroup := router.Group("/workers/profile")
	workerProfileGroup.Use(middleware.AuthMiddleware(), middleware.WorkerMiddleware())
	{
		// GET /api/v1/workers/profile - Get own worker profile
		workerProfileGroup.GET("", workerController.GetWorkerProfile)
		// PUT /api/v1/workers/profile - Update own worker profile
		workerProfileGroup.PUT("", workerController.UpdateWorkerProfile)
	}
}
