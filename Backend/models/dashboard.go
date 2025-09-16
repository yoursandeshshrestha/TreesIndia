package models

import (
	"time"
)

// DashboardOverview represents the complete dashboard overview data
type DashboardOverview struct {
	OverviewStats      OverviewStats      `json:"overview_stats"`
	UserAnalytics      UserAnalytics      `json:"user_analytics"`
	BookingAnalytics   BookingAnalytics   `json:"booking_analytics"`
	ServiceAnalytics   ServiceAnalytics   `json:"service_analytics"`
	MarketplaceAnalytics MarketplaceAnalytics `json:"marketplace_analytics"`
	FinancialAnalytics FinancialAnalytics `json:"financial_analytics"`
	CommunicationAnalytics CommunicationAnalytics `json:"communication_analytics"`
	SystemHealth       SystemHealth       `json:"system_health"`
	MonthlyTrends      MonthlyTrends      `json:"monthly_trends"`
}

// OverviewStats represents key overview statistics
type OverviewStats struct {
	TotalUsers        int     `json:"total_users"`
	TotalBookings     int     `json:"total_bookings"`
	TotalRevenue      float64 `json:"total_revenue"`
	ActiveServices    int     `json:"active_services"`
	TotalProperties   int     `json:"total_properties"`
	TotalProjects     int     `json:"total_projects"`
	TotalVendors      int     `json:"total_vendors"`
	TotalWorkers      int     `json:"total_workers"`
	TotalBrokers      int     `json:"total_brokers"`
	ActiveSubscriptions int   `json:"active_subscriptions"`
}

// UserAnalytics represents user-related analytics
type UserAnalytics struct {
	UserGrowth           []MonthlyData `json:"user_growth"`
	UserTypesDistribution map[string]int `json:"user_types_distribution"`
	RecentUsers          []User        `json:"recent_users"`
	ActiveUsers          int           `json:"active_users"`
	NewUsersThisMonth    int           `json:"new_users_this_month"`
	UserRetentionRate    float64       `json:"user_retention_rate"`
}

// BookingAnalytics represents booking-related analytics
type BookingAnalytics struct {
	BookingTrends        []MonthlyData `json:"booking_trends"`
	StatusBreakdown      map[string]int `json:"status_breakdown"`
	RecentBookings       []Booking     `json:"recent_bookings"`
	UrgentAlerts         []UrgentAlert `json:"urgent_alerts"`
	CompletionRate       float64       `json:"completion_rate"`
	AverageBookingValue  float64       `json:"average_booking_value"`
	BookingsThisMonth    int           `json:"bookings_this_month"`
}

// ServiceAnalytics represents service-related analytics
type ServiceAnalytics struct {
	PopularServices      []ServicePerformance `json:"popular_services"`
	CategoryPerformance  []CategoryPerformance `json:"category_performance"`
	ServiceAreas         []ServiceAreaData    `json:"service_areas"`
	ServiceTrends        []MonthlyData        `json:"service_trends"`
	AverageServiceRating float64              `json:"average_service_rating"`
}

// MarketplaceAnalytics represents marketplace-related analytics
type MarketplaceAnalytics struct {
	PropertyAnalytics PropertyAnalytics `json:"property_analytics"`
	ProjectAnalytics  ProjectAnalytics  `json:"project_analytics"`
	VendorAnalytics   VendorAnalytics   `json:"vendor_analytics"`
}

// PropertyAnalytics represents property-related analytics
type PropertyAnalytics struct {
	TotalProperties     int           `json:"total_properties"`
	ActiveListings      int           `json:"active_listings"`
	PropertiesThisMonth int           `json:"properties_this_month"`
	AveragePropertyPrice float64      `json:"average_property_price,omitempty"`
	PropertyTrends      []MonthlyData `json:"property_trends"`
}

// ProjectAnalytics represents project-related analytics
type ProjectAnalytics struct {
	TotalProjects      int           `json:"total_projects"`
	ActiveProjects     int           `json:"active_projects"`
	CompletedProjects  int           `json:"completed_projects,omitempty"`
	ProjectsThisMonth  int           `json:"projects_this_month"`
	ProjectTrends      []MonthlyData `json:"project_trends"`
}

// VendorAnalytics represents vendor-related analytics
type VendorAnalytics struct {
	TotalVendors       int           `json:"total_vendors"`
	ActiveVendors      int           `json:"active_vendors"`
	VendorsThisMonth   int           `json:"vendors_this_month"`
	AverageVendorRating float64      `json:"average_vendor_rating,omitempty"`
	VendorTrends       []MonthlyData `json:"vendor_trends"`
}

// FinancialAnalytics represents financial-related analytics
type FinancialAnalytics struct {
	RevenueTrends        []MonthlyData `json:"revenue_trends"`
	PaymentAnalytics     PaymentAnalytics `json:"payment_analytics"`
	SubscriptionAnalytics SubscriptionAnalytics `json:"subscription_analytics"`
	RevenueThisMonth     float64       `json:"revenue_this_month"`
	RevenueGrowth        float64       `json:"revenue_growth"`
}

// PaymentAnalytics represents payment-related analytics
type PaymentAnalytics struct {
	TotalTransactions    int           `json:"total_transactions"`
	SuccessfulPayments   int           `json:"successful_payments"`
	FailedPayments       int           `json:"failed_payments"`
	PaymentSuccessRate   float64       `json:"payment_success_rate"`
	PaymentMethodBreakdown map[string]int `json:"payment_method_breakdown"`
	PaymentTrends        []MonthlyData `json:"payment_trends"`
}

