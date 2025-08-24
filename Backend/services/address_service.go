package services

import (
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"
)

// AddressService handles address business logic
type AddressService struct {
	addressRepo *repositories.AddressRepository
	userRepo    *repositories.UserRepository
}

// NewAddressService creates a new address service
func NewAddressService() *AddressService {
	return &AddressService{
		addressRepo: repositories.NewAddressRepository(),
		userRepo:    repositories.NewUserRepository(),
	}
}

// CreateAddress creates a new address for a user
func (as *AddressService) CreateAddress(userID uint, req *models.CreateAddressRequest) (*models.Address, error) {
	// Check if user exists
	var user models.User
	if err := as.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if this is the user's first address
	var existingAddresses []models.Address
	err := as.addressRepo.FindByUserID(&existingAddresses, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing addresses: %w", err)
	}

	// If this is the first address, automatically set it as default
	if len(existingAddresses) == 0 {
		req.IsDefault = true
	}

	// If this is set as default, unset other default addresses for this user
	if req.IsDefault {
		if err := as.addressRepo.UnsetDefaultAddresses(userID); err != nil {
			return nil, fmt.Errorf("failed to unset default addresses: %w", err)
		}
	}

	// Create address
	address := &models.Address{
		UserID:      userID,
		Name:        req.Name,
		Address:     req.Address,
		City:        req.City,
		State:       req.State,
		Country:     req.Country,
		PostalCode:  req.PostalCode,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		Landmark:    req.Landmark,
		HouseNumber: req.HouseNumber,
		IsDefault:   req.IsDefault,
		UpdatedAt:   time.Now(),
		CreatedAt:   time.Now(),
	}

	if err := as.addressRepo.CreateAddress(address); err != nil {
		return nil, fmt.Errorf("failed to create address: %w", err)
	}

	return address, nil
}

// GetAddressByID gets an address by ID
func (as *AddressService) GetAddressByID(id uint) (*models.Address, error) {
	if id == 0 {
		return nil, fmt.Errorf("invalid address ID")
	}

	var address models.Address
	if err := as.addressRepo.FindByID(&address, id); err != nil {
		return nil, fmt.Errorf("address not found: %w", err)
	}
	return &address, nil
}

// GetAllAddressesByUserID gets all addresses for a user
func (as *AddressService) GetAllAddressesByUserID(userID uint) ([]models.Address, error) {
	var addresses []models.Address
	if err := as.addressRepo.FindByUserID(&addresses, userID); err != nil {
		return nil, fmt.Errorf("failed to get addresses: %w", err)
	}
	return addresses, nil
}

// GetDefaultAddressByUserID gets the default address for a user
func (as *AddressService) GetDefaultAddressByUserID(userID uint) (*models.Address, error) {
	var address models.Address
	if err := as.addressRepo.FindDefaultAddressByUserID(&address, userID); err != nil {
		return nil, fmt.Errorf("default address not found: %w", err)
	}
	return &address, nil
}

// SetAddressAsDefault sets an address as default for a user
func (as *AddressService) SetAddressAsDefault(addressID uint, userID uint) (*models.Address, error) {
	var address models.Address
	if err := as.addressRepo.FindByID(&address, addressID); err != nil {
		return nil, fmt.Errorf("address not found")
	}

	// Check if address belongs to the user
	if address.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}

	if err := as.addressRepo.SetAddressAsDefault(addressID, userID); err != nil {
		return nil, fmt.Errorf("failed to set default address: %w", err)
	}

	// Update the address object to reflect the change
	address.IsDefault = true
	address.UpdatedAt = time.Now()

	return &address, nil
}

// UpdateAddress updates an address
func (as *AddressService) UpdateAddress(id uint, userID uint, req *models.UpdateAddressRequest) (*models.Address, error) {
	var address models.Address
	if err := as.addressRepo.FindByID(&address, id); err != nil {
		return nil, fmt.Errorf("address not found")
	}

	// Check if address belongs to the user
	if address.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}

	// If this is set as default, unset other default addresses for this user
	if req.IsDefault {
		if err := as.addressRepo.UnsetDefaultAddresses(address.UserID); err != nil {
			return nil, fmt.Errorf("failed to unset default addresses: %w", err)
		}
	}

	// Update fields
	if req.Name != "" {
		address.Name = req.Name
	}
	if req.Address != "" {
		address.Address = req.Address
	}
	if req.PostalCode != "" {
		address.PostalCode = req.PostalCode
	}
	if req.Latitude != 0 {
		address.Latitude = req.Latitude
	}
	if req.Longitude != 0 {
		address.Longitude = req.Longitude
	}
	if req.Landmark != "" {
		address.Landmark = req.Landmark
	}
	if req.HouseNumber != "" {
		address.HouseNumber = req.HouseNumber
	}
	address.IsDefault = req.IsDefault
	address.UpdatedAt = time.Now()

	if err := as.addressRepo.UpdateAddress(&address); err != nil {
		return nil, fmt.Errorf("failed to update address: %w", err)
	}

	return &address, nil
}

// DeleteAddress deletes an address
func (as *AddressService) DeleteAddress(id uint, userID uint) error {
	var address models.Address
	if err := as.addressRepo.FindByID(&address, id); err != nil {
		return fmt.Errorf("address not found")
	}

	// Check if address belongs to the user
	if address.UserID != userID {
		return fmt.Errorf("access denied")
	}

	// Check if this is the last address
	count, err := as.addressRepo.CountAddressesByUserID(userID)
	if err != nil {
		return fmt.Errorf("failed to count addresses: %w", err)
	}
	if count <= 1 {
		return fmt.Errorf("cannot delete last address")
	}

	wasDefault := address.IsDefault

	if err := as.addressRepo.DeleteAddress(&address); err != nil {
		return fmt.Errorf("failed to delete address: %w", err)
	}

	// If we deleted the default address, set another address as default if available
	if wasDefault {
		var remainingAddresses []models.Address
		if err := as.addressRepo.FindByUserID(&remainingAddresses, userID); err != nil {
			// Log the error but don't fail the deletion
			return nil
		}

		// If there are remaining addresses, set the first one as default
		if len(remainingAddresses) > 0 {
			if err := as.addressRepo.SetAddressAsDefault(remainingAddresses[0].ID, userID); err != nil {
				// Log the error but don't fail the deletion
			}
		}
	}

	return nil
}

// CountAddressesByUserID counts addresses for a specific user
func (as *AddressService) CountAddressesByUserID(userID uint) (int64, error) {
	return as.addressRepo.CountAddressesByUserID(userID)
}
