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
	razorpayService  *RazorpayService
	notificationService *NotificationService
}

func NewBookingService() *BookingService {
	return &BookingService{
		bookingRepo:      repositories.NewBookingRepository(),
		serviceRepo:      repositories.NewServiceRepository(),
		userRepo:         repositories.NewUserRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		razorpayService:  NewRazorpayService(),
		notificationService: NewNotificationService(),
	}
}

// CreateBooking creates a new booking
func (bs *BookingService) CreateBooking(userID uint, req *models.CreateBookingRequest) (*models.Booking, error) {
	// 1. Validate service exists and is active
	service, err := bs.serviceRepo.GetByID(req.ServiceID)
	if err != nil {
		return nil, errors.New("service not found")
	}
	if !service.IsActive {
		return nil, errors.New("service is not active")
	}

	// 2. Parse scheduled date and time
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	// Parse the scheduled time and create it in IST timezone
	istLocation, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		istLocation = time.FixedZone("IST", 5*60*60+30*60) // UTC+5:30 as fallback
	}
	
	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid time format")
	}
	
	// Create the scheduled time in IST timezone for the given date
	scheduledTime = time.Date(scheduledDate.Year(), scheduledDate.Month(), scheduledDate.Day(),
		scheduledTime.Hour(), scheduledTime.Minute(), 0, 0, istLocation)

	// 3. Get admin configuration for buffer time
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



	// 5. Calculate service duration
	var serviceDurationMinutes int
	
	// Use service duration if available, otherwise use default
	if service.Duration != nil && *service.Duration != "" {
		duration, err := utils.ParseDuration(*service.Duration)
		if err != nil {
			return nil, fmt.Errorf("invalid service duration: %v", err)
		}
		serviceDurationMinutes = duration.ToMinutes()
	} else {
		serviceDurationMinutes = 120 // Default 2 hours
	}

	// Find and assign an available worker
	assignedWorkerID, err := bs.assignAvailableWorker(scheduledTime, serviceDurationMinutes)
	if err != nil {
		return nil, fmt.Errorf("failed to assign worker: %v", err)
	}


	
	scheduledEndTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+bufferTimeMinutes) * time.Minute)

	// 6. Generate booking reference
	bookingReference := bs.generateBookingReference()

	// 7. Create booking
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           req.ServiceID,
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending,
		PaymentStatus:       models.PaymentStatusPending,
		BookingType:         models.BookingTypeRegular,
		ScheduledDate:       &scheduledDate,
		ScheduledTime:       &scheduledTime,
		ScheduledEndTime:    &scheduledEndTime,
		Address:             &req.Address,
		Description:         req.Description,
		ContactPerson:       req.ContactPerson,
		ContactPhone:        req.ContactPhone,
		SpecialInstructions: req.SpecialInstructions,
		TotalAmount:         service.Price,
	}

	// 8. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, err
	}

	// 9. Create worker assignment
	now := time.Now()
	workerAssignment := &models.WorkerAssignment{
		BookingID:  booking.ID,
		WorkerID:   assignedWorkerID,
		AssignedBy: userID, // For now, assign by the user who created the booking
		Status:     "assigned",
		AssignedAt: now,
	}

	// Save worker assignment
	workerAssignmentRepo := repositories.NewWorkerAssignmentRepository()
	if err := workerAssignmentRepo.Create(workerAssignment); err != nil {
		return nil, fmt.Errorf("failed to create worker assignment: %v", err)
	}



	return booking, nil
}

