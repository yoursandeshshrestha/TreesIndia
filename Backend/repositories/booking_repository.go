package repositories

import (
	"encoding/json"
	"strings"
	"time"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type BookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository() *BookingRepository {
	return &BookingRepository{
		db: database.GetDB(),
	}
}

// GetDB returns the database connection
func (br *BookingRepository) GetDB() *gorm.DB {
	return br.db
}

// Create creates a new booking
func (br *BookingRepository) Create(booking *models.Booking) (*models.Booking, error) {
	err := br.db.Create(booking).Error
	if err != nil {
		return nil, err
	}
	return booking, nil
}

// GetByID gets a booking by ID
func (br *BookingRepository) GetByID(id uint) (*models.Booking, error) {
	var booking models.Booking
	err := br.db.Preload("User").Preload("Service").Preload("WorkerAssignment.Worker").Preload("WorkerAssignment.AssignedByUser").Preload("BufferRequests").Preload("PaymentSegments").First(&booking, id).Error
	if err != nil {
		return nil, err
	}
	
	// Manually load payment relationship (get all payments)
	paymentRepo := NewPaymentRepository()
	payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
		RelatedEntityType: "booking",
		RelatedEntityID:   &booking.ID,
	})
	if err == nil && len(payments) > 0 {
		// Set the most recent payment as the primary payment
		booking.Payment = &payments[0]
		// Store all payments in a custom field if needed
		// booking.AllPayments = payments
	}
	
	return &booking, nil
}

// Update updates a booking
func (br *BookingRepository) Update(booking *models.Booking) error {
	return br.db.Save(booking).Error
}

