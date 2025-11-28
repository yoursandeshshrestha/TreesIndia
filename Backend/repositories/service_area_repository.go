package repositories

import (
	"fmt"
	"treesindia/models"

	"github.com/sirupsen/logrus"
)

// ServiceAreaRepository handles service area-specific database operations
type ServiceAreaRepository struct {
	*BaseRepository
}

// NewServiceAreaRepository creates a new service area repository
func NewServiceAreaRepository() *ServiceAreaRepository {
	return &ServiceAreaRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateServiceArea creates a new service area
func (sar *ServiceAreaRepository) CreateServiceArea(serviceArea *models.ServiceArea) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaRepository.CreateServiceArea panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceAreaRepository.CreateServiceArea called for city: %s, state: %s", 
		serviceArea.City, serviceArea.State)
	
	return sar.Create(serviceArea)
}

// FindByID finds a service area by ID
func (sar *ServiceAreaRepository) FindByID(serviceArea *models.ServiceArea, id uint) error {
	if id == 0 {
		return fmt.Errorf("invalid service area ID")
	}
	return sar.BaseRepository.FindByID(serviceArea, id)
}

// ExistsByID checks if a service area exists by ID
func (sar *ServiceAreaRepository) ExistsByID(id uint) (bool, error) {
	if id == 0 {
		return false, fmt.Errorf("invalid service area ID")
	}
	
	var count int64
	err := sar.db.Model(&models.ServiceArea{}).Where("id = ?", id).Count(&count).Error
	return count > 0, err
}

// FindByServiceID finds all service areas for a service
func (sar *ServiceAreaRepository) FindByServiceID(serviceAreas *[]models.ServiceArea, serviceID uint) error {
	return sar.db.Table("service_areas").
		Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
		Where("service_service_areas.service_id = ?", serviceID).
		Find(serviceAreas).Error
}

// FindByServiceIDAndLocation finds service areas for a service in a specific location
func (sar *ServiceAreaRepository) FindByServiceIDAndLocation(serviceAreas *[]models.ServiceArea, serviceID uint, city, state string) error {
	return sar.db.Table("service_areas").
		Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
		Where("service_service_areas.service_id = ? AND service_areas.city ILIKE ? AND service_areas.state ILIKE ? AND service_areas.is_active = ?", 
			serviceID, city, state, true).
		Find(serviceAreas).Error
}

// FindServicesByLocation finds all services available in a specific location
func (sar *ServiceAreaRepository) FindServicesByLocation(serviceAreas *[]models.ServiceArea, city, state string) error {
	return sar.db.Where("city ILIKE ? AND state ILIKE ? AND is_active = ?", city, state, true).Find(serviceAreas).Error
}

// FindServicesByLocationFlexible finds all services available by city/state OR pincode
func (sar *ServiceAreaRepository) FindServicesByLocationFlexible(serviceAreas *[]models.ServiceArea, city, state, pincode string) error {
	query := sar.db.Where("is_active = ?", true)

	// Build OR condition: match city+state OR pincode
	if pincode != "" {
		query = query.Where("(city ILIKE ? AND state ILIKE ?) OR ? = ANY(pincodes)", city, state, pincode)
	} else {
		query = query.Where("city ILIKE ? AND state ILIKE ?", city, state)
	}

	return query.Find(serviceAreas).Error
}

// UpdateServiceArea updates a service area
func (sar *ServiceAreaRepository) UpdateServiceArea(serviceArea *models.ServiceArea) error {
	return sar.Update(serviceArea)
}

// DeleteServiceArea deletes a service area
func (sar *ServiceAreaRepository) DeleteServiceArea(serviceArea *models.ServiceArea) error {
	return sar.Delete(serviceArea)
}

// DeleteByID deletes a service area by ID
func (sar *ServiceAreaRepository) DeleteByID(id uint) error {
	return sar.db.Delete(&models.ServiceArea{}, id).Error
}

