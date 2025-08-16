package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupWorkerInquiryRoutes sets up worker inquiry-related routes
func SetupWorkerInquiryRoutes(router *gin.RouterGroup) {
	inquiryController := controllers.NewWorkerInquiryController()

	// Worker inquiry routes (authenticated users)
	inquiries := router.Group("/workers")
	inquiries.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/workers/:id/inquiry - Send inquiry to worker
		inquiries.POST("/:id/inquiry", inquiryController.CreateInquiry)
		
		// GET /api/v1/workers/inquiries - Get inquiries sent by user
		inquiries.GET("/inquiries", inquiryController.GetUserInquiries)
		
		// GET /api/v1/workers/received-inquiries - Get inquiries received by worker
		inquiries.GET("/received-inquiries", inquiryController.GetWorkerInquiries)
		
		// PUT /api/v1/workers/received-inquiries/:id/response - Update worker response
		inquiries.PUT("/received-inquiries/:id/response", inquiryController.UpdateWorkerResponse)
	}
}
