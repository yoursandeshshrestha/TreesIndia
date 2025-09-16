package repositories

import (
	"fmt"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// DashboardRepository handles dashboard-related database operations
type DashboardRepository struct {
	db *gorm.DB
}

// NewDashboardRepository creates a new dashboard repository
func NewDashboardRepository() *DashboardRepository {
	return &DashboardRepository{
		db: database.GetDB(),
	}
}

// GetOverviewStats gets basic overview statistics
func (dr *DashboardRepository) GetOverviewStats() (*models.OverviewStats, error) {
	stats := &models.OverviewStats{}

	// Get total users
	var totalUsers int64
	err := dr.db.Model(&models.User{}).Count(&totalUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total users: %w", err)
	}
	stats.TotalUsers = int(totalUsers)

	// Get total bookings
	var totalBookings int64
	err = dr.db.Model(&models.Booking{}).Count(&totalBookings).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total bookings: %w", err)
	}
	stats.TotalBookings = int(totalBookings)

	// Get total revenue
	var totalRevenue float64
	err = dr.db.Model(&models.Payment{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalRevenue).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total revenue: %w", err)
	}
	stats.TotalRevenue = totalRevenue

	// Get active services
	var activeServices int64
	err = dr.db.Model(&models.Service{}).
		Where("is_active = ?", true).
		Count(&activeServices).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get active services: %w", err)
	}
	stats.ActiveServices = int(activeServices)

	// Get total properties
	var totalProperties int64
	err = dr.db.Model(&models.Property{}).Count(&totalProperties).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total properties: %w", err)
	}
	stats.TotalProperties = int(totalProperties)

	// Get total projects
	var totalProjects int64
	err = dr.db.Model(&models.Project{}).Count(&totalProjects).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total projects: %w", err)
	}
	stats.TotalProjects = int(totalProjects)

	// Get total vendors
	var totalVendors int64
	err = dr.db.Model(&models.Vendor{}).
		Where("is_active = ?", true).
		Count(&totalVendors).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total vendors: %w", err)
	}
	stats.TotalVendors = int(totalVendors)

	// Get total workers
	var totalWorkers int64
	err = dr.db.Model(&models.Worker{}).
		Where("is_active = ?", true).
		Count(&totalWorkers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total workers: %w", err)
	}
	stats.TotalWorkers = int(totalWorkers)

	// Get total brokers
	var totalBrokers int64
	err = dr.db.Model(&models.User{}).
		Where("user_type = ? AND is_active = ?", "broker", true).
		Count(&totalBrokers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total brokers: %w", err)
	}
	stats.TotalBrokers = int(totalBrokers)

	// Get active subscriptions
	var activeSubscriptions int64
	err = dr.db.Model(&models.UserSubscription{}).
		Where("status = ?", "active").
		Count(&activeSubscriptions).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get active subscriptions: %w", err)
	}
	stats.ActiveSubscriptions = int(activeSubscriptions)

	return stats, nil
}

// GetUserAnalytics gets user-related analytics
func (dr *DashboardRepository) GetUserAnalytics() (*models.UserAnalytics, error) {
	analytics := &models.UserAnalytics{}

	// Get user growth (last 12 months)
	userGrowth, err := dr.getUserGrowthTrend()
	if err != nil {
		return nil, fmt.Errorf("failed to get user growth: %w", err)
	}
	analytics.UserGrowth = userGrowth

	// Get user types distribution
	userTypesDist, err := dr.getUserTypesDistribution()
	if err != nil {
		return nil, fmt.Errorf("failed to get user types distribution: %w", err)
	}
	analytics.UserTypesDistribution = userTypesDist

	// Get recent users (last 10)
	recentUsers, err := dr.getRecentUsers(10)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent users: %w", err)
	}
	analytics.RecentUsers = recentUsers

	// Get active users (last 30 days)
	var activeUsers int64
	err = dr.db.Model(&models.User{}).
		Where("last_login_at >= NOW() - INTERVAL '30 days'").
		Count(&activeUsers).Error
	if err != nil {
		activeUsers = 0 // Default to 0 if query fails
	}
	analytics.ActiveUsers = int(activeUsers)

	// Get new users this month
	var newUsersThisMonth int64
	err = dr.db.Model(&models.User{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&newUsersThisMonth).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get new users this month: %w", err)
	}
	analytics.NewUsersThisMonth = int(newUsersThisMonth)

	// Calculate user retention rate (simplified)
	analytics.UserRetentionRate = 0.0 // Will be calculated when we have proper data

	return analytics, nil
}

