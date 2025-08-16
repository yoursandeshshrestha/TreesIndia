package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupWalletRoutes sets up wallet-related routes
func SetupWalletRoutes(group *gin.RouterGroup) {
	walletController := controllers.NewWalletController()

	// Wallet routes (authenticated users)
	walletGroup := group.Group("/wallet")
	walletGroup.Use(middleware.AuthMiddleware())

	{
		// Wallet recharge
		walletGroup.POST("/recharge", walletController.RechargeWallet)
		walletGroup.POST("/recharge-immediate", walletController.RechargeWalletImmediate)
		walletGroup.POST("/recharge/:id/complete", walletController.CompleteRecharge)



		// Transaction history
		walletGroup.GET("/transactions", walletController.GetUserTransactions)
		walletGroup.GET("/transactions/type/:type", walletController.GetUserTransactionsByType)
		walletGroup.GET("/transaction/:reference_id", walletController.GetTransactionByReference)

		// Wallet summary
		walletGroup.GET("/summary", walletController.GetUserWalletSummary)
	}

	// Admin wallet routes (admin only)
	adminWalletGroup := group.Group("/admin/wallet")
	adminWalletGroup.Use(middleware.AuthMiddleware())
	adminWalletGroup.Use(middleware.AdminMiddleware())

	{
		// Admin wallet adjustment
		adminWalletGroup.POST("/adjust", walletController.AdminAdjustWallet)
	}
}
