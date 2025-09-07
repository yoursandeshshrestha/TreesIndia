package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"github.com/sirupsen/logrus"
)

type BookingService struct {
	bookingRepo      *repositories.BookingRepository
	serviceRepo      *repositories.ServiceRepository
	userRepo         *repositories.UserRepository
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	serviceAreaRepo  *repositories.ServiceAreaRepository
	locationRepo     *repositories.LocationRepository
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
		serviceAreaRepo:  repositories.NewServiceAreaRepository(),
		locationRepo:     repositories.NewLocationRepository(),
		paymentService:   NewPaymentService(),
		razorpayService:  NewRazorpayService(),
		notificationService: NewNotificationService(),
	}
}

// CreateBooking creates a new booking (handles all booking types)
func (bs *BookingService) CreateBooking(userID uint, req *models.CreateBookingRequest) (*models.Booking, map[string]interface{}, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("BookingService.CreateBooking panic: %v", r)
		}
	}()
	
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, nil, errors.New("service is not active")
	}

	// 1.5. Check service availability using city and state from the address object
	available, err := bs.serviceAreaRepo.CheckServiceAvailability(req.ServiceID, req.Address.City, req.Address.State)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to check service availability: %v", err)
	}
	if !available {
		return nil, nil, fmt.Errorf("service is not available in your selected address location (%s, %s). Please choose a different address or contact support for availability in your area", req.Address.City, req.Address.State)
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

	// 4. Calculate service duration from service
	var serviceDurationMinutes int
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
		
		// Check if service price is valid
		if service.Price == nil {
			return nil, nil, errors.New("service price is not set")
		}
		totalAmount = service.Price
		
		// Check if time slot is available using worker pool
		// Extract location from address
		location := ""
		if req.Address.City != "" && req.Address.State != "" {
			location = req.Address.City + ", " + req.Address.State
		}
		
		isSlotAvailable, err := bs.isTimeSlotAvailable(scheduledTime, serviceDurationMinutes, req.ServiceID, location)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to check slot availability: %v", err)
		}
		
		if !isSlotAvailable {
			return nil, nil, errors.New("selected time slot is not available - no worker slots available")
		}
		
		scheduledEndTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

		// 6. Generate booking reference
		bookingReference := bs.generateBookingReference()

		// 7. Calculate hold expiration time
		now := time.Now()
		holdExpiresAt := now.Add(time.Duration(holdTimeMinutes) * time.Minute)

		// Convert address object to JSON string for storage
		addressJSON, err := json.Marshal(req.Address)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to marshal address: %v", err)
		}
		addressStr := string(addressJSON)
		
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
			Address:             &addressStr,
			Description:         req.Description,
			ContactPerson:       req.ContactPerson,
			ContactPhone:        req.ContactPhone,
			SpecialInstructions: req.SpecialInstructions,
			HoldExpiresAt:       &holdExpiresAt,
		}

		// 9. Save booking
		booking, err = bs.bookingRepo.Create(booking)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to save booking: %v", err)
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

		// Calculate payment progress before returning
		booking.GetPaymentProgress()
		
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

			// Convert address object to JSON string for storage
			addressJSON, err := json.Marshal(req.Address)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to marshal address: %v", err)
			}
			addressStr := string(addressJSON)
			
			// Create booking with minimal data for inquiry-based booking
			booking := &models.Booking{
				UserID:              userID,
				ServiceID:           req.ServiceID,
				BookingReference:    bookingReference,
				Status:              models.BookingStatusPending, // Booking workflow status
				PaymentStatus:       models.PaymentStatusPending, // Payment status
				BookingType:         bookingType,
				ScheduledDate:       &scheduledDate,
				ScheduledTime:       &scheduledTime,
				Address:             &addressStr,
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

			// Calculate payment progress before returning
		booking.GetPaymentProgress()
		
		return booking, razorpayOrder, nil

		} else {
			// No inquiry fee required
			// Generate booking reference
			bookingReference := bs.generateBookingReference()

			// Convert address object to JSON string for storage
			addressJSON, err := json.Marshal(req.Address)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to marshal address: %v", err)
			}
			addressStr := string(addressJSON)
			
			// Create booking with minimal data for inquiry-based booking
			booking := &models.Booking{
				UserID:              userID,
				ServiceID:           req.ServiceID,
				BookingReference:    bookingReference,
				Status:              models.BookingStatusPending, // Booking workflow status - stays pending until quote is provided
				PaymentStatus:       models.PaymentStatusPending, // No fee required, but payment status stays pending for inquiry flow
				BookingType:         bookingType,
				ScheduledDate:       &scheduledDate,
				ScheduledTime:       &scheduledTime,
				Address:             &addressStr,
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

			// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
				// Calculate payment progress before returning
			booking.GetPaymentProgress()
			
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

	// 3. Check service availability using the address from the inquiry request
	available, err := bs.serviceAreaRepo.CheckServiceAvailability(req.ServiceID, req.Address.City, req.Address.State)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to check service availability: %v", err)
	}
	if !available {
		return nil, nil, fmt.Errorf("service is not available in your selected address location (%s, %s). Please choose a different address or contact support for availability in your area", req.Address.City, req.Address.State)
	}

	// 4. Check inquiry booking fee
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

	// 5. If fee is required, try to create Razorpay order
	if feeAmount > 0 {
		logrus.Infof("Inquiry booking fee required: %d", feeAmount)
		
		// Check if razorpay service is available and configured
		if bs.razorpayService == nil {
			logrus.Warn("Razorpay service is nil, creating booking without payment")
			// Fall through to create booking without payment
		} else {
			// Try to create Razorpay order using payment service (same as fixed price booking)
			tempBookingReference := bs.GenerateTemporaryBookingReference()
			logrus.Infof("Generated temporary booking reference: %s", tempBookingReference)
			
			feeFloat := float64(feeAmount)
			
			// Store inquiry data in metadata for later retrieval
			inquiryMetadata := models.JSONMap{
				"address":             req.Address,
				"description":         req.Description,
				"contact_person":      req.ContactPerson,
				"contact_phone":       req.ContactPhone,
				"special_instructions": req.SpecialInstructions,
			}
			
			// Create payment request (same pattern as fixed price booking)
			paymentReq := &models.CreatePaymentRequest{
				UserID:            userID,
				Amount:            feeFloat,
				Currency:          "INR",
				Type:              models.PaymentTypeBooking,
				Method:            "razorpay",
				RelatedEntityType: "inquiry_booking",
				RelatedEntityID:   0, // Will be set after booking creation
				Description:       "Inquiry booking fee",
				Metadata:          &inquiryMetadata,
			}
			
			logrus.Infof("Creating Razorpay order for inquiry booking fee: %f", feeFloat)
			_, razorpayOrder, err := bs.paymentService.CreateRazorpayOrder(paymentReq)
			if err != nil {
				logrus.Warnf("Failed to create Razorpay order: %v, creating booking without payment", err)
				// Fall through to create booking without payment
			} else {
				logrus.Infof("Razorpay order created successfully for inquiry booking")
				
				// Return nil booking and payment order - booking will be created after payment
				return nil, razorpayOrder, nil
			}
		}
	}
	
	// 6. Create booking directly (either no fee required or payment failed)
	logrus.Infof("Creating inquiry booking directly")
		
		// 7. Generate booking reference
		bookingReference := bs.generateBookingReference()
		logrus.Infof("Generated booking reference: %s", bookingReference)

		// 8. Create booking with address data from the inquiry request
		// Convert address object to JSON string for storage
		addressJSON, err := json.Marshal(req.Address)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to marshal address: %v", err)
		}
		addressStr := string(addressJSON)
		
		booking := &models.Booking{
			UserID:              userID,
			ServiceID:           req.ServiceID,
			BookingReference:    bookingReference,
			Status:              models.BookingStatusPending,
			PaymentStatus:       models.PaymentStatusPending, // No fee required, but payment status stays pending for inquiry flow
			BookingType:         models.BookingTypeInquiry,
			ScheduledDate:       nil, // Will be set later
			ScheduledTime:       nil, // Will be set later
			ScheduledEndTime:    nil, // Will be set later
			Address:             &addressStr,
			Description:         req.Description,
			ContactPerson:       req.ContactPerson,
			ContactPhone:        req.ContactPhone,
			SpecialInstructions: req.SpecialInstructions,
		}

		// 9. Save booking
		booking, err = bs.bookingRepo.Create(booking)
		if err != nil {
			logrus.Errorf("Failed to create inquiry booking: %v", err)
			return nil, nil, err
		}

		// 10. Send notification (optional)
		// bs.notificationService.SendInquiryBookingNotification(booking)

		// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
				// Calculate payment progress before returning
			booking.GetPaymentProgress()
			
			return booking, nil, nil
}





