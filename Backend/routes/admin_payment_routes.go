package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAdminPaymentRoutes sets up admin payment and transaction management routes
func SetupAdminPaymentRoutes(group *gin.RouterGroup) {
	adminPaymentController := controllers.NewAdminPaymentController()

	// Admin transaction routes (admin authentication required)
	adminTransactions := group.Group("/admin/transactions")
	adminTransactions.Use(middleware.AuthMiddleware())
	adminTransactions.Use(middleware.AdminMiddleware())

	{
		// GET /api/v1/admin/transactions - Get all transactions with filtering and pagination
		adminTransactions.GET("", adminPaymentController.GetAdminTransactions)
		
		// GET /api/v1/admin/transactions/stats - Get transaction statistics
		adminTransactions.GET("/stats", adminPaymentController.GetTransactionStats)
		
		// GET /api/v1/admin/transactions/dashboard - Get comprehensive dashboard data
		adminTransactions.GET("/dashboard", adminPaymentController.GetTransactionDashboard)
		
		// GET /api/v1/admin/transactions/filters - Get available filter options
		adminTransactions.GET("/filters", adminPaymentController.GetTransactionFilters)
		
		// POST /api/v1/admin/transactions/export - Export transactions to CSV
		adminTransactions.POST("/export", adminPaymentController.ExportTransactions)
		
		// GET /api/v1/admin/transactions/:id - Get specific transaction by ID
		adminTransactions.GET("/:id", adminPaymentController.GetTransactionByID)
		
		// GET /api/v1/admin/transactions/reference/:reference_id - Get transaction by reference
		adminTransactions.GET("/reference/:reference_id", adminPaymentController.GetTransactionByReference)
		
		// POST /api/v1/admin/transactions/:id/refund - Refund a transaction
		adminTransactions.POST("/:id/refund", adminPaymentController.RefundTransaction)
		
		// POST /api/v1/admin/transactions/manual - Create manual transaction
		adminTransactions.POST("/manual", adminPaymentController.CreateManualTransaction)
	}
}
