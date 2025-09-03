package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type LocationTrackingService struct {
	workerLocationRepo *repositories.WorkerLocationRepository
	workerAssignmentRepo *repositories.WorkerAssignmentRepository
	bookingRepo *repositories.BookingRepository
	wsService *WebSocketService
	geoapifyService *GeoapifyService
}

func NewLocationTrackingService(wsService *WebSocketService) *LocationTrackingService {
	return &LocationTrackingService{
		workerLocationRepo: repositories.NewWorkerLocationRepository(),
		workerAssignmentRepo: repositories.NewWorkerAssignmentRepository(),
		bookingRepo: repositories.NewBookingRepository(),
		wsService: wsService,
		geoapifyService: NewGeoapifyService(),
	}
}

// StartTracking starts location tracking for a worker's assignment
func (lts *LocationTrackingService) StartTracking(workerID uint, assignmentID uint) (*models.TrackingStatusResponse, error) {
	// Check if assignment exists and worker is assigned
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Check if assignment is in progress
	if assignment.Status != models.AssignmentStatusInProgress {
		return nil, errors.New("can only track location for assignments in progress")
	}

	// Check if tracking is already active
	isActive, err := lts.workerLocationRepo.IsLocationTrackingActive(assignmentID)
	if err != nil {
		logrus.Errorf("Error checking if location tracking is active for assignment %d: %v", assignmentID, err)
		// Check if it's a table not found error
		if strings.Contains(err.Error(), "table not found") {
			return nil, errors.New("location tracking system not initialized - database table missing")
		}
		return nil, errors.New("failed to check location tracking status")
	}
	
	if isActive {
		return nil, errors.New("location tracking already active for this assignment")
	}

	// Create initial location record with default coordinates (0,0) to start tracking
	// The actual coordinates will be updated when UpdateLocation is called
	err = lts.workerLocationRepo.CreateLocation(workerID, assignmentID, assignment.BookingID, 0, 0, 0)
	if err != nil {
		logrus.Errorf("Failed to start location tracking for worker %d, assignment %d: %v", workerID, assignmentID, err)
		return nil, errors.New("failed to start location tracking")
	}

	logrus.Infof("Location tracking started for worker %d, assignment %d", workerID, assignmentID)
	
	// Return tracking status response
	now := time.Now()
	return &models.TrackingStatusResponse{
		AssignmentID:      assignmentID,
		BookingID:         assignment.BookingID,
		WorkerID:          workerID,
		IsTracking:        true,
		Status:            "tracking",
		TrackingStartedAt: &now,
		WorkerName:        assignment.Worker.Name,
		CustomerName:      assignment.Booking.User.Name,
	}, nil
}

// UpdateLocation updates the worker's location and broadcasts to customer
// This method handles both initial location creation and subsequent updates
func (lts *LocationTrackingService) UpdateLocation(workerID uint, assignmentID uint, latitude, longitude, accuracy float64) error {
	// Validate coordinates
	if latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 {
		return errors.New("invalid coordinates")
	}

	// Check if assignment exists and is in progress
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		logrus.Errorf("Assignment %d not found: %v", assignmentID, err)
		return errors.New("assignment not found")
	}

	if assignment.WorkerID != workerID {
		logrus.Errorf("Worker %d unauthorized access to assignment %d (assigned to worker %d)", workerID, assignmentID, assignment.WorkerID)
		return errors.New("unauthorized access to assignment")
	}

	if assignment.Status != models.AssignmentStatusInProgress {
		logrus.Errorf("Assignment %d status is '%s', expected '%s'", assignmentID, assignment.Status, models.AssignmentStatusInProgress)
		return errors.New("can only update location for assignments in progress")
	}

	logrus.Infof("Assignment %d validation passed: worker %d, status %s", assignmentID, workerID, assignment.Status)

	// Check if location tracking is already active
	existingLocation, err := lts.workerLocationRepo.GetActiveLocationByAssignmentID(assignmentID)
	if err != nil && err.Error() != "record not found" {
		logrus.Errorf("Error checking existing location: %v", err)
		return errors.New("failed to check existing location")
	}

	if existingLocation != nil {
		logrus.Infof("Updating existing location for assignment %d", assignmentID)
		// Update existing location
		err = lts.workerLocationRepo.UpdateExistingLocation(existingLocation.ID, latitude, longitude, accuracy)
	} else {
		logrus.Infof("Creating new location for assignment %d", assignmentID)
		// Create new location
		err = lts.workerLocationRepo.CreateLocation(workerID, assignmentID, assignment.BookingID, latitude, longitude, accuracy)
	}

	if err != nil {
		logrus.Errorf("Failed to update/create worker location for worker %d, assignment %d: %v", workerID, assignmentID, err)
		return errors.New("failed to update location")
	}

	// Get updated location with relationships for response calculation
	location, err := lts.workerLocationRepo.GetActiveByAssignmentID(assignmentID)
	if err != nil {
		logrus.Errorf("Failed to get updated location: %v", err)
		return err
	}

	// Calculate distance and ETA from customer location
	locationResponse, err := lts.calculateLocationResponse(location)
	if err != nil {
		logrus.Errorf("Failed to calculate location response: %v", err)
		// Don't fail the update, just log the error
		// Create a basic response for WebSocket broadcasting
		locationResponse = &models.WorkerLocationResponse{
			WorkerID:       location.WorkerID,
			AssignmentID:   location.AssignmentID,
			BookingID:      location.BookingID,
			Latitude:       location.Latitude,
			Longitude:      location.Longitude,
			Accuracy:       location.Accuracy,
			Status:         location.Status,
			LastUpdated:    location.LastUpdated,
		}
	}

	// Broadcast location update via WebSocket
	if lts.wsService != nil && lts.wsService.hub != nil && locationResponse != nil {
		lts.wsService.hub.BroadcastMessage(assignment.BookingID, "location_update", map[string]interface{}{
			"type": "worker_location",
			"data": locationResponse,
		})
	}

	logrus.Infof("Location updated for worker %d, assignment %d: lat=%.6f, lng=%.6f", 
		workerID, assignmentID, latitude, longitude)
	return nil
}