// checkWorkerBookingConflict checks if a worker has any conflicting bookings
func (bs *BookingService) checkWorkerBookingConflict(workerID uint, startTime time.Time, endTime time.Time) (bool, error) {
	// Get all bookings for this worker that overlap with the requested time
	var conflictingBookings []models.Booking
	err := bs.bookingRepo.GetDB().Joins("JOIN worker_assignments ON bookings.id = worker_assignments.booking_id").
		Where("worker_assignments.worker_id = ? AND worker_assignments.status IN (?)", workerID, []string{"reserved", "assigned", "accepted", "in_progress"}).
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

// isTimeSlotAvailable checks if a time slot is available for booking using Go-based calculation
func (bs *BookingService) isTimeSlotAvailable(scheduledTime time.Time, serviceDurationMinutes int, serviceID uint, location string) (bool, error) {
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

	// Ensure service duration is valid
	if serviceDurationMinutes <= 0 {
		serviceDurationMinutes = 120 // Default to 2 hours if invalid
	}

	// Calculate end time including buffer
	endTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

	// Get total active workers
	var workers []models.User
	err = bs.userRepo.FindByUserType(&workers, models.UserTypeWorker)
	if err != nil {
		return false, fmt.Errorf("failed to get workers: %v", err)
	}

	totalWorkers := 0
	for _, worker := range workers {
		if worker.IsActive {
			totalWorkers++
		}
	}

	// If no workers available, return false
	if totalWorkers == 0 {
		return false, nil
	}

	// Get worker assignments for this time period
	workerAssignmentRepo := repositories.NewWorkerAssignmentRepository()
	assignments, _, err := workerAssignmentRepo.GetWorkerAssignments(0, &repositories.WorkerAssignmentFilters{
		Page:  1,
		Limit: 100, // Get up to 100 assignments
	})
	if err != nil {
		return false, fmt.Errorf("failed to get worker assignments: %v", err)
	}

	// Count busy workers for this time slot
	busyWorkers := 0
	for _, assignment := range assignments {
		// Check if booking scheduled time is valid
		if assignment.Booking.ScheduledTime == nil {
			continue
		}
		
		// Get the actual service duration for this assignment
		assignmentServiceDuration := serviceDurationMinutes // Default to requested service duration
		if assignment.Booking.Service.Duration != nil && *assignment.Booking.Service.Duration != "" {
			duration, err := utils.ParseDuration(*assignment.Booking.Service.Duration)
			if err == nil {
				assignmentServiceDuration = duration.ToMinutes()
			}
		}
		
		// Ensure assignment service duration is valid
		if assignmentServiceDuration <= 0 {
			assignmentServiceDuration = 120 // Default to 2 hours if invalid
		}
		
		// Calculate assignment end time using the actual service duration
		assignmentEndTime := assignment.Booking.ScheduledTime.Add(time.Duration(assignmentServiceDuration+bufferTimeMinutes) * time.Minute)
		
		// Check if there's overlap
		if scheduledTime.Before(assignmentEndTime) && endTime.After(*assignment.Booking.ScheduledTime) {
			busyWorkers++
		}
	}

	// Check if there are available workers
	availableWorkers := totalWorkers - busyWorkers
	return availableWorkers > 0, nil
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

	// 5. Update booking status - only confirm for regular bookings, keep inquiry bookings pending
	if booking.BookingType == models.BookingTypeRegular {
		booking.Status = models.BookingStatusConfirmed
	} else if booking.BookingType == models.BookingTypeInquiry {
		// Keep inquiry bookings as pending - they need to go through quote workflow
		booking.Status = models.BookingStatusPending
	}

	// 6. Save booking
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 7. Send confirmation notifications only for regular bookings
	if booking.BookingType == models.BookingTypeRegular {
		go bs.notificationService.SendBookingConfirmation(booking)
	}

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}

// VerifyPayment verifies payment and confirms booking (Phase 2 of two-phase booking)
func (bs *BookingService) VerifyPayment(req *models.VerifyPaymentRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(req.BookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// Check if booking is in temporary hold status
	if booking.Status != models.BookingStatusTemporaryHold {
		return nil, errors.New("booking is not in temporary hold status")
	}

	// Check if hold has expired
	if booking.HoldExpiresAt != nil && time.Now().After(*booking.HoldExpiresAt) {
		return nil, errors.New("booking hold has expired")
	}

	// 2. Find and verify the associated payment
	payment, err := bs.paymentService.GetPaymentByRazorpayOrderID(req.RazorpayOrderID)
	if err != nil {
		return nil, fmt.Errorf("payment not found for order ID %s: %v", req.RazorpayOrderID, err)
	}

	// Verify the payment
	_, err = bs.paymentService.VerifyAndCompletePayment(payment.ID, req.RazorpayPaymentID, req.RazorpaySignature)
	if err != nil {
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}

	// 3. Check if time slot is still available and get service duration
	if booking.ScheduledTime != nil {
		// For payment verification, we don't need to check slot availability again
		// since it was already checked during booking creation
		// The slot is guaranteed to be available if the booking exists
	}

	// 4. Note: Worker pool reservation is no longer needed with Go-based availability calculation
	// The availability is calculated in real-time based on existing bookings and worker assignments

	// 5. Update booking status to confirmed and payment status to completed
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = models.PaymentStatusCompleted
	booking.HoldExpiresAt = nil // Clear hold expiration

	// 6. Save booking
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 7. Send confirmation notifications
	go bs.notificationService.SendBookingConfirmation(booking)

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
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
		booking.Status = models.BookingStatusCancelled
		
		err := bs.bookingRepo.Update(&booking)
		if err != nil {
			// Log error but continue with other bookings
			continue
		}

		// Disable call masking for expired bookings
		callMaskingService := NewCallMaskingService()
		go callMaskingService.DisableCallMasking(booking.ID)
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

	// 3. Disable call masking if it exists
	callMaskingService := NewCallMaskingService()
	go callMaskingService.DisableCallMasking(bookingID)



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

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
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

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}

// AssignWorkerToBooking assigns a worker to a booking (admin only)
// Admin can only assign a new worker if:
// - No worker is currently assigned, OR
// - The assigned worker has rejected the assignment, OR  
// - The assigned worker hasn't accepted yet
func (bs *BookingService) AssignWorkerToBooking(bookingID uint, workerID uint, adminID uint) (*models.WorkerAssignment, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// For inquiry bookings, worker can only be assigned when status is confirmed
	if booking.BookingType == models.BookingTypeInquiry && booking.Status != models.BookingStatusConfirmed {
		return nil, errors.New("inquiry booking must be confirmed before worker assignment")
	}
	
	// For regular bookings, worker can be assigned when status is confirmed or assigned
	if booking.BookingType == models.BookingTypeRegular && booking.Status != models.BookingStatusConfirmed && booking.Status != models.BookingStatusAssigned {
		return nil, errors.New("booking is not in a valid state for worker assignment")
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

	// 3. Check if the worker is available for this time slot
	if booking.ScheduledTime != nil {
		serviceDurationMinutes := 120 // Default
		if booking.Service.Duration != nil && *booking.Service.Duration != "" {
			duration, err := utils.ParseDuration(*booking.Service.Duration)
			if err == nil {
				serviceDurationMinutes = duration.ToMinutes()
			}
		}

		// Check if worker has any conflicting bookings during this time period
		hasConflict, err := bs.checkWorkerBookingConflict(workerID, *booking.ScheduledTime, booking.ScheduledTime.Add(time.Duration(serviceDurationMinutes)*time.Minute))
		if err != nil {
			return nil, fmt.Errorf("failed to check worker availability: %v", err)
		}

		if hasConflict {
			return nil, errors.New("worker is not available for this time slot")
		}
	}

	// 4. Check existing assignment status
	workerAssignmentRepo := repositories.NewWorkerAssignmentRepository()
	existingAssignment, err := workerAssignmentRepo.GetByBookingID(bookingID)
	
	if err == nil && existingAssignment != nil {
		// Check if admin can reassign based on current assignment status
		if existingAssignment.Status == models.AssignmentStatusAccepted {
			return nil, errors.New("cannot reassign worker: current worker has already accepted the assignment")
		}
		
		if existingAssignment.Status == models.AssignmentStatusInProgress {
			return nil, errors.New("cannot reassign worker: service is already in progress")
		}
		
		if existingAssignment.Status == models.AssignmentStatusCompleted {
			return nil, errors.New("cannot reassign worker: service has already been completed")
		}
		
		// Allow reassignment if status is: assigned (not accepted yet) or rejected
		if existingAssignment.Status == models.AssignmentStatusAssigned || existingAssignment.Status == models.AssignmentStatusRejected {
			// Update existing assignment
			existingAssignment.WorkerID = workerID
			existingAssignment.AssignedBy = adminID
			existingAssignment.Status = models.AssignmentStatusAssigned
			existingAssignment.AssignedAt = time.Now()
			existingAssignment.AssignmentNotes = "Worker reassigned by admin"
			
			// Clear previous acceptance/rejection data
			existingAssignment.AcceptedAt = nil
			existingAssignment.RejectedAt = nil
			existingAssignment.AcceptanceNotes = ""
			existingAssignment.RejectionNotes = ""
			existingAssignment.RejectionReason = ""
			
			err = workerAssignmentRepo.Update(existingAssignment)
			if err != nil {
				return nil, err
			}
			
			// Update booking status
			booking.Status = models.BookingStatusAssigned
			err = bs.bookingRepo.Update(booking)
			if err != nil {
				return nil, err
			}
			
			// Send notification to new worker
			go bs.notificationService.SendWorkerAssignmentNotification(existingAssignment)
			
			return existingAssignment, nil
		}
	}

	// 5. Create new worker assignment
	assignment := &models.WorkerAssignment{
		BookingID:        booking.ID,
		WorkerID:         workerID,
		AssignedBy:       adminID,
		Status:           models.AssignmentStatusAssigned,
		AssignedAt:       time.Now(),
		AssignmentNotes:  "Assigned by admin",
	}

	err = bs.workerAssignmentRepo.Create(assignment)
	if err != nil {
		return nil, err
	}

	// 6. Update booking status
	booking.Status = models.BookingStatusAssigned
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 7. Send notification to worker
	go bs.notificationService.SendWorkerAssignmentNotification(assignment)

	return assignment, nil
}

// GetBookingStats gets booking statistics (admin only)
func (bs *BookingService) GetBookingStats() (map[string]interface{}, error) {
	return bs.bookingRepo.GetBookingStats()
}

// GetRecentBookings gets recent bookings for dashboard
func (bs *BookingService) GetRecentBookings(limit int) ([]models.OptimizedBookingResponse, error) {
	return bs.bookingRepo.GetRecentBookings(limit)
}

// GetUrgentAlerts gets urgent alerts for dashboard
func (bs *BookingService) GetUrgentAlerts() ([]models.OptimizedBookingResponse, error) {
	return bs.bookingRepo.GetUrgentAlerts()
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
		PaymentStatus:       models.PaymentStatusCompleted, // Payment is completed
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

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}

// VerifyInquiryPayment verifies payment for inquiry booking and creates the actual booking
func (bs *BookingService) VerifyInquiryPayment(userID uint, req *models.VerifyInquiryPaymentRequest) (*models.Booking, error) {
	logrus.Infof("VerifyInquiryPayment called for user_id: %d, service_id: %d", userID, req.ServiceID)
	
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		logrus.Errorf("Service not found: %v", err)
		return nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, errors.New("service is not active")
	}

	// 2. Validate service is inquiry-based
	if service.PriceType != "inquiry" {
		return nil, errors.New("service is not inquiry-based")
	}

	// 3. Verify Razorpay payment
	if bs.razorpayService == nil {
		logrus.Error("Razorpay service is nil")
		return nil, errors.New("payment service not available")
	}
	
	logrus.Infof("Verifying Razorpay payment: payment_id=%s, order_id=%s", req.RazorpayPaymentID, req.RazorpayOrderID)
	isValid, err := bs.razorpayService.VerifyPayment(req.RazorpayPaymentID, req.RazorpayOrderID, req.RazorpaySignature)
	if err != nil {
		logrus.Errorf("Payment verification failed: %v", err)
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}
	if !isValid {
		logrus.Error("Payment signature verification failed")
		return nil, errors.New("payment signature verification failed")
	}
	
	logrus.Info("Payment verification successful")

	// 4. Generate booking reference
	bookingReference := bs.generateBookingReference()

	// 5. Create booking with inquiry type (pending since quote workflow starts after payment)
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           req.ServiceID,
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending, // Pending since quote workflow starts after payment
		PaymentStatus:       models.PaymentStatusCompleted, // Payment is completed for inquiry fee
		BookingType:         models.BookingTypeInquiry,
		ScheduledDate:       nil, // Will be set when quote is accepted
		ScheduledTime:       nil, // Will be set when quote is accepted
		ScheduledEndTime:    nil, // Will be set when quote is accepted
		Address:             nil, // Will be filled when quote is accepted
		Description:         "",  // Will be filled when quote is accepted
		ContactPerson:       "",  // Will be filled when quote is accepted
		ContactPhone:        "",  // Will be filled when quote is accepted
		SpecialInstructions: "",  // Will be filled when quote is accepted
	}

	logrus.Infof("Creating booking with status: %s, booking_type: %s, payment_status: %s", 
		booking.Status, booking.BookingType, booking.PaymentStatus)
	logrus.Infof("Booking struct values - Status: %v, BookingType: %v, PaymentStatus: %v", 
		booking.Status, booking.BookingType, booking.PaymentStatus)

	// 6. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, err
	}

	logrus.Infof("Booking created with ID: %d, status: %s, booking_type: %s", 
		booking.ID, booking.Status, booking.BookingType)

	// 7. Get the existing payment record to retrieve inquiry data
	existingPayment, err := bs.paymentService.GetPaymentByRazorpayOrderID(req.RazorpayOrderID)
	if err != nil {
		logrus.Errorf("Could not find existing payment record: %v", err)
		return nil, fmt.Errorf("payment record not found: %v", err)
	}
	
	// 8. Retrieve inquiry data from payment metadata
	var inquiryData struct {
		Address             models.BookingAddress `json:"address"`
		Description         string                `json:"description"`
		ContactPerson       string                `json:"contact_person"`
		ContactPhone        string                `json:"contact_phone"`
		SpecialInstructions string                `json:"special_instructions"`
	}
	
	if existingPayment.Metadata != nil {
		// Convert metadata back to inquiry data
		metadataBytes, err := json.Marshal(existingPayment.Metadata)
		if err != nil {
			logrus.Errorf("Failed to marshal payment metadata: %v", err)
			return nil, fmt.Errorf("failed to retrieve inquiry data: %v", err)
		}
		
		err = json.Unmarshal(metadataBytes, &inquiryData)
		if err != nil {
			logrus.Errorf("Failed to unmarshal inquiry data: %v", err)
			return nil, fmt.Errorf("failed to parse inquiry data: %v", err)
		}
	} else {
		logrus.Error("Payment metadata is nil - no inquiry data found")
		return nil, errors.New("inquiry data not found in payment metadata")
	}
	
	// 9. Update booking with inquiry data
	addressJSON, err := json.Marshal(inquiryData.Address)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal address: %v", err)
	}
	addressStr := string(addressJSON)
	
	booking.Address = &addressStr
	booking.Description = inquiryData.Description
	booking.ContactPerson = inquiryData.ContactPerson
	booking.ContactPhone = inquiryData.ContactPhone
	booking.SpecialInstructions = inquiryData.SpecialInstructions
	
	// 10. Update the booking with inquiry data
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		logrus.Errorf("Failed to update booking with inquiry data: %v", err)
		return nil, fmt.Errorf("failed to update booking: %v", err)
	}
	
	// 11. Update payment record with booking link and mark as completed
	existingPayment.RelatedEntityType = "booking"
	existingPayment.RelatedEntityID = booking.ID
	existingPayment.Status = models.PaymentStatusCompleted
	existingPayment.RazorpayPaymentID = &req.RazorpayPaymentID
	existingPayment.RazorpaySignature = &req.RazorpaySignature
	now := time.Now()
	existingPayment.CompletedAt = &now
	existingPayment.Notes = "Inquiry booking fee - payment completed"
	
	err = bs.paymentService.UpdatePayment(existingPayment)
	if err != nil {
		logrus.Errorf("Failed to update payment record: %v", err)
		// Don't fail the booking creation if payment update fails
	} else {
		logrus.Infof("Payment record updated successfully for booking ID: %d", booking.ID)
	}

	// 8. Send notification (optional)
	// bs.notificationService.SendInquiryBookingNotification(booking)

	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}



