package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupDashboardRoutes sets up dashboard routes
func SetupDashboardRoutes(r *gin.RouterGroup) {
	dashboardController := controllers.NewDashboardController()

	// Admin dashboard routes (admin authentication required)
	adminDashboard := r.Group("/admin/dashboard")
	adminDashboard.Use(middleware.AuthMiddleware())
	adminDashboard.Use(middleware.AdminMiddleware())
	{
		// GET /api/v1/admin/dashboard/overview - Get basic overview stats and system health
		adminDashboard.GET("/overview", dashboardController.GetDashboardOverview)
		
		// Separate analytics endpoints
		// GET /api/v1/admin/dashboard/user-analytics - Get user analytics
		adminDashboard.GET("/user-analytics", dashboardController.GetUserAnalytics)
		
		// GET /api/v1/admin/dashboard/booking-analytics - Get booking analytics
		adminDashboard.GET("/booking-analytics", dashboardController.GetBookingAnalytics)
		
		// GET /api/v1/admin/dashboard/service-analytics - Get service analytics
		adminDashboard.GET("/service-analytics", dashboardController.GetServiceAnalytics)
		
		// GET /api/v1/admin/dashboard/financial-analytics - Get financial analytics
		adminDashboard.GET("/financial-analytics", dashboardController.GetFinancialAnalytics)
		
		// GET /api/v1/admin/dashboard/marketplace-analytics - Get marketplace analytics
		adminDashboard.GET("/marketplace-analytics", dashboardController.GetMarketplaceAnalytics)
		
		// GET /api/v1/admin/dashboard/monthly-trends - Get monthly trends data
		adminDashboard.GET("/monthly-trends", dashboardController.GetMonthlyTrends)
		
		// GET /api/v1/admin/dashboard/alerts - Get dashboard alerts and notifications
		adminDashboard.GET("/alerts", dashboardController.GetDashboardAlerts)
	}
}
