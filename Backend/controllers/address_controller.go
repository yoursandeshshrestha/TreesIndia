package controllers

import (
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// AddressController handles address-related HTTP requests
type AddressController struct {
	*BaseController
	addressService *services.AddressService
}

// NewAddressController creates a new address controller
func NewAddressController() *AddressController {
	return &AddressController{
		BaseController: NewBaseController(),
		addressService: services.NewAddressService(),
	}
}

// CreateAddress creates a new address for the authenticated user
// @Summary Create a new address
// @Description Create a new address for the authenticated user
// @Tags addresses
// @Accept json
// @Produce json
// @Param address body models.CreateAddressRequest true "Address details"
// @Success 201 {object} models.AddressResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses [post]
// @Security BearerAuth
func (ac *AddressController) CreateAddress(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	var req models.CreateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ac.BadRequest(c, "Invalid request data", err.Error())
		return
	}

	address, err := ac.addressService.CreateAddress(userID, &req)
	if err != nil {
		ac.InternalServerError(c, "Failed to create address", err.Error())
		return
	}

	response := models.AddressResponse{
		ID:          address.ID,
		UserID:      address.UserID,
		Name:        address.Name,
		Address:     address.Address,
		PostalCode:  address.PostalCode,
		Latitude:    address.Latitude,
		Longitude:   address.Longitude,
		Landmark:    address.Landmark,
		HouseNumber: address.HouseNumber,
		IsDefault:   address.IsDefault,
		UpdatedAt:   address.UpdatedAt,
		CreatedAt:   address.CreatedAt,
	}

	ac.Created(c, "Address created successfully", response)
}

// GetAllAddresses gets all addresses for the authenticated user
// @Summary Get all user addresses
// @Description Get all addresses for the authenticated user
// @Tags addresses
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {array} models.AddressResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses [get]
// @Security BearerAuth
func (ac *AddressController) GetAllAddresses(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	addresses, err := ac.addressService.GetAllAddressesByUserID(userID)
	if err != nil {
		ac.InternalServerError(c, "Failed to get addresses", err.Error())
		return
	}

	var responses []models.AddressResponse
	for _, address := range addresses {
		response := models.AddressResponse{
			ID:          address.ID,
			UserID:      address.UserID,
			Name:        address.Name,
			Address:     address.Address,
			PostalCode:  address.PostalCode,
			Latitude:    address.Latitude,
			Longitude:   address.Longitude,
			Landmark:    address.Landmark,
			HouseNumber: address.HouseNumber,
			IsDefault:   address.IsDefault,
			UpdatedAt:   address.UpdatedAt,
			CreatedAt:   address.CreatedAt,
		}
		responses = append(responses, response)
	}

	ac.Success(c, "Addresses retrieved successfully", responses)
}

// GetAddressByID gets a specific address by ID
// @Summary Get address by ID
// @Description Get a specific address by ID (must belong to authenticated user)
// @Tags addresses
// @Produce json
// @Param id path int true "Address ID"
// @Success 200 {object} models.AddressResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses/{id} [get]
// @Security BearerAuth
func (ac *AddressController) GetAddressByID(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ac.BadRequest(c, "Invalid address ID", "Invalid address ID format")
		return
	}

	address, err := ac.addressService.GetAddressByID(uint(id))
	if err != nil {
		ac.NotFound(c, "Address not found", err.Error())
		return
	}

	// Check if address belongs to the authenticated user
	if address.UserID != userID {
		ac.Forbidden(c, "Access denied", "Address does not belong to user")
		return
	}

	response := models.AddressResponse{
		ID:          address.ID,
		UserID:      address.UserID,
		Name:        address.Name,
		Address:     address.Address,
		PostalCode:  address.PostalCode,
		Latitude:    address.Latitude,
		Longitude:   address.Longitude,
		Landmark:    address.Landmark,
		HouseNumber: address.HouseNumber,
		IsDefault:   address.IsDefault,
		UpdatedAt:   address.UpdatedAt,
		CreatedAt:   address.CreatedAt,
	}

	ac.Success(c, "Address retrieved successfully", response)
}