// ConvertToOptimizedBookingResponse converts a booking model to optimized response
func (bs *BookingService) ConvertToOptimizedBookingResponse(booking *models.Booking) *models.OptimizedBookingResponse {
	// Parse address from JSON string
	var address *models.BookingAddress
	if booking.Address != nil {
		var addr models.BookingAddress
		if err := json.Unmarshal([]byte(*booking.Address), &addr); err == nil {
			address = &addr
		}
	}

	// Get payment information
	var payment *models.OptimizedPaymentInfo
	
	// First try to get payment from preloaded relationship
	if booking.Payment != nil && booking.Payment.ID != 0 {
		payment = &models.OptimizedPaymentInfo{
			Status:            string(booking.Payment.Status),
			Amount:            booking.Payment.Amount,
			Currency:          booking.Payment.Currency,
			PaymentMethod:     &booking.Payment.Method,
			RazorpayOrderID:   booking.Payment.RazorpayOrderID,
			RazorpayPaymentID: booking.Payment.RazorpayPaymentID,
			CreatedAt:         &booking.Payment.CreatedAt,
		}
	} else {
		// Manually load payment if not preloaded
		paymentRepo := repositories.NewPaymentRepository()
		paymentRecord, err := paymentRepo.GetByRelatedEntity("booking", booking.ID)
		if err != nil {
			logrus.Infof("No payment found for booking %d: %v", booking.ID, err)
		} else if paymentRecord != nil {
			logrus.Infof("Found payment for booking %d: amount=%f, status=%s", booking.ID, paymentRecord.Amount, paymentRecord.Status)
			payment = &models.OptimizedPaymentInfo{
				Status:            string(paymentRecord.Status),
				Amount:            paymentRecord.Amount,
				Currency:          paymentRecord.Currency,
				PaymentMethod:     &paymentRecord.Method,
				RazorpayOrderID:   paymentRecord.RazorpayOrderID,
				RazorpayPaymentID: paymentRecord.RazorpayPaymentID,
				CreatedAt:         &paymentRecord.CreatedAt,
			}
		} else {
			logrus.Infof("Payment record is nil for booking %d", booking.ID)
		}
	}

	// Get worker assignment information
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
		Address:          address,
		Contact: &models.OptimizedContactInfo{
			Person:              booking.ContactPerson,
			Phone:               booking.ContactPhone,
			Description:         booking.Description,
			SpecialInstructions: booking.SpecialInstructions,
		},
		Payment:          payment,
		PaymentProgress:  booking.PaymentProgress,
		WorkerAssignment: workerAssignment,
	}
}

