package services

import (
	"fmt"
	"math"
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

// CreateLocation creates a new location for a user
func (ls *LocationService) CreateLocation(userID uint, req *models.CreateLocationRequest) (*models.Location, error) {
	// Check if user exists
	var user models.User
	if err := ls.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if location already exists for user
	exists, err := ls.locationRepo.ExistsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing location: %w", err)
	}

	if exists {
		return nil, fmt.Errorf("location already exists for user")
	}

	// Validate coordinates
	if err := ls.validateCoordinates(req.Latitude, req.Longitude); err != nil {
		return nil, err
	}

	// Create location
	location := &models.Location{
		UserID:    userID,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
		City:      req.City,
		State:     req.State,
		PostalCode: req.PostalCode,
		Source:    req.Source,
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
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

	// Validate coordinates
	if err := ls.validateCoordinates(req.Latitude, req.Longitude); err != nil {
		return nil, err
	}

	// Update fields
	location.Latitude = req.Latitude
	location.Longitude = req.Longitude
	location.Address = req.Address
	location.City = req.City
	location.State = req.State
	location.PostalCode = req.PostalCode
	location.Source = req.Source
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

// validateCoordinates validates latitude and longitude
func (ls *LocationService) validateCoordinates(lat, lng float64) error {
	if lat < -90 || lat > 90 {
		return fmt.Errorf("latitude must be between -90 and 90")
	}
	if lng < -180 || lng > 180 {
		return fmt.Errorf("longitude must be between -180 and 180")
	}
	return nil
}

// CalculateDistance calculates distance between two coordinates using Haversine formula
func (ls *LocationService) CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
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

// FindLocationsWithinRadius finds locations within a certain radius
func (ls *LocationService) FindLocationsWithinRadius(lat, lng float64, radiusKm int) ([]models.Location, error) {
	var locations []models.Location
	if err := ls.locationRepo.FindLocationsWithinRadius(&locations, lat, lng, radiusKm); err != nil {
		return nil, fmt.Errorf("failed to find locations: %w", err)
	}
	return locations, nil
}

// GetLocationStats gets location statistics
func (ls *LocationService) GetLocationStats() (map[string]int64, error) {
	return ls.locationRepo.GetLocationStats()
}
