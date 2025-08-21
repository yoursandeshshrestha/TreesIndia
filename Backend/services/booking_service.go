package services

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"
)

type BookingService struct {
	bookingRepo      *repositories.BookingRepository
	serviceRepo      *repositories.ServiceRepository
	userRepo         *repositories.UserRepository
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	paymentService   *PaymentService
	razorpayService  *RazorpayService
	notificationService *NotificationService
}

func NewBookingService() *BookingService {
	return &BookingService{
		bookingRepo:      repositories.NewBookingRepository(),
		serviceRepo:      repositories.NewServiceRepository(),
		userRepo:         repositories.NewUserRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		paymentService:   NewPaymentService(),
		razorpayService:  NewRazorpayService(),
		notificationService: NewNotificationService(),
	}
}

// CreateBooking creates a new booking (handles all booking types)
func (bs *BookingService) CreateBooking(userID uint, req *models.CreateBookingRequest) (*models.Booking, map[string]interface{}, error) {
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, nil, errors.New("service is not active")
	}

	// 2. Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		return nil, nil, errors.New("invalid date format")
	}

	// Parse the scheduled time and create it in IST timezone
	istLocation, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		istLocation = time.FixedZone("IST", 5*60*60+30*60) // UTC+5:30 as fallback
	}
	
	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, nil, errors.New("invalid time format")
	}
	
	// Create the scheduled time in IST timezone for the given date
	scheduledTime = time.Date(scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0, istLocation)

	// 3. Get admin configuration for buffer time and hold time
	adminConfigRepo := repositories.NewAdminConfigRepository()
	bufferTimeConfig, err := adminConfigRepo.GetByKey("booking_buffer_time_minutes")
	if err != nil {
		// Default 30 minutes buffer if not configured
		bufferTimeConfig = &models.AdminConfig{Value: "30"}
	}
	
	bufferTimeMinutes, err := strconv.Atoi(bufferTimeConfig.Value)
	if err != nil {
		bufferTimeMinutes = 30 // Default fallback
	}

	// Get hold time configuration
	holdTimeConfig, err := adminConfigRepo.GetByKey("booking_hold_time_minutes")
	if err != nil {
		// Default 7 minutes hold time if not configured
		holdTimeConfig = &models.AdminConfig{Value: "7"}
	}
	
	holdTimeMinutes, err := strconv.Atoi(holdTimeConfig.Value)
	if err != nil {
		holdTimeMinutes = 7 // Default fallback
	}

	// 4. Calculate service duration
	var serviceDurationMinutes int
	
	// Use service duration if available, otherwise use default
	if service.Duration != nil && *service.Duration != "" {
		duration, err := utils.ParseDuration(*service.Duration)
		if err != nil {
			return nil, nil, fmt.Errorf("invalid service duration: %v", err)
		}
		serviceDurationMinutes = duration.ToMinutes()
	} else {
		serviceDurationMinutes = 120 // Default 2 hours
	}

	// 5. Determine booking type and payment requirements
	var bookingType models.BookingType
	var totalAmount *float64

	if service.PriceType == "fixed" {
		// Fixed price service - implement two-phase booking
		bookingType = models.BookingTypeRegular
		totalAmount = service.Price
		
		// Check if time slot is available (no confirmed bookings)
		isSlotAvailable, err := bs.isTimeSlotAvailable(scheduledTime, serviceDurationMinutes)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to check slot availability: %v", err)
		}
		
		if !isSlotAvailable {
			return nil, nil, errors.New("selected time slot is not available")
		}
		
		scheduledEndTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

		// 6. Generate booking reference
		bookingReference := bs.generateBookingReference()

		// 7. Calculate hold expiration time
		now := time.Now()
		holdExpiresAt := now.Add(time.Duration(holdTimeMinutes) * time.Minute)

		// 8. Create booking with temporary hold status
		booking := &models.Booking{
			UserID:              userID,
			ServiceID:           req.ServiceID,
			BookingReference:    bookingReference,
			Status:              models.BookingStatusTemporaryHold,
			BookingType:         bookingType,
			ScheduledDate:       &scheduledDate,
			ScheduledTime:       &scheduledTime,
			ScheduledEndTime:    &scheduledEndTime,
			Address:             &req.Address,
			Description:         req.Description,
			ContactPerson:       req.ContactPerson,
			ContactPhone:        req.ContactPhone,
			SpecialInstructions: req.SpecialInstructions,
			HoldExpiresAt:       &holdExpiresAt,
		}

		// 9. Save booking
		booking, err = bs.bookingRepo.Create(booking)
		if err != nil {
			return nil, nil, err
		}

		// 10. Create payment record
		paymentReq := &models.CreatePaymentRequest{
			UserID:            userID,
			Amount:            *totalAmount,
			Currency:          "INR",
			Type:              models.PaymentTypeBooking,
			Method:            "razorpay",
			RelatedEntityType: "booking",
			RelatedEntityID:   booking.ID,
			Description:       "Service booking payment",
		}

		_, razorpayOrder, err := bs.paymentService.CreateRazorpayOrder(paymentReq)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create payment: %v", err)
		}

		return booking, razorpayOrder, nil

	} else {
		// Inquiry-based service
		bookingType = models.BookingTypeInquiry
		
		// Check inquiry booking fee
		feeConfig, err := adminConfigRepo.GetByKey("inquiry_booking_fee")
		if err != nil {
			// Default to 0 if config not found
			feeConfig = &models.AdminConfig{Value: "0"}
		}
		
		feeAmount, err := strconv.Atoi(feeConfig.Value)
		if err != nil {
			feeAmount = 0 // Default to 0 if parsing fails
		}

		if feeAmount > 0 {
			// Inquiry fee required
			feeFloat := float64(feeAmount)
			totalAmount = &feeFloat
			
			// Generate booking reference
			bookingReference := bs.generateBookingReference()

			// Create booking with minimal data for inquiry-based booking
			booking := &models.Booking{
				UserID:              userID,
				ServiceID:           req.ServiceID,
				BookingReference:    bookingReference,
				Status:              models.BookingStatusPaymentPending,
				BookingType:         bookingType,
				ScheduledDate:       &scheduledDate,
				ScheduledTime:       &scheduledTime,
				Address:             &req.Address,
				Description:         req.Description,
				ContactPerson:       req.ContactPerson,
				ContactPhone:        req.ContactPhone,
				SpecialInstructions: req.SpecialInstructions,
			}

			// Save booking
			booking, err = bs.bookingRepo.Create(booking)
			if err != nil {
				return nil, nil, err
			}

			// Create payment record for inquiry fee
			paymentReq := &models.CreatePaymentRequest{
				UserID:            userID,
				Amount:            feeFloat,
				Currency:          "INR",
				Type:              models.PaymentTypeBooking,
				Method:            "razorpay",
				RelatedEntityType: "booking",
				RelatedEntityID:   booking.ID,
				Description:       "Inquiry booking fee",
			}

			_, razorpayOrder, err := bs.paymentService.CreateRazorpayOrder(paymentReq)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to create payment: %v", err)
			}

			return booking, razorpayOrder, nil

		} else {
			// No inquiry fee required
			// Generate booking reference
			bookingReference := bs.generateBookingReference()

			// Create booking with minimal data for inquiry-based booking
			booking := &models.Booking{
				UserID:              userID,
				ServiceID:           req.ServiceID,
				BookingReference:    bookingReference,
				Status:              models.BookingStatusConfirmed,
				BookingType:         bookingType,
				ScheduledDate:       &scheduledDate,
				ScheduledTime:       &scheduledTime,
				Address:             &req.Address,
				Description:         req.Description,
				ContactPerson:       req.ContactPerson,
				ContactPhone:        req.ContactPhone,
				SpecialInstructions: req.SpecialInstructions,
			}

			// Save booking
			booking, err = bs.bookingRepo.Create(booking)
			if err != nil {
				return nil, nil, err
			}

			return booking, nil, nil
		}
	}
}