// ConvertToDetailedBookingResponse converts a booking model to detailed response
func (bs *BookingService) ConvertToDetailedBookingResponse(booking *models.Booking) *models.DetailedBookingResponse {
	// Parse address from JSON string
	var address *models.BookingAddress
	if booking.Address != nil {
		var addr models.BookingAddress
		if err := json.Unmarshal([]byte(*booking.Address), &addr); err == nil {
			address = &addr
		}
	}

	// Get detailed payment information
	var payment *models.DetailedPaymentInfo
	
	// First try to get payment from preloaded relationship
	if booking.Payment != nil && booking.Payment.ID != 0 {
		payment = &models.DetailedPaymentInfo{
			ID:                booking.Payment.ID,
			Status:            string(booking.Payment.Status),
			Amount:            booking.Payment.Amount,
			Currency:          booking.Payment.Currency,
			PaymentMethod:     &booking.Payment.Method,
			RazorpayOrderID:   booking.Payment.RazorpayOrderID,
			RazorpayPaymentID: booking.Payment.RazorpayPaymentID,
			RazorpaySignature: booking.Payment.RazorpaySignature,
			Metadata:          map[string]interface{}(*booking.Payment.Metadata),
			CreatedAt:         booking.Payment.CreatedAt,
			UpdatedAt:         booking.Payment.UpdatedAt,
		}
	} else {
		// Manually load payment if not preloaded
		paymentRepo := repositories.NewPaymentRepository()
		paymentRecord, err := paymentRepo.GetByRelatedEntity("booking", booking.ID)
		if err != nil {
			logrus.Infof("No payment found for booking %d (detailed): %v", booking.ID, err)
		} else if paymentRecord != nil {
			logrus.Infof("Found payment for booking %d (detailed): amount=%f, status=%s", booking.ID, paymentRecord.Amount, paymentRecord.Status)
			payment = &models.DetailedPaymentInfo{
				ID:                paymentRecord.ID,
				Status:            string(paymentRecord.Status),
				Amount:            paymentRecord.Amount,
				Currency:          paymentRecord.Currency,
				PaymentMethod:     &paymentRecord.Method,
				RazorpayOrderID:   paymentRecord.RazorpayOrderID,
				RazorpayPaymentID: paymentRecord.RazorpayPaymentID,
				RazorpaySignature: paymentRecord.RazorpaySignature,
				Metadata:          map[string]interface{}(*paymentRecord.Metadata),
				CreatedAt:         paymentRecord.CreatedAt,
				UpdatedAt:         paymentRecord.UpdatedAt,
			}
		} else {
			logrus.Infof("Payment record is nil for booking %d (detailed)", booking.ID)
		}
	}

	// Get detailed worker assignment information
	var workerAssignment *models.DetailedWorkerAssignment
	if booking.WorkerAssignment != nil {
		workerAssignment = &models.DetailedWorkerAssignment{
			ID:              booking.WorkerAssignment.ID,
			WorkerID:        &booking.WorkerAssignment.WorkerID,
			AssignedBy:      &booking.WorkerAssignment.AssignedBy,
			Status:          (*string)(&booking.WorkerAssignment.Status),
			AssignedAt:      &booking.WorkerAssignment.AssignedAt,
			AcceptedAt:      booking.WorkerAssignment.AcceptedAt,
			RejectedAt:      booking.WorkerAssignment.RejectedAt,
			StartedAt:       booking.WorkerAssignment.StartedAt,
			CompletedAt:     booking.WorkerAssignment.CompletedAt,
			AssignmentNotes: &booking.WorkerAssignment.AssignmentNotes,
			AcceptanceNotes: &booking.WorkerAssignment.AcceptanceNotes,
			RejectionNotes:  &booking.WorkerAssignment.RejectionNotes,
			RejectionReason: &booking.WorkerAssignment.RejectionReason,
		}

		// Add worker details if available
		if booking.WorkerAssignment.Worker.ID != 0 {
			workerAssignment.Worker = bs.convertToDetailedUserInfo(&booking.WorkerAssignment.Worker)
		}

		// Add assigned by user details if available
		if booking.WorkerAssignment.AssignedByUser.ID != 0 {
			workerAssignment.AssignedByUser = bs.convertToDetailedUserInfo(&booking.WorkerAssignment.AssignedByUser)
		}
	}

	// Get related bookings (same user, different bookings)
	relatedBookings := bs.getRelatedBookings(booking.UserID, booking.ID)

	// Get statistics
	statistics := bs.getBookingStatistics(booking.ID)

	// Get payment progress
	paymentProgress := booking.GetPaymentProgress()

	return &models.DetailedBookingResponse{
		ID:                    booking.ID,
		BookingReference:      booking.BookingReference,
		Status:                booking.Status,
		BookingType:           booking.BookingType,
		CompletionType:        booking.CompletionType,
		ScheduledDate:         booking.ScheduledDate,
		ScheduledTime:         booking.ScheduledTime,
		ScheduledEndTime:      booking.ScheduledEndTime,
		ActualStartTime:       booking.ActualStartTime,
		ActualEndTime:         booking.ActualEndTime,
		ActualDurationMinutes: booking.ActualDurationMinutes,
		HoldExpiresAt:         booking.HoldExpiresAt,
		CreatedAt:             booking.CreatedAt,
		UpdatedAt:             booking.UpdatedAt,
		DeletedAt:             &booking.DeletedAt.Time,
		Service: &models.DetailedServiceInfo{
			ID:          booking.Service.ID,
			Name:        booking.Service.Name,
			Slug:        booking.Service.Slug,
			Description: booking.Service.Description,
			Images:      booking.Service.Images,
			PriceType:   booking.Service.PriceType,
			Price:       booking.Service.Price,
			Duration:    booking.Service.Duration,
			Category:    bs.convertToDetailedCategory(&booking.Service.Category),
			Subcategory: bs.convertToDetailedSubcategory(&booking.Service.Subcategory),
			IsActive:    booking.Service.IsActive,
			CreatedAt:   booking.Service.CreatedAt,
			UpdatedAt:   booking.Service.UpdatedAt,
		},
		User: bs.convertToDetailedUserInfo(&booking.User),
		Address: address,
		Contact: &models.OptimizedContactInfo{
			Person:              booking.ContactPerson,
			Phone:               booking.ContactPhone,
			Description:         booking.Description,
			SpecialInstructions: booking.SpecialInstructions,
		},
		Payment:          payment,
		PaymentProgress:  paymentProgress,
		WorkerAssignment: workerAssignment,
		BufferRequests:   booking.BufferRequests,
		Reviews:          bs.getBookingReviews(booking.ID),
		ChatMessages:     bs.getBookingChatMessages(booking.ID),
		ActivityLog:      bs.getBookingActivityLog(booking.ID),
		Disputes:         bs.getBookingDisputes(booking.ID),
		RelatedBookings:  relatedBookings,
		Statistics:       statistics,
	}
}

