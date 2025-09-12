package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// VendorController handles vendor-related operations
type VendorController struct {
	vendorService     *services.VendorService
	validationHelper  *utils.ValidationHelper
}

// NewVendorController creates a new vendor controller
func NewVendorController() *VendorController {
	return &VendorController{
		vendorService:    services.NewVendorService(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// CreateVendor creates a new vendor profile
// @Summary Create vendor profile
// @Description Create a new vendor profile for the authenticated user (requires active subscription)
// @Tags Vendors
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param vendor_name formData string true "Vendor name"
// @Param business_description formData string false "Business description"
// @Param contact_person_name formData string true "Contact person name"
// @Param contact_person_phone formData string true "Contact person phone"
// @Param contact_person_email formData string false "Contact person email"
// @Param business_address formData string true "Business address JSON"
// @Param business_type formData string true "Business type"
// @Param years_in_business formData int true "Years in business"
// @Param services_offered formData string true "Services offered JSON array"
// @Param profile_picture formData file false "Profile picture"
// @Param business_gallery formData file false "Business gallery images"
// @Success 201 {object} models.Response "Vendor profile created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /vendors [post]
func (vc *VendorController) CreateVendor(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	// Check content type
	contentType := c.GetHeader("Content-Type")
	var req models.CreateVendorRequest

	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		if err := vc.parseFormDataVendor(c, &req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid form data", err.Error()))
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Content-Type must be application/json or multipart/form-data"))
		return
	}

	// Request validation is handled by Gin binding tags

	vendor, err := vc.vendorService.CreateVendor(userID, &req)
	if err != nil {
		if err.Error() == "active subscription required to create vendor profiles" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", "Active subscription required to create vendor profiles"))
			return
		}
		logrus.Errorf("Failed to create vendor for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create vendor profile", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Vendor profile created successfully", vendor))
}

// GetVendors gets all vendor profiles for the authenticated user
// @Summary Get user's vendor profiles
// @Description Get all vendor profiles created by the authenticated user
// @Tags Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Vendor profiles retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /vendors [get]
func (vc *VendorController) GetVendors(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	vendors, err := vc.vendorService.GetVendorsByUserIDWithSubscriptionCheck(userID)
	if err != nil {
		if err.Error() == "active subscription required to view vendor profiles" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", "Active subscription required to view vendor profiles"))
			return
		}
		logrus.Errorf("Failed to get vendors for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor profiles", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profiles retrieved successfully", vendors))
}

// GetVendor gets a specific vendor profile
// @Summary Get vendor profile
// @Description Get a specific vendor profile by ID
// @Tags Vendors
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Vendor ID"
// @Success 200 {object} models.Response "Vendor profile retrieved successfully"
// @Failure 400 {object} models.Response "Invalid vendor ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 404 {object} models.Response "Vendor not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /vendors/{id} [get]
func (vc *VendorController) GetVendor(c *gin.Context) {
	userID := c.GetUint("user_id")
	vendorIDStr := c.Param("id")
	vendorID, err := strconv.ParseUint(vendorIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid vendor ID", "Vendor ID must be a valid number"))
		return
	}

	vendor, err := vc.vendorService.GetVendorByIDWithSubscriptionCheck(userID, uint(vendorID))
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		if err.Error() == "active subscription required to view vendor profiles" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", "Active subscription required to view vendor profiles"))
			return
		}
		logrus.Errorf("Failed to get vendor %d: %v", vendorID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor profile", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile retrieved successfully", vendor))
}

// UpdateVendor updates a vendor profile
// @Summary Update vendor profile
// @Description Update an existing vendor profile
// @Tags Vendors
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
// @Router /vendors/{id} [put]
func (vc *VendorController) UpdateVendor(c *gin.Context) {
	userID := c.GetUint("user_id")
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

	vendor, err := vc.vendorService.UpdateVendor(uint(vendorID), userID, &req)
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		if err.Error() == "unauthorized: you can only update your own vendor profiles" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Forbidden", "You can only update your own vendor profiles"))
			return
		}
		logrus.Errorf("Failed to update vendor %d for user %d: %v", vendorID, userID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update vendor profile", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile updated successfully", vendor))
}

// DeleteVendor deletes a vendor profile
// @Summary Delete vendor profile
// @Description Delete an existing vendor profile
// @Tags Vendors
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
// @Router /vendors/{id} [delete]
func (vc *VendorController) DeleteVendor(c *gin.Context) {
	userID := c.GetUint("user_id")
	vendorIDStr := c.Param("id")
	vendorID, err := strconv.ParseUint(vendorIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid vendor ID", "Vendor ID must be a valid number"))
		return
	}

	err = vc.vendorService.DeleteVendor(uint(vendorID), userID)
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Vendor not found", "The requested vendor profile does not exist"))
			return
		}
		if err.Error() == "unauthorized: you can only delete your own vendor profiles" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Forbidden", "You can only delete your own vendor profiles"))
			return
		}
		logrus.Errorf("Failed to delete vendor %d for user %d: %v", vendorID, userID, err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete vendor profile", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor profile deleted successfully", nil))
}