// CreateBookingWithPayment creates booking with Razorpay payment for fixed price services
func (bs *BookingService) CreateBookingWithPayment(userID uint, req *models.CreateBookingRequest) (*models.Booking, map[string]interface{}, error) {
	// This method is now redundant since CreateBooking handles all cases
	// Keeping for backward compatibility but it just calls the main CreateBooking method
	return bs.CreateBooking(userID, req)
}

// CreateInquiryBooking creates a new inquiry-based booking (simplified flow)
func (bs *BookingService) CreateInquiryBooking(userID uint, req *models.CreateInquiryBookingRequest) (*models.Booking, map[string]interface{}, error) {
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, nil, errors.New("service is not active")
	}

	// 2. Validate service is inquiry-based
	if service.PriceType != "inquiry" {
		return nil, nil, errors.New("service is not inquiry-based")
	}

	// 3. Check inquiry booking fee
	adminConfigRepo := repositories.NewAdminConfigRepository()
	feeConfig, err := adminConfigRepo.GetByKey("inquiry_booking_fee")
	if err != nil {
		// Default to 0 if config not found
		feeConfig = &models.AdminConfig{Value: "0"}
	}
	
	feeAmount, err := strconv.Atoi(feeConfig.Value)
	if err != nil {
		feeAmount = 0 // Default to 0 if parsing fails
	}

	// 4. If fee is required, create Razorpay order directly (no payment record yet)
	if feeAmount > 0 {
		
		// Generate temporary booking reference for tracking
		tempBookingReference := bs.GenerateTemporaryBookingReference()
		
		// Create Razorpay order directly without payment record
		feeFloat := float64(feeAmount)
		razorpayOrder, err := bs.razorpayService.CreateOrder(feeFloat, tempBookingReference, "Inquiry booking fee")
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create payment order: %v", err)
		}

		// Add metadata to Razorpay order for tracking
		if razorpayOrder["notes"] == nil {
			razorpayOrder["notes"] = map[string]interface{}{
				"temp_booking_reference": tempBookingReference,
				"service_id":            req.ServiceID,
				"user_id":               userID,
				"booking_type":          "inquiry",
			}
		}

		// Return nil booking and payment order - booking will be created after payment
		return nil, razorpayOrder, nil
	} else {
		
		// 5. Generate booking reference
		bookingReference := bs.generateBookingReference()

		// 6. Create booking with minimal data for inquiry-based booking
		booking := &models.Booking{
			UserID:              userID,
			ServiceID:           req.ServiceID,
			BookingReference:    bookingReference,
			Status:              models.BookingStatusPending,
			BookingType:         models.BookingTypeInquiry,
			ScheduledDate:       nil, // Will be set later
			ScheduledTime:       nil, // Will be set later
			ScheduledEndTime:    nil, // Will be set later
			Address:             nil, // Will be filled later
			Description:         "",  // Will be filled later
			ContactPerson:       "",  // Will be filled later
			ContactPhone:        "",  // Will be filled later
			SpecialInstructions: "",  // Will be filled later
		}

		// 7. Save booking
		booking, err = bs.bookingRepo.Create(booking)
		if err != nil {
			return nil, nil, err
		}

		// 8. Send notification (optional)
		// bs.notificationService.SendInquiryBookingNotification(booking)

		return booking, nil, nil
	}
}





