package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// AdminVendorController handles admin vendor-related operations
type AdminVendorController struct {
	vendorService    *services.VendorService
	validationHelper *utils.ValidationHelper
}

// NewAdminVendorController creates a new admin vendor controller
func NewAdminVendorController() *AdminVendorController {
	return &AdminVendorController{
		vendorService:    services.NewVendorService(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// GetAllVendors gets all vendors with pagination (admin only)
// @Summary Get all vendors (Admin)
// @Description Get all vendor profiles with pagination (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Vendors retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors [get]
func (avc *AdminVendorController) GetAllVendors(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	vendors, total, err := avc.vendorService.GetAllVendors(page, limit)
	if err != nil {
		logrus.Errorf("Failed to get all vendors: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendors", err.Error()))
		return
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := gin.H{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"has_next":    int64(page*limit) < total,
		"has_prev":    page > 1,
	}

	response := gin.H{
		"vendors":    vendors,
		"pagination": pagination,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendors retrieved successfully", response))
}

// GetVendor gets a specific vendor profile (admin only)
// @Summary Get vendor profile (Admin)
// @Description Get a specific vendor profile by ID (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Vendor ID"
// @Success 200 {object} models.Response "Vendor profile retrieved successfully"
// @Failure 400 {object} models.Response "Invalid vendor ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 404 {object} models.Response "Vendor not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/{id} [get]
func (avc *AdminVendorController) GetVendor(c *gin.Context) {
	vendorIDStr := c.Param("id")
	vendorID, err := strconv.ParseUint(vendorIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid vendor ID", "Vendor ID must be a valid number"))
		return
	}

	vendor, err := avc.vendorService.GetVendorByID(uint(vendorID))
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		logrus.Errorf("Failed to get vendor %d: %v", vendorID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor profile", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile retrieved successfully", vendor))
}

// UpdateVendor updates a vendor profile (admin only)
// @Summary Update vendor profile (Admin)
// @Description Update an existing vendor profile (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Vendor ID"
// @Param request body models.UpdateVendorRequest true "Vendor update request"
// @Success 200 {object} models.Response "Vendor profile updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 404 {object} models.Response "Vendor not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/{id} [put]
func (avc *AdminVendorController) UpdateVendor(c *gin.Context) {
	adminID := c.GetUint("user_id")
	vendorIDStr := c.Param("id")
	vendorID, err := strconv.ParseUint(vendorIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid vendor ID", "Vendor ID must be a valid number"))
		return
	}

	var req models.UpdateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Request validation is handled by Gin binding tags

	// For admin, we can update any vendor (no ownership check)
	// Get the vendor first to get the user ID
	vendor, err := avc.vendorService.GetVendorByID(uint(vendorID))
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		logrus.Errorf("Failed to get vendor %d: %v", vendorID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor profile", err.Error()))
		return
	}

	// Update using the vendor's user ID (admin can update any vendor)
	updatedVendor, err := avc.vendorService.UpdateVendor(uint(vendorID), vendor.UserID, &req)
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		logrus.Errorf("Failed to update vendor %d by admin %d: %v", vendorID, adminID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update vendor profile", err.Error()))
		return
	}

	logrus.Infof("Admin %d updated vendor %d", adminID, vendorID)
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile updated successfully", updatedVendor))
}

// DeleteVendor deletes a vendor profile (admin only)
// @Summary Delete vendor profile (Admin)
// @Description Delete an existing vendor profile (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Vendor ID"
// @Success 200 {object} models.Response "Vendor profile deleted successfully"
// @Failure 400 {object} models.Response "Invalid vendor ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 404 {object} models.Response "Vendor not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/{id} [delete]
func (avc *AdminVendorController) DeleteVendor(c *gin.Context) {
	adminID := c.GetUint("user_id")
	vendorIDStr := c.Param("id")
	vendorID, err := strconv.ParseUint(vendorIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid vendor ID", "Vendor ID must be a valid number"))
		return
	}

	// For admin, we can delete any vendor (no ownership check)
	// Get the vendor first to get the user ID
	vendor, err := avc.vendorService.GetVendorByID(uint(vendorID))
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		logrus.Errorf("Failed to get vendor %d: %v", vendorID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor profile", err.Error()))
		return
	}

	// Delete using the vendor's user ID (admin can delete any vendor)
	err = avc.vendorService.DeleteVendor(uint(vendorID), vendor.UserID)
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		logrus.Errorf("Failed to delete vendor %d by admin %d: %v", vendorID, adminID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete vendor profile", err.Error()))
		return
	}

	logrus.Infof("Admin %d deleted vendor %d", adminID, vendorID)
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile deleted successfully", nil))
}

// GetVendorStats gets vendor statistics (admin only)
// @Summary Get vendor statistics (Admin)
// @Description Get vendor statistics and analytics (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Vendor statistics retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/stats [get]
func (avc *AdminVendorController) GetVendorStats(c *gin.Context) {
	stats, err := avc.vendorService.GetVendorStats()
	if err != nil {
		logrus.Errorf("Failed to get vendor stats: %v", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor statistics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor statistics retrieved successfully", stats))
}

// SearchVendors searches vendors by name or description (admin only)
// @Summary Search vendors (Admin)
// @Description Search vendors by name or description (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Search results retrieved successfully"
// @Failure 400 {object} models.Response "Invalid search query"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/search [get]
func (avc *AdminVendorController) SearchVendors(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid search query", "Search query is required"))
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	vendors, total, err := avc.vendorService.SearchVendors(query, page, limit)
	if err != nil {
		logrus.Errorf("Failed to search vendors with query '%s': %v", query, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to search vendors", err.Error()))
		return
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := gin.H{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"has_next":    int64(page*limit) < total,
		"has_prev":    page > 1,
	}

	response := gin.H{
		"vendors":    vendors,
		"pagination": pagination,
		"query":      query,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Search results retrieved successfully", response))
}

// GetVendorsByBusinessType gets vendors by business type (admin only)
// @Summary Get vendors by business type (Admin)
// @Description Get vendors filtered by business type (admin only)
// @Tags Admin Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param type path string true "Business type"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Vendors retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Forbidden"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/vendors/type/{type} [get]
func (avc *AdminVendorController) GetVendorsByBusinessType(c *gin.Context) {
	businessType := c.Param("type")
	if businessType == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid business type", "Business type is required"))
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	vendors, total, err := avc.vendorService.GetVendorsByBusinessType(businessType, page, limit)
	if err != nil {
		logrus.Errorf("Failed to get vendors by business type '%s': %v", businessType, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendors", err.Error()))
		return
	}

	// Calculate pagination info
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := gin.H{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"has_next":    int64(page*limit) < total,
		"has_prev":    page > 1,
	}

	response := gin.H{
		"vendors":       vendors,
		"pagination":    pagination,
		"business_type": businessType,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendors retrieved successfully", response))
}
