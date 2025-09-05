package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// CallMaskingService handles call masking business logic
type CallMaskingService struct {
	exotelService    *ExotelService
	callMaskingRepo  *repositories.CallMaskingEnabledRepository
	callLogRepo      *repositories.CallLogRepository
	bookingRepo      *repositories.BookingRepository
	userRepo         *repositories.UserRepository
}

// NewCallMaskingService creates a new call masking service
func NewCallMaskingService() *CallMaskingService {
	return &CallMaskingService{
		exotelService:   NewExotelService(),
		callMaskingRepo: repositories.NewCallMaskingEnabledRepository(),
		callLogRepo:     repositories.NewCallLogRepository(),
		bookingRepo:     repositories.NewBookingRepository(),
		userRepo:        repositories.NewUserRepository(),
	}
}

// EnableCallMasking enables call masking for a booking
func (cms *CallMaskingService) EnableCallMasking(bookingID uint) error {
	logrus.Infof("Enabling call masking for booking %d", bookingID)

	// Check if Exotel service is available
	if !cms.exotelService.IsServiceAvailable() {
		logrus.Warn("Exotel service not available, skipping call masking setup")
		return nil
	}

	// Get booking details
	booking, err := cms.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("booking not found: %w", err)
	}

	// Check if booking has assigned worker
	if booking.WorkerAssignment == nil {
		return errors.New("booking has no assigned worker")
	}

	// Get customer and worker details
	customer := &models.User{}
	err = cms.userRepo.FindByID(customer, booking.UserID)
	if err != nil {
		return fmt.Errorf("customer not found: %w", err)
	}

	worker := &models.User{}
	err = cms.userRepo.FindByID(worker, booking.WorkerAssignment.WorkerID)
	if err != nil {
		return fmt.Errorf("worker not found: %w", err)
	}

	// Validate phone numbers
	if customer.Phone == "" || worker.Phone == "" {
		return errors.New("customer or worker phone number not available")
	}

	// Check if call masking already enabled
	existing, err := cms.callMaskingRepo.GetByBookingID(bookingID)
	if err == nil && existing.DisabledAt == nil {
		logrus.Infof("Call masking already enabled for booking %d", bookingID)
		return nil
	}

	// Create call masking record in database
	callMasking := &models.CallMaskingEnabled{
		BookingID:  bookingID,
		WorkerID:   booking.WorkerAssignment.WorkerID,
		CustomerID: booking.UserID,
	}

	err = cms.callMaskingRepo.Create(callMasking)
	if err != nil {
		return fmt.Errorf("failed to enable call masking: %w", err)
	}

	logrus.Infof("Call masking enabled for booking %d", bookingID)
	return nil
}

// InitiateCall initiates a call between customer and worker
func (cms *CallMaskingService) InitiateCall(bookingID uint, callerID uint) error {
	logrus.Infof("Initiating call for booking %d by user %d", bookingID, callerID)

	// Check if Exotel service is available
	if !cms.exotelService.IsServiceAvailable() {
		return errors.New("can't call right now")
	}

	// Get call masking record
	callMasking, err := cms.callMaskingRepo.GetByBookingID(bookingID)
	if err != nil {
		return errors.New("call masking not enabled")
	}

	if callMasking.DisabledAt != nil {
		return errors.New("call masking is disabled")
	}

	// Validate caller is either customer or worker
	if callerID != callMasking.CustomerID && callerID != callMasking.WorkerID {
		return errors.New("unauthorized to initiate call")
	}

	// Get caller and callee details
	caller := &models.User{}
	err = cms.userRepo.FindByID(caller, callerID)
	if err != nil {
		return fmt.Errorf("caller not found: %w", err)
	}

	var calleeID uint
	if callerID == callMasking.CustomerID {
		calleeID = callMasking.WorkerID
	} else {
		calleeID = callMasking.CustomerID
	}

	callee := &models.User{}
	err = cms.userRepo.FindByID(callee, calleeID)
	if err != nil {
		return fmt.Errorf("callee not found: %w", err)
	}

	// Initiate call through Exotel
	callSID, err := cms.exotelService.InitiateCall(caller.Phone, callee.Phone)
	if err != nil {
		logrus.Errorf("Failed to initiate call: %v", err)
		return errors.New("can't call right now")
	}

	// Create call log entry
	callLog := &models.CallLog{
		CallMaskingID:  callMasking.ID,
		CallerID:       callerID,
		CallDuration:   0, // Will be updated when call ends
		CallStatus:     models.CallStatusRinging,
		ExotelCallSID:  callSID,
		StartedAt:      &time.Time{},
	}

	// Set started time
	now := time.Now()
	callLog.StartedAt = &now

	err = cms.callLogRepo.Create(callLog)
	if err != nil {
		logrus.Errorf("Failed to create call log: %v", err)
		// Don't fail the call initiation for this
	}

	// Update call masking call count
	callMasking.CallCount++
	err = cms.callMaskingRepo.Update(callMasking)
	if err != nil {
		logrus.Errorf("Failed to update call masking call count: %v", err)
	}

	logrus.Infof("Call initiated successfully for booking %d", bookingID)
	return nil
}

