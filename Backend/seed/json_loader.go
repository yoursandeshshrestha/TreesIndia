package seed

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/sirupsen/logrus"
)

// JSONLoader handles loading seed data from JSON files
type JSONLoader struct {
	seedDataPath string
}

// NewJSONLoader creates a new JSON loader
func NewJSONLoader() *JSONLoader {
	return &JSONLoader{
		seedDataPath: "seed-data",
	}
}

// LoadJSONFile loads a JSON file and unmarshals it into the provided interface
func (jl *JSONLoader) LoadJSONFile(filename string, v interface{}) error {
	filePath := filepath.Join(jl.seedDataPath, filename)
	
	logrus.Infof("Loading JSON file: %s", filePath)
	
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read JSON file %s: %v", filePath, err)
	}
	
	if err := json.Unmarshal(data, v); err != nil {
		return fmt.Errorf("failed to unmarshal JSON file %s: %v", filePath, err)
	}
	
	logrus.Infof("Successfully loaded JSON file: %s", filename)
	return nil
}

// LoadAdminConfigs loads admin configurations from JSON file
func (jl *JSONLoader) LoadAdminConfigs() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("admin_configs.json", &data)
	return data, err
}

// LoadServiceAreas loads service areas from JSON file
func (jl *JSONLoader) LoadServiceAreas() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("service_areas.json", &data)
	return data, err
}

// LoadAdminUser loads admin user from JSON file
func (jl *JSONLoader) LoadAdminUser() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("admin_user.json", &data)
	return data, err
}

// LoadServiceAreaAssociations loads service area associations from JSON file
func (jl *JSONLoader) LoadServiceAreaAssociations() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("service_area_associations.json", &data)
	return data, err
}

// LoadSubscriptionPlans loads subscription plans from JSON file
func (jl *JSONLoader) LoadSubscriptionPlans() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("subscription_plans.json", &data)
	return data, err
}

// LoadCategories loads categories from JSON file
func (jl *JSONLoader) LoadCategories() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("categories.json", &data)
	return data, err
}

// LoadSubcategories loads subcategories from JSON file
func (jl *JSONLoader) LoadSubcategories() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("subcategories.json", &data)
	return data, err
}

// LoadServices loads services from JSON file
func (jl *JSONLoader) LoadServices() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("services.json", &data)
	return data, err
}

// LoadWorkers loads workers from JSON file
func (jl *JSONLoader) LoadWorkers() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("workers.json", &data)
	return data, err
}

// LoadPromotionBanners loads promotion banners from JSON file
func (jl *JSONLoader) LoadPromotionBanners() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("promotion_banners.json", &data)
	return data, err
}

// LoadBannerImages loads banner images from JSON file
func (jl *JSONLoader) LoadBannerImages() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("banner_images.json", &data)
	return data, err
}

// LoadProperties loads properties from JSON file
func (jl *JSONLoader) LoadProperties() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("properties.json", &data)
	return data, err
}

// LoadProjects loads projects from JSON file
func (jl *JSONLoader) LoadProjects() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("projects.json", &data)
	return data, err
}

// LoadVendors loads vendors from JSON file
func (jl *JSONLoader) LoadVendors() (map[string]interface{}, error) {
	var data map[string]interface{}
	err := jl.LoadJSONFile("vendors.json", &data)
	return data, err
}

