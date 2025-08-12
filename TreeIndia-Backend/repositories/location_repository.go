package repositories

import (
	"fmt"
	"treesindia/models"
)

// LocationRepository handles location-specific database operations
type LocationRepository struct {
	*BaseRepository
}

// NewLocationRepository creates a new location repository
func NewLocationRepository() *LocationRepository {
	return &LocationRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateLocation creates a new location
func (lr *LocationRepository) CreateLocation(location *models.Location) error {
	return lr.Create(location)
}

// FindByID finds a location by ID
func (lr *LocationRepository) FindByID(location *models.Location, id uint) error {
	if id == 0 {
		return fmt.Errorf("invalid location ID")
	}
	return lr.BaseRepository.FindByID(location, id)
}

// FindByUserID finds a location by user ID
func (lr *LocationRepository) FindByUserID(location *models.Location, userID uint) error {
	return lr.FindByField(location, "user_id", userID)
}

// UpdateLocation updates a location
func (lr *LocationRepository) UpdateLocation(location *models.Location) error {
	return lr.Update(location)
}

// DeleteLocation deletes a location
func (lr *LocationRepository) DeleteLocation(location *models.Location) error {
	return lr.Delete(location)
}

// DeleteByID deletes a location by ID
func (lr *LocationRepository) DeleteByID(id uint) error {
	return lr.db.Delete(&models.Location{}, id).Error
}

// FindAllLocations finds all locations
func (lr *LocationRepository) FindAllLocations(locations *[]models.Location) error {
	return lr.FindAll(locations)
}

// FindLocationsByCity finds locations by city
func (lr *LocationRepository) FindLocationsByCity(locations *[]models.Location, city string) error {
	return lr.db.Where("city ILIKE ?", "%"+city+"%").Find(locations).Error
}

// FindLocationsByState finds locations by state
func (lr *LocationRepository) FindLocationsByState(locations *[]models.Location, state string) error {
	return lr.db.Where("state ILIKE ?", "%"+state+"%").Find(locations).Error
}

// FindLocationsBySource finds locations by source
func (lr *LocationRepository) FindLocationsBySource(locations *[]models.Location, source string) error {
	return lr.db.Where("source = ?", source).Find(locations).Error
}

// FindLocationsWithinRadius finds locations within a certain radius of coordinates
func (lr *LocationRepository) FindLocationsWithinRadius(locations *[]models.Location, lat, lng float64, radiusKm int) error {
	// Using Haversine formula for distance calculation
	query := `
		SELECT *, 
		(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
		cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
		sin(radians(latitude)))) AS distance 
		FROM locations 
		HAVING distance < ? 
		ORDER BY distance
	`
	return lr.db.Raw(query, lat, lng, lat, radiusKm).Scan(locations).Error
}

// ExistsByUserID checks if a location exists for a user
func (lr *LocationRepository) ExistsByUserID(userID uint) (bool, error) {
	return lr.Exists(&models.Location{}, "user_id", userID)
}

// GetLocationStats gets location statistics
func (lr *LocationRepository) GetLocationStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total locations
	var total int64
	if err := lr.db.Model(&models.Location{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Locations by source
	sources := []string{"gps", "manual"}
	for _, source := range sources {
		var count int64
		if err := lr.db.Model(&models.Location{}).Where("source = ?", source).Count(&count).Error; err != nil {
			return nil, err
		}
		stats[source] = count
	}
	
	return stats, nil
}