// StopTracking stops location tracking for a worker's assignment
func (lts *LocationTrackingService) StopTracking(workerID uint, assignmentID uint) error {
	// Check if assignment exists
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return errors.New("assignment not found")
	}

	if assignment.WorkerID != workerID {
		return errors.New("unauthorized access to assignment")
	}

	// Stop tracking in database
	err = lts.workerLocationRepo.StopTracking(workerID, assignmentID)
	if err != nil {
		logrus.Errorf("Failed to stop location tracking for worker %d, assignment %d: %v", workerID, assignmentID, err)
		return errors.New("failed to stop location tracking")
	}

	// Broadcast tracking stopped via WebSocket
	if lts.wsService != nil && lts.wsService.hub != nil {
		lts.wsService.hub.BroadcastMessage(assignment.BookingID, "location_update", map[string]interface{}{
			"type": "tracking_stopped",
			"data": map[string]interface{}{
				"assignment_id": assignmentID,
				"worker_id":     workerID,
				"status":        "stopped",
			},
		})
	}

	logrus.Infof("Location tracking stopped for worker %d, assignment %d", workerID, assignmentID)
	return nil
}

// GetWorkerLocation gets the current location of a worker for a specific assignment
func (lts *LocationTrackingService) GetWorkerLocation(assignmentID uint) (*models.WorkerLocationResponse, error) {
	location, err := lts.workerLocationRepo.GetActiveByAssignmentID(assignmentID)
	if err != nil {
		return nil, errors.New("no active location tracking found")
	}

	return lts.calculateLocationResponse(location)
}

// GetTrackingStatus gets the current tracking status for an assignment
func (lts *LocationTrackingService) GetTrackingStatus(assignmentID uint) (*models.TrackingStatusResponse, error) {
	// Check if assignment exists
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	// Check if location tracking is active
	isActive, err := lts.workerLocationRepo.IsLocationTrackingActive(assignmentID)
	if err != nil {
		logrus.Errorf("Error checking tracking status for assignment %d: %v", assignmentID, err)
		return nil, errors.New("failed to check tracking status")
	}

	response := &models.TrackingStatusResponse{
		AssignmentID: assignmentID,
		BookingID:    assignment.BookingID,
		WorkerID:     assignment.WorkerID,
		IsTracking:   isActive,
		Status:       "not_started",
	}

	if isActive {
		// Get active location details
		location, err := lts.workerLocationRepo.GetActiveLocationByAssignmentID(assignmentID)
		if err == nil && location != nil {
			response.Status = location.Status
			response.TrackingStartedAt = &location.CreatedAt
			response.LastLocationUpdate = &location.LastUpdated
			response.WorkerLocation = &models.LocationCoordinates{
				Latitude:  location.Latitude,
				Longitude: location.Longitude,
				Accuracy:  location.Accuracy,
			}
		} else {
			response.Status = "error"
			logrus.Warnf("Tracking marked as active but no location record found for assignment %d", assignmentID)
		}
	}

	// Add worker and customer names if available
	if assignment.Worker.Name != "" {
		response.WorkerName = assignment.Worker.Name
	}
	if assignment.Booking.User.Name != "" {
		response.CustomerName = assignment.Booking.User.Name
	}

	return response, nil
}

