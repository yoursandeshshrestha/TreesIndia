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
	notificationService  *NotificationService
	chatService          *ChatService
}

func NewWorkerAssignmentService(chatService *ChatService) *WorkerAssignmentService {
	return &WorkerAssignmentService{
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		bookingRepo:          repositories.NewBookingRepository(),
		userRepo:             repositories.NewUserRepository(),
		workerRepo:           repositories.NewWorkerRepository(),
		notificationService:  NewNotificationService(),
		chatService:          chatService,
	}
}

// GetWorkerAssignments gets all assignments for a worker with filters
func (was *WorkerAssignmentService) GetWorkerAssignments(workerID uint, filters *models.WorkerAssignmentFilters) ([]models.WorkerAssignment, *models.Pagination, error) {
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

	return assignments, &models.Pagination{
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

// AcceptAssignment accepts an assignment
func (was *WorkerAssignmentService) AcceptAssignment(assignmentID uint, workerID uint, notes string) (*models.WorkerAssignment, error) {
	// Get the assignment
	assignment, err := was.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Verify the assignment belongs to the worker
	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment can be accepted
	if assignment.Status != models.AssignmentStatusAssigned {
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

	// Send notification
	go was.notificationService.SendWorkerAssignmentAcceptedNotification(assignment)

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

	// Send notification
	go was.notificationService.SendWorkerAssignmentRejectedNotification(assignment)

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

	// Send notification
	go was.notificationService.SendWorkerAssignmentStartedNotification(assignment)

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
		} else if booking.Service.Price != nil {
			earnings = *booking.Service.Price
		}
		
		// Update worker statistics
		err = was.workerRepo.IncrementCompletedJob(worker.ID, earnings)
		if err != nil {
			logrus.Errorf("Failed to update worker statistics for assignment %d: %v", assignmentID, err)
			// Don't fail the completion if worker update fails
		} else {
			logrus.Infof("Updated worker statistics for assignment %d: worker_id=%d, earnings=%.2f", assignmentID, worker.ID, earnings)
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

	// Send notification
	go was.notificationService.SendWorkerAssignmentCompletedNotification(assignment)

	return assignment, nil
}
