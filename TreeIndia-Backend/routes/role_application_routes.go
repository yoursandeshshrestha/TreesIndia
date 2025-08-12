package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoleApplicationRoutes sets up role application-related routes
func SetupRoleApplicationRoutes(group *gin.RouterGroup) {
	applicationController := controllers.NewRoleApplicationController()
	
	// Comprehensive role application route (authenticated users)
	applications := group.Group("/role-applications")
	applications.Use(middleware.AuthMiddleware(), middleware.PerformanceMiddleware())
	{
		applications.POST("", applicationController.SubmitApplication)
		applications.POST("/broker", applicationController.SubmitBrokerApplication)
		applications.POST("/worker", applicationController.SubmitWorkerApplication)
		applications.GET("/me", applicationController.GetUserApplication)
	}
	
	// Admin role application routes
	adminApplications := group.Group("/admin/role-applications")
	adminApplications.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware(), middleware.PerformanceMiddleware())
	{
		adminApplications.GET("", applicationController.GetApplicationsByStatus)
		adminApplications.GET("/:id", applicationController.GetApplication)
		adminApplications.PUT("/:id", applicationController.UpdateApplication)
	}
}
