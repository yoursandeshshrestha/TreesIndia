package services

import (
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

// ServiceAreaService handles service area business logic
type ServiceAreaService struct {
	serviceAreaRepo *repositories.ServiceAreaRepository
	serviceRepo     *repositories.ServiceRepository
}

// NewServiceAreaService creates a new service area service
func NewServiceAreaService() *ServiceAreaService {
	return &ServiceAreaService{
		serviceAreaRepo: repositories.NewServiceAreaRepository(),
		serviceRepo:     repositories.NewServiceRepository(),
	}
}

// CreateServiceArea creates a new service area
func (sas *ServiceAreaService) CreateServiceArea(req *models.CreateServiceAreaRequest) (*models.ServiceArea, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceAreaService.CreateServiceArea panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceAreaService.CreateServiceArea called for city: %s, state: %s", req.City, req.State)

	// Check if service area already exists for this location
	var existingServiceArea models.ServiceArea
	err := sas.serviceAreaRepo.GetDB().Where("city ILIKE ? AND state ILIKE ? AND country ILIKE ?", 
		req.City, req.State, req.Country).First(&existingServiceArea).Error
	
	if err == nil {
		return nil, fmt.Errorf("service area already exists for this location")
	}

	// Set default is_active
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	// Create service area
	serviceArea := &models.ServiceArea{
		City:      req.City,
		State:     req.State,
		Country:   req.Country,
		IsActive:  isActive,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := sas.serviceAreaRepo.CreateServiceArea(serviceArea); err != nil {
		return nil, fmt.Errorf("failed to create service area: %w", err)
	}

	return serviceArea, nil
}

// GetServiceAreaByID gets a service area by ID
func (sas *ServiceAreaService) GetServiceAreaByID(id uint) (*models.ServiceArea, error) {
	if id == 0 {
		return nil, fmt.Errorf("invalid service area ID")
	}

	var serviceArea models.ServiceArea
	if err := sas.serviceAreaRepo.FindByID(&serviceArea, id); err != nil {
		return nil, fmt.Errorf("service area not found: %w", err)
	}
	return &serviceArea, nil
}

// GetAllServiceAreas gets all service areas
func (sas *ServiceAreaService) GetAllServiceAreas() ([]models.ServiceArea, error) {
	var serviceAreas []models.ServiceArea
	if err := sas.serviceAreaRepo.FindAllServiceAreas(&serviceAreas); err != nil {
		return nil, fmt.Errorf("failed to get service areas: %w", err)
	}
	return serviceAreas, nil
}

// GetServiceAreasByServiceID gets all service areas for a service
func (sas *ServiceAreaService) GetServiceAreasByServiceID(serviceID uint) ([]models.ServiceArea, error) {
	var serviceAreas []models.ServiceArea
	if err := sas.serviceAreaRepo.FindByServiceID(&serviceAreas, serviceID); err != nil {
		return nil, fmt.Errorf("failed to get service areas: %w", err)
	}
	return serviceAreas, nil
}

// UpdateServiceArea updates a service area
func (sas *ServiceAreaService) UpdateServiceArea(id uint, req *models.UpdateServiceAreaRequest) (*models.ServiceArea, error) {
	var serviceArea models.ServiceArea
	if err := sas.serviceAreaRepo.FindByID(&serviceArea, id); err != nil {
		return nil, fmt.Errorf("service area not found: %w", err)
	}

	// Update fields
	serviceArea.City = req.City
	serviceArea.State = req.State
	serviceArea.Country = req.Country
	if req.IsActive != nil {
		serviceArea.IsActive = *req.IsActive
	}
	serviceArea.UpdatedAt = time.Now()

	if err := sas.serviceAreaRepo.UpdateServiceArea(&serviceArea); err != nil {
		return nil, fmt.Errorf("failed to update service area: %w", err)
	}

	return &serviceArea, nil
}

// DeleteServiceArea deletes a service area
func (sas *ServiceAreaService) DeleteServiceArea(id uint) error {
	var serviceArea models.ServiceArea
	if err := sas.serviceAreaRepo.FindByID(&serviceArea, id); err != nil {
		return fmt.Errorf("service area not found: %w", err)
	}

	if err := sas.serviceAreaRepo.DeleteServiceArea(&serviceArea); err != nil {
		return fmt.Errorf("failed to delete service area: %w", err)
	}

	return nil
}

// CheckServiceAvailability checks if a service is available in a specific location
func (sas *ServiceAreaService) CheckServiceAvailability(serviceID uint, city, state string) (bool, error) {
	return sas.serviceAreaRepo.CheckServiceAvailability(serviceID, city, state)
}

// GetServicesByLocation gets all services available in a specific location
func (sas *ServiceAreaService) GetServicesByLocation(city, state string) ([]models.Service, error) {
	var serviceAreas []models.ServiceArea
	if err := sas.serviceAreaRepo.FindServicesByLocation(&serviceAreas, city, state); err != nil {
		return nil, fmt.Errorf("failed to get service areas for location: %w", err)
	}

	// Extract unique service area IDs
	serviceAreaIDs := make([]uint, 0, len(serviceAreas))
	for _, area := range serviceAreas {
		serviceAreaIDs = append(serviceAreaIDs, area.ID)
	}

	if len(serviceAreaIDs) == 0 {
		return []models.Service{}, nil
	}

	// Get service IDs from the junction table
	var serviceIDs []uint
	if err := sas.serviceRepo.GetDB().Table("service_service_areas").
		Select("DISTINCT service_id").
		Where("service_area_id IN ?", serviceAreaIDs).
		Pluck("service_id", &serviceIDs).Error; err != nil {
		return nil, fmt.Errorf("failed to get service IDs: %w", err)
	}

	// Get services
	var services []models.Service
	for _, serviceID := range serviceIDs {
		service, err := sas.serviceRepo.GetByID(serviceID)
		if err != nil {
			logrus.Warnf("Failed to get service ID %d: %v", serviceID, err)
			continue
		}
		if service.IsActive {
			services = append(services, *service)
		}
	}

	return services, nil
}

// GetServiceAreaStats gets service area statistics
func (sas *ServiceAreaService) GetServiceAreaStats() (map[string]int64, error) {
	return sas.serviceAreaRepo.GetServiceAreaStats()
}

// BulkCreateServiceAreas creates multiple service areas
func (sas *ServiceAreaService) BulkCreateServiceAreas(areas []models.CreateServiceAreaRequest) error {
	for _, area := range areas {
		if _, err := sas.CreateServiceArea(&area); err != nil {
			logrus.Errorf("Failed to create service area for city %s, state %s: %v", 
				area.City, area.State, err)
			return err
		}
	}
	return nil
}

// DeleteAllServiceAreasForService deletes all service areas for a service
func (sas *ServiceAreaService) DeleteAllServiceAreasForService(serviceID uint) error {
	return sas.serviceAreaRepo.DeleteByServiceID(serviceID)
}
