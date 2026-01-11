package services

import (
	"errors"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type WorkerAssignmentService struct {
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	bookingRepo          *repositories.BookingRepository
	userRepo             *repositories.UserRepository
	workerRepo           *repositories.WorkerRepository
	serviceRepo          *repositories.ServiceRepository
	notificationService  *NotificationService
	chatService          *ChatService
	callMaskingService   *CallMaskingService
	walletService        *UnifiedWalletService
}

func NewWorkerAssignmentService(chatService *ChatService) *WorkerAssignmentService {
	return &WorkerAssignmentService{
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		bookingRepo:          repositories.NewBookingRepository(),
		userRepo:             repositories.NewUserRepository(),
		workerRepo:           repositories.NewWorkerRepository(),
		serviceRepo:          repositories.NewServiceRepository(),
		notificationService:  NewNotificationService(),
		chatService:          chatService,
		callMaskingService:   NewCallMaskingService(),
		walletService:        NewUnifiedWalletService(),
	}
}

// GetWorkerAssignments gets all assignments for a worker with filters
func (was *WorkerAssignmentService) GetWorkerAssignments(workerID uint, filters *models.WorkerAssignmentFilters) ([]models.WorkerAssignmentResponse, *models.Pagination, error) {
	// Convert models.WorkerAssignmentFilters to repositories.WorkerAssignmentFilters
	repoFilters := &repositories.WorkerAssignmentFilters{
		Status: filters.Status,
		Date:   filters.Date,
		Page:   filters.Page,
		Limit:  filters.Limit,
	}

	assignments, pagination, err := was.workerAssignmentRepo.GetWorkerAssignments(workerID, repoFilters)
	if err != nil {
		logrus.Errorf("Failed to get worker assignments: %v", err)
		return nil, nil, errors.New("failed to get worker assignments")
	}

	// Convert to privacy-protected response
	privacyProtectedAssignments := make([]models.WorkerAssignmentResponse, len(assignments))
	for i, assignment := range assignments {
		privacyProtectedAssignments[i] = was.convertToPrivacyProtectedResponse(assignment)
	}

	return privacyProtectedAssignments, &models.Pagination{
		Page:       pagination.Page,
		Limit:      pagination.Limit,
		Total:      pagination.Total,
		TotalPages: pagination.TotalPages,
	}, nil
}

// GetWorkerAssignment gets a specific assignment for a worker
func (was *WorkerAssignmentService) GetWorkerAssignment(assignmentID uint, workerID uint) (*models.WorkerAssignment, error) {
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	return assignment, nil
}

// convertToPrivacyProtectedResponse converts a WorkerAssignment to WorkerAssignmentResponse (privacy protected)
func (was *WorkerAssignmentService) convertToPrivacyProtectedResponse(assignment models.WorkerAssignment) models.WorkerAssignmentResponse {
	return models.WorkerAssignmentResponse{
		Model:           assignment.Model,
		BookingID:       assignment.BookingID,
		WorkerID:        assignment.WorkerID,
		AssignedBy:      assignment.AssignedBy,
		Status:          assignment.Status,
		AssignedAt:      assignment.AssignedAt,
		AcceptedAt:      assignment.AcceptedAt,
		RejectedAt:      assignment.RejectedAt,
		StartedAt:       assignment.StartedAt,
		CompletedAt:     assignment.CompletedAt,
		AssignmentNotes: assignment.AssignmentNotes,
		AcceptanceNotes: assignment.AcceptanceNotes,
		RejectionNotes:  assignment.RejectionNotes,
		RejectionReason: assignment.RejectionReason,
		Booking: models.WorkerAssignmentBookingResponse{
			Model:                 assignment.Booking.Model,
			BookingReference:      assignment.Booking.BookingReference,
			UserID:                assignment.Booking.UserID,
			ServiceID:             assignment.Booking.ServiceID,
			Status:                string(assignment.Booking.Status),
			PaymentStatus:         string(assignment.Booking.PaymentStatus),
			BookingType:           string(assignment.Booking.BookingType),
			CompletionType:        (*string)(assignment.Booking.CompletionType),
			ScheduledDate:         assignment.Booking.ScheduledDate,
			ScheduledTime:         assignment.Booking.ScheduledTime,
			ScheduledEndTime:      assignment.Booking.ScheduledEndTime,
			ActualStartTime:       assignment.Booking.ActualStartTime,
			ActualEndTime:         assignment.Booking.ActualEndTime,
			ActualDurationMinutes: assignment.Booking.ActualDurationMinutes,
			Address:               assignment.Booking.Address,
			Description:           assignment.Booking.Description,
			ContactPerson:         assignment.Booking.ContactPerson,
			ContactPhone:          assignment.Booking.ContactPhone,
			SpecialInstructions:   assignment.Booking.SpecialInstructions,
			HoldExpiresAt:         assignment.Booking.HoldExpiresAt,
			QuoteAmount:           assignment.Booking.QuoteAmount,
			QuoteNotes:            assignment.Booking.QuoteNotes,
			QuoteProvidedBy:       assignment.Booking.QuoteProvidedBy,
			QuoteProvidedAt:       assignment.Booking.QuoteProvidedAt,
			QuoteAcceptedAt:       assignment.Booking.QuoteAcceptedAt,
			QuoteExpiresAt:        assignment.Booking.QuoteExpiresAt,
			User: models.WorkerAssignmentUserResponse{
				ID:                      assignment.Booking.User.ID,
				Name:                    assignment.Booking.User.Name,
				Email:                   assignment.Booking.User.Email,
				// Phone is intentionally excluded for privacy
				UserType:                string(assignment.Booking.User.UserType),
				Avatar:                  assignment.Booking.User.Avatar,
				Gender:                  assignment.Booking.User.Gender,
				IsActive:                assignment.Booking.User.IsActive,
				LastLoginAt:             assignment.Booking.User.LastLoginAt,
				RoleApplicationStatus:   assignment.Booking.User.RoleApplicationStatus,
				ApplicationDate:         assignment.Booking.User.ApplicationDate,
				ApprovalDate:            assignment.Booking.User.ApprovalDate,
				WalletBalance:           assignment.Booking.User.WalletBalance,
				SubscriptionID:          assignment.Booking.User.SubscriptionID,
				Subscription:            nil, // Convert UserSubscription to string if needed
				HasActiveSubscription:   assignment.Booking.User.HasActiveSubscription,
				SubscriptionExpiryDate:  assignment.Booking.User.SubscriptionExpiryDate,
				NotificationSettings:    nil, // Field doesn't exist in User model
			},
			Service: assignment.Booking.Service,
		},
		Worker:         assignment.Worker,
		AssignedByUser: assignment.AssignedByUser,
	}
}

// AcceptAssignment accepts an assignment
func (was *WorkerAssignmentService) AcceptAssignment(assignmentID uint, workerID uint, notes string) (*models.WorkerAssignment, error) {
	// Get the assignment
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		logrus.Errorf("Failed to get assignment %d: %v", assignmentID, err)
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		logrus.Warnf("Worker %d attempted to accept assignment %d belonging to worker %d", workerID, assignmentID, assignment.WorkerID)
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment can be accepted
	if assignment.Status != models.AssignmentStatusAssigned {
		logrus.Warnf("Assignment %d cannot be accepted: current status is %s, expected %s", assignmentID, assignment.Status, models.AssignmentStatusAssigned)
		return nil, errors.New("assignment cannot be accepted in current status")
	}

	// Update assignment
	now := time.Now()
	assignment.Status = models.AssignmentStatusAccepted
	assignment.AcceptedAt = &now
	assignment.AcceptanceNotes = notes

	err = was.workerAssignmentRepo.Update(assignment)
	if err != nil {
		logrus.Errorf("Failed to accept assignment: %v", err)
		return nil, errors.New("failed to accept assignment")
	}

	// Update booking status
	booking, err := was.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		logrus.Errorf("Failed to get booking for assignment: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	booking.Status = models.BookingStatusConfirmed
	err = was.bookingRepo.Update(booking)
	if err != nil {
		logrus.Errorf("Failed to update booking status: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	// Create chat room when worker accepts assignment
	_, err = was.chatService.CreateBookingChatRoomWhenWorkerAccepts(assignment.BookingID)
	if err != nil {
		logrus.Errorf("Failed to create chat room for booking %d: %v", assignment.BookingID, err)
		// Don't fail the acceptance if chat room creation fails
	}

	// Enable call masking when worker accepts assignment
	go was.callMaskingService.EnableCallMasking(assignment.BookingID)

	// Send in-app notification to user about worker assignment

	// Send assignment accepted notification
	go func() {
		// Get worker and service details for notification
		var worker models.User
		err := was.userRepo.FindByID(&worker, assignment.WorkerID)
		if err == nil {
			var service models.Service
			err = was.serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
			}
		}
	}()

	return assignment, nil
}

// RejectAssignment rejects an assignment
func (was *WorkerAssignmentService) RejectAssignment(assignmentID uint, workerID uint, reason string, notes string) (*models.WorkerAssignment, error) {
	// Get the assignment
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment can be rejected
	if assignment.Status != models.AssignmentStatusAssigned {
		return nil, errors.New("assignment cannot be rejected in current status")
	}

	// Update assignment
	now := time.Now()
	assignment.Status = models.AssignmentStatusRejected
	assignment.RejectedAt = &now
	assignment.RejectionReason = reason
	assignment.RejectionNotes = notes

	err = was.workerAssignmentRepo.Update(assignment)
	if err != nil {
		logrus.Errorf("Failed to reject assignment: %v", err)
		return nil, errors.New("failed to reject assignment")
	}

	// Update booking status back to confirmed
	booking, err := was.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		logrus.Errorf("Failed to get booking for assignment: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	booking.Status = models.BookingStatusConfirmed
	err = was.bookingRepo.Update(booking)
	if err != nil {
		logrus.Errorf("Failed to update booking status: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	// Disable call masking when assignment is rejected
	go was.callMaskingService.DisableCallMasking(assignment.BookingID)

	// Send notification

	// Send assignment rejected notification
	go func() {
		// Get worker and service details for notification
		var worker models.User
		err := was.userRepo.FindByID(&worker, assignment.WorkerID)
		if err == nil {
			var service models.Service
			err = was.serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
			}
		}
	}()

	return assignment, nil
}

// StartAssignment starts an assignment
func (was *WorkerAssignmentService) StartAssignment(assignmentID uint, workerID uint, notes string) (*models.WorkerAssignment, error) {
	// Get the assignment
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment can be started
	if assignment.Status != models.AssignmentStatusAccepted {
		return nil, errors.New("assignment cannot be started in current status")
	}

	// Update assignment
	now := time.Now()
	assignment.Status = models.AssignmentStatusInProgress
	assignment.StartedAt = &now

	err = was.workerAssignmentRepo.Update(assignment)
	if err != nil {
		logrus.Errorf("Failed to start assignment: %v", err)
		return nil, errors.New("failed to start assignment")
	}

	// Update booking status
	booking, err := was.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		logrus.Errorf("Failed to get booking for assignment: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	booking.Status = models.BookingStatusInProgress
	booking.ActualStartTime = &now
	err = was.bookingRepo.Update(booking)
	if err != nil {
		logrus.Errorf("Failed to update booking status: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	// Send in-app notification to user about work started
	go func() {
		// Get worker and service details for notification
		var worker models.User
		err := was.userRepo.FindByID(&worker, assignment.WorkerID)
		if err == nil {
			var service models.Service
			err = was.serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
			}
		}
	}()

	return assignment, nil
}

// CompleteAssignment completes an assignment
func (was *WorkerAssignmentService) CompleteAssignment(assignmentID uint, workerID uint, notes string, materialsUsed []string, photos []string) (*models.WorkerAssignment, error) {
	// Get the assignment
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment can be completed
	if assignment.Status != models.AssignmentStatusInProgress {
		return nil, errors.New("assignment cannot be completed in current status")
	}

	// Update assignment
	now := time.Now()
	assignment.Status = models.AssignmentStatusCompleted
	assignment.CompletedAt = &now

	err = was.workerAssignmentRepo.Update(assignment)
	if err != nil {
		logrus.Errorf("Failed to complete assignment: %v", err)
		return nil, errors.New("failed to complete assignment")
	}

	// Update booking status
	booking, err := was.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		logrus.Errorf("Failed to get booking for assignment: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	booking.Status = models.BookingStatusCompleted
	booking.ActualEndTime = &now
	
	// Calculate actual duration if start time is available
	if booking.ActualStartTime != nil {
		duration := int(now.Sub(*booking.ActualStartTime).Minutes())
		booking.ActualDurationMinutes = &duration
	}

	err = was.bookingRepo.Update(booking)
	if err != nil {
		logrus.Errorf("Failed to update booking status: %v", err)
		return nil, errors.New("failed to update booking status")
	}

	// Disable call masking when assignment is completed
	go was.callMaskingService.DisableCallMasking(assignment.BookingID)

	// Update worker statistics
	worker, err := was.workerRepo.GetByUserID(assignment.WorkerID)
	if err != nil {
		logrus.Errorf("Failed to get worker for assignment %d: %v", assignmentID, err)
		// Don't fail the completion if worker update fails
	} else {
		// Calculate earnings from booking
		earnings := 0.0

		// Get earnings from quote amount (for inquiry bookings) or service price (for regular bookings)
		if booking.QuoteAmount != nil {
			earnings = *booking.QuoteAmount
			logrus.Infof("Assignment %d earnings from quote_amount: ₹%.2f", assignmentID, earnings)
		} else if booking.Service.ID != 0 && booking.Service.Price != nil {
			earnings = *booking.Service.Price
			logrus.Infof("Assignment %d earnings from service price: ₹%.2f", assignmentID, earnings)
		} else {
			logrus.Warnf("Assignment %d: No earnings found. QuoteAmount: %v, Service.ID: %d, Service.Price: %v",
				assignmentID, booking.QuoteAmount, booking.Service.ID, booking.Service.Price)
		}

		// Update worker statistics
		err = was.workerRepo.IncrementCompletedJob(worker.ID, earnings)
		if err != nil {
			logrus.Errorf("Failed to update worker statistics for assignment %d: %v", assignmentID, err)
			// Don't fail the completion if worker update fails
		} else {
			logrus.Infof("Updated worker statistics for assignment %d: worker_id=%d, earnings=%.2f", assignmentID, worker.ID, earnings)

			// Credit earnings to worker's wallet
			if earnings > 0 {
				_, err = was.walletService.CreditWorkerEarnings(assignment.WorkerID, earnings, assignmentID, booking.BookingReference)
				if err != nil {
					logrus.Errorf("Failed to credit worker earnings to wallet for assignment %d: %v", assignmentID, err)
					// Don't fail the completion if wallet credit fails, but log the error
				} else {
					logrus.Infof("Credited worker earnings to wallet for assignment %d: worker_id=%d, amount=%.2f", assignmentID, assignment.WorkerID, earnings)
				}
			} else {
				logrus.Warnf("Skipping wallet credit for assignment %d: earnings is 0", assignmentID)
			}
		}
	}

	// Close chat room when assignment is completed
	err = was.chatService.CloseBookingChatRoom(assignment.BookingID, "Service completed")
	if err != nil {
		logrus.Errorf("Failed to close chat room for booking %d: %v", assignment.BookingID, err)
		// Don't fail the completion if chat room closure fails
	}

	// TODO: Store materials used and photos in a separate table
	// For now, we'll just log them
	if len(materialsUsed) > 0 {
		logrus.Infof("Materials used for assignment %d: %v", assignmentID, materialsUsed)
	}
	if len(photos) > 0 {
		logrus.Infof("Photos uploaded for assignment %d: %v", assignmentID, photos)
	}

	// Send in-app notification to user about work completed
	go func() {
		// Get worker and service details for notification
		var worker models.User
		err := was.userRepo.FindByID(&worker, assignment.WorkerID)
		if err == nil {
			var service models.Service
			err = was.serviceRepo.FindByID(&service, booking.ServiceID)
			if err == nil {
			}
		}
	}()

	return assignment, nil
}

// sendWorkerAssignmentNotification sends in-app notification about worker assignment

// sendWorkerStartedNotification sends in-app notification about work started

// sendWorkerCompletedNotification sends in-app notification about work completed