// DeleteByServiceID deletes all service areas for a service
func (sar *ServiceAreaRepository) DeleteByServiceID(serviceID uint) error {
	return sar.db.Table("service_service_areas").Where("service_id = ?", serviceID).Delete(&struct{}{}).Error
}

// FindAllServiceAreas finds all service areas
func (sar *ServiceAreaRepository) FindAllServiceAreas(serviceAreas *[]models.ServiceArea) error {
	return sar.FindAll(serviceAreas)
}

// FindServiceAreasByCity finds service areas by city
func (sar *ServiceAreaRepository) FindServiceAreasByCity(serviceAreas *[]models.ServiceArea, city string) error {
	return sar.db.Where("city ILIKE ? AND is_active = ?", "%"+city+"%", true).Find(serviceAreas).Error
}

// FindServiceAreasByState finds service areas by state
func (sar *ServiceAreaRepository) FindServiceAreasByState(serviceAreas *[]models.ServiceArea, state string) error {
	return sar.db.Where("state ILIKE ? AND is_active = ?", "%"+state+"%", true).Find(serviceAreas).Error
}

// CheckServiceAvailability checks if a service is available in a specific location (city, state, or pincode)
func (sar *ServiceAreaRepository) CheckServiceAvailability(serviceID uint, city, state string) (bool, error) {
	var count int64
	err := sar.db.Table("service_areas").
		Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
		Where("service_service_areas.service_id = ? AND service_areas.city ILIKE ? AND service_areas.state ILIKE ? AND service_areas.is_active = ?",
			serviceID, city, state, true).
		Count(&count).Error

	return count > 0, err
}

// CheckServiceAvailabilityByPincode checks if a service is available for a specific pincode
func (sar *ServiceAreaRepository) CheckServiceAvailabilityByPincode(serviceID uint, pincode string) (bool, error) {
	var count int64
	err := sar.db.Table("service_areas").
		Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
		Where("service_service_areas.service_id = ? AND ? = ANY(service_areas.pincodes) AND service_areas.is_active = ?",
			serviceID, pincode, true).
		Count(&count).Error

	return count > 0, err
}

// CheckServiceAvailabilityFlexible checks if a service is available by city/state OR pincode
func (sar *ServiceAreaRepository) CheckServiceAvailabilityFlexible(serviceID uint, city, state, pincode string) (bool, error) {
	var count int64
	query := sar.db.Table("service_areas").
		Joins("JOIN service_service_areas ON service_areas.id = service_service_areas.service_area_id").
		Where("service_service_areas.service_id = ? AND service_areas.is_active = ?", serviceID, true)

	// Build OR condition: match city+state OR pincode
	if pincode != "" {
		query = query.Where("(service_areas.city ILIKE ? AND service_areas.state ILIKE ?) OR ? = ANY(service_areas.pincodes)",
			city, state, pincode)
	} else {
		query = query.Where("service_areas.city ILIKE ? AND service_areas.state ILIKE ?", city, state)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

// GetServiceAreaStats gets service area statistics
func (sar *ServiceAreaRepository) GetServiceAreaStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total service areas
	var total int64
	if err := sar.db.Model(&models.ServiceArea{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Active service areas
	var active int64
	if err := sar.db.Model(&models.ServiceArea{}).Where("is_active = ?", true).Count(&active).Error; err != nil {
		return nil, err
	}
	stats["active"] = active
	
	// Unique cities
	var cities int64
	if err := sar.db.Model(&models.ServiceArea{}).Distinct("city").Count(&cities).Error; err != nil {
		return nil, err
	}
	stats["unique_cities"] = cities
	
	// Unique states
	var states int64
	if err := sar.db.Model(&models.ServiceArea{}).Distinct("state").Count(&states).Error; err != nil {
		return nil, err
	}
	stats["unique_states"] = states
	
	return stats, nil
}