// checkWorkerBookingConflict checks if a worker has any conflicting bookings
func (bs *BookingService) checkWorkerBookingConflict(workerID uint, startTime time.Time, endTime time.Time) (bool, error) {
	// Get all bookings for this worker that overlap with the requested time
	var conflictingBookings []models.Booking
	err := bs.bookingRepo.GetDB().Joins("JOIN worker_assignments ON bookings.id = worker_assignments.booking_id").
		Where("worker_assignments.worker_id = ? AND worker_assignments.status IN (?)", workerID, []string{"assigned", "accepted", "in_progress"}).
		Where("(bookings.scheduled_time < ? AND bookings.scheduled_end_time > ?) OR "+
			"(bookings.scheduled_time >= ? AND bookings.scheduled_time < ?) OR "+
			"(bookings.scheduled_end_time > ? AND bookings.scheduled_end_time <= ?)",
			endTime, startTime, startTime, endTime, startTime, endTime).
		Find(&conflictingBookings).Error

	if err != nil {
		return false, err
	}

	// Check for conflicts
	if len(conflictingBookings) > 0 {
		return true, nil
	}

	return len(conflictingBookings) > 0, nil
}

// isTimeSlotAvailable checks if a time slot is available for booking
func (bs *BookingService) isTimeSlotAvailable(scheduledTime time.Time, serviceDurationMinutes int) (bool, error) {
	// Get buffer time configuration
	adminConfigRepo := repositories.NewAdminConfigRepository()
	bufferTimeConfig, err := adminConfigRepo.GetByKey("booking_buffer_time_minutes")
	if err != nil {
		// Default 30 minutes buffer if not configured
		bufferTimeConfig = &models.AdminConfig{Value: "30"}
	}
	
	bufferTimeMinutes, err := strconv.Atoi(bufferTimeConfig.Value)
	if err != nil {
		bufferTimeMinutes = 30 // Default fallback
	}

	// Calculate end time including buffer
	endTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

	// Check for conflicting confirmed bookings
	conflictingBookings, err := bs.bookingRepo.GetConflictingBookings(scheduledTime, endTime)
	if err != nil {
		return false, fmt.Errorf("failed to check for conflicting bookings: %v", err)
	}

	// If there are any confirmed bookings in this time slot, it's not available
	if len(conflictingBookings) > 0 {
		return false, nil
	}

	return true, nil
}

