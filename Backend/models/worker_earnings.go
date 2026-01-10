package models

import "time"

// WorkerEarningsDashboardResponse represents the complete earnings dashboard data
type WorkerEarningsDashboardResponse struct {
	Summary            EarningsSummary     `json:"summary"`
	RecentAssignments  []RecentAssignment  `json:"recent_assignments"`
	WithdrawalSummary  *WithdrawalSummary  `json:"withdrawal_summary,omitempty"`
}

// EarningsSummary represents aggregated earnings metrics
type EarningsSummary struct {
	TotalEarnings        float64 `json:"total_earnings"`
	HoursWorked          float64 `json:"hours_worked"` // Total minutes / 60
	FixedServicesCount   int     `json:"fixed_services_count"`
	InquiryServicesCount int     `json:"inquiry_services_count"`
	TotalServices        int     `json:"total_services"`
	Period               string  `json:"period"` // "30_days", "90_days", "all_time"
}

// RecentAssignment represents a completed assignment with earnings
type RecentAssignment struct {
	ID               uint       `json:"id"`
	ServiceName      string     `json:"service_name"`
	CompletedAt      *time.Time `json:"completed_at"`
	Earnings         float64    `json:"earnings"`
	DurationMinutes  *int       `json:"duration_minutes"`
	DurationHours    *float64   `json:"duration_hours"` // Calculated from duration_minutes
	BookingReference string     `json:"booking_reference"`
	ServiceType      string     `json:"service_type"` // "fixed" or "inquiry"
}

// EarningsDashboardFilters represents filter options for the earnings dashboard
type EarningsDashboardFilters struct {
	Period string `json:"period" form:"period"` // "30_days", "90_days", "all_time"
}
