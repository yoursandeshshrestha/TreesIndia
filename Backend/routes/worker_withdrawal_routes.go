package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

func SetupWorkerWithdrawalRoutes(router *gin.RouterGroup) {
	controller := controllers.NewWorkerWithdrawalController()

	// Worker withdrawal routes
	workerRoutes := router.Group("/worker/withdrawals")
	workerRoutes.Use(middleware.AuthMiddleware())
	workerRoutes.Use(middleware.WorkerMiddleware())
	{
		workerRoutes.POST("/request", controller.RequestWithdrawal)
		workerRoutes.GET("", controller.GetWithdrawals)
		workerRoutes.GET("/pending", controller.GetPendingWithdrawals)
	}

	// Admin withdrawal routes
	adminRoutes := router.Group("/admin/withdrawals")
	adminRoutes.Use(middleware.AuthMiddleware())
	adminRoutes.Use(middleware.AdminMiddleware())
	{
		adminRoutes.GET("", controller.GetAllWithdrawals)
		adminRoutes.GET("/pending", controller.GetAllPendingWithdrawals)
		adminRoutes.POST("/:id/approve", controller.ApproveWithdrawal)
		adminRoutes.POST("/:id/reject", controller.RejectWithdrawal)
	}
}
