package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupWorkerEarningsRoutes sets up worker earnings-related routes
func SetupWorkerEarningsRoutes(router *gin.RouterGroup) {
	workerEarningsService := services.NewWorkerEarningsService()
	workerEarningsController := controllers.NewWorkerEarningsController(workerEarningsService)

	// Worker earnings routes (authenticated workers only)
	workerEarnings := router.Group("/worker/earnings")
	workerEarnings.Use(middleware.AuthMiddleware(), middleware.WorkerMiddleware())
	{
		// GET /api/v1/worker/earnings/dashboard - Get earnings dashboard
		workerEarnings.GET("/dashboard", workerEarningsController.GetEarningsDashboard)
	}
}
