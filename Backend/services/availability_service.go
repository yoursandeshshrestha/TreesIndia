package services

import (
	"fmt"
	"strconv"
	"time"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"
)

type AvailabilityService struct {
	adminConfigRepo *repositories.AdminConfigRepository
	serviceRepo     *repositories.ServiceRepository
	bookingRepo     *repositories.BookingRepository
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	userRepo        *repositories.UserRepository
}

func NewAvailabilityService() *AvailabilityService {
	return &AvailabilityService{
		adminConfigRepo: repositories.NewAdminConfigRepository(),
		serviceRepo:     repositories.NewServiceRepository(),
		bookingRepo:     repositories.NewBookingRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		userRepo:        repositories.NewUserRepository(),
	}
}

// AvailableSlot represents a time slot with availability information
type AvailableSlot struct {
	Time             string `json:"time"`
	AvailableWorkers int    `json:"available_workers"`
	IsAvailable      bool   `json:"is_available"`
}

// AvailabilityResponse represents the response for available slots
type AvailabilityResponse struct {
	WorkingHours    map[string]string    `json:"working_hours"`
	ServiceDuration int                  `json:"service_duration"`
	BufferTime      int                  `json:"buffer_time"`
	AvailableSlots  []AvailableSlot      `json:"available_slots"`
}

// GetAvailableSlots calculates available time slots for a service on a given date
func (as *AvailabilityService) GetAvailableSlots(serviceID uint, date string) (*AvailabilityResponse, error) {
	// 1. Get service details
	service, err := as.serviceRepo.GetByID(serviceID)
	if err != nil {
		return nil, fmt.Errorf("service not found: %v", err)
	}

	// 2. Get working hours from admin config
	startTimeConfig, err := as.adminConfigRepo.GetByKey("working_hours_start")
	if err != nil {
		startTimeConfig = &models.AdminConfig{Value: "09:00"} // Default 9 AM
	}
	
	endTimeConfig, err := as.adminConfigRepo.GetByKey("working_hours_end")
	if err != nil {
		endTimeConfig = &models.AdminConfig{Value: "22:00"} // Default 10 PM
	}

	// 3. Get buffer time
	bufferTimeConfig, err := as.adminConfigRepo.GetByKey("booking_buffer_time_minutes")
	if err != nil {
		bufferTimeConfig = &models.AdminConfig{Value: "30"} // Default 30 minutes
	}
	
	bufferTimeMinutes, err := strconv.Atoi(bufferTimeConfig.Value)
	if err != nil {
		bufferTimeMinutes = 30
	}

	// 4. Calculate service duration
	var serviceDurationMinutes int
	if service.Duration != nil && *service.Duration != "" {
		duration, err := utils.ParseDuration(*service.Duration)
		if err != nil {
			return nil, fmt.Errorf("invalid service duration: %v", err)
		}
		serviceDurationMinutes = duration.ToMinutes()
	} else {
		serviceDurationMinutes = 120 // Default 2 hours
	}

	// 5. Get all worker assignments for the date (single optimized query)
	workerAssignments, err := as.getWorkerAssignmentsForDate(date)
	if err != nil {
		return nil, fmt.Errorf("failed to get worker assignments: %v", err)
	}

	// 6. Get total active workers
	totalWorkers, err := as.getTotalActiveWorkers()
	if err != nil {
		return nil, fmt.Errorf("failed to get total workers: %v", err)
	}

	// 7. Calculate available slots
	availableSlots := as.calculateAvailableSlots(
		date,
		startTimeConfig.Value,
		endTimeConfig.Value,
		serviceDurationMinutes,
		bufferTimeMinutes,
		workerAssignments,
		totalWorkers,
	)

	// 8. Build response
	response := &AvailabilityResponse{
		WorkingHours: map[string]string{
			"start": startTimeConfig.Value,
			"end":   endTimeConfig.Value,
		},
		ServiceDuration: serviceDurationMinutes,
		BufferTime:      bufferTimeMinutes,
		AvailableSlots:  availableSlots,
	}

	return response, nil
}

// getWorkerAssignmentsForDate gets all worker assignments for a specific date
func (as *AvailabilityService) getWorkerAssignmentsForDate(date string) ([]models.WorkerAssignment, error) {
	var assignments []models.WorkerAssignment
	
	// Query all worker assignments for the given date
	err := as.workerAssignmentRepo.GetDB().Joins("JOIN bookings ON worker_assignments.booking_id = bookings.id").
		Where("DATE(bookings.scheduled_date) = ? AND worker_assignments.status IN (?)", date, []string{"assigned", "accepted", "in_progress"}).
		Preload("Booking").
		Find(&assignments).Error

	return assignments, err
}

