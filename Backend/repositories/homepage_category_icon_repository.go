package repositories

import (
	"treesindia/models"

	"gorm.io/gorm"
)

type HomepageCategoryIconRepository struct {
	db *gorm.DB
}

func NewHomepageCategoryIconRepository(db *gorm.DB) *HomepageCategoryIconRepository {
	return &HomepageCategoryIconRepository{db: db}
}

// Get all active category icons ordered by creation time
func (r *HomepageCategoryIconRepository) GetAllActive() ([]models.HomepageCategoryIcon, error) {
	var icons []models.HomepageCategoryIcon
	err := r.db.Where("is_active = ?", true).
		Order("created_at ASC").
		Find(&icons).Error
	return icons, err
}

// Get all category icons (including inactive) ordered by creation time
func (r *HomepageCategoryIconRepository) GetAll() ([]models.HomepageCategoryIcon, error) {
	var icons []models.HomepageCategoryIcon
	err := r.db.Order("created_at ASC").Find(&icons).Error
	return icons, err
}

// Get category icon by ID
func (r *HomepageCategoryIconRepository) GetByID(id uint) (*models.HomepageCategoryIcon, error) {
	var icon models.HomepageCategoryIcon
	err := r.db.First(&icon, id).Error
	if err != nil {
		return nil, err
	}
	return &icon, nil
}

// Get category icon by name
func (r *HomepageCategoryIconRepository) GetByName(name string) (*models.HomepageCategoryIcon, error) {
	var icon models.HomepageCategoryIcon
	err := r.db.Where("name = ?", name).First(&icon).Error
	if err != nil {
		return nil, err
	}
	return &icon, nil
}

// Create new category icon
func (r *HomepageCategoryIconRepository) Create(icon *models.HomepageCategoryIcon) error {
	return r.db.Create(icon).Error
}

// Update category icon
func (r *HomepageCategoryIconRepository) Update(icon *models.HomepageCategoryIcon) error {
	return r.db.Save(icon).Error
}

// Delete category icon
func (r *HomepageCategoryIconRepository) Delete(id uint) error {
	return r.db.Delete(&models.HomepageCategoryIcon{}, id).Error
}

// Toggle active status
func (r *HomepageCategoryIconRepository) ToggleActive(id uint) error {
	var icon models.HomepageCategoryIcon
	err := r.db.First(&icon, id).Error
	if err != nil {
		return err
	}
	
	icon.IsActive = !icon.IsActive
	return r.db.Save(&icon).Error
}
