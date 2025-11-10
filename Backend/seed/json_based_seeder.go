package seed

import (
	"fmt"
	"strings"
	"treesindia/models"

	"github.com/sirupsen/logrus"
)

// JSONBasedSeeder handles all seeding operations from JSON files
type JSONBasedSeeder struct {
	sm *SeedManager
}

// NewJSONBasedSeeder creates a new JSON-based seeder handler
func NewJSONBasedSeeder(sm *SeedManager) *JSONBasedSeeder {
	return &JSONBasedSeeder{
		sm: sm,
	}
}

// SeedCategories seeds all categories from JSON
func (js *JSONBasedSeeder) SeedCategories() error {
	logrus.Info("Seeding categories...")

	// Load categories from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadCategories()
	if err != nil {
		logrus.Errorf("Failed to load categories JSON: %v", err)
		return err
	}

	// Parse categories from JSON
	categoriesData, ok := data["categories"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid categories JSON structure")
	}

	var categories []models.Category
	for _, catData := range categoriesData {
		catMap, ok := catData.(map[string]interface{})
		if !ok {
			continue
		}

		category := models.Category{
			Name:        catMap["name"].(string),
			Slug:        catMap["slug"].(string),
			Description: catMap["description"].(string),
			IsActive:    catMap["is_active"].(bool),
		}
		categories = append(categories, category)
	}

	// Get existing categories in one query
	var existingCategories []models.Category
	if err := js.sm.db.Find(&existingCategories).Error; err != nil {
		logrus.Errorf("Failed to fetch existing categories: %v", err)
		return err
	}

	// Create a map for quick lookup
	existingMap := make(map[string]bool)
	for _, cat := range existingCategories {
		existingMap[cat.Name] = true
	}

	// Filter out categories that already exist
	var categoriesToCreate []models.Category
	for _, category := range categories {
		if !existingMap[category.Name] {
			categoriesToCreate = append(categoriesToCreate, category)
		}
	}

	// Bulk create new categories
	if len(categoriesToCreate) > 0 {
		if err := js.sm.db.Create(&categoriesToCreate).Error; err != nil {
			logrus.Errorf("Failed to create categories: %v", err)
			return err
		}
		logrus.Infof("Created %d new categories", len(categoriesToCreate))
	} else {
		logrus.Info("All categories already exist")
	}

	logrus.Info("Categories seeded successfully")
	return nil
}

// SeedSubcategories seeds all subcategories from JSON
func (js *JSONBasedSeeder) SeedSubcategories() error {
	logrus.Info("Seeding subcategories...")

	// Load subcategories from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadSubcategories()
	if err != nil {
		logrus.Errorf("Failed to load subcategories JSON: %v", err)
		return err
	}

	// Parse subcategories from JSON
	subcategoriesData, ok := data["subcategories"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid subcategories JSON structure")
	}

	// Get all categories for lookup
	var categories []models.Category
	if err := js.sm.db.Find(&categories).Error; err != nil {
		logrus.Errorf("Failed to fetch categories: %v", err)
		return err
	}

	// Create category map for quick lookup
	categoryMap := make(map[string]uint)
	for _, cat := range categories {
		categoryMap[cat.Name] = cat.ID
	}

	var subcategories []models.Subcategory
	for _, subcatData := range subcategoriesData {
		subcatMap, ok := subcatData.(map[string]interface{})
		if !ok {
			continue
		}

		categoryName := subcatMap["parent_category"].(string)
		categoryID, exists := categoryMap[categoryName]
		if !exists {
			logrus.Warnf("Category not found: %s", categoryName)
			continue
		}

		subcategory := models.Subcategory{
			Name:        subcatMap["name"].(string),
			Slug:        subcatMap["slug"].(string),
			Description: subcatMap["description"].(string),
			ParentID:    categoryID,
			IsActive:    subcatMap["is_active"].(bool),
		}
		subcategories = append(subcategories, subcategory)
	}

	// Get existing subcategories in one query
	var existingSubcategories []models.Subcategory
	if err := js.sm.db.Find(&existingSubcategories).Error; err != nil {
		logrus.Errorf("Failed to fetch existing subcategories: %v", err)
		return err
	}

	// Create a map for quick lookup
	existingMap := make(map[string]bool)
	for _, subcat := range existingSubcategories {
		existingMap[subcat.Name] = true
	}

	// Filter out subcategories that already exist
	var subcategoriesToCreate []models.Subcategory
	for _, subcategory := range subcategories {
		if !existingMap[subcategory.Name] {
			subcategoriesToCreate = append(subcategoriesToCreate, subcategory)
		}
	}

	// Bulk create new subcategories
	if len(subcategoriesToCreate) > 0 {
		if err := js.sm.db.Create(&subcategoriesToCreate).Error; err != nil {
			logrus.Errorf("Failed to create subcategories: %v", err)
			return err
		}
		logrus.Infof("Created %d new subcategories", len(subcategoriesToCreate))
	} else {
		logrus.Info("All subcategories already exist")
	}

	logrus.Info("Subcategories seeded successfully")
	return nil
}