// getTotalActiveWorkers gets the total number of active workers
func (as *AvailabilityService) getTotalActiveWorkers() (int, error) {
	var workers []models.User
	err := as.userRepo.FindByUserType(&workers, models.UserTypeWorker)
	if err != nil {
		return 0, err
	}

	activeCount := 0
	for _, worker := range workers {
		if worker.IsActive {
			activeCount++
		}
	}

	return activeCount, nil
}

// calculateAvailableSlots calculates available slots based on worker assignments
func (as *AvailabilityService) calculateAvailableSlots(
	date, startTimeStr, endTimeStr string,
	serviceDurationMinutes, bufferTimeMinutes int,
	workerAssignments []models.WorkerAssignment,
	totalWorkers int,
) []AvailableSlot {
	
	// Parse working hours
	startTime, _ := time.Parse("15:04", startTimeStr)
	endTime, _ := time.Parse("15:04", endTimeStr)
	
	// Use IST timezone
	istLocation, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		istLocation = time.FixedZone("IST", 5*60*60+30*60)
	}

	// Parse the date
	parsedDate, _ := time.Parse("2006-01-02", date)
	
	// Calculate latest possible booking time
	totalDurationMinutes := serviceDurationMinutes + bufferTimeMinutes
	latestBookingTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 
		endTime.Hour(), endTime.Minute(), 0, 0, istLocation).Add(-time.Duration(totalDurationMinutes) * time.Minute)

	// Build conflict map for fast lookup
	conflictMap := as.buildConflictMap(workerAssignments, istLocation)

	var slots []AvailableSlot
	slotInterval := 30 * time.Minute
	
	currentTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 
		startTime.Hour(), startTime.Minute(), 0, 0, istLocation)
	
	slotEndTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 
		endTime.Hour(), endTime.Minute(), 0, 0, istLocation)
	
	// Use the earlier of working hours end or latest possible booking time
	if latestBookingTime.Before(slotEndTime) {
		slotEndTime = latestBookingTime
	}

	for currentTime.Before(slotEndTime) {
		// Check availability for this slot
		availableWorkers := as.checkSlotAvailability(currentTime, totalDurationMinutes, conflictMap, totalWorkers)
		isAvailable := availableWorkers > 0

		slot := AvailableSlot{
			Time:             currentTime.Format("15:04"),
			AvailableWorkers: availableWorkers,
			IsAvailable:      isAvailable,
		}

		slots = append(slots, slot)
		currentTime = currentTime.Add(slotInterval)
	}

	return slots
}

// buildConflictMap builds a map of time periods where workers are busy
func (as *AvailabilityService) buildConflictMap(assignments []models.WorkerAssignment, location *time.Location) map[uint][]time.Time {
	conflictMap := make(map[uint][]time.Time)
	
	for _, assignment := range assignments {
		// Add start and end times for this worker from the booking
		startTime := assignment.Booking.ScheduledTime
		endTime := assignment.Booking.ScheduledEndTime
		
		if _, exists := conflictMap[assignment.WorkerID]; !exists {
			conflictMap[assignment.WorkerID] = []time.Time{}
		}
		
		// Only add times if they are not nil
		if startTime != nil && endTime != nil {
			conflictMap[assignment.WorkerID] = append(conflictMap[assignment.WorkerID], *startTime, *endTime)
		}
	}
	
	return conflictMap
}

// checkSlotAvailability checks how many workers are available for a specific time slot
func (as *AvailabilityService) checkSlotAvailability(
	slotTime time.Time, 
	totalDurationMinutes int, 
	conflictMap map[uint][]time.Time,
	totalWorkers int,
) int {
	
	slotEndTime := slotTime.Add(time.Duration(totalDurationMinutes) * time.Minute)
	availableWorkers := totalWorkers

	// Check each worker's conflicts
	for _, busyTimes := range conflictMap {
		workerHasConflict := false
		
		for i := 0; i < len(busyTimes); i += 2 {
			if i+1 < len(busyTimes) {
				busyStart := busyTimes[i]
				busyEnd := busyTimes[i+1]
				
				// Check for overlap
				if (slotTime.Before(busyEnd) && slotEndTime.After(busyStart)) {
					workerHasConflict = true
					break
				}
			}
		}
		
		if workerHasConflict {
			availableWorkers--
		}
	}

	return availableWorkers
}