// Helper functions for detailed response
func (bs *BookingService) convertToDetailedUserInfo(user *models.User) *models.DetailedUserInfo {
	return &models.DetailedUserInfo{
		ID:                    user.ID,
		Name:                  user.Name,
		Email:                 user.Email,
		Phone:                 user.Phone,
		UserType:              string(user.UserType),
		Avatar:                user.Avatar,
		Gender:                user.Gender,
		IsActive:              user.IsActive,
		LastLoginAt:           user.LastLoginAt,
		RoleApplicationStatus: user.RoleApplicationStatus,
		WalletBalance:         user.WalletBalance,
		HasActiveSubscription: user.HasActiveSubscription,
		SubscriptionExpiryDate: user.SubscriptionExpiryDate,
		CreatedAt:             user.CreatedAt,
		UpdatedAt:             user.UpdatedAt,
	}
}

func (bs *BookingService) convertToDetailedCategory(category *models.Category) *models.DetailedCategory {
	if category == nil || category.ID == 0 {
		return nil
	}
	return &models.DetailedCategory{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		IsActive:    category.IsActive,
	}
}

func (bs *BookingService) convertToDetailedSubcategory(subcategory *models.Subcategory) *models.DetailedSubcategory {
	if subcategory == nil || subcategory.ID == 0 {
		return nil
	}
	return &models.DetailedSubcategory{
		ID:          subcategory.ID,
		Name:        subcategory.Name,
		Slug:        subcategory.Slug,
		Description: subcategory.Description,
		Icon:        subcategory.Icon,
		IsActive:    subcategory.IsActive,
	}
}

