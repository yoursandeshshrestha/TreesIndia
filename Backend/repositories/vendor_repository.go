package repositories

import (
	"treesindia/models"
	"treesindia/utils"
)

// VendorRepository handles vendor-specific database operations
type VendorRepository struct {
	*BaseRepository
	paginationHelper *utils.PaginationHelper
}

// NewVendorRepository creates a new vendor repository
func NewVendorRepository() *VendorRepository {
	return &VendorRepository{
		BaseRepository:   NewBaseRepository(),
		paginationHelper: utils.NewPaginationHelper(),
	}
}

// Create creates a new vendor
func (vr *VendorRepository) Create(vendor *models.Vendor) error {
	return vr.db.Create(vendor).Error
}

// GetByID gets a vendor by ID
func (vr *VendorRepository) GetByID(vendor *models.Vendor, id uint) error {
	return vr.db.Preload("User").First(vendor, id).Error
}

// GetByUserID gets all vendors for a specific user
func (vr *VendorRepository) GetByUserID(vendors *[]models.Vendor, userID uint) error {
	return vr.db.Where("user_id = ?", userID).Find(vendors).Error
}

// GetActiveByUserID gets all active vendors for a specific user
func (vr *VendorRepository) GetActiveByUserID(vendors *[]models.Vendor, userID uint) error {
	return vr.db.Where("user_id = ? AND is_active = ?", userID, true).Find(vendors).Error
}

// Update updates a vendor
func (vr *VendorRepository) Update(vendor *models.Vendor) error {
	return vr.db.Save(vendor).Error
}

// Delete soft deletes a vendor
func (vr *VendorRepository) Delete(vendor *models.Vendor) error {
	return vr.db.Delete(vendor).Error
}

// GetAll gets all vendors with pagination
func (vr *VendorRepository) GetAll(vendors *[]models.Vendor, page, limit int) (int64, error) {
	var total int64
	
	// Count total records
	if err := vr.db.Model(&models.Vendor{}).Count(&total).Error; err != nil {
		return 0, err
	}
	
	// Get paginated results
	offset := (page - 1) * limit
	err := vr.db.Preload("User").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(vendors).Error
	
	return total, err
}

// GetActive gets all active vendors with pagination
func (vr *VendorRepository) GetActive(vendors *[]models.Vendor, page, limit int) (int64, error) {
	var total int64
	
	// Count total active records
	if err := vr.db.Model(&models.Vendor{}).Where("is_active = ?", true).Count(&total).Error; err != nil {
		return 0, err
	}
	
	// Get paginated results
	offset := (page - 1) * limit
	err := vr.db.Preload("User").
		Where("is_active = ?", true).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(vendors).Error
	
	return total, err
}

// GetByBusinessType gets vendors by business type with pagination
func (vr *VendorRepository) GetByBusinessType(vendors *[]models.Vendor, businessType string, page, limit int) (int64, error) {
	var total int64
	
	// Count total records for business type
	if err := vr.db.Model(&models.Vendor{}).Where("business_type = ? AND is_active = ?", businessType, true).Count(&total).Error; err != nil {
		return 0, err
	}
	
	// Get paginated results
	offset := (page - 1) * limit
	err := vr.db.Preload("User").
		Where("business_type = ? AND is_active = ?", businessType, true).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(vendors).Error
	
	return total, err
}

// SearchVendors searches vendors by name or description
func (vr *VendorRepository) SearchVendors(vendors *[]models.Vendor, query string, page, limit int) (int64, error) {
	var total int64
	searchQuery := "%" + query + "%"
	
	// Count total matching records
	if err := vr.db.Model(&models.Vendor{}).
		Where("(vendor_name ILIKE ? OR business_description ILIKE ?) AND is_active = ?", 
			searchQuery, searchQuery, true).
		Count(&total).Error; err != nil {
		return 0, err
	}
	
	// Get paginated results
	offset := (page - 1) * limit
	err := vr.db.Preload("User").
		Where("(vendor_name ILIKE ? OR business_description ILIKE ?) AND is_active = ?", 
			searchQuery, searchQuery, true).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(vendors).Error
	
	return total, err
}

// CountByUserID counts total vendors for a user
func (vr *VendorRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := vr.db.Model(&models.Vendor{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// CountActiveByUserID counts active vendors for a user
func (vr *VendorRepository) CountActiveByUserID(userID uint) (int64, error) {
	var count int64
	err := vr.db.Model(&models.Vendor{}).Where("user_id = ? AND is_active = ?", userID, true).Count(&count).Error
	return count, err
}

// GetVendorStats gets vendor statistics
func (vr *VendorRepository) GetVendorStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total vendors
	var totalVendors int64
	if err := vr.db.Model(&models.Vendor{}).Count(&totalVendors).Error; err != nil {
		return nil, err
	}
	stats["total_vendors"] = totalVendors
	
	// Active vendors
	var activeVendors int64
	if err := vr.db.Model(&models.Vendor{}).Where("is_active = ?", true).Count(&activeVendors).Error; err != nil {
		return nil, err
	}
	stats["active_vendors"] = activeVendors
	
	// Inactive vendors
	var inactiveVendors int64
	if err := vr.db.Model(&models.Vendor{}).Where("is_active = ?", false).Count(&inactiveVendors).Error; err != nil {
		return nil, err
	}
	stats["inactive_vendors"] = inactiveVendors
	
	return stats, nil
}