// assignAvailableWorker finds and assigns an available worker for the given time period
func (bs *BookingService) assignAvailableWorker(startTime time.Time, serviceDurationMinutes int) (uint, error) {
	// Get all active workers
	var workers []models.User
	err := bs.userRepo.FindByUserType(&workers, models.UserTypeWorker)
	if err != nil {
		return 0, fmt.Errorf("failed to get workers: %v", err)
	}

	// Calculate service end time
	serviceEndTime := startTime.Add(time.Duration(serviceDurationMinutes) * time.Minute)

	// Find first available worker
	for _, worker := range workers {
		if !worker.IsActive {
			continue
		}

		// Check if worker has any conflicting bookings during this time period
		hasConflict, err := bs.checkWorkerBookingConflict(worker.ID, startTime, serviceEndTime)
		if err != nil {
			continue // Skip this worker if there's an error checking conflicts
		}

		if !hasConflict {
			return worker.ID, nil
		}
	}

	return 0, errors.New("no available workers found")
}

// VerifyPaymentAndCreateBooking verifies payment and creates the booking
func (bs *BookingService) VerifyPaymentAndCreateBooking(userID uint, req *models.VerifyPaymentAndCreateBookingRequest) (*models.Booking, error) {
	// 1. Create payment service
	paymentService := NewPaymentService()

	// 2. Find the payment record by Razorpay order ID
	payment, err := paymentService.GetPaymentByRazorpayOrderID(req.RazorpayOrderID)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %v", err)
	}

	// 3. Verify and complete the payment
	if req.RazorpaySignature != "" {
		// If signature is provided, verify it
		_, err = paymentService.VerifyAndCompletePayment(payment.ID, req.RazorpayPaymentID, req.RazorpaySignature)
		if err != nil {
			return nil, fmt.Errorf("payment verification failed: %v", err)
		}
	} else {
		// If no signature provided, just mark payment as completed (signature will be verified via webhook)
		payment.Status = models.PaymentStatusCompleted
		payment.RazorpayPaymentID = &req.RazorpayPaymentID
		now := time.Now()
		payment.CompletedAt = &now
		payment.Notes = "Payment completed via frontend callback"
		
		err = paymentService.paymentRepo.Update(payment)
		if err != nil {
			return nil, fmt.Errorf("failed to update payment status: %v", err)
		}
	}

	// 4. Create the booking with the verified payment
	booking, _, err := bs.CreateBooking(userID, &req.CreateBookingRequest)
	if err != nil {
		return nil, err
	}

	// 5. Update booking status
	booking.Status = models.BookingStatusConfirmed

	// 6. Save booking
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 7. Send confirmation notifications
	go bs.notificationService.SendBookingConfirmation(booking)

	return booking, nil
}