func (bs *BookingService) getRelatedBookings(userID uint, excludeBookingID uint) []models.RelatedBooking {
	// This would typically query the database for related bookings
	// For now, returning empty slice
	return []models.RelatedBooking{}
}

func (bs *BookingService) getBookingStatistics(bookingID uint) *models.BookingStatistics {
	// This would typically calculate statistics from the database
	// For now, returning default values
	return &models.BookingStatistics{
		TotalMessages: 0,
		TotalReviews:  0,
		AverageRating: 0.0,
	}
}

func (bs *BookingService) getBookingReviews(bookingID uint) []models.Review {
	// This would typically query the database for reviews
	// For now, returning empty slice
	return []models.Review{}
}

func (bs *BookingService) getBookingChatMessages(bookingID uint) []models.ChatMessageInfo {
	// This would typically query the database for chat messages
	// For now, returning empty slice
	return []models.ChatMessageInfo{}
}

func (bs *BookingService) getBookingActivityLog(bookingID uint) []models.ActivityLog {
	// This would typically query the database for activity log
	// For now, returning empty slice
	return []models.ActivityLog{}
}

func (bs *BookingService) getBookingDisputes(bookingID uint) []models.Dispute {
	// This would typically query the database for disputes
	// For now, returning empty slice
	return []models.Dispute{}
}