// GetBookingAnalytics gets booking-related analytics
func (dr *DashboardRepository) GetBookingAnalytics() (*models.BookingAnalytics, error) {
	analytics := &models.BookingAnalytics{}

	// Get booking trends (last 12 months)
	bookingTrends, err := dr.getBookingTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get booking trends: %w", err)
	}
	analytics.BookingTrends = bookingTrends

	// Get status breakdown
	statusBreakdown, err := dr.getBookingStatusBreakdown()
	if err != nil {
		return nil, fmt.Errorf("failed to get status breakdown: %w", err)
	}
	analytics.StatusBreakdown = statusBreakdown

	// Get recent bookings (last 10)
	recentBookings, err := dr.getRecentBookings(10)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent bookings: %w", err)
	}
	analytics.RecentBookings = recentBookings

	// Get urgent alerts
	urgentAlerts, err := dr.GetUrgentAlerts()
	if err != nil {
		return nil, fmt.Errorf("failed to get urgent alerts: %w", err)
	}
	analytics.UrgentAlerts = urgentAlerts

	// Calculate completion rate
	completionRate, err := dr.getBookingCompletionRate()
	if err != nil {
		analytics.CompletionRate = 0.0
	} else {
		analytics.CompletionRate = completionRate
	}

	// Calculate average booking value
	avgBookingValue, err := dr.getAverageBookingValue()
	if err != nil {
		analytics.AverageBookingValue = 0.0
	} else {
		analytics.AverageBookingValue = avgBookingValue
	}

	// Get bookings this month
	var bookingsThisMonth int64
	err = dr.db.Model(&models.Booking{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&bookingsThisMonth).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get bookings this month: %w", err)
	}
	analytics.BookingsThisMonth = int(bookingsThisMonth)

	return analytics, nil
}

// GetServiceAnalytics gets service-related analytics
func (dr *DashboardRepository) GetServiceAnalytics() (*models.ServiceAnalytics, error) {
	analytics := &models.ServiceAnalytics{}

	// Get popular services
	popularServices, err := dr.getPopularServices(10)
	if err != nil {
		return nil, fmt.Errorf("failed to get popular services: %w", err)
	}
	analytics.PopularServices = popularServices

	// Get category performance
	categoryPerformance, err := dr.getCategoryPerformance()
	if err != nil {
		return nil, fmt.Errorf("failed to get category performance: %w", err)
	}
	analytics.CategoryPerformance = categoryPerformance

	// Get service areas
	serviceAreas, err := dr.getServiceAreas()
	if err != nil {
		return nil, fmt.Errorf("failed to get service areas: %w", err)
	}
	analytics.ServiceAreas = serviceAreas

	// Get service trends
	serviceTrends, err := dr.getServiceTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get service trends: %w", err)
	}
	analytics.ServiceTrends = serviceTrends

	// Calculate average service rating
	analytics.AverageServiceRating = 0.0 // Will be calculated when we have proper data

	return analytics, nil
}

// GetMarketplaceAnalytics gets marketplace-related analytics
func (dr *DashboardRepository) GetMarketplaceAnalytics() (*models.MarketplaceAnalytics, error) {
	analytics := &models.MarketplaceAnalytics{}

	// Get property analytics
	propertyAnalytics, err := dr.getPropertyAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get property analytics: %w", err)
	}
	analytics.PropertyAnalytics = *propertyAnalytics

	// Get project analytics
	projectAnalytics, err := dr.getProjectAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get project analytics: %w", err)
	}
	analytics.ProjectAnalytics = *projectAnalytics

	// Get vendor analytics
	vendorAnalytics, err := dr.getVendorAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get vendor analytics: %w", err)
	}
	analytics.VendorAnalytics = *vendorAnalytics

	return analytics, nil
}