// GetUserBookings gets bookings for a user with filters
func (br *BookingRepository) GetUserBookings(userID uint, filters *UserBookingFilters) ([]models.Booking, *Pagination, error) {
	var bookings []models.Booking
	var total int64

	query := br.db.Where("user_id = ?", userID)

	// Apply filters
	if filters.Status != "" {
		// Handle comma-separated status values
		if strings.Contains(filters.Status, ",") {
			statuses := strings.Split(filters.Status, ",")
			// Trim whitespace from each status
			for i, status := range statuses {
				statuses[i] = strings.TrimSpace(status)
			}
			query = query.Where("status IN ?", statuses)
		} else {
			query = query.Where("status = ?", filters.Status)
		}
	}
	if filters.DateFrom != "" {
		query = query.Where("scheduled_date >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Where("scheduled_date <= ?", filters.DateTo)
	}

	// Count total
	err := query.Model(&models.Booking{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("Service").Preload("WorkerAssignment.Worker").Preload("WorkerAssignment.AssignedByUser").Preload("PaymentSegments")

	// Execute query
	err = query.Order("created_at DESC").Find(&bookings).Error
	if err != nil {
		return nil, nil, err
	}

	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}

	// Calculate pagination
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))
	pagination := &Pagination{
		Page:       filters.Page,
		Limit:      filters.Limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return bookings, pagination, nil
}

// GetBookingsWithFilters gets all bookings with admin filters
func (br *BookingRepository) GetBookingsWithFilters(filters *AdminBookingFilters) ([]models.Booking, *Pagination, error) {
	var bookings []models.Booking
	var total int64

	query := br.db

	// Apply filters
	if filters.Status != "" {
		// Handle comma-separated status values
		if strings.Contains(filters.Status, ",") {
			statuses := strings.Split(filters.Status, ",")
			// Trim whitespace from each status
			for i, status := range statuses {
				statuses[i] = strings.TrimSpace(status)
			}
			query = query.Where("status IN ?", statuses)
		} else {
			query = query.Where("status = ?", filters.Status)
		}
	}
	if filters.DateFrom != "" {
		query = query.Where("scheduled_date >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Where("scheduled_date <= ?", filters.DateTo)
	}
	if filters.ServiceID != "" {
		query = query.Where("service_id = ?", filters.ServiceID)
	}
	if filters.WorkerID != "" {
		query = query.Joins("JOIN worker_assignments ON bookings.id = worker_assignments.booking_id").
			Where("worker_assignments.worker_id = ?", filters.WorkerID)
	}
	if filters.PaymentStatus != "" {
		query = query.Where("payment_status = ?", filters.PaymentStatus)
	}
	if filters.Search != "" {
		query = query.Joins("JOIN users ON bookings.user_id = users.id").
			Where("users.name ILIKE ? OR users.phone ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	// Count total
	err := query.Model(&models.Booking{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("User").Preload("Service").Preload("WorkerAssignment.Worker").Preload("PaymentSegments")

	// Apply sorting
	if filters.Sort != "" {
		query = query.Order(filters.Sort)
	} else {
		query = query.Order("created_at DESC")
	}

	// Execute query
	err = query.Find(&bookings).Error
	if err != nil {
		return nil, nil, err
	}

	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}

	// Calculate pagination
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))
	pagination := &Pagination{
		Page:       filters.Page,
		Limit:      filters.Limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return bookings, pagination, nil
}

// GetConflictingBookings gets bookings that conflict with the given time slot
func (br *BookingRepository) GetConflictingBookings(startTime time.Time, endTime time.Time) ([]models.Booking, error) {
	var bookings []models.Booking
	
	// Find bookings that overlap with the given time slot
	// Only consider confirmed, assigned, or in-progress bookings
	err := br.db.Where(
		"status IN (?, ?, ?) AND scheduled_time < ? AND scheduled_end_time > ?",
		models.BookingStatusConfirmed,
		models.BookingStatusAssigned,
		models.BookingStatusInProgress,
		endTime,
		startTime,
	).Find(&bookings).Error
	
	if err != nil {
		return nil, err
	}
	
	return bookings, nil
}

// GetExpiredTemporaryHolds gets expired temporary holds
func (br *BookingRepository) GetExpiredTemporaryHolds() ([]models.Booking, error) {
	var bookings []models.Booking
	err := br.db.Where("status = ? AND hold_expires_at < ?", models.BookingStatusTemporaryHold, time.Now()).Find(&bookings).Error
	return bookings, err
}

// GetConfirmedBookingsForDate gets confirmed bookings for a specific date
func (br *BookingRepository) GetConfirmedBookingsForDate(date time.Time) ([]models.Booking, error) {
	var bookings []models.Booking
	err := br.db.Where("DATE(scheduled_date) = ? AND status IN (?)", 
		date.Format("2006-01-02"), 
		[]string{string(models.BookingStatusConfirmed), string(models.BookingStatusAssigned)}).
		Find(&bookings).Error
	return bookings, err
}

// GetBookingStats gets comprehensive booking statistics
func (br *BookingRepository) GetBookingStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Overview statistics
	overview, err := br.getOverviewStats()
	if err != nil {
		return nil, err
	}
	stats["overview"] = overview
	
	// Status breakdown
	statusBreakdown, err := br.getStatusBreakdown()
	if err != nil {
		return nil, err
	}
	stats["status_breakdown"] = statusBreakdown
	
	// Revenue analytics
	revenueAnalytics, err := br.getRevenueAnalytics()
	if err != nil {
		return nil, err
	}
	stats["revenue_analytics"] = revenueAnalytics
	
	// Performance metrics
	performanceMetrics, err := br.getPerformanceMetrics()
	if err != nil {
		return nil, err
	}
	stats["performance_metrics"] = performanceMetrics
	
	// Trends
	trends, err := br.getTrends()
	if err != nil {
		return nil, err
	}
	stats["trends"] = trends
	
	// Alerts
	alerts, err := br.getAlerts()
	if err != nil {
		return nil, err
	}
	stats["alerts"] = alerts
	
	return stats, nil
}

// getOverviewStats gets basic overview statistics
func (br *BookingRepository) getOverviewStats() (map[string]interface{}, error) {
	var totalBookings int64
	var totalRevenue float64
	var activeWorkers int64
	
	// Total bookings
	err := br.db.Model(&models.Booking{}).Count(&totalBookings).Error
	if err != nil {
		return nil, err
	}
	
	// Total revenue from all completed payments (consistent with revenue analytics)
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ?", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(SUM(payments.amount), 0)").Scan(&totalRevenue).Error
	if err != nil {
		return nil, err
	}
	
	// Active workers (users with worker type who are active)
	err = br.db.Model(&models.User{}).
		Where("user_type = ? AND is_active = ?", models.UserTypeWorker, true).
		Count(&activeWorkers).Error
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"total_bookings": totalBookings,
		"total_revenue":  totalRevenue,
		"active_workers": activeWorkers,
	}, nil
}

// getStatusBreakdown gets booking counts by status
func (br *BookingRepository) getStatusBreakdown() (map[string]interface{}, error) {
	var result []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	
	err := br.db.Model(&models.Booking{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	
	statusBreakdown := make(map[string]interface{})
	for _, item := range result {
		statusBreakdown[item.Status] = item.Count
	}
	
	// Ensure all statuses are present with 0 count if not found
	allStatuses := []string{
		string(models.BookingStatusPending),
		string(models.BookingStatusQuoteProvided),
		string(models.BookingStatusQuoteAccepted),
		string(models.BookingStatusConfirmed),
		string(models.BookingStatusScheduled),
		string(models.BookingStatusAssigned),
		string(models.BookingStatusInProgress),
		string(models.BookingStatusCompleted),
		string(models.BookingStatusCancelled),
		string(models.BookingStatusRejected),
	}
	
	for _, status := range allStatuses {
		if _, exists := statusBreakdown[status]; !exists {
			statusBreakdown[status] = int64(0)
		}
	}
	
	return statusBreakdown, nil
}

// getRevenueAnalytics gets revenue-related statistics
func (br *BookingRepository) getRevenueAnalytics() (map[string]interface{}, error) {
	var totalRevenue, monthlyRevenue, weeklyRevenue, dailyRevenue, avgBookingValue float64
	
	// Total revenue
	err := br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ?", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(SUM(payments.amount), 0)").Scan(&totalRevenue).Error
	if err != nil {
		return nil, err
	}
	
	// Monthly revenue (current month)
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ? AND DATE_TRUNC('month', payments.created_at) = DATE_TRUNC('month', CURRENT_DATE)", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(SUM(payments.amount), 0)").Scan(&monthlyRevenue).Error
	if err != nil {
		return nil, err
	}
	
	// Weekly revenue (current week)
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ? AND DATE_TRUNC('week', payments.created_at) = DATE_TRUNC('week', CURRENT_DATE)", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(SUM(payments.amount), 0)").Scan(&weeklyRevenue).Error
	if err != nil {
		return nil, err
	}
	
	// Daily revenue (today)
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ? AND DATE(payments.created_at) = CURRENT_DATE", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(SUM(payments.amount), 0)").Scan(&dailyRevenue).Error
	if err != nil {
		return nil, err
	}
	
	// Average booking value
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ?", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("COALESCE(AVG(payments.amount), 0)").Scan(&avgBookingValue).Error
	if err != nil {
		return nil, err
	}
	
	// Get last 7 days revenue data for charts
	last7DaysRevenue, err := br.getLast7DaysRevenue()
	if err != nil {
		return nil, err
	}
	
	// Get last 12 months revenue data for charts
	last12MonthsRevenue, err := br.getLast12MonthsRevenue()
	if err != nil {
		return nil, err
	}
	
	// Get revenue by booking status
	revenueByStatus, err := br.getRevenueByStatus()
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"total":              totalRevenue,
		"monthly":            monthlyRevenue,
		"weekly":             weeklyRevenue,
		"daily":              dailyRevenue,
		"average_per_booking": avgBookingValue,
		"last_7_days":        last7DaysRevenue,
		"last_12_months":     last12MonthsRevenue,
		"by_status":          revenueByStatus,
	}, nil
}