// DisableCallMasking disables call masking for a booking
func (cms *CallMaskingService) DisableCallMasking(bookingID uint) error {
	logrus.Infof("Disabling call masking for booking %d", bookingID)

	// Get call masking record
	callMasking, err := cms.callMaskingRepo.GetByBookingID(bookingID)
	if err != nil {
		logrus.Warnf("No call masking record found for booking %d", bookingID)
		return nil // Not an error if record doesn't exist
	}

	if callMasking.DisabledAt != nil {
		logrus.Infof("Call masking already disabled for booking %d", bookingID)
		return nil
	}

	// Update record to mark as disabled
	now := time.Now()
	callMasking.DisabledAt = &now

	err = cms.callMaskingRepo.Update(callMasking)
	if err != nil {
		return fmt.Errorf("failed to disable call masking: %w", err)
	}

	logrus.Infof("Call masking disabled for booking %d", bookingID)
	return nil
}

// GetCallLogs retrieves call logs for a booking
func (cms *CallMaskingService) GetCallLogs(bookingID uint) ([]models.CallLogResponse, error) {
	callMasking, err := cms.callMaskingRepo.GetByBookingID(bookingID)
	if err != nil {
		return nil, fmt.Errorf("call masking not found: %w", err)
	}

	logs, err := cms.callLogRepo.GetByCallMaskingID(callMasking.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get call logs: %w", err)
	}

	// Convert to response format
	var response []models.CallLogResponse
	for _, log := range logs {
		// Get caller name
		caller := &models.User{}
		err = cms.userRepo.FindByID(caller, log.CallerID)
		if err != nil {
			logrus.Errorf("Failed to get caller details for log %d: %v", log.ID, err)
			continue
		}

		response = append(response, models.CallLogResponse{
			ID:           log.ID,
			CallerID:     log.CallerID,
			CallerName:   caller.Name,
			CallDuration: log.CallDuration,
			CallStatus:   log.CallStatus,
			StartedAt:    log.StartedAt,
			EndedAt:      log.EndedAt,
			CreatedAt:    log.CreatedAt,
		})
	}

	return response, nil
}

// HandleCallWebhook handles Exotel call status webhooks
func (cms *CallMaskingService) HandleCallWebhook(callSID, callStatus, callDuration string) error {
	logrus.Infof("Handling call webhook for call %s with status %s", callSID, callStatus)

	// Find call log by Exotel call SID
	callLog, err := cms.callLogRepo.GetByExotelCallSID(callSID)
	if err != nil {
		logrus.Errorf("Call log not found for Exotel call SID %s: %v", callSID, err)
		return fmt.Errorf("call log not found: %w", err)
	}

	// Update call log
	callLog.CallStatus = models.CallStatus(callStatus)
	callLog.CallDuration = cms.exotelService.ParseCallDuration(callDuration)

	if callStatus == "completed" || callStatus == "failed" || callStatus == "busy" || callStatus == "no-answer" {
		now := time.Now()
		callLog.EndedAt = &now
	}

	err = cms.callLogRepo.Update(callLog)
	if err != nil {
		return fmt.Errorf("failed to update call log: %w", err)
	}

	// Update call masking total duration if call completed
	if callStatus == "completed" {
		callMasking, err := cms.callMaskingRepo.GetByID(callLog.CallMaskingID)
		if err == nil {
			callMasking.TotalCallDuration += callLog.CallDuration
			cms.callMaskingRepo.Update(callMasking)
		}
	}

	logrus.Infof("Call webhook processed for call %s", callSID)
	return nil
}

// TestCall makes a test call for development
func (cms *CallMaskingService) TestCall(testPhoneNumber string) (string, error) {
	if !cms.exotelService.IsServiceAvailable() {
		return "", errors.New("Exotel service not available")
	}

	callSID, err := cms.exotelService.TestCall(testPhoneNumber)
	if err != nil {
		return "", fmt.Errorf("failed to make test call: %w", err)
	}

	return callSID, nil
}

// GetCallMaskingStatus checks if call masking is available for a booking
func (cms *CallMaskingService) GetCallMaskingStatus(bookingID uint) (bool, error) {
	callMasking, err := cms.callMaskingRepo.GetByBookingID(bookingID)
	if err != nil {
		return false, nil // No record means no call masking
	}

	return callMasking.DisabledAt == nil, nil
}