// GetFinancialAnalytics gets financial-related analytics
func (dr *DashboardRepository) GetFinancialAnalytics() (*models.FinancialAnalytics, error) {
	analytics := &models.FinancialAnalytics{}

	// Get revenue trends
	revenueTrends, err := dr.getRevenueTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue trends: %w", err)
	}
	analytics.RevenueTrends = revenueTrends

	// Get payment analytics
	paymentAnalytics, err := dr.getPaymentAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get payment analytics: %w", err)
	}
	analytics.PaymentAnalytics = *paymentAnalytics

	// Get subscription analytics
	subscriptionAnalytics, err := dr.getSubscriptionAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription analytics: %w", err)
	}
	analytics.SubscriptionAnalytics = *subscriptionAnalytics

	// Get revenue this month
	var revenueThisMonth float64
	err = dr.db.Model(&models.Payment{}).
		Where("status = ? AND created_at >= DATE_TRUNC('month', CURRENT_DATE)", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&revenueThisMonth).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue this month: %w", err)
	}
	analytics.RevenueThisMonth = revenueThisMonth

	// Calculate revenue growth
	revenueGrowth, err := dr.calculateRevenueGrowth()
	if err != nil {
		analytics.RevenueGrowth = 0.0
	} else {
		analytics.RevenueGrowth = revenueGrowth
	}

	return analytics, nil
}

// GetCommunicationAnalytics gets communication-related analytics
func (dr *DashboardRepository) GetCommunicationAnalytics() (*models.CommunicationAnalytics, error) {
	analytics := &models.CommunicationAnalytics{}

	// Get chat analytics
	chatAnalytics, err := dr.getChatAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get chat analytics: %w", err)
	}
	analytics.ChatAnalytics = *chatAnalytics

	// Get notification analytics
	notificationAnalytics, err := dr.getNotificationAnalytics()
	if err != nil {
		return nil, fmt.Errorf("failed to get notification analytics: %w", err)
	}
	analytics.NotificationAnalytics = *notificationAnalytics

	return analytics, nil
}

// GetSystemHealth gets system health metrics
func (dr *DashboardRepository) GetSystemHealth() (*models.SystemHealth, error) {
	health := &models.SystemHealth{}

	// Check database connection
	sqlDB, err := dr.db.DB()
	if err != nil {
		health.SystemStatus = "unhealthy"
		health.DatabaseStatus = "disconnected"
	} else {
		err = sqlDB.Ping()
		if err != nil {
			health.SystemStatus = "unhealthy"
			health.DatabaseStatus = "disconnected"
		} else {
			health.SystemStatus = "healthy"
			health.DatabaseStatus = "connected"
		}
	}

	// Get active sessions (simplified - using recent logins)
	var activeSessions int64
	err = dr.db.Model(&models.User{}).
		Where("last_login_at >= NOW() - INTERVAL '1 hour'").
		Count(&activeSessions).Error
	if err != nil {
		activeSessions = 0
	}
	health.ActiveSessions = int(activeSessions)

	// Set API response time (this would be measured in middleware)
	health.APIResponseTime = "0ms" // Will be measured when implemented

	// Set uptime (this would be calculated from application start time)
	health.Uptime = "0%" // Will be calculated when implemented

	// Calculate error rate (simplified)
	health.ErrorRate = 0.0 // Will be calculated when implemented

	return health, nil
}

