package seed

import (
	"fmt"
	"treesindia/models"

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
		sm.SeedCategories,           // Create categories first
		sm.SeedSubcategories,        // Then subcategories
		sm.SeedServices,             // Then services
		sm.SeedServiceAreaAssociations, // Associate services with service areas
		sm.SeedWorkers,              // Then workers
		SeedPromotionBanners,        // Finally promotion banners
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

// SeedCategories seeds all categories
func (sm *SeedManager) SeedCategories() error {
	logrus.Info("Seeding categories...")

	categories := []models.Category{
		{
			Name:        "Home Services",
			Slug:        "home-services",
			Description: "Professional home services for your daily needs",
			Image:       "/images/main-icons/home_service.png",
			IsActive:    true,
		},
		{
			Name:        "Construction Services",
			Slug:        "construction-services",
			Description: "Professional construction and renovation services",
			Image:       "/images/main-icons/construction_service.png",
			IsActive:    true,
		},
	}

	for _, category := range categories {
		if err := sm.db.Where("name = ?", category.Name).FirstOrCreate(&category).Error; err != nil {
			logrus.Errorf("Failed to create category %s: %v", category.Name, err)
			return err
		}
	}

	logrus.Info("Categories seeded successfully")
	return nil
}

// SeedSubcategories seeds all subcategories
func (sm *SeedManager) SeedSubcategories() error {
	logrus.Info("Seeding subcategories...")

	// Get category IDs
	var homeCategory, constructionCategory models.Category
	sm.db.Where("name = ?", "Home Services").First(&homeCategory)
	sm.db.Where("name = ?", "Construction Services").First(&constructionCategory)

	subcategories := []models.Subcategory{
		// Home Services subcategories
		{Name: "Plumbing", Slug: "plumbing", Description: "Professional plumbing services", Image: "/images/image-for-seeding/tap.png", ParentID: homeCategory.ID, IsActive: true},
		{Name: "Pest Control", Slug: "pest-control", Description: "Effective pest control solutions", Image: "/images/image-for-seeding/maid3.jpg", ParentID: homeCategory.ID, IsActive: true},
		{Name: "Painting", Slug: "painting", Description: "Interior and exterior painting services", Image: "/images/image-for-seeding/maid4.jpg", ParentID: homeCategory.ID, IsActive: true},
		{Name: "Electrical", Slug: "electrical", Description: "Electrical repair and installation services", Image: "/images/image-for-seeding/maid5.jpg", ParentID: homeCategory.ID, IsActive: true},
		{Name: "Cleaning", Slug: "cleaning", Description: "Professional cleaning services", Image: "/images/image-for-seeding/cleaning.png", ParentID: homeCategory.ID, IsActive: true},
		
		// Construction Services subcategories
		{Name: "Renovation", Slug: "renovation", Description: "Complete home renovation services", Image: "/images/image-for-seeding/maid6.jpg", ParentID: constructionCategory.ID, IsActive: true},
		{Name: "Plan Sanction", Slug: "plan-sanction", Description: "Building plan approval and sanction services", Image: "/images/image-for-seeding/maid7.avif", ParentID: constructionCategory.ID, IsActive: true},
		{Name: "Promoting Services", Slug: "promoting-services", Description: "Construction project promotion and marketing", Image: "/images/image-for-seeding/maid8.jpg", ParentID: constructionCategory.ID, IsActive: true},
	}

	for _, subcategory := range subcategories {
		if err := sm.db.Where("name = ? AND parent_id = ?", subcategory.Name, subcategory.ParentID).FirstOrCreate(&subcategory).Error; err != nil {
			logrus.Errorf("Failed to create subcategory %s: %v", subcategory.Name, err)
			return err
		}
	}

	logrus.Info("Subcategories seeded successfully")
	return nil
}

// SeedServices seeds all services
func (sm *SeedManager) SeedServices() error {
	logrus.Info("Seeding services...")

	// Get category and subcategory IDs
	var homeCategory, constructionCategory models.Category
	sm.db.Where("name = ?", "Home Services").First(&homeCategory)
	sm.db.Where("name = ?", "Construction Services").First(&constructionCategory)

	// Get subcategory IDs
	subcategoryIDs := sm.getSubcategoryIDs(homeCategory.ID)
	constructionSubcategoryIDs := sm.getSubcategoryIDs(constructionCategory.ID)

	services := []models.Service{
		// Home Services
		{Name: "Tap Repair", Slug: "tap-repair", Description: "Professional tap repair and replacement service", Images: []string{"/images/image-for-seeding/tap.png"}, PriceType: "fixed", Price: &[]float64{500}[0], Duration: &[]string{"2 hours"}[0], CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Plumbing"], IsActive: true},
		{Name: "Pipe Installation", Slug: "pipe-installation", Description: "Complete pipe installation and repair service", Images: []string{"/images/image-for-seeding/pipe.png"}, PriceType: "fixed", Price: &[]float64{1000}[0], Duration: &[]string{"4 hours"}[0], CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Plumbing"], IsActive: true},
		{Name: "General Pest Control", Slug: "general-pest-control", Description: "Complete pest control treatment for your home", Images: []string{"/images/image-for-seeding/maid9.jpg"}, PriceType: "fixed", Price: &[]float64{1500}[0], Duration: &[]string{"6 hours"}[0], CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Pest Control"], IsActive: true},
		{Name: "Interior Painting", Slug: "interior-painting", Description: "Professional interior painting service", Images: []string{"/images/image-for-seeding/maid10.jpg"}, PriceType: "inquiry", CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Painting"], IsActive: true},
		{Name: "Switch Repair", Slug: "switch-repair", Description: "Electrical switch repair and replacement", Images: []string{"/images/image-for-seeding/maid11.jpg"}, PriceType: "fixed", Price: &[]float64{300}[0], Duration: &[]string{"1 hour"}[0], CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Electrical"], IsActive: true},
		{Name: "House Cleaning", Slug: "house-cleaning", Description: "Complete house cleaning service", Images: []string{"/images/image-for-seeding/cleaning.png"}, PriceType: "fixed", Price: &[]float64{1200}[0], Duration: &[]string{"4 hours"}[0], CategoryID: homeCategory.ID, SubcategoryID: subcategoryIDs["Cleaning"], IsActive: true},
		
		// Construction Services
		{Name: "Kitchen Renovation", Slug: "kitchen-renovation", Description: "Complete kitchen renovation and remodeling", Images: []string{"/images/image-for-seeding/maid12.jpg"}, PriceType: "inquiry", CategoryID: constructionCategory.ID, SubcategoryID: constructionSubcategoryIDs["Renovation"], IsActive: true},
		{Name: "Building Plan Approval", Slug: "building-plan-approval", Description: "Building plan design and approval services", Images: []string{"/images/image-for-seeding/maid.jpg"}, PriceType: "inquiry", CategoryID: constructionCategory.ID, SubcategoryID: constructionSubcategoryIDs["Plan Sanction"], IsActive: true},
		{Name: "Project Marketing", Slug: "project-marketing", Description: "Construction project marketing and promotion", Images: []string{"/images/image-for-seeding/maid2.jpg"}, PriceType: "inquiry", CategoryID: constructionCategory.ID, SubcategoryID: constructionSubcategoryIDs["Promoting Services"], IsActive: true},
	}

	for _, service := range services {
		if err := sm.db.Where("slug = ?", service.Slug).FirstOrCreate(&service).Error; err != nil {
			logrus.Errorf("Failed to create service %s: %v", service.Name, err)
			return err
		}
	}

	logrus.Info("Services seeded successfully")
	return nil
}

// SeedServiceAreaAssociations associates services with service areas
func (sm *SeedManager) SeedServiceAreaAssociations() error {
	logrus.Info("Seeding service-service area associations...")

	// Get all services
	var services []models.Service
	if err := sm.db.Find(&services).Error; err != nil {
		logrus.Error("Failed to fetch services:", err)
		return err
	}

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

// SeedWorkers seeds all workers
func (sm *SeedManager) SeedWorkers() error {
	logrus.Info("Seeding workers...")

	// Get first service for worker assignment
	var firstService models.Service
	if err := sm.db.First(&firstService).Error; err != nil {
		logrus.Error("No services found for worker assignment")
		return err
	}

	workers := []struct {
		user   models.User
		worker models.Worker
	}{
		{
			user: models.User{
				Name:     "John Worker",
				Phone:    "+919876543210",
				UserType: models.UserTypeWorker,
				IsActive: true,
			},
			worker: models.Worker{
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
			},
		},
		{
			user: models.User{
				Name:     "Sarah Worker",
				Phone:    "+919876543211",
				UserType: models.UserTypeWorker,
				IsActive: true,
			},
			worker: models.Worker{
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
			},
		},
	}

	for _, w := range workers {
		// Check if worker user already exists
		var existingUser models.User
		if err := sm.db.Where("phone = ?", w.user.Phone).First(&existingUser).Error; err == nil {
			logrus.Infof("Worker user %s already exists", w.user.Name)
			continue
		}

		// Create worker user
		if err := sm.db.Create(&w.user).Error; err != nil {
			logrus.Errorf("Failed to create worker user %s: %v", w.user.Name, err)
			return err
		}

		// Create worker profile
		w.worker.UserID = w.user.ID
		w.worker.ServiceID = firstService.ID
		if err := sm.db.Create(&w.worker).Error; err != nil {
			logrus.Errorf("Failed to create worker profile for %s: %v", w.user.Name, err)
			return err
		}

		logrus.Infof("Worker %s seeded successfully", w.user.Name)
	}

	logrus.Info("Workers seeded successfully")
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