// getPerformanceMetrics gets performance-related statistics
func (br *BookingRepository) getPerformanceMetrics() (map[string]interface{}, error) {
	var avgCompletionTime, avgResponseTime float64
	var totalWorkers, activeWorkers int64
	
	// Average completion time (in minutes)
	err := br.db.Model(&models.Booking{}).
		Where("status = ? AND actual_duration_minutes IS NOT NULL", models.BookingStatusCompleted).
		Select("COALESCE(AVG(actual_duration_minutes), 0)").Scan(&avgCompletionTime).Error
	if err != nil {
		return nil, err
	}
	
	// Total workers
	err = br.db.Model(&models.User{}).
		Where("user_type = ?", models.UserTypeWorker).
		Count(&totalWorkers).Error
	if err != nil {
		return nil, err
	}
	
	// Active workers
	err = br.db.Model(&models.User{}).
		Where("user_type = ? AND is_active = ?", models.UserTypeWorker, true).
		Count(&activeWorkers).Error
	if err != nil {
		return nil, err
	}
	
	// Calculate worker utilization rate
	utilizationRate := 0.0
	if totalWorkers > 0 {
		utilizationRate = float64(activeWorkers) / float64(totalWorkers)
	}
	
	// Average response time (time from booking creation to first assignment)
	err = br.db.Model(&models.Booking{}).
		Joins("JOIN worker_assignments ON bookings.id = worker_assignments.booking_id").
		Where("worker_assignments.assigned_at IS NOT NULL").
		Select("COALESCE(AVG(EXTRACT(EPOCH FROM (worker_assignments.assigned_at - bookings.created_at)) / 60), 0)").
		Scan(&avgResponseTime).Error
	if err != nil {
		// If no assignments found, set to 0
		avgResponseTime = 0
	}
	
	return map[string]interface{}{
		"average_completion_time_minutes": avgCompletionTime,
		"average_response_time_minutes":   avgResponseTime,
		"total_workers":                   totalWorkers,
		"active_workers":                  activeWorkers,
		"worker_utilization_rate":         utilizationRate,
	}, nil
}