// GetMonthlyTrends gets monthly trend data for all metrics
func (dr *DashboardRepository) GetMonthlyTrends() (*models.MonthlyTrends, error) {
	trends := &models.MonthlyTrends{}

	// Get user trends
	userTrends, err := dr.getUserGrowthTrend()
	if err != nil {
		return nil, fmt.Errorf("failed to get user trends: %w", err)
	}
	trends.Users = userTrends

	// Get booking trends
	bookingTrends, err := dr.getBookingTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get booking trends: %w", err)
	}
	trends.Bookings = bookingTrends

	// Get revenue trends
	revenueTrends, err := dr.getRevenueTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue trends: %w", err)
	}
	trends.Revenue = revenueTrends

	// Get service trends
	serviceTrends, err := dr.getServiceTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get service trends: %w", err)
	}
	trends.Services = serviceTrends

	// Get property trends
	propertyTrends, err := dr.getPropertyTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get property trends: %w", err)
	}
	trends.Properties = propertyTrends

	// Get project trends
	projectTrends, err := dr.getProjectTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get project trends: %w", err)
	}
	trends.Projects = projectTrends

	// Get vendor trends
	vendorTrends, err := dr.getVendorTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get vendor trends: %w", err)
	}
	trends.Vendors = vendorTrends

	// Get payment trends
	paymentTrends, err := dr.getPaymentTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get payment trends: %w", err)
	}
	trends.Payments = paymentTrends

	// Get subscription trends
	subscriptionTrends, err := dr.getSubscriptionTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription trends: %w", err)
	}
	trends.Subscriptions = subscriptionTrends

	// Get chat trends
	chatTrends, err := dr.getChatTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get chat trends: %w", err)
	}
	trends.Chats = chatTrends

	// Get notification trends
	notificationTrends, err := dr.getNotificationTrends()
	if err != nil {
		return nil, fmt.Errorf("failed to get notification trends: %w", err)
	}
	trends.Notifications = notificationTrends

	return trends, nil
}

// Helper methods for getting trend data

// getUserGrowthTrend gets user growth trend for last 12 months
func (dr *DashboardRepository) getUserGrowthTrend() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.User{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}

// getBookingTrends gets booking trends for last 12 months
func (dr *DashboardRepository) getBookingTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Booking{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}

// getRevenueTrends gets revenue trends for last 12 months
func (dr *DashboardRepository) getRevenueTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month  string  `json:"month"`
		Amount float64 `json:"amount"`
	}
	
	err := dr.db.Model(&models.Payment{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as amount").
		Where("status = ? AND created_at >= NOW() - INTERVAL '12 months'", "completed").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month:  result.Month,
			Amount: result.Amount, // Only keep amount for revenue data
		})
	}

	return trends, nil
}

// Additional helper methods would be implemented here...
// For brevity, I'll include the key ones and you can expand as needed

func (dr *DashboardRepository) getUserTypesDistribution() (map[string]int, error) {
	var results []struct {
		UserType string `json:"user_type"`
		Count    int    `json:"count"`
	}
	
	err := dr.db.Model(&models.User{}).
		Select("user_type, COUNT(*) as count").
		Group("user_type").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	distribution := make(map[string]int)
	for _, result := range results {
		distribution[result.UserType] = result.Count
	}

	return distribution, nil
}