// SubscriptionAnalytics represents subscription-related analytics
type SubscriptionAnalytics struct {
	ActiveSubscriptions  int           `json:"active_subscriptions"`
	NewSubscriptions     int           `json:"new_subscriptions"`
	SubscriptionRevenue  float64       `json:"subscription_revenue"`
	ChurnRate            float64       `json:"churn_rate"`
	SubscriptionTrends   []MonthlyData `json:"subscription_trends"`
}

// CommunicationAnalytics represents communication-related analytics
type CommunicationAnalytics struct {
	ChatAnalytics        ChatAnalytics `json:"chat_analytics"`
	NotificationAnalytics NotificationAnalytics `json:"notification_analytics"`
}

// ChatAnalytics represents chat-related analytics
type ChatAnalytics struct {
	TotalChats           int           `json:"total_chats"`
	ActiveChats          int           `json:"active_chats"`
	AverageResponseTime  float64       `json:"average_response_time"`
	ChatTrends           []MonthlyData `json:"chat_trends"`
}

// NotificationAnalytics represents notification-related analytics
type NotificationAnalytics struct {
	TotalNotifications   int           `json:"total_notifications"`
	DeliveredNotifications int         `json:"delivered_notifications"`
	DeliveryRate         float64       `json:"delivery_rate"`
	NotificationTrends   []MonthlyData `json:"notification_trends"`
}

// SystemHealth represents system health metrics
type SystemHealth struct {
	SystemStatus      string  `json:"system_status"`
	ActiveSessions    int     `json:"active_sessions"`
	APIResponseTime   string  `json:"api_response_time"`
	DatabaseStatus    string  `json:"database_status"`
	Uptime            string  `json:"uptime"`
	ErrorRate         float64 `json:"error_rate"`
}

// MonthlyTrends represents monthly trend data for all metrics
type MonthlyTrends struct {
	Users           []MonthlyData `json:"users"`
	Bookings        []MonthlyData `json:"bookings"`
	Revenue         []MonthlyData `json:"revenue"`
	Services        []MonthlyData `json:"services"`
	Properties      []MonthlyData `json:"properties"`
	Projects        []MonthlyData `json:"projects"`
	Vendors         []MonthlyData `json:"vendors"`
	Payments        []MonthlyData `json:"payments"`
	Subscriptions   []MonthlyData `json:"subscriptions"`
	Chats           []MonthlyData `json:"chats"`
	Notifications   []MonthlyData `json:"notifications"`
}

// MonthlyData represents data for a specific month
type MonthlyData struct {
	Month  string  `json:"month"`  // Format: "2024-01"
	Value  int     `json:"value"`
	Amount float64 `json:"amount,omitempty"` // For revenue data
	Label  string  `json:"label,omitempty"`  // For display purposes
}

// ServicePerformance represents service performance metrics
type ServicePerformance struct {
	ServiceID    uint    `json:"service_id"`
	ServiceName  string  `json:"service_name"`
	TotalBookings int    `json:"total_bookings"`
	Revenue      float64 `json:"revenue"`
	Rating       float64 `json:"rating"`
	CompletionRate float64 `json:"completion_rate"`
}

// CategoryPerformance represents category performance metrics
type CategoryPerformance struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	TotalServices int    `json:"total_services"`
	TotalBookings int    `json:"total_bookings"`
	Revenue      float64 `json:"revenue"`
	Growth       float64 `json:"growth"`
}

// ServiceAreaData represents service area coverage data
type ServiceAreaData struct {
	AreaName     string `json:"area_name"`
	TotalBookings int   `json:"total_bookings"`
	ActiveWorkers int   `json:"active_workers"`
	Coverage     float64 `json:"coverage"`
}

// UrgentAlert represents urgent alerts for dashboard
type UrgentAlert struct {
	ID          uint      `json:"id"`
	Type        string    `json:"type"` // "booking", "payment", "system"
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	Priority    string    `json:"priority"` // "high", "medium", "low"
	CreatedAt   time.Time `json:"created_at"`
	ActionURL   string    `json:"action_url,omitempty"`
}

// DashboardStats represents simplified dashboard statistics
type DashboardStats struct {
	OverviewStats OverviewStats `json:"overview_stats"`
	MonthlyTrends MonthlyTrends `json:"monthly_trends"`
	RecentActivity []RecentActivity `json:"recent_activity"`
}

// DashboardAlerts represents dashboard alerts and notifications
type DashboardAlerts struct {
	UrgentAlerts    []UrgentAlert `json:"urgent_alerts"`
	SystemAlerts    []SystemAlert `json:"system_alerts"`
	PendingActions  []PendingAction `json:"pending_actions"`
}

// RecentActivity represents recent system activity
type RecentActivity struct {
	ID        uint      `json:"id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	UserID    uint      `json:"user_id,omitempty"`
	UserName  string    `json:"user_name,omitempty"`
}

// SystemAlert represents system-level alerts
type SystemAlert struct {
	ID        uint      `json:"id"`
	Type      string    `json:"type"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	Resolved  bool      `json:"resolved"`
}

// PendingAction represents pending actions requiring admin attention
type PendingAction struct {
	ID          uint      `json:"id"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    string    `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	ActionURL   string    `json:"action_url"`
}