// CreateBookingWithWallet creates a booking with wallet payment for fixed price services
func (bs *BookingService) CreateBookingWithWallet(userID uint, req *models.CreateBookingRequest) (*models.Booking, error) {
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, errors.New("service is not active")
	}

	// 2. Validate service is fixed price
	if service.PriceType != "fixed" {
		return nil, errors.New("service is not fixed price")
	}

	// 3. Check if service price is valid
	if service.Price == nil {
		return nil, errors.New("service price is not set")
	}

	// 4. Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid scheduled date format")
	}

	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid scheduled time format")
	}

	// 5. Combine date and time
	scheduledDateTime := time.Date(
		scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0,
		scheduledDate.Location(),
	)

	// 6. Validate scheduled time is in the future
	if scheduledDateTime.Before(time.Now()) {
		return nil, errors.New("scheduled time must be in the future")
	}

	// 7. Check if time slot is available
	location := ""
	if req.Address.City != "" && req.Address.State != "" {
		location = req.Address.City + ", " + req.Address.State
	}
	
	serviceDurationMinutes := 60 // Default duration
	if service.Duration != nil {
		durationStr := *service.Duration
		if duration, err := strconv.Atoi(durationStr); err == nil {
			serviceDurationMinutes = duration
		}
	}
	
	isSlotAvailable, err := bs.isTimeSlotAvailable(scheduledTime, serviceDurationMinutes, req.ServiceID, location)
	if err != nil {
		return nil, fmt.Errorf("failed to check slot availability: %v", err)
	}
	
	if !isSlotAvailable {
		return nil, errors.New("selected time slot is not available")
	}

	// 8. Generate booking reference
	bookingReference := bs.generateBookingReference()

	// 9. Calculate scheduled end time
	bufferTimeMinutes := 15
	scheduledEndTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

	// 10. Convert address object to JSON string for storage
	addressJSON, err := json.Marshal(req.Address)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal address: %v", err)
	}
	addressStr := string(addressJSON)
	
	// 11. Create booking with confirmed status
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           req.ServiceID,
		BookingReference:    bookingReference,
		Status:              models.BookingStatusConfirmed,
		PaymentStatus:       models.PaymentStatusCompleted,
		BookingType:         models.BookingTypeRegular,
		ScheduledDate:       &scheduledDate,
		ScheduledTime:       &scheduledTime,
		ScheduledEndTime:    &scheduledEndTime,
		Address:             &addressStr,
		Description:         req.Description,
		ContactPerson:       req.ContactPerson,
		ContactPhone:        req.ContactPhone,
		SpecialInstructions: req.SpecialInstructions,
	}

	// 12. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to save booking: %v", err)
	}

	// 13. Process wallet payment after booking is created
	walletService := NewUnifiedWalletService()
	_, err = walletService.DeductFromWalletForBooking(userID, *service.Price, booking.ID, "Service booking payment")
	if err != nil {
		// If payment fails, update booking status to cancelled
		booking.Status = models.BookingStatusCancelled
		booking.PaymentStatus = "failed"
		bs.bookingRepo.Update(booking)
		return nil, fmt.Errorf("failed to process wallet payment: %v", err)
	}

	// 14. Send confirmation notification
	go bs.notificationService.SendBookingConfirmation(booking)

	logrus.Infof("Wallet payment booking created successfully: booking_id=%d, amount=%.2f", booking.ID, *service.Price)
	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}