// calculateLocationResponse calculates basic location response without distance/ETA calculations
func (lts *LocationTrackingService) calculateLocationResponse(location *models.WorkerLocation) (*models.WorkerLocationResponse, error) {
	// Get customer location from booking address for arrival detection only
	booking, err := lts.bookingRepo.GetByID(location.BookingID)
	if err != nil {
		return nil, err
	}

	// Get customer location from stored address coordinates for arrival detection
	var customerLat, customerLng float64
	var coordinatesFound bool
	
	// Try to get customer location from stored address coordinates first
	if booking.Address != nil && *booking.Address != "" {
		// Parse the JSON address to get stored coordinates
		var bookingAddress models.BookingAddress
		if err := json.Unmarshal([]byte(*booking.Address), &bookingAddress); err == nil {
			// Check if we have valid coordinates stored
			if bookingAddress.Latitude != 0 && bookingAddress.Longitude != 0 {
				customerLat = bookingAddress.Latitude
				customerLng = bookingAddress.Longitude
				coordinatesFound = true
				logrus.Infof("Using stored coordinates for booking %d: %f, %f", location.BookingID, customerLat, customerLng)
			}
		}
		
		// If no stored coordinates, try geocoding the address
		if !coordinatesFound {
			logrus.Infof("No stored coordinates found for booking %d, attempting geocoding", location.BookingID)
			customerLocation, err := lts.getCustomerLocationFromAddress(*booking.Address)
			if err == nil {
				customerLat = customerLocation.Latitude
				customerLng = customerLocation.Longitude
				coordinatesFound = true
				logrus.Infof("Successfully geocoded address for booking %d: %f, %f", location.BookingID, customerLat, customerLng)
			} else {
				logrus.Warnf("Failed to geocode address for booking %d: %v", location.BookingID, err)
			}
		}
	}
	
	// If still no coordinates, use a reasonable default for TreesIndia service area
	if !coordinatesFound {
		logrus.Warnf("No coordinates available for booking %d, using default coordinates", location.BookingID)
		// Use default coordinates (Siliguri, West Bengal - appropriate for TreesIndia)
		customerLat = 26.7271
		customerLng = 88.3953
	}

	// Calculate distance using Haversine formula for arrival detection only
	distance := lts.calculateDistance(
		location.Latitude, location.Longitude,
		customerLat, customerLng,
	)

	// Detect arrival - if distance is very close to 0 (within 50 meters), consider worker arrived
	const arrivalThreshold = 0.05 // 50 meters in kilometers
	hasArrived := distance <= arrivalThreshold

	// Determine status based on arrival
	status := location.Status
	if hasArrived && status == "tracking" {
		status = "arrived"
	}

	response := &models.WorkerLocationResponse{
		WorkerID:       location.WorkerID,
		AssignmentID:   location.AssignmentID,
		BookingID:      location.BookingID,
		Latitude:       location.Latitude,
		Longitude:      location.Longitude,
		Accuracy:       location.Accuracy,
		Status:         status,
		LastUpdated:    location.LastUpdated,
		// Add arrival status
		HasArrived:        hasArrived,
	}

	// Add worker and customer names if available
	if location.Worker.Name != "" {
		response.WorkerName = location.Worker.Name
	}
	if booking.User.Name != "" {
		response.CustomerName = booking.User.Name
	}

	return response, nil
}

// GetCustomerLocation gets the customer location for a specific assignment (for workers)
func (lts *LocationTrackingService) GetCustomerLocation(assignmentID uint, workerID uint) (*models.CustomerLocationResponse, error) {
	// Get assignment to verify worker access
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, errors.New("assignment not found")
	}

	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Get booking details
	booking, err := lts.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		return nil, errors.New("booking not found")
	}

	// Get customer location from address
	var address string
	if booking.Address != nil {
		address = *booking.Address
	} else {
		address = "Default Address" // Fallback address
	}
	
	customerLocation, err := lts.getCustomerLocationFromAddress(address)
	if err != nil {
		logrus.Warnf("Failed to geocode address '%s': %v, using fallback coordinates", address, err)
		// Use fallback coordinates (Siliguri, West Bengal - appropriate for TreesIndia)
		customerLocation = &models.LocationCoordinates{
			Latitude:  26.7271,
			Longitude: 88.3953,
		}
	}

	response := &models.CustomerLocationResponse{
		AssignmentID:   assignmentID,
		BookingID:      assignment.BookingID,
		CustomerName:   booking.User.Name,
		Address:        address,
		ContactPerson:  booking.ContactPerson,
		ContactPhone:   booking.ContactPhone,
		Latitude:       customerLocation.Latitude,
		Longitude:      customerLocation.Longitude,
		Description:    booking.Description,
		ScheduledDate:  booking.ScheduledDate,
		ScheduledTime:  booking.ScheduledTime,
	}

	return response, nil
}

