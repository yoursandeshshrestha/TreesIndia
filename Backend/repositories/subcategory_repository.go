package repositories

import (
	"treesindia/models"
	"treesindia/utils"
)

// SubcategoryRepository handles subcategory-specific database operations
type SubcategoryRepository struct {
	*BaseRepository
	paginationHelper *utils.PaginationHelper
	validationHelper *utils.ValidationHelper
}

// NewSubcategoryRepository creates a new subcategory repository
func NewSubcategoryRepository() *SubcategoryRepository {
	return &SubcategoryRepository{
		BaseRepository:   NewBaseRepository(),
		paginationHelper: utils.NewPaginationHelper(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// FindBySlug finds a subcategory by slug
func (sr *SubcategoryRepository) FindBySlug(subcategory *models.Subcategory, slug string) error {
	return sr.FindByField(subcategory, "slug", slug)
}

// FindActiveSubcategories finds all active subcategories
func (sr *SubcategoryRepository) FindActiveSubcategories(subcategories *[]models.Subcategory) error {
	return sr.db.Where("is_active = ?", true).Order("name ASC").Find(subcategories).Error
}

// FindByParentID finds subcategories by parent category ID
func (sr *SubcategoryRepository) FindByParentID(subcategories *[]models.Subcategory, parentID uint) error {
	return sr.db.Where("parent_id = ?", parentID).Where("is_active = ?", true).Order("name ASC").Find(subcategories).Error
}

// FindWithParent finds subcategories with their parent category
func (sr *SubcategoryRepository) FindWithParent(subcategories *[]models.Subcategory) error {
	return sr.db.Preload("Parent").Order("name ASC").Find(subcategories).Error
}

// FindByActiveStatus finds subcategories by active status
func (sr *SubcategoryRepository) FindByActiveStatus(subcategories *[]models.Subcategory, isActive bool) error {
	return sr.db.Where("is_active = ?", isActive).Order("name ASC").Find(subcategories).Error
}

// GenerateUniqueSlug generates a unique slug for a subcategory
func (sr *SubcategoryRepository) GenerateUniqueSlug(name string) (string, error) {
	slugHelper := utils.NewSlugHelper()
	
	// Define the exists function for checking uniqueness
	existsFunc := func(slug string) bool {
		var count int64
		if err := sr.db.Model(&models.Subcategory{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
			return false // Assume it doesn't exist if there's an error
		}
		return count > 0
	}
	
	return slugHelper.GenerateUniqueSlug(name, existsFunc), nil
}

// UpdateActiveStatus updates the active status of a subcategory
func (sr *SubcategoryRepository) UpdateActiveStatus(subcategoryID uint, isActive bool) error {
	return sr.db.Model(&models.Subcategory{}).Where("id = ?", subcategoryID).Update("is_active", isActive).Error
}

// GetSubcategoryStats gets subcategory statistics
func (sr *SubcategoryRepository) GetSubcategoryStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total subcategories
	var total int64
	if err := sr.db.Model(&models.Subcategory{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Active subcategories
	var active int64
	if err := sr.db.Model(&models.Subcategory{}).Where("is_active = ?", true).Count(&active).Error; err != nil {
		return nil, err
	}
	stats["active"] = active
	
	return stats, nil
}

// GetSubcategoriesByCategory gets all subcategories for a specific category
func (sr *SubcategoryRepository) GetSubcategoriesByCategory(categoryID uint, excludeInactive bool) ([]models.Subcategory, error) {
	var subcategories []models.Subcategory
	query := sr.db.Where("parent_id = ?", categoryID)
	
	if excludeInactive {
		query = query.Where("is_active = ?", true)
	}
	
	err := query.Order("name ASC").Find(&subcategories).Error
	return subcategories, err
}

// CheckParentExists checks if the parent category exists
func (sr *SubcategoryRepository) CheckParentExists(parentID uint) bool {
	var count int64
	if err := sr.db.Model(&models.Category{}).Where("id = ?", parentID).Count(&count).Error; err != nil {
		return false
	}
	return count > 0
}
