package services

import (
	"errors"
	"fmt"
	"time"

	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"
)

type BookingService struct {
	bookingRepo      *repositories.BookingRepository
	serviceRepo      *repositories.ServiceRepository
	timeSlotRepo     *repositories.TimeSlotRepository
	serviceConfigRepo *repositories.ServiceConfigRepository
	userRepo         *repositories.UserRepository
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	razorpayService  *RazorpayService
	notificationService *NotificationService
}

func NewBookingService() *BookingService {
	return &BookingService{
		bookingRepo:      repositories.NewBookingRepository(),
		serviceRepo:      repositories.NewServiceRepository(),
		timeSlotRepo:     repositories.NewTimeSlotRepository(),
		serviceConfigRepo: repositories.NewServiceConfigRepository(),
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

	scheduledTime, err := time.Parse("15:04", req.ScheduledTime)
	if err != nil {
		return nil, errors.New("invalid time format")
	}

	// 3. Get service configuration
	config, err := bs.serviceConfigRepo.GetByServiceID(req.ServiceID)
	if err != nil {
		return nil, errors.New("service configuration not found")
	}

	// 4. Check if slot exists and is available
	slot, err := bs.timeSlotRepo.GetByID(req.TimeSlotID)
	if err != nil {
		return nil, errors.New("time slot not found")
	}

	if !slot.IsActive || slot.AvailableWorkers <= 0 {
		return nil, errors.New("time slot is not available")
	}

	// 5. Calculate scheduled end time based on service duration
	var serviceDurationMinutes int
	
	// Use service duration if available, otherwise use config
	if service.Duration != nil && *service.Duration != "" {
		duration, err := utils.ParseDuration(*service.Duration)
		if err != nil {
			return nil, fmt.Errorf("invalid service duration: %v", err)
		}
		serviceDurationMinutes = duration.ToMinutes()
	} else {
		serviceDurationMinutes = config.ServiceDurationMinutes
	}
	
	scheduledEndTime := scheduledTime.Add(time.Duration(serviceDurationMinutes+config.BufferTimeMinutes) * time.Minute)

	// 6. Generate booking reference
	bookingReference := bs.generateBookingReference()

	// 7. Create booking
	booking := &models.Booking{
		UserID:              userID,
		ServiceID:           req.ServiceID,
		TimeSlotID:          req.TimeSlotID,
		BookingReference:    bookingReference,
		Status:              models.BookingStatusPending,
		PaymentStatus:       models.PaymentStatusPending,
		ScheduledDate:       scheduledDate,
		ScheduledTime:       scheduledTime,
		ScheduledEndTime:    scheduledEndTime,
		Address:             req.Address,
		Description:         req.Description,
		ContactPerson:       req.ContactPerson,
		ContactPhone:        req.ContactPhone,
		SpecialInstructions: req.SpecialInstructions,
		TotalAmount:         *service.Price,
	}

	// 8. Save booking
	booking, err = bs.bookingRepo.Create(booking)
	if err != nil {
		return nil, err
	}

	// 9. Decrease available workers count
	err = bs.timeSlotRepo.DecreaseAvailableWorkers(req.TimeSlotID)
	if err != nil {
		return nil, err
	}

	return booking, nil
}

// CreateBookingWithPayment creates booking with Razorpay payment for fixed price services
func (bs *BookingService) CreateBookingWithPayment(userID uint, req *models.CreateBookingRequest) (*models.Booking, *RazorpayOrder, error) {
	// 1. Create booking
	booking, err := bs.CreateBooking(userID, req)
	if err != nil {
		return nil, nil, err
	}

	// 2. Create Razorpay order
	razorpayOrder, err := bs.razorpayService.CreateOrder(booking.TotalAmount, booking.BookingReference, "Booking payment")
	if err != nil {
		return nil, nil, err
	}

	// 3. Update booking with order ID
	booking.RazorpayOrderID = &razorpayOrder.OrderID
	booking.Status = models.BookingStatusPaymentPending
	err = bs.bookingRepo.Update(booking)
	if err != nil {
		return nil, nil, err
	}

	return booking, razorpayOrder, nil
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

	// 3. Increase available workers count
	err = bs.timeSlotRepo.IncreaseAvailableWorkers(booking.TimeSlotID)
	if err != nil {
		return nil, err
	}

	// 4. Process refund if payment was made
	var refundAmount float64
	var refundMethod string
	if booking.PaymentStatus == models.PaymentStatusCompleted {
		refundAmount = booking.TotalAmount
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
	// TODO: Add sequence number
	return fmt.Sprintf("BK%s%06d", timestamp, 1)
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


// RazorpayOrder represents Razorpay order information
type RazorpayOrder struct {
	OrderID  string  `json:"order_id"`
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
	Receipt  string  `json:"receipt"`
	KeyID    string  `json:"key_id"`
}