// SeedServices seeds all services from JSON
func (js *JSONBasedSeeder) SeedServices() error {
	logrus.Info("Seeding services...")

	// Load services from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadServices()
	if err != nil {
		logrus.Errorf("Failed to load services JSON: %v", err)
		return err
	}

	// Parse services from JSON
	servicesData, ok := data["services"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid services JSON structure")
	}

	// Get all categories for lookup
	var categories []models.Category
	if err := js.sm.db.Find(&categories).Error; err != nil {
		logrus.Errorf("Failed to fetch categories: %v", err)
		return err
	}

	// Create category map for quick lookup
	categoryMap := make(map[string]uint)
	for _, cat := range categories {
		categoryMap[cat.Name] = cat.ID
	}

	// Get all subcategories for lookup
	var subcategories []models.Subcategory
	if err := js.sm.db.Find(&subcategories).Error; err != nil {
		logrus.Errorf("Failed to fetch subcategories: %v", err)
		return err
	}

	// Create subcategory map for quick lookup
	subcategoryMap := make(map[string]uint)
	for _, subcat := range subcategories {
		subcategoryMap[subcat.Name] = subcat.ID
	}

	var services []models.Service
	for _, serviceData := range servicesData {
		serviceMap, ok := serviceData.(map[string]interface{})
		if !ok {
			continue
		}

		categoryName := serviceMap["category"].(string)
		categoryID, exists := categoryMap[categoryName]
		if !exists {
			logrus.Warnf("Category not found: %s", categoryName)
			continue
		}

		subcategoryName := serviceMap["subcategory"].(string)
		subcategoryID, exists := subcategoryMap[subcategoryName]
		if !exists {
			logrus.Warnf("Subcategory not found: %s", subcategoryName)
			continue
		}

		// Parse duration string (optional)
		var duration *string
		if durationStr, ok := serviceMap["duration"].(string); ok {
			duration = &durationStr
		}

		// Parse price (optional)
		var price *float64
		if priceValue, ok := serviceMap["price"].(float64); ok {
			price = &priceValue
		}

		service := models.Service{
			Name:         serviceMap["name"].(string),
			Slug:         serviceMap["slug"].(string),
			Description:  serviceMap["description"].(string),
			PriceType:    serviceMap["price_type"].(string),
			Price:        price,
			Duration:     duration,
			CategoryID:   categoryID,
			SubcategoryID: subcategoryID,
			IsActive:     serviceMap["is_active"].(bool),
		}
		services = append(services, service)
	}

	// Get existing services in one query (including soft-deleted ones)
	var existingServices []models.Service
	if err := js.sm.db.Unscoped().Find(&existingServices).Error; err != nil {
		logrus.Errorf("Failed to fetch existing services: %v", err)
		return err
	}

	logrus.Infof("Found %d existing services in database", len(existingServices))

	// Create a map for quick lookup by slug (which has unique constraint)
	existingMap := make(map[string]bool)
	for _, service := range existingServices {
		existingMap[service.Slug] = true
		logrus.Debugf("Existing service slug: %s", service.Slug)
	}

	// Filter out services that already exist
	var servicesToCreate []models.Service
	for _, service := range services {
		if !existingMap[service.Slug] {
			servicesToCreate = append(servicesToCreate, service)
			logrus.Infof("Will create service: %s (slug: %s)", service.Name, service.Slug)
		} else {
			logrus.Infof("Service already exists, skipping: %s (slug: %s)", service.Name, service.Slug)
		}
	}

	// Bulk create new services
	if len(servicesToCreate) > 0 {
		if err := js.sm.db.Create(&servicesToCreate).Error; err != nil {
			logrus.Errorf("Failed to create services: %v", err)
			return err
		}
		logrus.Infof("Created %d new services", len(servicesToCreate))
	} else {
		logrus.Info("All services already exist")
	}

	logrus.Info("Services seeded successfully")
	return nil
}