// GetPublicVendors gets all active vendors (public endpoint)
// @Summary Get public vendors
// @Description Get all active vendor profiles (public endpoint)
// @Tags Vendors
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Vendors retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /public/vendors [get]
func (vc *VendorController) GetPublicVendors(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	vendors, total, err := vc.vendorService.GetActiveVendors(page, limit)
	if err != nil {
		logrus.Errorf("Failed to get public vendors: %v", err)
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

// SearchVendors searches vendors by name or description
// @Summary Search vendors
// @Description Search vendors by name or description
// @Tags Vendors
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Search results retrieved successfully"
// @Failure 400 {object} models.Response "Invalid search query"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /public/vendors/search [get]
func (vc *VendorController) SearchVendors(c *gin.Context) {
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

	vendors, total, err := vc.vendorService.SearchVendors(query, page, limit)
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

// GetVendorsByBusinessType gets vendors by business type
// @Summary Get vendors by business type
// @Description Get vendors filtered by business type
// @Tags Vendors
// @Accept json
// @Produce json
// @Param type path string true "Business type"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.Response "Vendors retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /public/vendors/type/{type} [get]
func (vc *VendorController) GetVendorsByBusinessType(c *gin.Context) {
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

	vendors, total, err := vc.vendorService.GetVendorsByBusinessType(businessType, page, limit)
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
		"vendors":      vendors,
		"pagination":   pagination,
		"business_type": businessType,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendors retrieved successfully", response))
}

// GetVendorStats godoc
// @Summary Get vendor statistics
// @Description Get vendor statistics. Statistics are publicly available to all authenticated users.
// @Tags Vendors
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response{data=map[string]interface{}} "Vendor statistics retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /vendors/stats [get]
func (vc *VendorController) GetVendorStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	stats, err := vc.vendorService.GetVendorStatsForUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get vendor statistics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Vendor statistics retrieved successfully", stats))
}

// parseFormDataVendor parses form-data request and populates the vendor request struct
func (vc *VendorController) parseFormDataVendor(c *gin.Context, req *models.CreateVendorRequest) error {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		return err
	}
	
	form := c.Request.MultipartForm
	
	// Parse basic fields
	req.VendorName = c.PostForm("vendor_name")
	req.BusinessDescription = c.PostForm("business_description")
	req.ContactPersonName = c.PostForm("contact_person_name")
	req.ContactPersonPhone = c.PostForm("contact_person_phone")
	req.ContactPersonEmail = c.PostForm("contact_person_email")
	req.BusinessType = c.PostForm("business_type")
	
	// Validate business type
	validBusinessTypes := []string{"individual", "partnership", "company", "llp", "pvt_ltd", "public_ltd", "other"}
	isValidBusinessType := false
	for _, validType := range validBusinessTypes {
		if req.BusinessType == validType {
			isValidBusinessType = true
			break
		}
	}
	if !isValidBusinessType {
		return fmt.Errorf("invalid business type: %s. Must be one of: individual, partnership, company, llp, pvt_ltd, public_ltd, other", req.BusinessType)
	}
	
	// Parse numeric fields
	if yearsInBusinessStr := c.PostForm("years_in_business"); yearsInBusinessStr != "" {
		if yearsInBusiness, err := strconv.Atoi(yearsInBusinessStr); err == nil {
			req.YearsInBusiness = yearsInBusiness
		}
	}
	
	// Parse business_address JSON
	if businessAddressStr := c.PostForm("business_address"); businessAddressStr != "" {
		var businessAddress models.JSONB
		if err := json.Unmarshal([]byte(businessAddressStr), &businessAddress); err == nil {
			req.BusinessAddress = businessAddress
		}
	}
	
	// Parse services_offered JSON array
	if servicesOfferedStr := c.PostForm("services_offered"); servicesOfferedStr != "" {
		var servicesOffered []string
		if err := json.Unmarshal([]byte(servicesOfferedStr), &servicesOffered); err == nil {
			req.ServicesOffered = servicesOffered
		}
	}
	
	// Handle profile picture upload
	if form.File != nil && len(form.File["profile_picture"]) > 0 {
		profileFile := form.File["profile_picture"][0]
		
		// Validate file size (2MB limit)
		if profileFile.Size > 2*1024*1024 {
			return fmt.Errorf("profile picture file size must be less than 2MB")
		}
		
		// Validate file type
		contentType := profileFile.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			return fmt.Errorf("profile picture must be an image file")
		}
		
		// Upload to Cloudinary
		cloudinaryService := vc.vendorService.GetCloudinaryService()
		if cloudinaryService != nil {
			profileURL, err := cloudinaryService.UploadImage(profileFile, "vendors/profiles")
			if err != nil {
				return fmt.Errorf("failed to upload profile picture: %v", err)
			}
			req.ProfilePicture = profileURL
		}
	}
	
	// Handle business gallery uploads (max 7 images)
	if form.File != nil && len(form.File["business_gallery"]) > 0 {
		galleryFiles := form.File["business_gallery"]
		
		// Validate number of files (max 7)
		if len(galleryFiles) > 7 {
			return fmt.Errorf("maximum 7 gallery images allowed")
		}
		
		var galleryURLs []string
		cloudinaryService := vc.vendorService.GetCloudinaryService()
		
		if cloudinaryService != nil {
			for _, file := range galleryFiles {
				// Validate file size (2MB limit)
				if file.Size > 2*1024*1024 {
					return fmt.Errorf("gallery image file size must be less than 2MB")
				}
				
				// Validate file type
				contentType := file.Header.Get("Content-Type")
				if !strings.HasPrefix(contentType, "image/") {
					return fmt.Errorf("gallery images must be image files")
				}
				
				// Upload to Cloudinary
				galleryURL, err := cloudinaryService.UploadImage(file, "vendors/gallery")
				if err != nil {
					return fmt.Errorf("failed to upload gallery image: %v", err)
				}
				galleryURLs = append(galleryURLs, galleryURL)
			}
		}
		
		req.BusinessGallery = galleryURLs
	}
	
	return nil
}
