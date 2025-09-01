package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupWorkerAssignmentRoutes sets up worker assignment-related routes
func SetupWorkerAssignmentRoutes(router *gin.RouterGroup, workerAssignmentService *services.WorkerAssignmentService) {
	workerAssignmentController := controllers.NewWorkerAssignmentController(workerAssignmentService)

	// Worker assignment routes (authenticated workers only)
	workerAssignments := router.Group("/worker/assignments")
	workerAssignments.Use(middleware.AuthMiddleware(), middleware.WorkerMiddleware())
	{
		// GET /api/v1/worker/assignments - Get all assignments for the worker
		workerAssignments.GET("", workerAssignmentController.GetWorkerAssignments)
		
		// GET /api/v1/worker/assignments/:id - Get specific assignment
		workerAssignments.GET("/:id", workerAssignmentController.GetWorkerAssignment)
		
		// POST /api/v1/worker/assignments/:id/accept - Accept assignment
		workerAssignments.POST("/:id/accept", workerAssignmentController.AcceptAssignment)
		
		// POST /api/v1/worker/assignments/:id/reject - Reject assignment
		workerAssignments.POST("/:id/reject", workerAssignmentController.RejectAssignment)
		
		// POST /api/v1/worker/assignments/:id/start - Start assignment
		workerAssignments.POST("/:id/start", workerAssignmentController.StartAssignment)
		
		// POST /api/v1/worker/assignments/:id/complete - Complete assignment
		workerAssignments.POST("/:id/complete", workerAssignmentController.CompleteAssignment)
	}
}