// UpdateAddress updates an existing address
// @Summary Update address
// @Description Update an existing address
// @Tags addresses
// @Accept json
// @Produce json
// @Param id path int true "Address ID"
// @Param address body models.UpdateAddressRequest true "Address update details"
// @Success 200 {object} models.AddressResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses/{id} [put]
// @Security BearerAuth
func (ac *AddressController) UpdateAddress(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ac.BadRequest(c, "Invalid address ID", "Invalid address ID format")
		return
	}

	var req models.UpdateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ac.BadRequest(c, "Invalid request data", err.Error())
		return
	}

	address, err := ac.addressService.UpdateAddress(uint(id), userID, &req)
	if err != nil {
		if err.Error() == "address not found" {
			ac.NotFound(c, "Address not found", "Address does not exist")
		} else if err.Error() == "access denied" {
			ac.Forbidden(c, "Access denied", "Address does not belong to user")
		} else {
			ac.InternalServerError(c, "Failed to update address", err.Error())
		}
		return
	}

	response := models.AddressResponse{
		ID:          address.ID,
		UserID:      address.UserID,
		Name:        address.Name,
		Address:     address.Address,
		PostalCode:  address.PostalCode,
		Latitude:    address.Latitude,
		Longitude:   address.Longitude,
		Landmark:    address.Landmark,
		HouseNumber: address.HouseNumber,
		IsDefault:   address.IsDefault,
		UpdatedAt:   address.UpdatedAt,
		CreatedAt:   address.CreatedAt,
	}

	ac.Success(c, "Address updated successfully", response)
}

// DeleteAddress deletes an address
// @Summary Delete address
// @Description Delete an address (cannot delete last address)
// @Tags addresses
// @Produce json
// @Param id path int true "Address ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 409 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses/{id} [delete]
// @Security BearerAuth
func (ac *AddressController) DeleteAddress(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ac.BadRequest(c, "Invalid address ID", "Invalid address ID format")
		return
	}

	err = ac.addressService.DeleteAddress(uint(id), userID)
	if err != nil {
		if err.Error() == "address not found" {
			ac.NotFound(c, "Address not found", "Address does not exist")
		} else if err.Error() == "access denied" {
			ac.Forbidden(c, "Access denied", "Address does not belong to user")
		} else if err.Error() == "cannot delete last address" {
			ac.Conflict(c, "Cannot delete last address", "At least one address must remain")
		} else {
			ac.InternalServerError(c, "Failed to delete address", err.Error())
		}
		return
	}

	ac.Success(c, "Address deleted successfully", nil)
}

// SetDefaultAddress sets an address as default
// @Summary Set address as default
// @Description Set a specific address as the user's default address
// @Tags addresses
// @Produce json
// @Param id path int true "Address ID"
// @Success 200 {object} models.AddressResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses/{id}/set-default [patch]
// @Security BearerAuth
func (ac *AddressController) SetDefaultAddress(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ac.BadRequest(c, "Invalid address ID", "Invalid address ID format")
		return
	}

	address, err := ac.addressService.SetAddressAsDefault(uint(id), userID)
	if err != nil {
		if err.Error() == "address not found" {
			ac.NotFound(c, "Address not found", "Address does not exist")
		} else if err.Error() == "access denied" {
			ac.Forbidden(c, "Access denied", "Address does not belong to user")
		} else {
			ac.InternalServerError(c, "Failed to set default address", err.Error())
		}
		return
	}

	response := models.AddressResponse{
		ID:          address.ID,
		UserID:      address.UserID,
		Name:        address.Name,
		Address:     address.Address,
		PostalCode:  address.PostalCode,
		Latitude:    address.Latitude,
		Longitude:   address.Longitude,
		Landmark:    address.Landmark,
		HouseNumber: address.HouseNumber,
		IsDefault:   address.IsDefault,
		UpdatedAt:   address.UpdatedAt,
		CreatedAt:   address.CreatedAt,
	}

	ac.Success(c, "Default address set successfully", response)
}

// GetDefaultAddress gets the user's default address
// @Summary Get default address
// @Description Get the user's default address
// @Tags addresses
// @Produce json
// @Success 200 {object} models.AddressResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /addresses/default [get]
// @Security BearerAuth
func (ac *AddressController) GetDefaultAddress(c *gin.Context) {
	userID := ac.GetUserID(c)
	if userID == 0 {
		ac.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	address, err := ac.addressService.GetDefaultAddressByUserID(userID)
	if err != nil {
		if err.Error() == "default address not found" {
			ac.NotFound(c, "No default address found", "User has no default address set")
		} else {
			ac.InternalServerError(c, "Failed to get default address", err.Error())
		}
		return
	}

	response := models.AddressResponse{
		ID:          address.ID,
		UserID:      address.UserID,
		Name:        address.Name,
		Address:     address.Address,
		PostalCode:  address.PostalCode,
		Latitude:    address.Latitude,
		Longitude:   address.Longitude,
		Landmark:    address.Landmark,
		HouseNumber: address.HouseNumber,
		IsDefault:   address.IsDefault,
		UpdatedAt:   address.UpdatedAt,
		CreatedAt:   address.CreatedAt,
	}

	ac.Success(c, "Default address retrieved successfully", response)
}