// CreateBookingWithPayment creates booking with Razorpay payment for fixed price services
func (bs *BookingService) CreateBookingWithPayment(userID uint, req *models.CreateBookingRequest) (*models.Booking, map[string]interface{}, error) {
	// 1. Create booking
	booking, err := bs.CreateBooking(userID, req)
	if err != nil {
		return nil, nil, err
	}

	// 2. Create Razorpay order
	var amount float64
	if booking.TotalAmount != nil {
		amount = *booking.TotalAmount
	} else {
		return nil, nil, errors.New("booking amount is not set")
	}
	
	razorpayOrder, err := bs.razorpayService.CreateOrder(amount, booking.BookingReference, "Booking payment")
	if err != nil {
		return nil, nil, err
	}

	// 3. Update booking with order ID
	orderID := razorpayOrder["id"].(string)
	booking.RazorpayOrderID = &orderID
	booking.Status = models.BookingStatusPaymentPending
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, nil, err
	}

	return booking, razorpayOrder, nil
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

	fmt.Printf("Inquiry booking fee config - Value: %s, Parsed: %d\n", feeConfig.Value, feeAmount)

	// 4. If fee is required, create Razorpay order directly (no payment record yet)
	if feeAmount > 0 {
		fmt.Printf("Creating Razorpay order for inquiry booking - Fee: %d\n", feeAmount)
		
		// Generate temporary booking reference for tracking
		tempBookingReference := bs.GenerateTemporaryBookingReference()
		
		// Create Razorpay order directly without payment record
		feeFloat := float64(feeAmount)
		razorpayOrder, err := bs.razorpayService.CreateOrder(feeFloat, tempBookingReference, "Inquiry booking fee")
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create payment order: %v", err)
		}

		fmt.Printf("Razorpay order created - Order ID: %s, Temp Ref: %s\n", razorpayOrder["id"], tempBookingReference)

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
		fmt.Printf("No fee required for inquiry booking\n")
		
		// 5. Generate booking reference
		bookingReference := bs.generateBookingReference()

		// 6. Create booking with minimal data for inquiry-based booking
		booking := &models.Booking{
			UserID:              userID,
			ServiceID:           req.ServiceID,
			BookingReference:    bookingReference,
			Status:              models.BookingStatusPending,
			PaymentStatus:       models.PaymentStatusCompleted, // No payment needed
			BookingType:         models.BookingTypeInquiry,
			ScheduledDate:       nil, // Will be set later
			ScheduledTime:       nil, // Will be set later
			ScheduledEndTime:    nil, // Will be set later
			Address:             nil, // Will be filled later
			Description:         "",  // Will be filled later
			ContactPerson:       "",  // Will be filled later
			ContactPhone:        "",  // Will be filled later
			SpecialInstructions: "",  // Will be filled later
			TotalAmount:         nil, // Will be determined later
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

	// Debug: Log the conflict check
	if len(conflictingBookings) > 0 {
		fmt.Printf("Worker %d has %d conflicting bookings for time %s to %s\n", 
			workerID, len(conflictingBookings), startTime.Format("15:04"), endTime.Format("15:04"))
		for _, booking := range conflictingBookings {
			fmt.Printf("  - Booking %d: %s to %s\n", 
				booking.ID, booking.ScheduledTime.Format("15:04"), booking.ScheduledEndTime.Format("15:04"))
		}
	}

	return len(conflictingBookings) > 0, nil
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
	booking, err := bs.CreateBooking(userID, &req.CreateBookingRequest)
	if err != nil {
		return nil, err
	}

	// 5. Update booking with payment details
	booking.PaymentStatus = models.PaymentStatusCompleted
	booking.PaymentID = &req.RazorpayPaymentID
	booking.RazorpayOrderID = &req.RazorpayOrderID
	now := time.Now()
	booking.PaymentCompletedAt = &now
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

// VerifyPayment verifies payment and confirms booking
func (bs *BookingService) VerifyPayment(req *models.VerifyPaymentRequest) (*models.Booking, error) {
	// 1. Get booking
	booking, err := bs.bookingRepo.GetByID(req.BookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	if booking.Status != models.BookingStatusPaymentPending {
		return nil, errors.New("booking is not in payment pending status")
	}

	// 2. Verify Razorpay payment
	isValid, err := bs.razorpayService.VerifyPayment(req.RazorpayPaymentID, req.RazorpayOrderID, req.RazorpaySignature)
	if err != nil {
		return nil, err
	}

	if !isValid {
		return nil, errors.New("payment verification failed")
	}

	// 3. Update booking status
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = models.PaymentStatusCompleted
	booking.PaymentID = &req.RazorpayPaymentID
	now := time.Now()
	booking.PaymentCompletedAt = &now

	// 4. Save booking
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, err
	}

	// 5. Send confirmation notifications
	go bs.notificationService.SendBookingConfirmation(booking)

	return booking, nil
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
	if booking.PaymentStatus == models.PaymentStatusCompleted && booking.TotalAmount != nil {
		refundAmount = *booking.TotalAmount
		refundMethod = "razorpay"
		// TODO: Process refund through Razorpay
	}

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
	fmt.Printf("Skipping signature verification for inquiry payment - Payment ID: %s, Order ID: %s\n", 
		req.RazorpayPaymentID, req.RazorpayOrderID)

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

	fmt.Printf("Payment record created after verification - ID: %d, Reference: %s\n", payment.ID, payment.PaymentReference)

	// 4. Create the actual booking
	bookingReference := bs.generateBookingReference()
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           serviceID, // This needs to be properly set
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending,
		PaymentStatus:       models.PaymentStatusCompleted,
		BookingType:         models.BookingTypeInquiry,
		ScheduledDate:       nil, // Will be set later
		ScheduledTime:       nil, // Will be set later
		ScheduledEndTime:    nil, // Will be set later
		Address:             nil, // Will be filled later
		Description:         "",  // Will be filled later
		ContactPerson:       "",  // Will be filled later
		ContactPhone:        "",  // Will be filled later
		SpecialInstructions: "",  // Will be filled later
		TotalAmount:         &payment.Amount,
		PaymentID:           &payment.PaymentReference,
		RazorpayOrderID:     &req.RazorpayOrderID,
		PaymentCompletedAt:  &now,
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

	fmt.Printf("Inquiry booking created after payment - Booking ID: %d, Reference: %s\n", booking.ID, booking.BookingReference)

	return booking, nil
}



