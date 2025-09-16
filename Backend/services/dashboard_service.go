package services

import (
	"fmt"
	"treesindia/models"
	"treesindia/repositories"
)

// DashboardService handles dashboard-related business logic
type DashboardService struct {
	dashboardRepo *repositories.DashboardRepository
	userRepo      *repositories.UserRepository
	bookingRepo   *repositories.BookingRepository
	serviceRepo   *repositories.ServiceRepository
	propertyRepo  *repositories.PropertyRepository
	projectRepo   *repositories.ProjectRepository
	vendorRepo    *repositories.VendorRepository
	paymentRepo   *repositories.PaymentRepository
}

// NewDashboardService creates a new dashboard service
func NewDashboardService() *DashboardService {
	return &DashboardService{
		dashboardRepo: repositories.NewDashboardRepository(),
		userRepo:      repositories.NewUserRepository(),
		bookingRepo:   repositories.NewBookingRepository(),
		serviceRepo:   repositories.NewServiceRepository(),
		propertyRepo:  repositories.NewPropertyRepository(),
		projectRepo:   repositories.NewProjectRepository(),
		vendorRepo:    repositories.NewVendorRepository(),
		paymentRepo:   repositories.NewPaymentRepository(),
	}
}

// GetDashboardOverview gets basic dashboard overview data (only overview stats and system health)
func (ds *DashboardService) GetDashboardOverview() (*models.DashboardOverview, error) {
	overview := &models.DashboardOverview{}

	// Get overview stats
	overviewStats, err := ds.getOverviewStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get overview stats: %w", err)
	}
	overview.OverviewStats = *overviewStats

	// Get system health
	systemHealth, err := ds.getSystemHealth()
	if err != nil {
		return nil, fmt.Errorf("failed to get system health: %w", err)
	}
	overview.SystemHealth = *systemHealth

	return overview, nil
}

// GetUserAnalytics gets user analytics data
func (ds *DashboardService) GetUserAnalytics() (*models.UserAnalytics, error) {
	return ds.getUserAnalytics()
}

// GetBookingAnalytics gets booking analytics data
func (ds *DashboardService) GetBookingAnalytics() (*models.BookingAnalytics, error) {
	return ds.getBookingAnalytics()
}

// GetServiceAnalytics gets service analytics data
func (ds *DashboardService) GetServiceAnalytics() (*models.ServiceAnalytics, error) {
	return ds.getServiceAnalytics()
}

// GetFinancialAnalytics gets financial analytics data
func (ds *DashboardService) GetFinancialAnalytics() (*models.FinancialAnalytics, error) {
	return ds.getFinancialAnalytics()
}

// GetMarketplaceAnalytics gets marketplace analytics data
func (ds *DashboardService) GetMarketplaceAnalytics() (*models.MarketplaceAnalytics, error) {
	return ds.getMarketplaceAnalytics()
}

// GetMonthlyTrends gets monthly trends data
func (ds *DashboardService) GetMonthlyTrends() (*models.MonthlyTrends, error) {
	return ds.getMonthlyTrends()
}

// GetDashboardAlerts gets dashboard alerts and notifications
func (ds *DashboardService) GetDashboardAlerts() (*models.DashboardAlerts, error) {
	alerts := &models.DashboardAlerts{}

	// Get urgent alerts
	urgentAlerts, err := ds.dashboardRepo.GetUrgentAlerts()
	if err != nil {
		return nil, fmt.Errorf("failed to get urgent alerts: %w", err)
	}
	alerts.UrgentAlerts = urgentAlerts

	// Get system alerts
	systemAlerts, err := ds.dashboardRepo.GetSystemAlerts()
	if err != nil {
		return nil, fmt.Errorf("failed to get system alerts: %w", err)
	}
	alerts.SystemAlerts = systemAlerts

	// Get pending actions
	pendingActions, err := ds.dashboardRepo.GetPendingActions()
	if err != nil {
		return nil, fmt.Errorf("failed to get pending actions: %w", err)
	}
	alerts.PendingActions = pendingActions

	return alerts, nil
}

// getOverviewStats gets basic overview statistics
func (ds *DashboardService) getOverviewStats() (*models.OverviewStats, error) {
	return ds.dashboardRepo.GetOverviewStats()
}

// getUserAnalytics gets user-related analytics
func (ds *DashboardService) getUserAnalytics() (*models.UserAnalytics, error) {
	return ds.dashboardRepo.GetUserAnalytics()
}

// getBookingAnalytics gets booking-related analytics
func (ds *DashboardService) getBookingAnalytics() (*models.BookingAnalytics, error) {
	return ds.dashboardRepo.GetBookingAnalytics()
}

// getServiceAnalytics gets service-related analytics
func (ds *DashboardService) getServiceAnalytics() (*models.ServiceAnalytics, error) {
	return ds.dashboardRepo.GetServiceAnalytics()
}

// getMarketplaceAnalytics gets marketplace-related analytics
func (ds *DashboardService) getMarketplaceAnalytics() (*models.MarketplaceAnalytics, error) {
	return ds.dashboardRepo.GetMarketplaceAnalytics()
}

// getFinancialAnalytics gets financial-related analytics
func (ds *DashboardService) getFinancialAnalytics() (*models.FinancialAnalytics, error) {
	return ds.dashboardRepo.GetFinancialAnalytics()
}

// getCommunicationAnalytics gets communication-related analytics
func (ds *DashboardService) getCommunicationAnalytics() (*models.CommunicationAnalytics, error) {
	return ds.dashboardRepo.GetCommunicationAnalytics()
}

// getSystemHealth gets system health metrics
func (ds *DashboardService) getSystemHealth() (*models.SystemHealth, error) {
	return ds.dashboardRepo.GetSystemHealth()
}

// getMonthlyTrends gets monthly trend data for all metrics
func (ds *DashboardService) getMonthlyTrends() (*models.MonthlyTrends, error) {
	return ds.dashboardRepo.GetMonthlyTrends()
}

