package repositories

import (
	"fmt"
	"treesindia/models"
)

// AddressRepository handles address-specific database operations
type AddressRepository struct {
	*BaseRepository
}

// NewAddressRepository creates a new address repository
func NewAddressRepository() *AddressRepository {
	return &AddressRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateAddress creates a new address
func (ar *AddressRepository) CreateAddress(address *models.Address) error {
	return ar.Create(address)
}

// FindByID finds an address by ID
func (ar *AddressRepository) FindByID(address *models.Address, id uint) error {
	if id == 0 {
		return fmt.Errorf("invalid address ID")
	}
	return ar.BaseRepository.FindByID(address, id)
}

// FindByUserID finds all addresses by user ID
func (ar *AddressRepository) FindByUserID(addresses *[]models.Address, userID uint) error {
	return ar.db.Where("user_id = ?", userID).Find(addresses).Error
}

// FindByLocationID finds all addresses by location ID
func (ar *AddressRepository) FindByLocationID(addresses *[]models.Address, locationID uint) error {
	return ar.db.Where("location_id = ?", locationID).Find(addresses).Error
}

// FindDefaultAddressByUserID finds the default address for a user
func (ar *AddressRepository) FindDefaultAddressByUserID(address *models.Address, userID uint) error {
	return ar.db.Where("user_id = ? AND is_default = ?", userID, true).First(address).Error
}

// UpdateAddress updates an address
func (ar *AddressRepository) UpdateAddress(address *models.Address) error {
	return ar.Update(address)
}

// DeleteAddress deletes an address
func (ar *AddressRepository) DeleteAddress(address *models.Address) error {
	return ar.Delete(address)
}

// DeleteByID deletes an address by ID
func (ar *AddressRepository) DeleteByID(id uint) error {
	return ar.db.Delete(&models.Address{}, id).Error
}

// UnsetDefaultAddresses unsets all default addresses for a user
func (ar *AddressRepository) UnsetDefaultAddresses(userID uint) error {
	return ar.db.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", false).Error
}

// SetAddressAsDefault sets a specific address as default for a user
func (ar *AddressRepository) SetAddressAsDefault(addressID uint, userID uint) error {
	// First unset all default addresses for this user
	if err := ar.UnsetDefaultAddresses(userID); err != nil {
		return err
	}
	
	// Then set the specified address as default
	return ar.db.Model(&models.Address{}).Where("id = ? AND user_id = ?", addressID, userID).Update("is_default", true).Error
}

// CountAddressesByUserID counts addresses for a specific user
func (ar *AddressRepository) CountAddressesByUserID(userID uint) (int64, error) {
	var count int64
	err := ar.db.Model(&models.Address{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// ExistsByUserID checks if an address exists for a user
func (ar *AddressRepository) ExistsByUserID(userID uint) (bool, error) {
	return ar.Exists(&models.Address{}, "user_id", userID)
}
