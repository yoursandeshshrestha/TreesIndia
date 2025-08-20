package services

import (
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"
)

// LocationService handles location business logic
type LocationService struct {
	locationRepo *repositories.LocationRepository
	userRepo     *repositories.UserRepository
}

// NewLocationService creates a new location service
func NewLocationService() *LocationService {
	return &LocationService{
		locationRepo: repositories.NewLocationRepository(),
		userRepo:     repositories.NewUserRepository(),
	}
}

// CreateLocation creates a new location for a user (one per user)
func (ls *LocationService) CreateLocation(userID uint, req *models.CreateLocationRequest) (*models.Location, error) {
	// Check if user exists
	var user models.User
	if err := ls.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if user already has a location
	exists, err := ls.locationRepo.ExistsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing location: %w", err)
	}

	if exists {
		return nil, fmt.Errorf("user already has a location")
	}

	// Create location
	location := &models.Location{
		UserID:     userID,
		City:       req.City,
		State:      req.State,
		Country:    req.Country,
		Address:    req.Address,
		PostalCode: req.PostalCode,
		Latitude:   req.Latitude,
		Longitude:  req.Longitude,
		IsActive:   true,
		UpdatedAt:  time.Now(),
		CreatedAt:  time.Now(),
	}

	if err := ls.locationRepo.CreateLocation(location); err != nil {
		return nil, fmt.Errorf("failed to create location: %w", err)
	}

	return location, nil
}

// GetLocationByID gets a location by ID
func (ls *LocationService) GetLocationByID(id uint) (*models.Location, error) {
	if id == 0 {
		return nil, fmt.Errorf("invalid location ID")
	}

	var location models.Location
	if err := ls.locationRepo.FindByID(&location, id); err != nil {
		return nil, fmt.Errorf("location not found: %w", err)
	}
	return &location, nil
}

// GetLocationByUserID gets a location by user ID
func (ls *LocationService) GetLocationByUserID(userID uint) (*models.Location, error) {
	var location models.Location
	if err := ls.locationRepo.FindByUserID(&location, userID); err != nil {
		return nil, fmt.Errorf("location not found: %w", err)
	}
	return &location, nil
}

// UpdateLocation updates a location
func (ls *LocationService) UpdateLocation(id uint, req *models.UpdateLocationRequest) (*models.Location, error) {
	var location models.Location
	if err := ls.locationRepo.FindByID(&location, id); err != nil {
		return nil, fmt.Errorf("location not found: %w", err)
	}

	// Update fields
	location.City = req.City
	location.State = req.State
	location.Country = req.Country
	location.Address = req.Address
	location.PostalCode = req.PostalCode
	location.Latitude = req.Latitude
	location.Longitude = req.Longitude
	location.UpdatedAt = time.Now()

	if err := ls.locationRepo.UpdateLocation(&location); err != nil {
		return nil, fmt.Errorf("failed to update location: %w", err)
	}

	return &location, nil
}

// DeleteLocation deletes a location
func (ls *LocationService) DeleteLocation(id uint) error {
	var location models.Location
	if err := ls.locationRepo.FindByID(&location, id); err != nil {
		return fmt.Errorf("location not found: %w", err)
	}

	if err := ls.locationRepo.DeleteLocation(&location); err != nil {
		return fmt.Errorf("failed to delete location: %w", err)
	}

	return nil
}

// GetLocationStats gets location statistics
func (ls *LocationService) GetLocationStats() (map[string]int64, error) {
	return ls.locationRepo.GetLocationStats()
}
