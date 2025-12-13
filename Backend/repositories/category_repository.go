package repositories

import (
	"treesindia/models"
	"treesindia/utils"
)

// CategoryRepository handles category-specific database operations
type CategoryRepository struct {
	*BaseRepository
	paginationHelper *utils.PaginationHelper
	validationHelper *utils.ValidationHelper
}

// NewCategoryRepository creates a new category repository
func NewCategoryRepository() *CategoryRepository {
	return &CategoryRepository{
		BaseRepository:   NewBaseRepository(),
		paginationHelper: utils.NewPaginationHelper(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// FindBySlug finds a category by slug
func (cr *CategoryRepository) FindBySlug(category *models.Category, slug string) error {
	return cr.FindByField(category, "slug", slug)
}

// FindActiveCategories finds all active categories
func (cr *CategoryRepository) FindActiveCategories(categories *[]models.Category) error {
	return cr.db.Where("is_active = ?", true).Order("name ASC").Find(categories).Error
}

// FindWithChildren finds categories with their children (all levels)
func (cr *CategoryRepository) FindWithChildren(categories *[]models.Category) error {
	return cr.db.Preload("Children").Order("name ASC").Find(categories).Error
}

// FindActiveWithChildren finds active categories with their active children
func (cr *CategoryRepository) FindActiveWithChildren(categories *[]models.Category) error {
	return cr.db.Preload("Children", "is_active = ?", true).Where("is_active = ?", true).Order("name ASC").Find(categories).Error
}

// FindRootCategories finds only root categories (Level 1, no parent)
func (cr *CategoryRepository) FindRootCategories(categories *[]models.Category) error {
	return cr.db.Where("parent_id IS NULL").Order("name ASC").Find(categories).Error
}

// FindActiveRootCategories finds active root categories
func (cr *CategoryRepository) FindActiveRootCategories(categories *[]models.Category) error {
	return cr.db.Where("parent_id IS NULL AND is_active = ?", true).Order("name ASC").Find(categories).Error
}

// FindByParentID finds all categories with a specific parent
func (cr *CategoryRepository) FindByParentID(categories *[]models.Category, parentID uint) error {
	return cr.db.Where("parent_id = ?", parentID).Order("name ASC").Find(categories).Error
}

// FindActiveByParentID finds active categories with a specific parent
func (cr *CategoryRepository) FindActiveByParentID(categories *[]models.Category, parentID uint) error {
	return cr.db.Where("parent_id = ? AND is_active = ?", parentID, true).Order("name ASC").Find(categories).Error
}

// FindWithFullTree preloads the complete hierarchy (children and their children recursively)
func (cr *CategoryRepository) FindWithFullTree(categories *[]models.Category) error {
	return cr.db.Preload("Children.Children").Order("name ASC").Find(categories).Error
}

// FindByActiveStatus finds categories by active status
func (cr *CategoryRepository) FindByActiveStatus(categories *[]models.Category, isActive bool) error {
	return cr.db.Where("is_active = ?", isActive).Order("name ASC").Find(categories).Error
}

// GenerateUniqueSlug generates a unique slug for a category
func (cr *CategoryRepository) GenerateUniqueSlug(name string) (string, error) {
	slugHelper := utils.NewSlugHelper()
	
	// Define the exists function for checking uniqueness
	existsFunc := func(slug string) bool {
		var count int64
		if err := cr.db.Model(&models.Category{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
			return false // Assume it doesn't exist if there's an error
		}
		return count > 0
	}
	
	return slugHelper.GenerateUniqueSlug(name, existsFunc), nil
}

// UpdateActiveStatus updates the active status of a category
func (cr *CategoryRepository) UpdateActiveStatus(categoryID uint, isActive bool) error {
	return cr.db.Model(&models.Category{}).Where("id = ?", categoryID).Update("is_active", isActive).Error
}

// GetCategoryStats gets category statistics
func (cr *CategoryRepository) GetCategoryStats() (map[string]int64, error) {
	stats := make(map[string]int64)
	
	// Total categories
	var total int64
	if err := cr.db.Model(&models.Category{}).Count(&total).Error; err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Active categories
	var active int64
	if err := cr.db.Model(&models.Category{}).Where("is_active = ?", true).Count(&active).Error; err != nil {
		return nil, err
	}
	stats["active"] = active
	
	return stats, nil
}

// GetCategoryTree gets the complete category tree with all levels
func (cr *CategoryRepository) GetCategoryTree() ([]models.Category, error) {
	var categories []models.Category
	// Get root categories and preload children recursively (up to 3 levels)
	err := cr.db.Preload("Children.Children", "is_active = ?", true).
		Preload("Children", "is_active = ?", true).
		Where("parent_id IS NULL AND is_active = ?", true).
		Order("name ASC").
		Find(&categories).Error
	return categories, err
}

// GetCategoryTreeByLevel gets categories up to a specific level
func (cr *CategoryRepository) GetCategoryTreeByLevel(maxLevel int) ([]models.Category, error) {
	var categories []models.Category
	query := cr.db.Where("parent_id IS NULL AND is_active = ?", true)
	
	// Preload children based on maxLevel
	if maxLevel >= 2 {
		query = query.Preload("Children", "is_active = ?", true)
	}
	if maxLevel >= 3 {
		query = query.Preload("Children.Children", "is_active = ?", true)
	}
	
	err := query.Order("name ASC").Find(&categories).Error
	return categories, err
}
