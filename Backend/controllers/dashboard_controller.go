package controllers

import (
	"net/http"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// DashboardController handles dashboard-related requests
type DashboardController struct {
	dashboardService *services.DashboardService
}

// NewDashboardController creates a new dashboard controller
func NewDashboardController() *DashboardController {
	return &DashboardController{
		dashboardService: services.NewDashboardService(),
	}
}

// GetDashboardOverview gets basic dashboard overview data (admin only)
// @Summary Get dashboard overview
// @Description Get basic dashboard overview with key statistics and system health
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.DashboardOverview}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/overview [get]
func (dc *DashboardController) GetDashboardOverview(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get basic dashboard overview data (only overview stats and system health)
	overview, err := dc.dashboardService.GetDashboardOverview()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch dashboard overview", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Dashboard overview retrieved successfully", overview))
}

// GetUserAnalytics gets user analytics data (admin only)
// @Summary Get user analytics
// @Description Get user analytics including growth trends, distribution, and recent users
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.UserAnalytics}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/user-analytics [get]
func (dc *DashboardController) GetUserAnalytics(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get user analytics
	analytics, err := dc.dashboardService.GetUserAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch user analytics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User analytics retrieved successfully", analytics))
}

// GetBookingAnalytics gets booking analytics data (admin only)
// @Summary Get booking analytics
// @Description Get booking analytics including trends, status breakdown, and recent bookings
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.BookingAnalytics}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/booking-analytics [get]
func (dc *DashboardController) GetBookingAnalytics(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get booking analytics
	analytics, err := dc.dashboardService.GetBookingAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch booking analytics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Booking analytics retrieved successfully", analytics))
}

// GetServiceAnalytics gets service analytics data (admin only)
// @Summary Get service analytics
// @Description Get service analytics including popular services, category performance, and trends
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.ServiceAnalytics}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/service-analytics [get]
func (dc *DashboardController) GetServiceAnalytics(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get service analytics
	analytics, err := dc.dashboardService.GetServiceAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch service analytics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Service analytics retrieved successfully", analytics))
}

// GetFinancialAnalytics gets financial analytics data (admin only)
// @Summary Get financial analytics
// @Description Get financial analytics including revenue trends, payment analytics, and subscription data
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.FinancialAnalytics}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/financial-analytics [get]
func (dc *DashboardController) GetFinancialAnalytics(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get financial analytics
	analytics, err := dc.dashboardService.GetFinancialAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch financial analytics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Financial analytics retrieved successfully", analytics))
}

// GetMarketplaceAnalytics gets marketplace analytics data (admin only)
// @Summary Get marketplace analytics
// @Description Get marketplace analytics including properties, projects, and vendors
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.MarketplaceAnalytics}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/marketplace-analytics [get]
func (dc *DashboardController) GetMarketplaceAnalytics(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get marketplace analytics
	analytics, err := dc.dashboardService.GetMarketplaceAnalytics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch marketplace analytics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Marketplace analytics retrieved successfully", analytics))
}

// GetMonthlyTrends gets monthly trends data (admin only)
// @Summary Get monthly trends
// @Description Get monthly trends data for all metrics including users, bookings, revenue, etc.
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.MonthlyTrends}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/monthly-trends [get]
func (dc *DashboardController) GetMonthlyTrends(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get monthly trends
	trends, err := dc.dashboardService.GetMonthlyTrends()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch monthly trends", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Monthly trends retrieved successfully", trends))
}

// GetDashboardAlerts gets dashboard alerts and notifications (admin only)
// @Summary Get dashboard alerts
// @Description Get system alerts, urgent bookings, and notifications for dashboard
// @Tags Admin Dashboard
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.DashboardAlerts}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/dashboard/alerts [get]
func (dc *DashboardController) GetDashboardAlerts(c *gin.Context) {
	// Check if user is admin
	userType := c.GetString("user_type")
	if userType != "admin" {
		c.JSON(http.StatusForbidden, views.CreateErrorResponse("Admin access required", ""))
		return
	}

	// Get dashboard alerts
	alerts, err := dc.dashboardService.GetDashboardAlerts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch dashboard alerts", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Dashboard alerts retrieved successfully", alerts))
}