// VerifyPayment verifies payment and confirms booking (Phase 2 of two-phase booking)
func (bs *BookingService) VerifyPayment(req *models.VerifyPaymentRequest) (*models.Booking, error) {
	fmt.Printf("VerifyPayment called with booking ID: %d\n", req.BookingID)
	
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(req.BookingID)
	if err != nil {
		fmt.Printf("Error getting booking by ID %d: %v\n", req.BookingID, err)
		return nil, errors.New("booking not found")
	}

	fmt.Printf("Found booking: ID=%d, Status=%s\n", booking.ID, booking.Status)

	// Check if booking is in temporary hold status
	if booking.Status != models.BookingStatusTemporaryHold {
		fmt.Printf("Booking status is %s, expected %s\n", booking.Status, models.BookingStatusTemporaryHold)
		return nil, errors.New("booking is not in temporary hold status")
	}

	// Check if hold has expired
	if booking.HoldExpiresAt != nil && time.Now().After(*booking.HoldExpiresAt) {
		fmt.Printf("Booking hold has expired at %v\n", booking.HoldExpiresAt)
		return nil, errors.New("booking hold has expired")
	}

	// 2. Verify Razorpay payment
	isValid, err := bs.razorpayService.VerifyPayment(req.RazorpayPaymentID, req.RazorpayOrderID, req.RazorpaySignature)
	if err != nil {
		fmt.Printf("Razorpay verification error: %v\n", err)
		return nil, err
	}

	if !isValid {
		fmt.Printf("Razorpay verification failed\n")
		return nil, errors.New("payment verification failed")
	}

	fmt.Printf("Payment verification successful, proceeding with booking confirmation\n")

	// 3. Check if time slot is still available and get service duration
	var serviceDurationMinutes int
	if booking.ScheduledTime != nil {
		service, err := bs.serviceRepo.GetByID(booking.ServiceID)
		if err != nil {
			return nil, fmt.Errorf("failed to get service: %v", err)
		}

		if service.Duration != nil && *service.Duration != "" {
			duration, err := utils.ParseDuration(*service.Duration)
			if err != nil {
				return nil, fmt.Errorf("invalid service duration: %v", err)
			}
			serviceDurationMinutes = duration.ToMinutes()
		} else {
			serviceDurationMinutes = 120 // Default 2 hours
		}

		isSlotAvailable, err := bs.isTimeSlotAvailable(*booking.ScheduledTime, serviceDurationMinutes)
		if err != nil {
			return nil, fmt.Errorf("failed to check slot availability: %v", err)
		}

		if !isSlotAvailable {
			// Slot is no longer available, cancel the booking
			booking.Status = models.BookingStatusCancelled
			bs.bookingRepo.Update(booking)
			return nil, errors.New("selected time slot is no longer available")
		}
	} else {
		serviceDurationMinutes = 120 // Default 2 hours
	}

	// 4. Assign worker (Phase 2: Worker assignment)
	assignedWorkerID, err := bs.assignAvailableWorker(*booking.ScheduledTime, serviceDurationMinutes)
	if err != nil {
		return nil, fmt.Errorf("failed to assign worker: %v", err)
	}

	// 5. Create worker assignment
	now := time.Now()
	workerAssignment := &models.WorkerAssignment{
		BookingID:  booking.ID,
		WorkerID:   assignedWorkerID,
		AssignedBy: booking.UserID,
		Status:     "assigned",
		AssignedAt: now,
	}

	// Save worker assignment
	workerAssignmentRepo := repositories.NewWorkerAssignmentRepository()
	if err := workerAssignmentRepo.Create(workerAssignment); err != nil {
		return nil, fmt.Errorf("failed to create worker assignment: %v", err)
	}

	// 6. Update booking status to confirmed
	booking.Status = models.BookingStatusConfirmed
	booking.HoldExpiresAt = nil // Clear hold expiration

	// 7. Save booking
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		fmt.Printf("Error updating booking: %v\n", err)
		return nil, err
	}

	// 8. Send confirmation notifications
	go bs.notificationService.SendBookingConfirmation(booking)

	return booking, nil
}

// CleanupExpiredTemporaryHolds cleans up expired temporary holds
func (bs *BookingService) CleanupExpiredTemporaryHolds() error {
	// Get expired temporary holds
	expiredHolds, err := bs.bookingRepo.GetExpiredTemporaryHolds()
	if err != nil {
		return fmt.Errorf("failed to get expired holds: %v", err)
	}

	for _, booking := range expiredHolds {
		// Update booking status to cancelled
		booking.Status = models.BookingStatusTimeExpired
		
		err := bs.bookingRepo.Update(&booking)
		if err != nil {
			// Log error but continue with other bookings
			fmt.Printf("Failed to update expired booking %d: %v\n", booking.ID, err)
			continue
		}
		
		fmt.Printf("Cleaned up expired temporary hold: Booking ID %d\n", booking.ID)
	}

	return nil
}

// GetUserBookings gets bookings for a user
func (bs *BookingService) GetUserBookings(userID uint, filters *repositories.UserBookingFilters) ([]models.Booking, *repositories.Pagination, error) {
	return bs.bookingRepo.GetUserBookings(userID, filters)
}

// GetBookingByID gets a booking by ID
func (bs *BookingService) GetBookingByID(bookingID uint) (*models.Booking, error) {
	return bs.bookingRepo.GetByID(bookingID)
}