// CreateInquiryBookingWithWallet creates an inquiry booking with wallet payment
func (bs *BookingService) CreateInquiryBookingWithWallet(userID uint, req *models.CreateInquiryBookingRequest) (*models.Booking, error) {
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, errors.New("service is not active")
	}

	// 2. Validate service is inquiry-based
	if service.PriceType != "inquiry" {
		return nil, errors.New("service is not inquiry-based")
	}

	// 3. Check service availability using the address from the inquiry request
	available, err := bs.serviceAreaRepo.CheckServiceAvailability(req.ServiceID, req.Address.City, req.Address.State)
	if err != nil {
		return nil, fmt.Errorf("failed to check service availability: %v", err)
	}
	if !available {
		return nil, fmt.Errorf("service is not available in your selected address location (%s, %s). Please choose a different address or contact support for availability in your area", req.Address.City, req.Address.State)
	}

	// 4. Check inquiry booking fee
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

	// 5. Generate booking reference
	bookingReference := bs.generateBookingReference()

	// 6. Convert address object to JSON string for storage
	addressJSON, err := json.Marshal(req.Address)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal address: %v", err)
	}
	addressStr := string(addressJSON)
	
	// 7. Create booking with inquiry type
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           req.ServiceID,
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending,
		PaymentStatus:       models.PaymentStatusCompleted, // Payment completed via wallet
		BookingType:         models.BookingTypeInquiry,
		ScheduledDate:       nil, // Will be set when quote is accepted
		ScheduledTime:       nil, // Will be set when quote is accepted
		ScheduledEndTime:    nil, // Will be set when quote is accepted
		Address:             &addressStr,
		Description:         req.Description,
		ContactPerson:       req.ContactPerson,
		ContactPhone:        req.ContactPhone,
		SpecialInstructions: req.SpecialInstructions,
	}

	// 8. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, fmt.Errorf("failed to save booking: %v", err)
	}

	// 9. Process wallet payment if fee is required (after booking is created)
	if feeAmount > 0 {
		feeFloat := float64(feeAmount)
		walletService := NewUnifiedWalletService()
		_, err = walletService.DeductFromWalletForBooking(userID, feeFloat, booking.ID, "Inquiry booking fee")
		if err != nil {
			// If payment fails, update booking status to cancelled
			booking.Status = models.BookingStatusCancelled
			booking.PaymentStatus = "failed"
			bs.bookingRepo.Update(booking)
			return nil, fmt.Errorf("failed to process wallet payment: %v", err)
		}
	}

	logrus.Infof("Inquiry booking with wallet payment created successfully: booking_id=%d, fee_amount=%.2f", booking.ID, float64(feeAmount))
	// Calculate payment progress before returning
	booking.GetPaymentProgress()
	
	return booking, nil
}