// getTrends gets trend-related statistics
func (br *BookingRepository) getTrends() (map[string]interface{}, error) {
	var todayBookings, thisWeekBookings, thisMonthBookings int64
	
	// Today's bookings
	err := br.db.Model(&models.Booking{}).
		Where("DATE(created_at) = CURRENT_DATE").
		Count(&todayBookings).Error
	if err != nil {
		return nil, err
	}
	
	// This week's bookings
	err = br.db.Model(&models.Booking{}).
		Where("DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE)").
		Count(&thisWeekBookings).Error
	if err != nil {
		return nil, err
	}
	
	// This month's bookings
	err = br.db.Model(&models.Booking{}).
		Where("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)").
		Count(&thisMonthBookings).Error
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"bookings_today":     todayBookings,
		"bookings_this_week": thisWeekBookings,
		"bookings_this_month": thisMonthBookings,
	}, nil
}

// getAlerts gets alert-related statistics
func (br *BookingRepository) getAlerts() (map[string]interface{}, error) {
	var expiringHolds, paymentPending, unassignedBookings, overdueBookings int64
	
	// Expiring holds (holds that expire in the next hour)
	err := br.db.Model(&models.Booking{}).
		Where("status = ? AND hold_expires_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour'", 
			models.BookingStatusPending).
		Count(&expiringHolds).Error
	if err != nil {
		return nil, err
	}
	
	// Payment pending bookings
	err = br.db.Model(&models.Booking{}).
		Where("payment_status = ?", models.PaymentStatusPending).
		Count(&paymentPending).Error
	if err != nil {
		return nil, err
	}
	
	// Unassigned bookings (confirmed but no worker assigned)
	err = br.db.Model(&models.Booking{}).
		Where("status = ? AND id NOT IN (SELECT booking_id FROM worker_assignments)", 
			models.BookingStatusConfirmed).
		Count(&unassignedBookings).Error
	if err != nil {
		return nil, err
	}
	
	// Overdue bookings (scheduled time passed but not completed)
	err = br.db.Model(&models.Booking{}).
		Where("status IN (?, ?) AND scheduled_time < NOW()", 
			models.BookingStatusConfirmed, models.BookingStatusAssigned).
		Count(&overdueBookings).Error
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"expiring_holds":      expiringHolds,
		"payment_pending":     paymentPending,
		"unassigned_bookings": unassignedBookings,
		"overdue_bookings":    overdueBookings,
	}, nil
}

// GetRecentBookings gets recent bookings for dashboard
func (br *BookingRepository) GetRecentBookings(limit int) ([]models.OptimizedBookingResponse, error) {
	var bookings []models.Booking
	
	err := br.db.Preload("User").Preload("Service").Preload("WorkerAssignment.Worker").Preload("WorkerAssignment.AssignedByUser").
		Order("created_at DESC").
		Limit(limit).
		Find(&bookings).Error
	if err != nil {
		return nil, err
	}
	
	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}
	
	// Convert to optimized response
	var optimizedBookings []models.OptimizedBookingResponse
	for _, booking := range bookings {
		optimizedBooking := br.convertToOptimizedResponse(&booking)
		optimizedBookings = append(optimizedBookings, *optimizedBooking)
	}
	
	return optimizedBookings, nil
}

