package seed

import (
	"fmt"
	"treesindia/models"

	"github.com/sirupsen/logrus"
)

// SeedServiceAreasData seeds independent service areas
func (sm *SeedManager) SeedServiceAreasData() error {
	logrus.Info("Seeding service areas...")

	// Define service areas data (key cities only)
	serviceAreasData := []struct {
		City    string
		State   string
		Country string
	}{
		// West Bengal - Key Cities
		{"Siliguri", "West Bengal", "India"},
		{"Darjeeling", "West Bengal", "India"},
		{"Kolkata", "West Bengal", "India"},
		{"Howrah", "West Bengal", "India"},

		// Sikkim - Key Cities
		{"Gangtok", "Sikkim", "India"},
		{"Namchi", "Sikkim", "India"},

		// Assam - Key Cities
		{"Guwahati", "Assam", "India"},
		{"Dibrugarh", "Assam", "India"},

		// Bihar - Key Cities
		{"Patna", "Bihar", "India"},
		{"Gaya", "Bihar", "India"},

		// Jharkhand - Key Cities
		{"Ranchi", "Jharkhand", "India"},
		{"Jamshedpur", "Jharkhand", "India"},

		// Odisha - Key Cities
		{"Bhubaneswar", "Odisha", "India"},
		{"Cuttack", "Odisha", "India"},
	}

	// Get existing service areas to avoid duplicates
	var existingServiceAreas []models.ServiceArea
	if err := sm.db.Find(&existingServiceAreas).Error; err != nil {
		logrus.Error("Failed to fetch existing service areas:", err)
		return err
	}

	// Create a map for quick lookup of existing service areas
	existingMap := make(map[string]bool)
	for _, area := range existingServiceAreas {
		key := getServiceAreaKey(area.City, area.State, area.Country)
		existingMap[key] = true
	}

	// Create service areas that don't exist
	var serviceAreasToCreate []models.ServiceArea

	for _, areaData := range serviceAreasData {
		key := getServiceAreaKey(areaData.City, areaData.State, areaData.Country)
		
		// Skip if already exists
		if existingMap[key] {
			continue
		}

		// Create new service area
		serviceArea := models.ServiceArea{
			City:      areaData.City,
			State:     areaData.State,
			Country:   areaData.Country,
			IsActive:  true,
		}

		serviceAreasToCreate = append(serviceAreasToCreate, serviceArea)
	}

	// Bulk create service areas if any need to be created
	if len(serviceAreasToCreate) > 0 {
		// Use batch size to avoid memory issues with large datasets
		batchSize := 100
		for i := 0; i < len(serviceAreasToCreate); i += batchSize {
			end := i + batchSize
			if end > len(serviceAreasToCreate) {
				end = len(serviceAreasToCreate)
			}
			
			batch := serviceAreasToCreate[i:end]
			if err := sm.db.Create(&batch).Error; err != nil {
				logrus.Errorf("Failed to create service areas batch %d-%d: %v", i+1, end, err)
				return err
			}
		}
		
		logrus.Infof("Created %d new service areas", len(serviceAreasToCreate))
	} else {
		logrus.Info("All service areas already exist")
	}

	logrus.Info("Service areas seeding completed successfully")
	return nil
}

// getServiceAreaKey creates a unique key for service area lookup
func getServiceAreaKey(city, state, country string) string {
	return fmt.Sprintf("%s-%s-%s", city, state, country)
}