// SeedWorkers seeds worker users from JSON
func (js *JSONBasedSeeder) SeedWorkers() error {
	logrus.Info("Seeding worker users...")

	// Load workers from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadWorkers()
	if err != nil {
		logrus.Errorf("Failed to load workers JSON: %v", err)
		return err
	}

	// Parse workers from JSON
	workersData, ok := data["workers"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid workers JSON structure")
	}

	// Get existing users to avoid duplicates
	var existingUsers []models.User
	if err := js.sm.db.Where("user_type = ?", "worker").Find(&existingUsers).Error; err != nil {
		logrus.Errorf("Failed to fetch existing worker users: %v", err)
		return err
	}

	// Create a map for quick lookup using phone number
	existingMap := make(map[string]bool)
	for _, user := range existingUsers {
		existingMap[user.Phone] = true
	}

	var usersToCreate []models.User

	for _, workerData := range workersData {
		workerMap, ok := workerData.(map[string]interface{})
		if !ok {
			continue
		}

		// Check if worker already exists
		phone := workerMap["phone"].(string)
		if existingMap[phone] {
			logrus.Infof("Worker with phone %s already exists, skipping", phone)
			continue
		}

		// Create user with worker type
		user := models.User{
			Name:     workerMap["name"].(string),
			Phone:    phone,
			UserType: "worker",
			IsActive: workerMap["is_active"].(bool),
		}
		usersToCreate = append(usersToCreate, user)
	}

	// Bulk create users
	if len(usersToCreate) > 0 {
		if err := js.sm.db.Create(&usersToCreate).Error; err != nil {
			logrus.Errorf("Failed to create worker users: %v", err)
			return err
		}
		logrus.Infof("Created %d new worker users", len(usersToCreate))
	} else {
		logrus.Info("All worker users already exist")
	}

	logrus.Info("Worker users seeded successfully")
	return nil
}