// CancelUserBooking cancels a user's booking
func (bs *BookingService) CancelUserBooking(userID uint, bookingID uint, req *models.CancelBookingRequest) (map[string]interface{}, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	if booking.Status == models.BookingStatusCompleted || booking.Status == models.BookingStatusCancelled {
		return nil, errors.New("booking cannot be cancelled")
	}

	// 2. Cancel booking
	booking.Status = models.BookingStatusCancelled
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}



	// 4. Process refund if payment was made
	var refundAmount float64
	var refundMethod string
	// TODO: Get payment details from payment table and process refund
	// For now, set default values
	refundAmount = 0
	refundMethod = "razorpay"

	return map[string]interface{}{
		"booking_id":       booking.ID,
		"status":           booking.Status,
		"refund_amount":    refundAmount,
		"refund_method":    refundMethod,
		"cancellation_fee": 0,
		"message":          "Booking cancelled successfully",
	}, nil
}

// AssignWorker assigns a worker to a booking
func (bs *BookingService) AssignWorker(bookingID uint, workerID uint, notes string) (*models.Booking, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.Status != models.BookingStatusConfirmed {
		return nil, errors.New("booking is not confirmed")
	}

	// 2. Check if worker exists and is available
	worker := &models.User{}
	err = bs.userRepo.FindByID(worker, workerID)
	if err != nil {
		return nil, errors.New("worker not found")
	}

	if worker.UserType != models.UserTypeWorker {
		return nil, errors.New("user is not a worker")
	}

	// 3. Create worker assignment
	assignment := &models.WorkerAssignment{
		BookingID:        booking.ID,
		WorkerID:         workerID,
		AssignedBy:       1, // TODO: Get admin ID from context
		Status:           models.AssignmentStatusAssigned,
		AssignedAt:       time.Now(),
		AssignmentNotes:  notes,
	}

	err = bs.workerAssignmentRepo.Create(assignment)
	if err != nil {
		return nil, err
	}

	// 4. Update booking status
	booking.Status = models.BookingStatusAssigned
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 5. Send notification to worker
	go bs.notificationService.SendWorkerAssignmentNotification(assignment)

	return booking, nil
}

// Generate booking reference
func (bs *BookingService) generateBookingReference() string {
	timestamp := time.Now().Format("20060102")
	// Generate a unique sequence number using current time in nanoseconds
	sequence := time.Now().UnixNano() % 1000000 // Use last 6 digits of nanoseconds
	return fmt.Sprintf("BK%s%06d", timestamp, sequence)
}

// GenerateTemporaryBookingReference generates a temporary booking reference for payment orders
func (bs *BookingService) GenerateTemporaryBookingReference() string {
	timestamp := time.Now().Format("20060102")
	// Generate a unique sequence number using current time in nanoseconds
	sequence := time.Now().UnixNano() % 1000000 // Use last 6 digits of nanoseconds
	return fmt.Sprintf("TEMP%s%06d", timestamp, sequence)
}

// GetServiceByID gets a service by ID
func (bs *BookingService) GetServiceByID(serviceID uint) (*models.Service, error) {
	return bs.serviceRepo.GetByID(serviceID)
}

// GetAllBookings gets all bookings with admin filters
func (bs *BookingService) GetAllBookings(filters *repositories.AdminBookingFilters) ([]models.Booking, *repositories.Pagination, error) {
	return bs.bookingRepo.GetBookingsWithFilters(filters)
}

