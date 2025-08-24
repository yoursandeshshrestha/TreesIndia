package seed

import (
	"fmt"
	"treesindia/models"

	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

// SeedMainData seeds the main application data
func SeedMainData() error {
	sm := NewSeedManager()
	return sm.seedMainData()
}

// seedMainData seeds all main application data
func (sm *SeedManager) seedMainData() error {
	logrus.Info("Seeding main application data...")

	// Seed in order of dependencies
	seeders := []func() error{
		sm.SeedServiceAreasData, // Create service areas first
		sm.SeedHomeServices,     // Then create services with service area IDs
		sm.SeedConstructionServices,
		sm.SeedWorkerUser,
		sm.SeedSecondWorkerUser,
	}

	for _, seeder := range seeders {
		if err := seeder(); err != nil {
			logrus.Errorf("Main data seeding failed: %v", err)
			return err
		}
	}

	logrus.Info("Main application data seeded successfully")
	return nil
}

// SeedWorkerUser seeds a worker user
func (sm *SeedManager) SeedWorkerUser() error {
	logrus.Info("Seeding worker user...")

	// Check if worker user already exists
	var workerCount int64
	sm.db.Model(&models.User{}).Where("phone = ?", "+919876543210").Count(&workerCount)
	
	if workerCount > 0 {
		logrus.Info("Worker user already exists")
		return nil
	}

	// Create worker user
	workerUser := models.User{
		Name:     "John Worker",
		Phone:    "+919876543210",
		UserType: models.UserTypeWorker,
		IsActive: true,
	}

	if err := sm.db.Create(&workerUser).Error; err != nil {
		logrus.Error("Failed to create worker user:", err)
		return err
	}

	// Get the first service for the worker
	var firstService models.Service
	if err := sm.db.First(&firstService).Error; err != nil {
		logrus.Error("No services found for worker assignment")
		return err
	}

	// Create worker profile
	worker := models.Worker{
		UserID:     workerUser.ID,
		ServiceID:  firstService.ID,
		HourlyRate: 500.0,
		WorkerType: models.WorkerTypeTreesIndia,
		Skills:     `["plumbing", "electrical", "painting"]`,
		Experience: 5,
		ServiceAreas: `["Siliguri", "Darjeeling"]`,
		IsAvailable: true,
		BankAccountHolder: "John Worker",
		BankAccountNumber: "1234567890",
		BankIFSCCode:      "SBIN0001234",
		BankName:          "State Bank of India",
		BankBranch:        "Siliguri Main Branch",
		PoliceVerificationStatus: models.DocumentVerificationStatusPending,
	}

	if err := sm.db.Create(&worker).Error; err != nil {
		logrus.Error("Failed to create worker profile:", err)
		return err
	}

	logrus.Info("Worker user seeded successfully")
	return nil
}

// SeedSecondWorkerUser seeds a second worker user
func (sm *SeedManager) SeedSecondWorkerUser() error {
	logrus.Info("Seeding second worker user...")

	// Check if second worker user already exists
	var workerCount int64
	sm.db.Model(&models.User{}).Where("phone = ?", "+919876543211").Count(&workerCount)
	
	if workerCount > 0 {
		logrus.Info("Second worker user already exists")
		return nil
	}

	// Create second worker user
	workerUser := models.User{
		Name:     "Sarah Worker",
		Phone:    "+919876543211",
		UserType: models.UserTypeWorker,
		IsActive: true,
	}

	if err := sm.db.Create(&workerUser).Error; err != nil {
		logrus.Error("Failed to create second worker user:", err)
		return err
	}

	// Get the second service for the worker (if available, otherwise use first)
	var service models.Service
	if err := sm.db.Offset(1).First(&service).Error; err != nil {
		// If no second service, use the first one
		if err := sm.db.First(&service).Error; err != nil {
			logrus.Error("No services found for worker assignment")
			return err
		}
	}

	// Create worker profile
	worker := models.Worker{
		UserID:     workerUser.ID,
		ServiceID:  service.ID,
		HourlyRate: 600.0,
		WorkerType: models.WorkerTypeTreesIndia,
		Skills:     `["cleaning", "carpentry", "gardening"]`,
		Experience: 7,
		ServiceAreas: `["Kolkata", "Howrah"]`,
		IsAvailable: true,
		BankAccountHolder: "Sarah Worker",
		BankAccountNumber: "0987654321",
		BankIFSCCode:      "HDFC0001234",
		BankName:          "HDFC Bank",
		BankBranch:        "Kolkata Main Branch",
		PoliceVerificationStatus: models.DocumentVerificationStatusPending,
	}

	if err := sm.db.Create(&worker).Error; err != nil {
		logrus.Error("Failed to create second worker profile:", err)
		return err
	}

	logrus.Info("Second worker user seeded successfully")
	return nil
}

// SeedHomeServices seeds Home Services category, subcategories, and services
func (sm *SeedManager) SeedHomeServices() error {
	logrus.Info("Seeding Home Services...")

	// Create Home Services category
	homeServicesCategory := models.Category{
		Name:        "Home Services",
		Slug:        "home-services",
		Description: "Professional home services for your daily needs",
		IsActive:    true,
	}

	if err := sm.db.Where("name = ?", "Home Services").FirstOrCreate(&homeServicesCategory).Error; err != nil {
		logrus.Error("Failed to create Home Services category:", err)
		return err
	}

	// Create subcategories for Home Services
	homeSubcategories := []models.Subcategory{
		{
			Name:        "Plumbing",
			Slug:        "plumbing",
			Description: "Professional plumbing services",
			ParentID:    homeServicesCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Pest Control",
			Slug:        "pest-control",
			Description: "Effective pest control solutions",
			ParentID:    homeServicesCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Painting",
			Slug:        "painting",
			Description: "Interior and exterior painting services",
			ParentID:    homeServicesCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Electrical",
			Slug:        "electrical",
			Description: "Electrical repair and installation services",
			ParentID:    homeServicesCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Cleaning",
			Slug:        "cleaning",
			Description: "Professional cleaning services",
			ParentID:    homeServicesCategory.ID,
			IsActive:    true,
		},
	}

	// Bulk create subcategories
	for _, subcategory := range homeSubcategories {
		if err := sm.db.Where("name = ? AND parent_id = ?", subcategory.Name, subcategory.ParentID).FirstOrCreate(&subcategory).Error; err != nil {
			logrus.Errorf("Failed to create subcategory %s: %v", subcategory.Name, err)
			return err
		}
	}

	// Get subcategory IDs for service creation
	subcategoryIDs := sm.getSubcategoryIDs(homeServicesCategory.ID)

	// Create services for Home Services
	homeServices := []models.Service{
		// Plumbing Services
		{
			Name:          "Tap Repair",
			Slug:          "tap-repair",
			Description:   "Professional tap repair and replacement service",
			PriceType:     "fixed",
			Price:         &[]float64{500}[0],
			Duration:      &[]string{"2 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Plumbing"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Pipe Installation",
			Slug:          "pipe-installation",
			Description:   "Complete pipe installation and repair service",
			PriceType:     "fixed",
			Price:         &[]float64{1000}[0],
			Duration:      &[]string{"4 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Plumbing"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Drainage Cleaning",
			Slug:          "drainage-cleaning",
			Description:   "Professional drainage cleaning and unclogging",
			PriceType:     "fixed",
			Price:         &[]float64{800}[0],
			Duration:      &[]string{"3 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Plumbing"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Pest Control Services
		{
			Name:          "General Pest Control",
			Slug:          "general-pest-control",
			Description:   "Complete pest control treatment for your home",
			PriceType:     "fixed",
			Price:         &[]float64{1500}[0],
			Duration:      &[]string{"6 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Pest Control"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Termite Treatment",
			Slug:          "termite-treatment",
			Description:   "Specialized termite treatment and prevention",
			PriceType:     "fixed",
			Price:         &[]float64{2500}[0],
			Duration:      &[]string{"8 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Pest Control"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Painting Services
		{
			Name:          "Interior Painting",
			Slug:          "interior-painting",
			Description:   "Professional interior painting service",
			PriceType:     "inquiry",
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Painting"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Exterior Painting",
			Slug:          "exterior-painting",
			Description:   "Professional exterior painting service",
			PriceType:     "inquiry",
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Painting"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Electrical Services
		{
			Name:          "Switch Repair",
			Slug:          "switch-repair",
			Description:   "Electrical switch repair and replacement",
			PriceType:     "fixed",
			Price:         &[]float64{300}[0],
			Duration:      &[]string{"1 hour"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Electrical"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Fan Installation",
			Slug:          "fan-installation",
			Description:   "Ceiling fan installation and repair",
			PriceType:     "fixed",
			Price:         &[]float64{600}[0],
			Duration:      &[]string{"2 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Electrical"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Cleaning Services
		{
			Name:          "House Cleaning",
			Slug:          "house-cleaning",
			Description:   "Complete house cleaning service",
			PriceType:     "fixed",
			Price:         &[]float64{1200}[0],
			Duration:      &[]string{"4 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Cleaning"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Deep Cleaning",
			Slug:          "deep-cleaning",
			Description:   "Deep cleaning and sanitization service",
			PriceType:     "fixed",
			Price:         &[]float64{2000}[0],
			Duration:      &[]string{"6 hours"}[0],
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: subcategoryIDs["Cleaning"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
	}

	// Bulk create services and collect them with proper IDs
	var createdHomeServices []models.Service
	for _, service := range homeServices {
		if err := sm.db.Where("slug = ?", service.Slug).FirstOrCreate(&service).Error; err != nil {
			logrus.Errorf("Failed to create service %s: %v", service.Name, err)
			return err
		}
		createdHomeServices = append(createdHomeServices, service)
	}

	// Associate services with service areas
	if err := sm.associateServicesWithServiceAreas(createdHomeServices); err != nil {
		logrus.Errorf("Failed to associate home services with service areas: %v", err)
		return err
	}

	logrus.Info("Home Services seeded successfully")
	return nil
}

// SeedConstructionServices seeds Construction Services category, subcategories, and services
func (sm *SeedManager) SeedConstructionServices() error {
	logrus.Info("Seeding Construction Services...")

	// Create Construction Services category
	constructionCategory := models.Category{
		Name:        "Construction Services",
		Slug:        "construction-services",
		Description: "Professional construction and renovation services",
		IsActive:    true,
	}

	if err := sm.db.Where("name = ?", "Construction Services").FirstOrCreate(&constructionCategory).Error; err != nil {
		logrus.Error("Failed to create Construction Services category:", err)
		return err
	}

	// Create subcategories for Construction Services
	constructionSubcategories := []models.Subcategory{
		{
			Name:        "Renovation",
			Slug:        "renovation",
			Description: "Complete home renovation services",
			ParentID:    constructionCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Plan Sanction",
			Slug:        "plan-sanction",
			Description: "Building plan approval and sanction services",
			ParentID:    constructionCategory.ID,
			IsActive:    true,
		},
		{
			Name:        "Promoting Services",
			Slug:        "promoting-services",
			Description: "Construction project promotion and marketing",
			ParentID:    constructionCategory.ID,
			IsActive:    true,
		},
	}

	// Bulk create subcategories
	for _, subcategory := range constructionSubcategories {
		if err := sm.db.Where("name = ? AND parent_id = ?", subcategory.Name, subcategory.ParentID).FirstOrCreate(&subcategory).Error; err != nil {
			logrus.Errorf("Failed to create subcategory %s: %v", subcategory.Name, err)
			return err
		}
	}

	// Get subcategory IDs for service creation
	subcategoryIDs := sm.getSubcategoryIDs(constructionCategory.ID)

	// Create services for Construction Services (all inquiry-based)
	constructionServices := []models.Service{
		// Renovation Services
		{
			Name:          "Kitchen Renovation",
			Slug:          "kitchen-renovation",
			Description:   "Complete kitchen renovation and remodeling",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Renovation"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Bathroom Renovation",
			Slug:          "bathroom-renovation",
			Description:   "Complete bathroom renovation and remodeling",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Renovation"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Complete Home Renovation",
			Slug:          "complete-home-renovation",
			Description:   "Complete home renovation and remodeling service",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Renovation"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Plan Sanction Services
		{
			Name:          "Building Plan Approval",
			Slug:          "building-plan-approval",
			Description:   "Building plan design and approval services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Plan Sanction"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Construction Permit",
			Slug:          "construction-permit",
			Description:   "Construction permit and license services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Plan Sanction"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},

		// Promoting Services
		{
			Name:          "Project Marketing",
			Slug:          "project-marketing",
			Description:   "Construction project marketing and promotion",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Promoting Services"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
		{
			Name:          "Brand Promotion",
			Slug:          "brand-promotion",
			Description:   "Construction company brand promotion services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: subcategoryIDs["Promoting Services"],
			Images:        pq.StringArray{},
			IsActive:      true,
		},
	}

	// Bulk create services and collect them with proper IDs
	var createdConstructionServices []models.Service
	for _, service := range constructionServices {
		if err := sm.db.Where("slug = ?", service.Slug).FirstOrCreate(&service).Error; err != nil {
			logrus.Errorf("Failed to create service %s: %v", service.Name, err)
			return err
		}
		createdConstructionServices = append(createdConstructionServices, service)
	}

	// Associate services with service areas
	if err := sm.associateServicesWithServiceAreas(createdConstructionServices); err != nil {
		logrus.Errorf("Failed to associate construction services with service areas: %v", err)
		return err
	}

	logrus.Info("Construction Services seeded successfully")
	return nil
}

// getSubcategoryIDs gets all subcategory IDs for a given category ID
func (sm *SeedManager) getSubcategoryIDs(categoryID uint) map[string]uint {
	var subcategories []models.Subcategory
	sm.db.Where("parent_id = ?", categoryID).Find(&subcategories)
	
	subcategoryIDs := make(map[string]uint)
	for _, subcategory := range subcategories {
		subcategoryIDs[subcategory.Name] = subcategory.ID
	}
	return subcategoryIDs
}

// getSubcategoryID gets the ID of a subcategory by name and parent ID
func (sm *SeedManager) getSubcategoryID(name string, parentID uint) uint {
	var subcategory models.Subcategory
	sm.db.Where("name = ? AND parent_id = ?", name, parentID).First(&subcategory)
	return subcategory.ID
}

// associateServicesWithServiceAreas associates services with existing service areas
func (sm *SeedManager) associateServicesWithServiceAreas(services []models.Service) error {
	logrus.Info("Associating services with service areas...")

	// Get all service areas
	var serviceAreas []models.ServiceArea
	if err := sm.db.Find(&serviceAreas).Error; err != nil {
		logrus.Error("Failed to fetch service areas:", err)
		return err
	}

	if len(serviceAreas) == 0 {
		logrus.Info("No service areas found to associate with services")
		return nil
	}

	// Get existing associations to avoid duplicates
	var existingAssociations []struct {
		ServiceID     uint `gorm:"column:service_id"`
		ServiceAreaID uint `gorm:"column:service_area_id"`
	}
	if err := sm.db.Table("service_service_areas").Find(&existingAssociations).Error; err != nil {
		logrus.Error("Failed to fetch existing associations:", err)
		return err
	}

	// Create a map for quick lookup of existing associations
	existingAssocMap := make(map[string]bool)
	for _, assoc := range existingAssociations {
		key := fmt.Sprintf("%d-%d", assoc.ServiceID, assoc.ServiceAreaID)
		existingAssocMap[key] = true
	}

	// Prepare associations to be created
	var associationsToCreate []struct {
		ServiceID     uint `gorm:"column:service_id"`
		ServiceAreaID uint `gorm:"column:service_area_id"`
	}
	createdCount := 0

	// Associate each service with multiple service areas
	for _, service := range services {
		// For each service, associate with 3-5 service areas (deterministic selection)
		selectedAreas := sm.selectServiceAreasForService(serviceAreas, service.ID)
		
		for _, area := range selectedAreas {
			key := fmt.Sprintf("%d-%d", service.ID, area.ID)
			
			// Skip if association already exists
			if existingAssocMap[key] {
				continue
			}

			// Add to creation list
			associationsToCreate = append(associationsToCreate, struct {
				ServiceID     uint `gorm:"column:service_id"`
				ServiceAreaID uint `gorm:"column:service_area_id"`
			}{
				ServiceID:     service.ID,
				ServiceAreaID: area.ID,
			})
			createdCount++
		}
	}

	// Bulk create associations if any need to be created
	if len(associationsToCreate) > 0 {
		// Use batch size to avoid memory issues with large datasets
		batchSize := 100
		for i := 0; i < len(associationsToCreate); i += batchSize {
			end := i + batchSize
			if end > len(associationsToCreate) {
				end = len(associationsToCreate)
			}
			
			batch := associationsToCreate[i:end]
			if err := sm.db.Table("service_service_areas").Create(&batch).Error; err != nil {
				logrus.Errorf("Failed to create associations batch %d-%d: %v", i+1, end, err)
				return err
			}
		}
		
		logrus.Infof("Created %d new service-service area associations for %d services", createdCount, len(services))
	} else {
		logrus.Info("All service-service area associations already exist")
	}

	return nil
}

// selectServiceAreasForService selects service areas for a specific service
// This creates a deterministic but varied selection based on service ID
func (sm *SeedManager) selectServiceAreasForService(allAreas []models.ServiceArea, serviceID uint) []models.ServiceArea {
	// Use service ID to create a deterministic selection
	// This ensures the same service always gets the same areas
	selectedCount := 3 + (int(serviceID) % 3) // 3-5 areas per service
	
	// Create a deterministic selection based on service ID
	var selectedAreas []models.ServiceArea
	for i := 0; i < selectedCount && i < len(allAreas); i++ {
		index := (int(serviceID) + i) % len(allAreas)
		selectedAreas = append(selectedAreas, allAreas[index])
	}
	
	return selectedAreas
}
