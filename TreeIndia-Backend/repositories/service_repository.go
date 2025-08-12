package repositories

import (
	"errors"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ServiceRepository struct {
	BaseRepository
}

func NewServiceRepository() *ServiceRepository {
	return &ServiceRepository{
		BaseRepository: *NewBaseRepository(),
	}
}

// Create creates a new service
func (sr *ServiceRepository) Create(service *models.Service) error {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.Create panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.Create called for service: %s", service.Name)
	logrus.Infof("ServiceRepository.Create service data: CategoryID=%d, SubcategoryID=%d", service.CategoryID, service.SubcategoryID)
	
	// First, let's verify the subcategory exists
	var subcategory models.Subcategory
	if err := sr.GetDB().First(&subcategory, service.SubcategoryID).Error; err != nil {
		logrus.Errorf("ServiceRepository.Create subcategory lookup failed: %v", err)
		return err
	}
	logrus.Infof("ServiceRepository.Create found subcategory: ID=%d, Name=%s, ParentID=%d", subcategory.ID, subcategory.Name, subcategory.ParentID)
	
	// Also verify the category exists
	var category models.Category
	if err := sr.GetDB().First(&category, service.CategoryID).Error; err != nil {
		logrus.Errorf("ServiceRepository.Create category lookup failed: %v", err)
		return err
	}
	logrus.Infof("ServiceRepository.Create found category: ID=%d, Name=%s", category.ID, category.Name)
	
	err := sr.GetDB().Create(service).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.Create database error: %v", err)
		return err
	}
	
	logrus.Infof("ServiceRepository.Create successfully created service with ID: %d", service.ID)
	return nil
}

// GetByID retrieves a service by ID
func (sr *ServiceRepository) GetByID(id uint) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetByID panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetByID called with ID: %d", id)
	
	var service models.Service
	err := sr.GetDB().First(&service, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceRepository.GetByID service not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("ServiceRepository.GetByID database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetByID found service: %s", service.Name)
	return &service, nil
}

// GetByIDWithRelations retrieves a service by ID with preloaded relationships
func (sr *ServiceRepository) GetByIDWithRelations(id uint) (*models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetByIDWithRelations panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetByIDWithRelations called with ID: %d", id)
	
	var service models.Service
	err := sr.GetDB().Preload("Subcategory").First(&service, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Infof("ServiceRepository.GetByIDWithRelations service not found with ID: %d", id)
			return nil, gorm.ErrRecordNotFound
		}
		logrus.Errorf("ServiceRepository.GetByIDWithRelations database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetByIDWithRelations found service: %s", service.Name)
	return &service, nil
}

// GetAll retrieves all services with optional filtering
func (sr *ServiceRepository) GetAll(excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetAll panic: %v", r)
		}
	}()
	
	var services []models.Service
	query := sr.GetDB()
	
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Find(&services).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.GetAll database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetAll found %d services", len(services))
	return services, nil
}

// GetBySubcategory retrieves services by subcategory ID
func (sr *ServiceRepository) GetBySubcategory(subcategoryID uint, excludeInactive bool) ([]models.Service, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("ServiceRepository.GetBySubcategory panic: %v", r)
		}
	}()
	
	logrus.Infof("ServiceRepository.GetBySubcategory called with subcategoryID: %d, excludeInactive: %v", subcategoryID, excludeInactive)
	
	var services []models.Service
	query := sr.GetDB().Where("subcategory_id = ?", subcategoryID)
	
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Find(&services).Error
	if err != nil {
		logrus.Errorf("ServiceRepository.GetBySubcategory database error: %v", err)
		return nil, err
	}
	
	logrus.Infof("ServiceRepository.GetBySubcategory found %d services", len(services))
	return services, nil
}

// Update updates a service
func (sr *ServiceRepository) Update(service *models.Service) error {
	return sr.GetDB().Save(service).Error
}

// Delete deletes a service
func (sr *ServiceRepository) Delete(id uint) error {
	return sr.GetDB().Delete(&models.Service{}, id).Error
}

// ToggleStatus toggles the active status of a service
func (sr *ServiceRepository) ToggleStatus(id uint) error {
	return sr.GetDB().Model(&models.Service{}).Where("id = ?", id).Update("is_active", gorm.Expr("NOT is_active")).Error
}