func (dr *DashboardRepository) getRecentUsers(limit int) ([]models.User, error) {
	var users []models.User
	
	err := dr.db.
		Order("created_at DESC").
		Limit(limit).
		Find(&users).Error
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (dr *DashboardRepository) getRecentBookings(limit int) ([]models.Booking, error) {
	var bookings []models.Booking
	
	err := dr.db.
		Order("created_at DESC").
		Limit(limit).
		Find(&bookings).Error
	if err != nil {
		return nil, err
	}

	return bookings, nil
}

// Placeholder methods for other analytics - these return empty data when not implemented
func (dr *DashboardRepository) getBookingStatusBreakdown() (map[string]int, error) {
	var results []struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Booking{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	distribution := make(map[string]int)
	for _, result := range results {
		distribution[result.Status] = result.Count
	}

	return distribution, nil
}

func (dr *DashboardRepository) getBookingCompletionRate() (float64, error) {
	var totalBookings int64
	var completedBookings int64
	
	// Get total bookings
	err := dr.db.Model(&models.Booking{}).Count(&totalBookings).Error
	if err != nil {
		return 0.0, err
	}
	
	// Get completed bookings
	err = dr.db.Model(&models.Booking{}).
		Where("status = ?", "completed").
		Count(&completedBookings).Error
	if err != nil {
		return 0.0, err
	}
	
	if totalBookings == 0 {
		return 0.0, nil
	}
	
	return float64(completedBookings) / float64(totalBookings) * 100, nil
}

func (dr *DashboardRepository) getAverageBookingValue() (float64, error) {
	var avgValue float64
	
	err := dr.db.Model(&models.Payment{}).
		Where("status = ?", "completed").
		Select("AVG(amount)").
		Scan(&avgValue).Error
	if err != nil {
		return 0.0, err
	}
	
	return avgValue, nil
}

func (dr *DashboardRepository) GetUrgentAlerts() ([]models.UrgentAlert, error) {
	return []models.UrgentAlert{}, nil
}

func (dr *DashboardRepository) getPopularServices(limit int) ([]models.ServicePerformance, error) {
	var results []struct {
		ServiceID      uint    `json:"service_id"`
		ServiceName    string  `json:"service_name"`
		TotalBookings  int     `json:"total_bookings"`
		Revenue        float64 `json:"revenue"`
	}
	
	err := dr.db.Table("bookings b").
		Select("s.id as service_id, s.name as service_name, COUNT(b.id) as total_bookings, COALESCE(SUM(p.amount), 0) as revenue").
		Joins("JOIN services s ON b.service_id = s.id").
		Joins("LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'").
		Group("s.id, s.name").
		Order("total_bookings DESC").
		Limit(limit).
		Scan(&results).Error
	if err != nil {
		return []models.ServicePerformance{}, nil
	}

	var services []models.ServicePerformance
	for _, result := range results {
		services = append(services, models.ServicePerformance{
			ServiceID:      result.ServiceID,
			ServiceName:    result.ServiceName,
			TotalBookings:  result.TotalBookings,
			Revenue:        result.Revenue,
			Rating:         0.0, // Will be calculated when we have rating data
			CompletionRate: 0.0, // Will be calculated when we have completion data
		})
	}

	return services, nil
}

func (dr *DashboardRepository) getCategoryPerformance() ([]models.CategoryPerformance, error) {
	var results []struct {
		CategoryID    uint    `json:"category_id"`
		CategoryName  string  `json:"category_name"`
		TotalServices int     `json:"total_services"`
		TotalBookings int     `json:"total_bookings"`
		Revenue       float64 `json:"revenue"`
	}
	
	err := dr.db.Table("categories c").
		Select("c.id as category_id, c.name as category_name, COUNT(DISTINCT s.id) as total_services, COUNT(b.id) as total_bookings, COALESCE(SUM(p.amount), 0) as revenue").
		Joins("LEFT JOIN services s ON c.id = s.category_id").
		Joins("LEFT JOIN bookings b ON s.id = b.service_id").
		Joins("LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'").
		Group("c.id, c.name").
		Order("total_bookings DESC").
		Scan(&results).Error
	if err != nil {
		return []models.CategoryPerformance{}, nil
	}

	var categories []models.CategoryPerformance
	for _, result := range results {
		categories = append(categories, models.CategoryPerformance{
			CategoryID:    result.CategoryID,
			CategoryName:  result.CategoryName,
			TotalServices: result.TotalServices,
			TotalBookings: result.TotalBookings,
			Revenue:       result.Revenue,
			Growth:        0.0, // Will be calculated when we have historical data
		})
	}

	return categories, nil
}

func (dr *DashboardRepository) getServiceAreas() ([]models.ServiceAreaData, error) {
	return []models.ServiceAreaData{}, nil
}

func (dr *DashboardRepository) getServiceTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Service{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return []models.MonthlyData{}, nil
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}

func (dr *DashboardRepository) getPropertyAnalytics() (*models.PropertyAnalytics, error) {
	analytics := &models.PropertyAnalytics{}
	
	// Get total properties
	var totalProperties int64
	err := dr.db.Model(&models.Property{}).Count(&totalProperties).Error
	if err != nil {
		return analytics, err
	}
	analytics.TotalProperties = int(totalProperties)
	
	// Get active listings (properties that are not sold/rented)
	var activeListings int64
	err = dr.db.Model(&models.Property{}).
		Where("status != ?", "sold").
		Count(&activeListings).Error
	if err != nil {
		activeListings = totalProperties // Default to total if status field doesn't exist
	}
	analytics.ActiveListings = int(activeListings)
	
	// Get properties this month
	var propertiesThisMonth int64
	err = dr.db.Model(&models.Property{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&propertiesThisMonth).Error
	if err != nil {
		propertiesThisMonth = 0
	}
	analytics.PropertiesThisMonth = int(propertiesThisMonth)
	
	// Skip average property price calculation for now
	analytics.AveragePropertyPrice = 0.0
	
	// Get property trends
	propertyTrends, err := dr.getPropertyTrends()
	if err != nil {
		propertyTrends = []models.MonthlyData{}
	}
	analytics.PropertyTrends = propertyTrends
	
	return analytics, nil
}

func (dr *DashboardRepository) getProjectAnalytics() (*models.ProjectAnalytics, error) {
	analytics := &models.ProjectAnalytics{}
	
	// Get total projects
	var totalProjects int64
	err := dr.db.Model(&models.Project{}).Count(&totalProjects).Error
	if err != nil {
		return analytics, err
	}
	analytics.TotalProjects = int(totalProjects)
	
	// Get active projects
	var activeProjects int64
	err = dr.db.Model(&models.Project{}).
		Where("status IN (?)", []string{"starting_soon", "on_going"}).
		Count(&activeProjects).Error
	if err != nil {
		activeProjects = 0
	}
	analytics.ActiveProjects = int(activeProjects)
	
	// Skip completed projects calculation for now
	analytics.CompletedProjects = 0
	
	// Get projects this month
	var projectsThisMonth int64
	err = dr.db.Model(&models.Project{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&projectsThisMonth).Error
	if err != nil {
		projectsThisMonth = 0
	}
	analytics.ProjectsThisMonth = int(projectsThisMonth)
	
	// Get project trends
	projectTrends, err := dr.getProjectTrends()
	if err != nil {
		projectTrends = []models.MonthlyData{}
	}
	analytics.ProjectTrends = projectTrends
	
	return analytics, nil
}

func (dr *DashboardRepository) getVendorAnalytics() (*models.VendorAnalytics, error) {
	analytics := &models.VendorAnalytics{}
	
	// Get total vendors
	var totalVendors int64
	err := dr.db.Model(&models.Vendor{}).Count(&totalVendors).Error
	if err != nil {
		return analytics, err
	}
	analytics.TotalVendors = int(totalVendors)
	
	// Get active vendors
	var activeVendors int64
	err = dr.db.Model(&models.Vendor{}).
		Where("is_active = ?", true).
		Count(&activeVendors).Error
	if err != nil {
		activeVendors = 0
	}
	analytics.ActiveVendors = int(activeVendors)
	
	// Get vendors this month
	var vendorsThisMonth int64
	err = dr.db.Model(&models.Vendor{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&vendorsThisMonth).Error
	if err != nil {
		vendorsThisMonth = 0
	}
	analytics.VendorsThisMonth = int(vendorsThisMonth)
	
	// Skip average vendor rating calculation for now
	analytics.AverageVendorRating = 0.0
	
	// Get vendor trends
	vendorTrends, err := dr.getVendorTrends()
	if err != nil {
		vendorTrends = []models.MonthlyData{}
	}
	analytics.VendorTrends = vendorTrends
	
	return analytics, nil
}

func (dr *DashboardRepository) getPaymentAnalytics() (*models.PaymentAnalytics, error) {
	analytics := &models.PaymentAnalytics{}
	
	// Get total transactions
	var totalTransactions int64
	err := dr.db.Model(&models.Payment{}).Count(&totalTransactions).Error
	if err != nil {
		return analytics, err
	}
	analytics.TotalTransactions = int(totalTransactions)
	
	// Get successful payments
	var successfulPayments int64
	err = dr.db.Model(&models.Payment{}).
		Where("status = ?", "completed").
		Count(&successfulPayments).Error
	if err != nil {
		successfulPayments = 0
	}
	analytics.SuccessfulPayments = int(successfulPayments)
	
	// Get failed payments
	var failedPayments int64
	err = dr.db.Model(&models.Payment{}).
		Where("status = ?", "failed").
		Count(&failedPayments).Error
	if err != nil {
		failedPayments = 0
	}
	analytics.FailedPayments = int(failedPayments)
	
	// Calculate payment success rate
	if totalTransactions > 0 {
		analytics.PaymentSuccessRate = float64(successfulPayments) / float64(totalTransactions) * 100
	} else {
		analytics.PaymentSuccessRate = 0.0
	}
	
	// Get payment method breakdown
	paymentMethodBreakdown, err := dr.getPaymentMethodBreakdown()
	if err != nil {
		paymentMethodBreakdown = make(map[string]int)
	}
	analytics.PaymentMethodBreakdown = paymentMethodBreakdown
	
	// Get payment trends
	paymentTrends, err := dr.getPaymentTrends()
	if err != nil {
		paymentTrends = []models.MonthlyData{}
	}
	analytics.PaymentTrends = paymentTrends
	
	return analytics, nil
}

func (dr *DashboardRepository) getSubscriptionAnalytics() (*models.SubscriptionAnalytics, error) {
	analytics := &models.SubscriptionAnalytics{}
	
	// Get active subscriptions
	var activeSubscriptions int64
	err := dr.db.Model(&models.UserSubscription{}).
		Where("status = ? AND end_date > NOW()", "active").
		Count(&activeSubscriptions).Error
	if err != nil {
		activeSubscriptions = 0
	}
	analytics.ActiveSubscriptions = int(activeSubscriptions)
	
	// Get new subscriptions this month
	var newSubscriptions int64
	err = dr.db.Model(&models.UserSubscription{}).
		Where("created_at >= DATE_TRUNC('month', CURRENT_DATE)").
		Count(&newSubscriptions).Error
	if err != nil {
		newSubscriptions = 0
	}
	analytics.NewSubscriptions = int(newSubscriptions)
	
	// Get subscription revenue this month
	var subscriptionRevenue float64
	err = dr.db.Model(&models.Payment{}).
		Where("type = ? AND status = ? AND created_at >= DATE_TRUNC('month', CURRENT_DATE)", "subscription", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&subscriptionRevenue).Error
	if err != nil {
		subscriptionRevenue = 0
	}
	analytics.SubscriptionRevenue = subscriptionRevenue
	
	// Calculate churn rate (simplified - subscriptions that expired in last month)
	var expiredSubscriptions int64
	err = dr.db.Model(&models.UserSubscription{}).
		Where("status = ? AND end_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND end_date < DATE_TRUNC('month', CURRENT_DATE)", "expired").
		Count(&expiredSubscriptions).Error
	if err != nil {
		expiredSubscriptions = 0
	}
	
	// Calculate churn rate
	if activeSubscriptions > 0 {
		analytics.ChurnRate = float64(expiredSubscriptions) / float64(activeSubscriptions) * 100
	} else {
		analytics.ChurnRate = 0.0
	}
	
	// Get subscription trends
	subscriptionTrends, err := dr.getSubscriptionTrends()
	if err != nil {
		subscriptionTrends = []models.MonthlyData{}
	}
	analytics.SubscriptionTrends = subscriptionTrends
	
	return analytics, nil
}

func (dr *DashboardRepository) getChatAnalytics() (*models.ChatAnalytics, error) {
	return &models.ChatAnalytics{}, nil
}

func (dr *DashboardRepository) getNotificationAnalytics() (*models.NotificationAnalytics, error) {
	return &models.NotificationAnalytics{}, nil
}

// calculateRevenueGrowth calculates the revenue growth percentage compared to last month
func (dr *DashboardRepository) calculateRevenueGrowth() (float64, error) {
	// Get current month revenue
	var currentMonthRevenue float64
	err := dr.db.Model(&models.Payment{}).
		Where("status = ? AND created_at >= DATE_TRUNC('month', CURRENT_DATE)", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&currentMonthRevenue).Error
	if err != nil {
		return 0.0, err
	}
	
	// Get last month revenue
	var lastMonthRevenue float64
	err = dr.db.Model(&models.Payment{}).
		Where("status = ? AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&lastMonthRevenue).Error
	if err != nil {
		return 0.0, err
	}
	
	// Calculate growth percentage
	if lastMonthRevenue > 0 {
		return ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100, nil
	} else if currentMonthRevenue > 0 {
		return 100.0, nil // 100% growth if no previous revenue
	}
	
	return 0.0, nil
}

// getPaymentMethodBreakdown gets breakdown of payment methods
func (dr *DashboardRepository) getPaymentMethodBreakdown() (map[string]int, error) {
	var results []struct {
		Method string `json:"method"`
		Count  int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Payment{}).
		Select("method, COUNT(*) as count").
		Where("status = ? AND method IS NOT NULL AND method != ''", "completed").
		Group("method").
		Scan(&results).Error
	if err != nil {
		// Return empty map instead of error to prevent breaking the API
		return make(map[string]int), nil
	}
	
	breakdown := make(map[string]int)
	for _, result := range results {
		if result.Method != "" {
			breakdown[result.Method] = result.Count
		}
	}
	
	return breakdown, nil
}

// getSubscriptionTrends gets subscription trends for last 12 months
func (dr *DashboardRepository) getSubscriptionTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.UserSubscription{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}
	
	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}
	
	return trends, nil
}

func (dr *DashboardRepository) GetRecentActivity() ([]models.RecentActivity, error) {
	return []models.RecentActivity{}, nil
}

func (dr *DashboardRepository) GetSystemAlerts() ([]models.SystemAlert, error) {
	return []models.SystemAlert{}, nil
}

func (dr *DashboardRepository) GetPendingActions() ([]models.PendingAction, error) {
	return []models.PendingAction{}, nil
}

// Additional trend methods
func (dr *DashboardRepository) getPropertyTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Property{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return []models.MonthlyData{}, nil
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}

func (dr *DashboardRepository) getProjectTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Project{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return []models.MonthlyData{}, nil
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}

func (dr *DashboardRepository) getVendorTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Vendor{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return []models.MonthlyData{}, nil
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}


func (dr *DashboardRepository) getPaymentTrends() ([]models.MonthlyData, error) {
	var results []struct {
		Month string `json:"month"`
		Count int    `json:"count"`
	}
	
	err := dr.db.Model(&models.Payment{}).
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("created_at >= NOW() - INTERVAL '12 months'").
		Group("TO_CHAR(created_at, 'YYYY-MM')").
		Order("month").
		Scan(&results).Error
	if err != nil {
		return []models.MonthlyData{}, nil
	}

	var trends []models.MonthlyData
	for _, result := range results {
		trends = append(trends, models.MonthlyData{
			Month: result.Month,
			Value: result.Count,
		})
	}

	return trends, nil
}


func (dr *DashboardRepository) getChatTrends() ([]models.MonthlyData, error) {
	return []models.MonthlyData{}, nil
}

func (dr *DashboardRepository) getNotificationTrends() ([]models.MonthlyData, error) {
	return []models.MonthlyData{}, nil
}