// UpdateBookingStatus updates booking status (admin only)
func (bs *BookingService) UpdateBookingStatus(bookingID uint, status models.BookingStatus, reason string) (*models.Booking, error) {
	booking, err := bs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	booking.Status = status
	if reason != "" {
		// TODO: Add cancellation reason field to booking model
	}

	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

// AssignWorkerToBooking assigns a worker to a booking (admin only)
func (bs *BookingService) AssignWorkerToBooking(bookingID uint, workerID uint) (*models.WorkerAssignment, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.Status != models.BookingStatusConfirmed {
		return nil, errors.New("booking is not confirmed")
	}

	// 2. Check if worker exists and is available
	worker := &models.User{}
	err = bs.userRepo.FindByID(worker, workerID)
	if err != nil {
		return nil, errors.New("worker not found")
	}

	if worker.UserType != models.UserTypeWorker {
		return nil, errors.New("user is not a worker")
	}

	// 3. Create worker assignment
	assignment := &models.WorkerAssignment{
		BookingID:        booking.ID,
		WorkerID:         workerID,
		AssignedBy:       1, // TODO: Get admin ID from context
		Status:           models.AssignmentStatusAssigned,
		AssignedAt:       time.Now(),
		AssignmentNotes:  "Assigned by admin",
	}

	err = bs.workerAssignmentRepo.Create(assignment)
	if err != nil {
		return nil, err
	}

	// 4. Update booking status
	booking.Status = models.BookingStatusAssigned
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 5. Send notification to worker
	go bs.notificationService.SendWorkerAssignmentNotification(assignment)

	return assignment, nil
}

// GetBookingStats gets booking statistics (admin only)
func (bs *BookingService) GetBookingStats() (map[string]interface{}, error) {
	// TODO: Implement booking statistics
	// This would include counts by status, revenue, etc.
	stats := map[string]interface{}{
		"total_bookings":     0,
		"pending_bookings":   0,
		"confirmed_bookings": 0,
		"completed_bookings": 0,
		"cancelled_bookings": 0,
		"total_revenue":      0.0,
		"monthly_revenue":    0.0,
	}
	return stats, nil
}

// VerifyInquiryPaymentAndCreateBooking verifies payment and creates the inquiry booking
func (bs *BookingService) VerifyInquiryPaymentAndCreateBooking(userID uint, req *models.VerifyInquiryPaymentRequest) (*models.Booking, error) {
	// 1. Verify Razorpay payment (skip signature verification for inquiry payments)
	// For inquiry payments, we'll rely on payment ID verification and webhook verification
	
	// Check if payment ID is valid format (basic validation)
	if req.RazorpayPaymentID == "" {
		return nil, errors.New("invalid payment ID")
	}
	
	// For now, skip signature verification and rely on webhook verification
	// In production, you might want to implement a more robust verification

	// 2. Get service details from Razorpay order notes (or we can pass it in the request)
	// For now, let's get the service ID from the request or we can store it in the order notes
	// We'll need to modify the frontend to send service_id in the verification request
	
	// 3. Create payment record only after successful verification
	paymentService := NewPaymentService()
	
	// Get service details from request
	serviceID := req.ServiceID
	
	// Get amount from Razorpay order (we'll need to fetch it)
	// For now, let's use a default amount
	amount := float64(100) // This should be fetched from Razorpay order
	
	// Create payment record with basic info
	paymentReq := &models.CreatePaymentRequest{
		UserID:             userID,
		Amount:             amount,
		Currency:           "INR",
		Type:               models.PaymentTypeBooking,
		Method:             "razorpay",
		RelatedEntityType:  "service", // Will be updated to booking after creation
		RelatedEntityID:    serviceID,
		Description:        "Inquiry booking fee",
		Notes:              "Inquiry booking fee - completed",
	}
	
	payment, err := paymentService.CreatePayment(paymentReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment record: %v", err)
	}
	
	// Update payment with Razorpay details and mark as completed
	now := time.Now()
	payment.Status = models.PaymentStatusCompleted
	payment.RazorpayOrderID = &req.RazorpayOrderID
	payment.RazorpayPaymentID = &req.RazorpayPaymentID
	payment.RazorpaySignature = &req.RazorpaySignature
	payment.CompletedAt = &now
	
	err = paymentService.UpdatePayment(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment with Razorpay details: %v", err)
	}



	// 4. Create the actual booking
	bookingReference := bs.generateBookingReference()
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           serviceID, // This needs to be properly set
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending,
		BookingType:         models.BookingTypeInquiry,
		ScheduledDate:       nil, // Will be set later
		ScheduledTime:       nil, // Will be set later
		ScheduledEndTime:    nil, // Will be set later
		Address:             nil, // Will be filled later
		Description:         "",  // Will be filled later
		ContactPerson:       "",  // Will be filled later
		ContactPhone:        "",  // Will be filled later
		SpecialInstructions: "",  // Will be filled later
	}

	// 5. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to create booking: %v", err)
	}

	// 6. Update payment to link to the actual booking
	payment.RelatedEntityType = "booking"
	payment.RelatedEntityID = booking.ID
	err = paymentService.UpdatePayment(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment with booking link: %v", err)
	}

	return booking, nil
}