// SeedPromotionBanners seeds promotion banners from JSON
func (js *JSONBasedSeeder) SeedPromotionBanners() error {
	logrus.Info("Seeding promotion banners...")

	// Load promotion banners from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadPromotionBanners()
	if err != nil {
		logrus.Errorf("Failed to load promotion banners JSON: %v", err)
		return err
	}

	// Parse promotion banners from JSON
	bannersData, ok := data["promotion_banners"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid promotion banners JSON structure")
	}

	var banners []models.PromotionBanner
	for _, bannerData := range bannersData {
		bannerMap, ok := bannerData.(map[string]interface{})
		if !ok {
			continue
		}

		// Handle optional fields
		var image string
		if imageVal, ok := bannerMap["image"].(string); ok {
			image = imageVal
		}

		var link string
		if linkVal, ok := bannerMap["link"].(string); ok {
			link = linkVal
		}

		banner := models.PromotionBanner{
			Title:    bannerMap["title"].(string),
			Image:    image,
			Link:     link,
			IsActive: bannerMap["is_active"].(bool),
		}
		banners = append(banners, banner)
	}

	// Get existing banners in one query
	var existingBanners []models.PromotionBanner
	if err := js.sm.db.Find(&existingBanners).Error; err != nil {
		logrus.Errorf("Failed to fetch existing banners: %v", err)
		return err
	}

	// Create a map for quick lookup
	existingMap := make(map[string]bool)
	for _, banner := range existingBanners {
		existingMap[banner.Title] = true
	}

	// Filter out banners that already exist
	var bannersToCreate []models.PromotionBanner
	for _, banner := range banners {
		if !existingMap[banner.Title] {
			bannersToCreate = append(bannersToCreate, banner)
		}
	}

	// Bulk create new banners
	if len(bannersToCreate) > 0 {
		if err := js.sm.db.Create(&bannersToCreate).Error; err != nil {
			logrus.Errorf("Failed to create promotion banners: %v", err)
			return err
		}
		logrus.Infof("Created %d new promotion banners", len(bannersToCreate))
	} else {
		logrus.Info("All promotion banners already exist")
	}

	logrus.Info("Promotion banners seeded successfully")
	return nil
}

// SeedAdminConfigurations seeds admin configurations from JSON
func (js *JSONBasedSeeder) SeedAdminConfigurations() error {
	logrus.Info("Seeding admin configurations...")

	// Load admin configurations from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadAdminConfigs()
	if err != nil {
		logrus.Errorf("Failed to load admin configs JSON: %v", err)
		return err
	}

	// Parse admin configurations from JSON
	configsData, ok := data["admin_configs"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid admin configs JSON structure")
	}

	var configs []models.AdminConfig
	for _, configData := range configsData {
		configMap, ok := configData.(map[string]interface{})
		if !ok {
			continue
		}

		config := models.AdminConfig{
			Key:         configMap["key"].(string),
			Value:       configMap["value"].(string),
			Type:        configMap["type"].(string),
			Category:    configMap["category"].(string),
			Description: configMap["description"].(string),
			IsActive:    configMap["is_active"].(bool),
		}
		configs = append(configs, config)
	}

	// Get existing configurations in one query
	var existingConfigs []models.AdminConfig
	if err := js.sm.db.Find(&existingConfigs).Error; err != nil {
		logrus.Errorf("Failed to fetch existing admin configs: %v", err)
		return err
	}

	// Create maps for quick lookup
	existingMap := make(map[string]models.AdminConfig)
	for _, config := range existingConfigs {
		existingMap[config.Key] = config
	}

	// Separate configurations into create and update lists
	var configsToCreate []models.AdminConfig
	var configsToUpdate []models.AdminConfig

	for _, config := range configs {
		if existingConfig, exists := existingMap[config.Key]; exists {
			// Update existing config
			existingConfig.Value = config.Value
			existingConfig.Type = config.Type
			existingConfig.Category = config.Category
			existingConfig.Description = config.Description
			existingConfig.IsActive = config.IsActive
			configsToUpdate = append(configsToUpdate, existingConfig)
		} else {
			// Create new config
			configsToCreate = append(configsToCreate, config)
		}
	}

	// Bulk create new configurations
	if len(configsToCreate) > 0 {
		if err := js.sm.db.Create(&configsToCreate).Error; err != nil {
			logrus.Errorf("Failed to create admin configs: %v", err)
			return err
		}
		logrus.Infof("Created %d new admin configurations", len(configsToCreate))
	}

	// Bulk update existing configurations
	if len(configsToUpdate) > 0 {
		if err := js.sm.db.Save(&configsToUpdate).Error; err != nil {
			logrus.Errorf("Failed to update admin configs: %v", err)
			return err
		}
		logrus.Infof("Updated %d existing admin configurations", len(configsToUpdate))
	}

	if len(configsToCreate) == 0 && len(configsToUpdate) == 0 {
		logrus.Info("All admin configurations are up to date")
	}

	logrus.Info("Admin configurations seeded successfully")
	return nil
}