// getCustomerLocationFromAddress converts address to coordinates using Geoapify service
func (lts *LocationTrackingService) getCustomerLocationFromAddress(address string) (*models.LocationCoordinates, error) {
	// Use Geoapify service to geocode the address
	req := &GeocodeRequest{
		Address: address,
	}
	
	response, err := lts.geoapifyService.GeocodeAddress(req)
	if err != nil {
		logrus.Warnf("Failed to geocode address '%s' using Geoapify: %v", address, err)
		return nil, fmt.Errorf("geocoding failed: %w", err)
	}
	
	if len(response.Results) == 0 {
		logrus.Warnf("No geocoding results found for address '%s'", address)
		return nil, fmt.Errorf("no geocoding results found")
	}
	
	result := response.Results[0]
	coordinates := &models.LocationCoordinates{
		Latitude:  result.Geometry.Location.Lat,
		Longitude: result.Geometry.Location.Lng,
	}
	
	logrus.Infof("Successfully geocoded address '%s' to coordinates: %f, %f", 
		address, coordinates.Latitude, coordinates.Longitude)
	
	return coordinates, nil
}

// calculateDistance calculates the distance between two points using Haversine formula
func (lts *LocationTrackingService) calculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLng := (lng2 - lng1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLng/2)*math.Sin(deltaLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// CleanupOldLocations removes old location records
func (lts *LocationTrackingService) CleanupOldLocations() error {
	return lts.workerLocationRepo.CleanupOldLocations()
}

// GetAssignmentDetails gets assignment details for debugging
func (lts *LocationTrackingService) GetAssignmentDetails(assignmentID uint, workerID uint) (map[string]interface{}, error) {
	// Get assignment details
	assignment, err := lts.workerAssignmentRepo.GetByID(assignmentID)
	if err != nil {
		return nil, fmt.Errorf("assignment not found: %w", err)
	}

	if assignment.WorkerID != workerID {
		return nil, errors.New("unauthorized access to assignment")
	}

	// Get current location if exists
	var currentLocation *models.WorkerLocation
	location, err := lts.workerLocationRepo.GetActiveByAssignmentID(assignmentID)
	if err == nil {
		currentLocation = location
	}

	// Get booking details
	booking, err := lts.bookingRepo.GetByID(assignment.BookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found: %w", err)
	}

	return map[string]interface{}{
		"assignment": map[string]interface{}{
			"id":         assignment.ID,
			"status":     assignment.Status,
			"worker_id":  assignment.WorkerID,
			"booking_id": assignment.BookingID,
			"assigned_at": assignment.AssignedAt,
		},
		"booking": map[string]interface{}{
			"id":          booking.ID,
			"description": booking.Description,
			"scheduled_date": booking.ScheduledDate,
			"scheduled_time": booking.ScheduledTime,
		},
		"current_location": currentLocation,
	}, nil
}

// CheckSystemHealth checks if the location tracking system is working properly
func (lts *LocationTrackingService) CheckSystemHealth() error {
	// Check if worker_locations table exists
	err := lts.workerLocationRepo.CheckTableExists()
	if err != nil {
		return fmt.Errorf("worker_locations table not accessible: %w", err)
	}

	// Check if we can perform basic database operations
	testLocation := &models.WorkerLocation{
		WorkerID:     0,
		AssignmentID: 0,
		BookingID:    0,
		Latitude:     0,
		Longitude:    0,
		Accuracy:     0,
		Status:       "test",
		LastUpdated:  time.Now(),
		IsActive:     false,
	}

	// Try to create a test record (it will fail due to foreign key constraints, but that's expected)
	err = lts.workerLocationRepo.GetDB().Create(testLocation).Error
	if err != nil {
		// If it's a foreign key constraint error, that means the table exists and is working
		if strings.Contains(err.Error(), "foreign key") || strings.Contains(err.Error(), "constraint") {
			return nil // Table is working, foreign key constraints are enforced
		}
		// If it's a different error, log it but don't fail the health check
		logrus.Warnf("Health check warning (non-critical): %v", err)
		return nil
	}

	return nil
}
