package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminInquiryRoutes sets up admin inquiry management routes
func SetupAdminInquiryRoutes(router *gin.RouterGroup) {
	inquiryController := controllers.NewWorkerInquiryController()

	// Admin inquiry routes (admin authentication required)
	adminInquiries := router.Group("/admin/inquiries")
	adminInquiries.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/inquiries - Get all inquiries
		adminInquiries.GET("", inquiryController.GetAllInquiries)
		
		// PUT /api/v1/admin/inquiries/:id/approve - Approve inquiry
		adminInquiries.PUT("/:id/approve", inquiryController.ApproveInquiry)
		
		// PUT /api/v1/admin/inquiries/:id/reject - Reject inquiry
		adminInquiries.PUT("/:id/reject", inquiryController.RejectInquiry)
	}
}