// SeedServiceAreas seeds service areas from JSON
func (js *JSONBasedSeeder) SeedServiceAreas() error {
	logrus.Info("Seeding service areas...")

	// Load service areas from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadServiceAreas()
	if err != nil {
		logrus.Errorf("Failed to load service areas JSON: %v", err)
		return err
	}

	// Parse service areas from JSON
	serviceAreasData, ok := data["service_areas"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid service areas JSON structure")
	}

	var serviceAreas []models.ServiceArea
	for _, areaData := range serviceAreasData {
		areaMap, ok := areaData.(map[string]interface{})
		if !ok {
			continue
		}

		serviceArea := models.ServiceArea{
			City:     areaMap["city"].(string),
			State:    areaMap["state"].(string),
			Country:  areaMap["country"].(string),
			IsActive: areaMap["is_active"].(bool),
		}
		serviceAreas = append(serviceAreas, serviceArea)
	}

	// Get existing service areas in one query
	var existingServiceAreas []models.ServiceArea
	if err := js.sm.db.Find(&existingServiceAreas).Error; err != nil {
		logrus.Errorf("Failed to fetch existing service areas: %v", err)
		return err
	}

	// Create a map for quick lookup
	existingMap := make(map[string]bool)
	for _, area := range existingServiceAreas {
		key := fmt.Sprintf("%s-%s-%s", area.City, area.State, area.Country)
		existingMap[key] = true
	}

	// Filter out service areas that already exist
	var serviceAreasToCreate []models.ServiceArea
	for _, serviceArea := range serviceAreas {
		key := fmt.Sprintf("%s-%s-%s", serviceArea.City, serviceArea.State, serviceArea.Country)
		if !existingMap[key] {
			serviceAreasToCreate = append(serviceAreasToCreate, serviceArea)
		}
	}

	// Bulk create new service areas
	if len(serviceAreasToCreate) > 0 {
		if err := js.sm.db.Create(&serviceAreasToCreate).Error; err != nil {
			logrus.Errorf("Failed to create service areas: %v", err)
			return err
		}
		logrus.Infof("Created %d new service areas", len(serviceAreasToCreate))
	} else {
		logrus.Info("All service areas already exist")
	}

	logrus.Info("Service areas seeded successfully")
	return nil
}

// SeedAdminUser seeds admin users from JSON
func (js *JSONBasedSeeder) SeedAdminUser() error {
	logrus.Info("Seeding admin users...")

	// Load admin users from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadAdminUser()
	if err != nil {
		logrus.Errorf("Failed to load admin user JSON: %v", err)
		return err
	}

	// Parse admin users from JSON
	adminUsersData, ok := data["admin_user"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid admin user JSON structure")
	}

	// Get existing admin users to avoid duplicates
	var existingUsers []models.User
	if err := js.sm.db.Where("user_type = ?", "admin").Find(&existingUsers).Error; err != nil {
		logrus.Errorf("Failed to fetch existing admin users: %v", err)
		return err
	}

	// Create a map for quick lookup using phone number
	existingMap := make(map[string]bool)
	for _, user := range existingUsers {
		existingMap[user.Phone] = true
	}

	var usersToCreate []models.User

	for _, adminUserData := range adminUsersData {
		adminMap, ok := adminUserData.(map[string]interface{})
		if !ok {
			continue
		}

		// Check if admin user already exists
		phone := adminMap["phone"].(string)
		if existingMap[phone] {
			logrus.Infof("Admin user with phone %s already exists, skipping", phone)
			continue
		}

		// Create admin user
		adminUser := models.User{
			Name:     adminMap["name"].(string),
			Phone:    phone,
			UserType: "admin",
			IsActive: adminMap["is_active"].(bool),
		}
		usersToCreate = append(usersToCreate, adminUser)
	}

	// Bulk create admin users
	if len(usersToCreate) > 0 {
		if err := js.sm.db.Create(&usersToCreate).Error; err != nil {
			logrus.Errorf("Failed to create admin users: %v", err)
			return err
		}
		logrus.Infof("Created %d new admin users", len(usersToCreate))
	} else {
		logrus.Info("All admin users already exist")
	}

	logrus.Info("Admin users seeded successfully")
	return nil
}

