package repositories

import (
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type WorkerEarningsRepository struct {
	db *gorm.DB
}

func NewWorkerEarningsRepository() *WorkerEarningsRepository {
	return &WorkerEarningsRepository{
		db: database.GetDB(),
	}
}

// GetEarningsSummary calculates aggregated earnings metrics for a worker
// Only includes completed assignments from single-segment bookings (multi-segment bookings have no worker_assignments)
func (wer *WorkerEarningsRepository) GetEarningsSummary(workerID uint, startDate *time.Time) (*models.EarningsSummary, error) {
	var summary struct {
		TotalEarnings        float64
		TotalMinutes         *int64
		FixedServicesCount   int64
		InquiryServicesCount int64
	}

	query := wer.db.Table("worker_assignments").
		Select(`
			COALESCE(SUM(
				CASE
					WHEN bookings.quote_amount IS NOT NULL THEN bookings.quote_amount
					ELSE services.price
				END
			), 0) as total_earnings,
			SUM(bookings.actual_duration_minutes) as total_minutes,
			COUNT(CASE WHEN services.price_type = 'fixed' THEN 1 END) as fixed_services_count,
			COUNT(CASE WHEN services.price_type = 'inquiry' THEN 1 END) as inquiry_services_count
		`).
		Joins("INNER JOIN bookings ON bookings.id = worker_assignments.booking_id").
		Joins("INNER JOIN services ON services.id = bookings.service_id").
		Where("worker_assignments.worker_id = ?", workerID).
		Where("worker_assignments.status = ?", "completed").
		Where("worker_assignments.deleted_at IS NULL").
		Where("bookings.deleted_at IS NULL")

	// Apply time filter if provided
	if startDate != nil {
		query = query.Where("worker_assignments.completed_at >= ?", startDate)
	}

	if err := query.Scan(&summary).Error; err != nil {
		return nil, err
	}

	// Calculate hours worked
	hoursWorked := 0.0
	if summary.TotalMinutes != nil && *summary.TotalMinutes > 0 {
		hoursWorked = float64(*summary.TotalMinutes) / 60.0
	}

	return &models.EarningsSummary{
		TotalEarnings:        summary.TotalEarnings,
		HoursWorked:          hoursWorked,
		FixedServicesCount:   int(summary.FixedServicesCount),
		InquiryServicesCount: int(summary.InquiryServicesCount),
		TotalServices:        int(summary.FixedServicesCount + summary.InquiryServicesCount),
	}, nil
}

// GetRecentAssignments retrieves recent completed assignments with earnings
func (wer *WorkerEarningsRepository) GetRecentAssignments(workerID uint, startDate *time.Time, limit int) ([]models.RecentAssignment, error) {
	var assignments []struct {
		ID               uint
		ServiceName      string
		CompletedAt      *time.Time
		QuoteAmount      *float64
		ServicePrice     *float64
		DurationMinutes  *int
		BookingReference string
		PriceType        string
	}

	query := wer.db.Table("worker_assignments").
		Select(`
			worker_assignments.id,
			services.name as service_name,
			worker_assignments.completed_at,
			bookings.quote_amount,
			services.price as service_price,
			bookings.actual_duration_minutes as duration_minutes,
			bookings.booking_reference,
			services.price_type
		`).
		Joins("INNER JOIN bookings ON bookings.id = worker_assignments.booking_id").
		Joins("INNER JOIN services ON services.id = bookings.service_id").
		Where("worker_assignments.worker_id = ?", workerID).
		Where("worker_assignments.status = ?", "completed").
		Where("worker_assignments.deleted_at IS NULL").
		Where("bookings.deleted_at IS NULL").
		Order("worker_assignments.completed_at DESC")

	// Apply time filter if provided
	if startDate != nil {
		query = query.Where("worker_assignments.completed_at >= ?", startDate)
	}

	// Apply limit (default 10)
	if limit > 0 {
		query = query.Limit(limit)
	} else {
		query = query.Limit(10)
	}

	if err := query.Scan(&assignments).Error; err != nil {
		return nil, err
	}

	// Convert to response model
	recentAssignments := make([]models.RecentAssignment, len(assignments))
	for i, a := range assignments {
		// Calculate earnings: use quote_amount if available (inquiry bookings), else use service price (fixed bookings)
		earnings := 0.0
		if a.QuoteAmount != nil {
			earnings = *a.QuoteAmount
		} else if a.ServicePrice != nil {
			earnings = *a.ServicePrice
		}

		var durationHours *float64
		if a.DurationMinutes != nil && *a.DurationMinutes > 0 {
			hours := float64(*a.DurationMinutes) / 60.0
			durationHours = &hours
		}

		recentAssignments[i] = models.RecentAssignment{
			ID:               a.ID,
			ServiceName:      a.ServiceName,
			CompletedAt:      a.CompletedAt,
			Earnings:         earnings,
			DurationMinutes:  a.DurationMinutes,
			DurationHours:    durationHours,
			BookingReference: a.BookingReference,
			ServiceType:      a.PriceType,
		}
	}

	return recentAssignments, nil
}

// CalculateStartDate converts period string to a start date timestamp
func CalculateStartDate(period string) *time.Time {
	now := time.Now()
	var startDate time.Time

	switch period {
	case "30_days":
		startDate = now.AddDate(0, 0, -30)
	case "90_days":
		startDate = now.AddDate(0, 0, -90)
	case "all_time":
		return nil // No filter
	default:
		return nil
	}

	return &startDate
}