// GetUrgentAlerts gets urgent alerts for dashboard
func (br *BookingRepository) GetUrgentAlerts() ([]models.OptimizedBookingResponse, error) {
	var bookings []models.Booking
	
	// Get bookings that need immediate attention
	err := br.db.Preload("User").Preload("Service").Preload("WorkerAssignment.Worker").Preload("WorkerAssignment.AssignedByUser").
		Where("(status = ? AND hold_expires_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour') OR "+
			"(payment_status = ?) OR "+
			"(status = ? AND id NOT IN (SELECT booking_id FROM worker_assignments)) OR "+
			"(status IN (?, ?) AND scheduled_time < NOW())",
			models.BookingStatusPending,
			models.PaymentStatusPending,
			models.BookingStatusConfirmed,
			models.BookingStatusConfirmed, models.BookingStatusAssigned).
		Order("created_at ASC").
		Limit(10).
		Find(&bookings).Error
	if err != nil {
		return nil, err
	}
	
	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}
	
	// Convert to optimized response
	var optimizedBookings []models.OptimizedBookingResponse
	for _, booking := range bookings {
		optimizedBooking := br.convertToOptimizedResponse(&booking)
		optimizedBookings = append(optimizedBookings, *optimizedBooking)
	}
	
	return optimizedBookings, nil
}

// convertToOptimizedResponse converts a booking to optimized response format
func (br *BookingRepository) convertToOptimizedResponse(booking *models.Booking) *models.OptimizedBookingResponse {
	// Parse address if it exists
	var address *models.BookingAddress
	if booking.Address != nil {
		json.Unmarshal([]byte(*booking.Address), &address)
	}
	
	// Get payment info
	var payment *models.OptimizedPaymentInfo
	if booking.Payment != nil {
		payment = &models.OptimizedPaymentInfo{
			Amount:   booking.Payment.Amount,
			Status:   string(booking.Payment.Status),
			Currency: booking.Payment.Currency,
		}
	} else {
		// Manually load payment if not preloaded (get all payments)
		paymentRepo := NewPaymentRepository()
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &booking.ID,
		})
		if err != nil || len(payments) == 0 {
			logrus.Infof("No payment found for booking %d (repo): %v", booking.ID, err)
		} else {
			// Set the most recent payment as the primary payment
			paymentRecord := &payments[0]
			logrus.Infof("Found payment for booking %d (repo): amount=%f, status=%s", booking.ID, paymentRecord.Amount, paymentRecord.Status)
			payment = &models.OptimizedPaymentInfo{
				Amount:   paymentRecord.Amount,
				Status:   string(paymentRecord.Status),
				Currency: paymentRecord.Currency,
			}
		}
	}
	
	// Get worker assignment info
	var workerAssignment *models.OptimizedWorkerAssignment
	if booking.WorkerAssignment != nil {
		workerAssignment = &models.OptimizedWorkerAssignment{
			WorkerID:   &booking.WorkerAssignment.WorkerID,
			Status:     (*string)(&booking.WorkerAssignment.Status),
		}

		// Add worker details if available
		if booking.WorkerAssignment.Worker.ID != 0 {
			workerAssignment.Worker = &models.OptimizedUserInfo{
				ID:       booking.WorkerAssignment.Worker.ID,
				Name:     booking.WorkerAssignment.Worker.Name,
				Phone:    booking.WorkerAssignment.Worker.Phone,
				UserType: string(booking.WorkerAssignment.Worker.UserType),
			}
		}
	}
	
	return &models.OptimizedBookingResponse{
		ID:                    booking.ID,
		BookingReference:      booking.BookingReference,
		Status:                booking.Status,
		BookingType:           booking.BookingType,
		ScheduledDate:         booking.ScheduledDate,
		ScheduledTime:         booking.ScheduledTime,
		ScheduledEndTime:      booking.ScheduledEndTime,
		ActualStartTime:       booking.ActualStartTime,
		ActualEndTime:         booking.ActualEndTime,
		ActualDurationMinutes: booking.ActualDurationMinutes,
		HoldExpiresAt:         booking.HoldExpiresAt,
		CreatedAt:             booking.CreatedAt,
		UpdatedAt:             booking.UpdatedAt,
		Service: &models.OptimizedServiceInfo{
			ID:        booking.Service.ID,
			Name:      booking.Service.Name,
			PriceType: booking.Service.PriceType,
			Price:     booking.Service.Price,
			Duration:  booking.Service.Duration,
		},
		User: &models.OptimizedUserInfo{
			ID:       booking.User.ID,
			Name:     booking.User.Name,
			Phone:    booking.User.Phone,
			UserType: string(booking.User.UserType),
		},
		Address: address,
		Contact: &models.OptimizedContactInfo{
			Person:              booking.ContactPerson,
			Phone:               booking.ContactPhone,
			SpecialInstructions: booking.SpecialInstructions,
		},
		Payment:          payment,
		PaymentProgress:  booking.PaymentProgress,
		WorkerAssignment: workerAssignment,
	}
}

