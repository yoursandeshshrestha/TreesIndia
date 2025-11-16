package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/models"

	"github.com/gin-gonic/gin"
)

func SetupLedgerRoutes(router *gin.RouterGroup) {
	ledgerController := controllers.NewLedgerController()

	// Admin-only routes for ledger management
	admin := router.Group("/admin/ledger")
	admin.Use(
		middleware.AuthMiddleware(),
		// Finance manager and super admin can manage ledger
		middleware.RequireAdminRoles(
			models.AdminRoleSuperAdmin,
			models.AdminRoleFinanceManager,
		),
	)

	{
		// Ledger Entry CRUD operations
		admin.POST("/entries", ledgerController.CreateEntry)
		admin.GET("/entries", ledgerController.GetAllEntries)
		admin.GET("/entries/:id", ledgerController.GetEntry)
		admin.PUT("/entries/:id", ledgerController.UpdateEntry)
		admin.DELETE("/entries/:id", ledgerController.DeleteEntry)

		// Specialized endpoints
		admin.GET("/entries/pending/payments", ledgerController.GetPendingPayments)
		admin.GET("/entries/pending/receivables", ledgerController.GetPendingReceivables)

		// Payment processing
		admin.POST("/entries/:id/pay", ledgerController.ProcessPayment)
		admin.POST("/entries/:id/receive", ledgerController.ProcessReceive)

		// Balance management
		admin.GET("/balance", ledgerController.GetCurrentBalance)
		admin.PUT("/balance", ledgerController.UpdateBalance)

		// Summary and reports
		admin.GET("/summary", ledgerController.GetSummary)
	}
}
