package seed

import (
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
		sm.SeedHomeServices,
		sm.SeedConstructionServices,
		sm.SeedWorkerUser,
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

	for _, subcategory := range homeSubcategories {
		if err := sm.db.Where("name = ? AND parent_id = ?", subcategory.Name, subcategory.ParentID).FirstOrCreate(&subcategory).Error; err != nil {
			logrus.Errorf("Failed to create subcategory %s: %v", subcategory.Name, err)
			return err
		}
	}

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
			SubcategoryID: sm.getSubcategoryID("Plumbing", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Plumbing", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Plumbing", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Pest Control", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Pest Control", homeServicesCategory.ID),
			IsActive:      true,
		},

		// Painting Services
		{
			Name:          "Interior Painting",
			Slug:          "interior-painting",
			Description:   "Professional interior painting service",
			PriceType:     "inquiry",
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Painting", homeServicesCategory.ID),
			IsActive:      true,
		},
		{
			Name:          "Exterior Painting",
			Slug:          "exterior-painting",
			Description:   "Professional exterior painting service",
			PriceType:     "inquiry",
			CategoryID:    homeServicesCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Painting", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Electrical", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Electrical", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Cleaning", homeServicesCategory.ID),
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
			SubcategoryID: sm.getSubcategoryID("Cleaning", homeServicesCategory.ID),
			IsActive:      true,
		},
	}

	for _, service := range homeServices {
		if err := sm.db.Where("slug = ?", service.Slug).FirstOrCreate(&service).Error; err != nil {
			logrus.Errorf("Failed to create service %s: %v", service.Name, err)
			return err
		}
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

	for _, subcategory := range constructionSubcategories {
		if err := sm.db.Where("name = ? AND parent_id = ?", subcategory.Name, subcategory.ParentID).FirstOrCreate(&subcategory).Error; err != nil {
			logrus.Errorf("Failed to create subcategory %s: %v", subcategory.Name, err)
			return err
		}
	}

	// Create services for Construction Services (all inquiry-based)
	constructionServices := []models.Service{
		// Renovation Services
		{
			Name:          "Kitchen Renovation",
			Slug:          "kitchen-renovation",
			Description:   "Complete kitchen renovation and remodeling",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Renovation", constructionCategory.ID),
			IsActive:      true,
		},
		{
			Name:          "Bathroom Renovation",
			Slug:          "bathroom-renovation",
			Description:   "Complete bathroom renovation and remodeling",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Renovation", constructionCategory.ID),
			IsActive:      true,
		},
		{
			Name:          "Complete Home Renovation",
			Slug:          "complete-home-renovation",
			Description:   "Complete home renovation and remodeling service",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Renovation", constructionCategory.ID),
			IsActive:      true,
		},

		// Plan Sanction Services
		{
			Name:          "Building Plan Approval",
			Slug:          "building-plan-approval",
			Description:   "Building plan design and approval services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Plan Sanction", constructionCategory.ID),
			IsActive:      true,
		},
		{
			Name:          "Construction Permit",
			Slug:          "construction-permit",
			Description:   "Construction permit and license services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Plan Sanction", constructionCategory.ID),
			IsActive:      true,
		},

		// Promoting Services
		{
			Name:          "Project Marketing",
			Slug:          "project-marketing",
			Description:   "Construction project marketing and promotion",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Promoting Services", constructionCategory.ID),
			IsActive:      true,
		},
		{
			Name:          "Brand Promotion",
			Slug:          "brand-promotion",
			Description:   "Construction company brand promotion services",
			PriceType:     "inquiry",
			CategoryID:    constructionCategory.ID,
			SubcategoryID: sm.getSubcategoryID("Promoting Services", constructionCategory.ID),
			IsActive:      true,
		},
	}

	for _, service := range constructionServices {
		if err := sm.db.Where("slug = ?", service.Slug).FirstOrCreate(&service).Error; err != nil {
			logrus.Errorf("Failed to create service %s: %v", service.Name, err)
			return err
		}
	}

	logrus.Info("Construction Services seeded successfully")
	return nil
}

// getSubcategoryID gets the ID of a subcategory by name and parent ID
func (sm *SeedManager) getSubcategoryID(name string, parentID uint) uint {
	var subcategory models.Subcategory
	sm.db.Where("name = ? AND parent_id = ?", name, parentID).First(&subcategory)
	return subcategory.ID
}