// SeedServiceAreaAssociations seeds service area associations from JSON
func (js *JSONBasedSeeder) SeedServiceAreaAssociations() error {
	logrus.Info("Seeding service-service area associations...")

	// Load service area associations from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadServiceAreaAssociations()
	if err != nil {
		logrus.Errorf("Failed to load service area associations JSON: %v", err)
		return err
	}

	// Parse service area associations from JSON
	associationsData, ok := data["service_area_associations"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid service area associations JSON structure")
	}

	// Get all services
	var services []models.Service
	if err := js.sm.db.Find(&services).Error; err != nil {
		logrus.Error("Failed to fetch services:", err)
		return err
	}

	// Get all service areas
	var serviceAreas []models.ServiceArea
	if err := js.sm.db.Find(&serviceAreas).Error; err != nil {
		logrus.Error("Failed to fetch service areas:", err)
		return err
	}

	if len(serviceAreas) == 0 {
		logrus.Info("No service areas found to associate with services")
		return nil
	}

	// Create maps for quick lookup
	serviceMap := make(map[string]uint)
	for _, service := range services {
		serviceMap[service.Name] = service.ID
	}

	areaMap := make(map[string]uint)
	for _, area := range serviceAreas {
		areaMap[area.City] = area.ID
	}

	// Get existing associations to avoid duplicates
	var existingAssociations []struct {
		ServiceID     uint `gorm:"column:service_id"`
		ServiceAreaID uint `gorm:"column:service_area_id"`
	}
	if err := js.sm.db.Table("service_service_areas").Find(&existingAssociations).Error; err != nil {
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

	// Process each association from JSON
	for _, assocData := range associationsData {
		assocMap, ok := assocData.(map[string]interface{})
		if !ok {
			continue
		}

		serviceName, ok := assocMap["service_name"].(string)
		if !ok {
			continue
		}

		serviceID, exists := serviceMap[serviceName]
		if !exists {
			logrus.Warnf("Service not found: %s", serviceName)
			continue
		}

		serviceAreasList, ok := assocMap["service_areas"].([]interface{})
		if !ok {
			continue
		}

		// Create associations for this service
		for _, areaNameInterface := range serviceAreasList {
			areaName, ok := areaNameInterface.(string)
			if !ok {
				continue
			}

			areaID, exists := areaMap[areaName]
			if !exists {
				logrus.Warnf("Service area not found: %s", areaName)
				continue
			}

			key := fmt.Sprintf("%d-%d", serviceID, areaID)
			
			// Skip if association already exists
			if existingAssocMap[key] {
				continue
			}

			// Add to creation list
			associationsToCreate = append(associationsToCreate, struct {
				ServiceID     uint `gorm:"column:service_id"`
				ServiceAreaID uint `gorm:"column:service_area_id"`
			}{
				ServiceID:     serviceID,
				ServiceAreaID: areaID,
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
			if err := js.sm.db.Table("service_service_areas").Create(&batch).Error; err != nil {
				logrus.Errorf("Failed to create associations batch %d-%d: %v", i+1, end, err)
				return err
			}
		}
		
		logrus.Infof("Created %d new service-service area associations", createdCount)
	} else {
		logrus.Info("All service-service area associations already exist")
	}

	logrus.Info("Service area associations seeded successfully")
	return nil
}

// SeedSubscriptionPlans seeds all subscription plans from JSON
func (js *JSONBasedSeeder) SeedSubscriptionPlans() error {
	logrus.Info("Seeding subscription plans...")

	// Load subscription plans from JSON
	jsonLoader := NewJSONLoader()
	data, err := jsonLoader.LoadSubscriptionPlans()
	if err != nil {
		logrus.Errorf("Failed to load subscription plans JSON: %v", err)
		return err
	}

	// Parse subscription plans from JSON
	plansData, ok := data["subscription_plans"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription plans JSON structure")
	}

	// Get existing subscription plans
	var existingPlans []models.SubscriptionPlan
	if err := js.sm.db.Find(&existingPlans).Error; err != nil {
		logrus.Errorf("Failed to fetch existing subscription plans: %v", err)
		return err
	}

	// Create a map for quick lookup by name
	existingMap := make(map[string]bool)
	for _, plan := range existingPlans {
		existingMap[plan.Name] = true
	}

	createdCount := 0

	// Process each plan
	for _, planData := range plansData {
		planMap, ok := planData.(map[string]interface{})
		if !ok {
			continue
		}

		name := planMap["name"].(string)
		description := planMap["description"].(string)
		isActive := planMap["is_active"].(bool)

		// Check if this plan already exists
		if existingMap[name] {
			logrus.Debugf("Subscription plan already exists: %s", name)
			continue
		}

		// Parse features
		var features models.JSONB
		if featuresArray, ok := planMap["features"].([]interface{}); ok && len(featuresArray) > 0 {
			featuresList := make([]string, 0, len(featuresArray))
			for _, feature := range featuresArray {
				if featureStr, ok := feature.(string); ok && featureStr != "" {
					featuresList = append(featuresList, featureStr)
				}
			}
			if len(featuresList) > 0 {
				features = models.JSONB{
					"description": strings.Join(featuresList, "\n"),
				}
			}
		}

		// Parse pricing array
		pricingArray, ok := planMap["pricing"].([]interface{})
		if !ok {
			logrus.Warnf("No pricing found for plan: %s", name)
			continue
		}

		var pricingOptions models.PricingOptionsJSONB

		// Process each pricing option
		for _, pricingData := range pricingArray {
			pricingMap, ok := pricingData.(map[string]interface{})
			if !ok {
				continue
			}

			durationType := pricingMap["duration_type"].(string)
			durationDays := int(pricingMap["duration_days"].(float64))
			price := pricingMap["price"].(float64)

			// Validate duration type and days
			var expectedDays int
			switch durationType {
			case models.DurationMonthly:
				expectedDays = models.DurationDaysMonthly
			case models.DurationYearly:
				expectedDays = models.DurationDaysYearly
			default:
				logrus.Warnf("Invalid duration type: %s for plan: %s", durationType, name)
				continue
			}

			if durationDays != expectedDays {
				logrus.Warnf("Duration days mismatch for plan %s (%s): expected %d, got %d", 
					name, durationType, expectedDays, durationDays)
				durationDays = expectedDays // Fix the duration days
			}

			pricingOptions = append(pricingOptions, models.PricingOption{
				DurationType: durationType,
				DurationDays: durationDays,
				Price:        price,
			})
		}

		plan := models.SubscriptionPlan{
			Name:        name,
			Description: description,
			IsActive:    isActive,
			Features:    features,
			Pricing:     pricingOptions,
		}

		if err := js.sm.db.Create(&plan).Error; err != nil {
			// Check if it's a unique constraint violation
			if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
				logrus.Debugf("Subscription plan already exists (skipping): %s", name)
				continue
			}
			logrus.Errorf("Failed to create subscription plan %s: %v", name, err)
			return err
		}
		createdCount++
	}

	logrus.Infof("Created %d new subscription plans", createdCount)
	logrus.Info("Subscription plans seeded successfully")
	return nil
}