// UserBookingFilters represents filters for user bookings
type UserBookingFilters struct {
	Status   string `json:"status"`
	DateFrom string `json:"date_from"`
	DateTo   string `json:"date_to"`
	Page     int    `json:"page"`
	Limit    int    `json:"limit"`
}

// AdminBookingFilters represents filters for admin bookings
type AdminBookingFilters struct {
	Status        string `json:"status"`
	DateFrom      string `json:"date_from"`
	DateTo        string `json:"date_to"`
	ServiceID     string `json:"service_id"`
	WorkerID      string `json:"worker_id"`
	PaymentStatus string `json:"payment_status"`
	Search        string `json:"search"`
	Page          int    `json:"page"`
	Limit         int    `json:"limit"`
	Sort          string `json:"sort"`
}

// InquiryBookingFilters represents filters for inquiry bookings
type InquiryBookingFilters struct {
	Status        string `json:"status"`
	DateFrom      string `json:"date_from"`
	DateTo        string `json:"date_to"`
	ServiceID     string `json:"service_id"`
	UserID        string `json:"user_id"`
	HasQuote      *bool  `json:"has_quote"`
	QuoteExpired  *bool  `json:"quote_expired"`
	Search        string `json:"search"`
	Page          int    `json:"page"`
	Limit         int    `json:"limit"`
	Sort          string `json:"sort"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// getLast7DaysRevenue gets revenue data for the last 7 days
func (br *BookingRepository) getLast7DaysRevenue() ([]map[string]interface{}, error) {
	var result []struct {
		Date     string  `json:"date"`
		Revenue  float64 `json:"revenue"`
		Bookings int64   `json:"bookings"`
	}
	
	err := br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ? AND payments.created_at >= CURRENT_DATE - INTERVAL '7 days'", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("DATE(payments.created_at) as date, COALESCE(SUM(payments.amount), 0) as revenue, COUNT(DISTINCT bookings.id) as bookings").
		Group("DATE(payments.created_at)").
		Order("date").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	
	// Convert to map format for frontend
	revenueData := make([]map[string]interface{}, len(result))
	for i, item := range result {
		revenueData[i] = map[string]interface{}{
			"date":     item.Date,
			"revenue":  item.Revenue,
			"bookings": item.Bookings,
		}
	}
	
	return revenueData, nil
}

// getLast12MonthsRevenue gets revenue data for the last 12 months
func (br *BookingRepository) getLast12MonthsRevenue() ([]map[string]interface{}, error) {
	var result []struct {
		Month    string  `json:"month"`
		Revenue  float64 `json:"revenue"`
		Bookings int64   `json:"bookings"`
	}
	
	err := br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ? AND payments.created_at >= CURRENT_DATE - INTERVAL '12 months'", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("TO_CHAR(DATE_TRUNC('month', payments.created_at), 'YYYY-MM') as month, COALESCE(SUM(payments.amount), 0) as revenue, COUNT(DISTINCT bookings.id) as bookings").
		Group("DATE_TRUNC('month', payments.created_at)").
		Order("month").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	
	// Convert to map format for frontend
	revenueData := make([]map[string]interface{}, len(result))
	for i, item := range result {
		revenueData[i] = map[string]interface{}{
			"month":    item.Month,
			"revenue":  item.Revenue,
			"bookings": item.Bookings,
		}
	}
	
	return revenueData, nil
}

// getRevenueByStatus gets revenue breakdown by booking status
func (br *BookingRepository) getRevenueByStatus() (map[string]interface{}, error) {
	var result []struct {
		Status  string  `json:"status"`
		Revenue float64 `json:"revenue"`
		Count   int64   `json:"count"`
	}
	
	err := br.db.Model(&models.Booking{}).
		Joins("JOIN payments ON bookings.id = payments.related_entity_id").
		Where("payments.status = ? AND payments.type = ?", 
			models.PaymentStatusCompleted, models.PaymentTypeBooking).
		Select("bookings.status, COALESCE(SUM(payments.amount), 0) as revenue, COUNT(DISTINCT bookings.id) as count").
		Group("bookings.status").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	
	// Convert to map format for frontend
	revenueByStatus := make(map[string]interface{})
	for _, item := range result {
		revenueByStatus[item.Status] = map[string]interface{}{
			"revenue": item.Revenue,
			"count":   item.Count,
		}
	}
	
	return revenueByStatus, nil
}

// GetInquiryBookings gets inquiry bookings with filters
func (br *BookingRepository) GetInquiryBookings(filters *InquiryBookingFilters) ([]models.Booking, *Pagination, error) {
	var bookings []models.Booking
	var total int64

	query := br.db.Where("booking_type = ?", models.BookingTypeInquiry)

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.DateFrom != "" {
		query = query.Where("created_at >= ?", filters.DateFrom)
	}
	if filters.DateTo != "" {
		query = query.Where("created_at <= ?", filters.DateTo)
	}
	if filters.ServiceID != "" {
		query = query.Where("service_id = ?", filters.ServiceID)
	}
	if filters.UserID != "" {
		query = query.Where("user_id = ?", filters.UserID)
	}
	if filters.HasQuote != nil {
		if *filters.HasQuote {
			query = query.Where("quote_amount IS NOT NULL")
		} else {
			query = query.Where("quote_amount IS NULL")
		}
	}
	if filters.QuoteExpired != nil {
		if *filters.QuoteExpired {
			query = query.Where("quote_expires_at IS NOT NULL AND quote_expires_at < NOW()")
		} else {
			query = query.Where("(quote_expires_at IS NULL OR quote_expires_at >= NOW())")
		}
	}
	if filters.Search != "" {
		searchTerm := "%" + filters.Search + "%"
		query = query.Where("description ILIKE ? OR contact_person ILIKE ?", searchTerm, searchTerm)
	}

	// Count total
	err := query.Model(&models.Booking{}).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.Limit
	query = query.Offset(offset).Limit(filters.Limit)

	// Preload relationships
	query = query.Preload("User").Preload("Service").Preload("WorkerAssignment.Worker")

	// Apply sorting
	if filters.Sort != "" {
		query = query.Order(filters.Sort)
	} else {
		query = query.Order("created_at DESC")
	}

	// Execute query
	err = query.Find(&bookings).Error
	if err != nil {
		return nil, nil, err
	}

	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}

	// Calculate pagination
	totalPages := int((total + int64(filters.Limit) - 1) / int64(filters.Limit))
	pagination := &Pagination{
		Page:       filters.Page,
		Limit:      filters.Limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return bookings, pagination, nil
}

// GetExpiredQuotes gets all quotes that have expired
func (br *BookingRepository) GetExpiredQuotes() ([]models.Booking, error) {
	var bookings []models.Booking

	err := br.db.Where("booking_type = ? AND status = ? AND quote_expires_at IS NOT NULL AND quote_expires_at < NOW()", 
		models.BookingTypeInquiry, models.BookingStatusQuoteProvided).
		Preload("User").Preload("Service").
		Find(&bookings).Error

	if err != nil {
		return nil, err
	}

	// Manually load payment relationships (get all payments for each booking)
	paymentRepo := NewPaymentRepository()
	for i := range bookings {
		payments, _, err := paymentRepo.GetPayments(&models.PaymentFilters{
			RelatedEntityType: "booking",
			RelatedEntityID:   &bookings[i].ID,
		})
		if err == nil && len(payments) > 0 {
			bookings[i].Payment = &payments[0]
		}
	}

	return bookings, nil
}
