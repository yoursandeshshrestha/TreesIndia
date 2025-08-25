package controllers

import (
	"errors"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"treesindia/database"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"
)

type SubcategoryController struct {
	*BaseController
	subcategoryService *services.SubcategoryService
	validationHelper   *utils.ValidationHelper
}

func NewSubcategoryController() *SubcategoryController {
	subcategoryService, err := services.NewSubcategoryService()
	if err != nil {
		logrus.Errorf("Failed to initialize SubcategoryService: %v", err)
		logrus.Error("This is likely due to missing Cloudinary configuration")
		logrus.Error("Please ensure CLOUDINARY_URL is set in your environment variables")
		panic(err) // This should be handled properly in production
	}
	
	return &SubcategoryController{
		BaseController:     NewBaseController(),
		subcategoryService: subcategoryService,
		validationHelper:   utils.NewValidationHelper(),
	}
}

// CreateSubcategoryRequest represents the request body for creating a subcategory
type CreateSubcategoryRequest struct {
	Name        string      `json:"name" form:"name" binding:"required,min=2,max=100"`
	Description string      `json:"description" form:"description" binding:"max=500"`
	Image       string      `json:"image" form:"image" binding:"max=255"`
	ParentID    interface{} `json:"parent_id" form:"parent_id" binding:"required"` // Required for subcategories
	IsActive    interface{} `json:"is_active" form:"is_active"` // Can be boolean or string
}

// GetSubcategories returns all subcategories with optional filtering
func (sc *SubcategoryController) GetSubcategories(c *gin.Context) {
	db := database.GetDB()

	// Get query parameters
	parentID := c.Query("parent_id")
	categoryName := c.Query("category_name")
	isActive := c.Query("is_active")
	excludeInactive := c.Query("exclude_inactive") == "true"

	// Build query
	query := db.Model(&models.Subcategory{})

	// Filter by parent_id
	if parentID != "" {
		query = query.Where("parent_id = ?", parentID)
	}

	// Filter by category name
	if categoryName != "" {
		query = query.Joins("JOIN categories ON subcategories.parent_id = categories.id").
			Where("categories.name ILIKE ?", "%"+categoryName+"%")
	}

	// Filter by active status
	if isActive != "" {
		active := isActive == "true"
		query = query.Where("is_active = ?", active)
	} else if excludeInactive {
		// If exclude_inactive is true, only show active subcategories
		query = query.Where("is_active = ?", true)
	}

	// Get subcategories with parent information
	var subcategories []models.Subcategory
	if err := query.Preload("Parent").Order("name ASC").Find(&subcategories).Error; err != nil {
		logrus.Error("Failed to fetch subcategories:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch subcategories", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategories retrieved successfully", subcategories))
}

// GetSubcategoryByID returns a specific subcategory by ID
func (sc *SubcategoryController) GetSubcategoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid subcategory ID", err.Error()))
		return
	}

	db := database.GetDB()

	var subcategory models.Subcategory
	if err := db.Preload("Parent").First(&subcategory, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Subcategory not found", "Subcategory with the specified ID does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategory retrieved successfully", subcategory))
}

// CreateSubcategory creates a new subcategory
func (sc *SubcategoryController) CreateSubcategory(c *gin.Context) {
	// Check content type
	contentType := c.GetHeader("Content-Type")
	var req CreateSubcategoryRequest

	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			logrus.Error("JSON parsing error:", err)
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid JSON data", err.Error()))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request manually to avoid interface{} binding issues
		
		// Try to get the image file first
		var file *multipart.FileHeader
		var form *multipart.Form
		var err error
		
		// Try MultipartForm first
		form, err = c.MultipartForm()
		if err == nil {
			// Try to get the image file from form
			if files, exists := form.File["image_file"]; exists && len(files) > 0 {
				file = files[0]
			} else if files, exists := form.File["image"]; exists && len(files) > 0 {
				file = files[0]
			} else {
				// Try alternative field names
				alternativeNames := []string{"file", "photo", "picture"}
				for _, name := range alternativeNames {
					if files, exists := form.File[name]; exists && len(files) > 0 {
						file = files[0]
						break
					}
				}
			}
		}
		
		// If MultipartForm failed or no file found, try FormFile directly
		if file == nil {
			formFile, formErr := c.FormFile("image")
			if formErr != nil {
				// Try alternative field names with FormFile
				alternativeNames := []string{"image_file", "file", "photo", "picture"}
				for _, name := range alternativeNames {
					formFile, formErr = c.FormFile(name)
					if formErr == nil {
						file = formFile
						break
					}
				}
			} else {
				file = formFile
			}
		}
		
		// If still no file found, return error
		if file == nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing image", "Image file is required. Please ensure the file is properly attached with field name 'image'"))
			return
		}
		
		// Validate file size (max 10MB)
		if file.Size > 10*1024*1024 {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "Image file size must be less than 10MB"))
			return
		}
		
		// Validate file type
		fileContentType := file.Header.Get("Content-Type")
		if !strings.HasPrefix(fileContentType, "image/") {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only image files are allowed"))
			return
		}
		
		// Extract form fields - handle both MultipartForm and direct form access
		var nameVal, descriptionVal, parentIDVal, isActiveVal string
		
		if form != nil {
			// Use MultipartForm data
			name := form.Value["name"]
			description := form.Value["description"]
			parentIDStr := form.Value["parent_id"]
			isActiveStr := form.Value["is_active"]
			
			// Extract first values from slices
			if len(name) > 0 {
				nameVal = name[0]
			}
			if len(description) > 0 {
				descriptionVal = description[0]
			}
			if len(parentIDStr) > 0 {
				parentIDVal = parentIDStr[0]
			}
			if len(isActiveStr) > 0 {
				isActiveVal = isActiveStr[0]
			}
		} else {
			// Fallback to direct form access
			nameVal = c.PostForm("name")
			descriptionVal = c.PostForm("description")
			parentIDVal = c.PostForm("parent_id")
			isActiveVal = c.PostForm("is_active")
		}
		
		// Set default value for is_active if not provided
		if isActiveVal == "" {
			isActiveVal = "true"
		}
		
		// Debug: Log all form fields
		logrus.Info("Form fields received:")
		logrus.Info("name:", nameVal)
		logrus.Info("description:", descriptionVal)
		logrus.Info("parent_id:", parentIDVal)
		logrus.Info("is_active:", isActiveVal)
		logrus.Info("file found:", file.Filename, "size:", file.Size)
		
		// Validate required fields
		if nameVal == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required field", "Name is required"))
			return
		}
		
		if parentIDVal == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required field", "Parent ID is required for subcategories"))
			return
		}
		
		// Check if Cloudinary service is available
		cloudinaryService := sc.subcategoryService.GetCloudinaryService()
		if cloudinaryService == nil {
			logrus.Error("Cloudinary service is not available")
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Cloudinary service unavailable", "Image upload service is not configured. Please contact administrator."))
			return
		}
		
		// Upload image to Cloudinary using the service's CloudinaryService
		imageURL, err := cloudinaryService.UploadImage(file, "subcategories")
		if err != nil {
			logrus.Error("Failed to upload image to Cloudinary:", err)
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload image", "Failed to upload image to cloud storage. Please try again."))
			return
		}
		
		logrus.Info("Image uploaded successfully to Cloudinary:", imageURL)
		
		// Set the request struct manually
		req = CreateSubcategoryRequest{
			Name:        nameVal,
			Description: descriptionVal,
			Image:       imageURL,
			ParentID:    parentIDVal,
			IsActive:    isActiveVal,
		}
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Use the service layer to create the subcategory
	// Convert the controller request to service request
	serviceReq := &services.CreateSubcategoryRequest{
		Name:        req.Name,
		Description: req.Description,
		Image:       req.Image,
		ParentID:    req.ParentID,
		IsActive:    req.IsActive,
	}

	// Create subcategory using service (this will handle image upload if needed)
	subcategory, err := sc.subcategoryService.CreateSubcategory(serviceReq, nil) // No file since we already uploaded
	if err != nil {
		logrus.Error("Failed to create subcategory:", err)
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create subcategory", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Subcategory created successfully", subcategory))
}

// UpdateSubcategory updates a subcategory
func (sc *SubcategoryController) UpdateSubcategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid subcategory ID", err.Error()))
		return
	}

	var req CreateSubcategoryRequest
	var imageFile *multipart.FileHeader
	
	// Check content type to handle both JSON and form-data
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request with file upload support
		
		// Try to get the image file first
		var form *multipart.Form
		var formErr error
		
		// Try MultipartForm first
		form, formErr = c.MultipartForm()
		if formErr == nil {
			// Try to get the image file from form
			if files, exists := form.File["image_file"]; exists && len(files) > 0 {
				imageFile = files[0]
			} else if files, exists := form.File["image"]; exists && len(files) > 0 {
				imageFile = files[0]
			} else {
				// Try alternative field names
				alternativeNames := []string{"file", "photo", "picture"}
				for _, name := range alternativeNames {
					if files, exists := form.File[name]; exists && len(files) > 0 {
						imageFile = files[0]
						break
					}
				}
			}
		}
		
		// If MultipartForm failed or no file found, try FormFile directly
		if imageFile == nil {
			formFile, formErr := c.FormFile("image")
			if formErr != nil {
				// Try alternative field names with FormFile
				alternativeNames := []string{"image_file", "file", "photo", "picture"}
				for _, name := range alternativeNames {
					formFile, formErr = c.FormFile(name)
					if formErr == nil {
						imageFile = formFile
						break
					}
				}
			} else {
				imageFile = formFile
			}
		}
		
		// Extract form fields - handle both MultipartForm and direct form access
		var nameVal, descriptionVal, parentIDVal, isActiveVal string
		
		if form != nil {
			// Use MultipartForm data
			name := form.Value["name"]
			description := form.Value["description"]
			parentIDStr := form.Value["parent_id"]
			isActiveStr := form.Value["is_active"]
			
			// Extract first values from slices
			if len(name) > 0 {
				nameVal = name[0]
			}
			if len(description) > 0 {
				descriptionVal = description[0]
			}
			if len(parentIDStr) > 0 {
				parentIDVal = parentIDStr[0]
			}
			if len(isActiveStr) > 0 {
				isActiveVal = isActiveStr[0]
			}
		} else {
			// Fallback to direct form access
			nameVal = c.PostForm("name")
			descriptionVal = c.PostForm("description")
			parentIDVal = c.PostForm("parent_id")
			isActiveVal = c.PostForm("is_active")
		}
		
		// Set default value for is_active if not provided
		if isActiveVal == "" {
			isActiveVal = "true"
		}
		
		// Debug: Log all form fields
		logrus.Info("Update form fields received:")
		logrus.Info("name:", nameVal)
		logrus.Info("description:", descriptionVal)
		logrus.Info("parent_id:", parentIDVal)
		logrus.Info("is_active:", isActiveVal)
		if imageFile != nil {
			logrus.Info("image file found:", imageFile.Filename, "size:", imageFile.Size)
		} else {
			logrus.Info("no image file provided")
		}
		
		// Validate required fields
		if nameVal == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required field", "Name is required"))
			return
		}
		
		if parentIDVal == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required field", "Parent ID is required for subcategories"))
			return
		}
		
		// Handle image upload if file is provided
		var imageURL string
		if imageFile != nil {
			// Validate file size (max 10MB)
			if imageFile.Size > 10*1024*1024 {
				c.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "Image file size must be less than 10MB"))
				return
			}
			
			// Validate file type
			fileContentType := imageFile.Header.Get("Content-Type")
			if !strings.HasPrefix(fileContentType, "image/") {
				c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Only image files are allowed"))
				return
			}
			
			// Check if Cloudinary service is available
			cloudinaryService := sc.subcategoryService.GetCloudinaryService()
			if cloudinaryService == nil {
				logrus.Error("Cloudinary service is not available")
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Cloudinary service unavailable", "Image upload service is not configured. Please contact administrator."))
				return
			}
			
			// Upload image to Cloudinary
			uploadedURL, err := cloudinaryService.UploadImage(imageFile, "subcategories")
			if err != nil {
				logrus.Error("Failed to upload image to Cloudinary:", err)
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload image", "Failed to upload image to cloud storage. Please try again."))
				return
			}
			
			logrus.Info("Image uploaded successfully to Cloudinary:", uploadedURL)
			imageURL = uploadedURL
		}
		
		req.Name = nameVal
		req.Description = descriptionVal
		req.Image = imageURL
		req.ParentID = parentIDVal
		req.IsActive = isActiveVal
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Convert to service request type
	serviceReq := &services.CreateSubcategoryRequest{
		Name:        req.Name,
		Description: req.Description,
		Image:       req.Image,
		ParentID:    req.ParentID,
		IsActive:    req.IsActive,
	}

	subcategory, err := sc.subcategoryService.UpdateSubcategory(uint(id), serviceReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update subcategory", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategory updated successfully", subcategory))
}

// DeleteSubcategory deletes a subcategory
func (sc *SubcategoryController) DeleteSubcategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid subcategory ID", err.Error()))
		return
	}

	if err := sc.subcategoryService.DeleteSubcategory(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to delete subcategory", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategory deleted successfully", nil))
}

// GetSubcategoriesByCategory gets all subcategories for a specific category
func (sc *SubcategoryController) GetSubcategoriesByCategory(c *gin.Context) {
	categoryIDStr := c.Param("categoryId")
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid category ID", err.Error()))
		return
	}

	// Get query parameters
	excludeInactive := c.Query("exclude_inactive") == "true"

	subcategories, err := sc.subcategoryService.GetSubcategoriesByCategory(uint(categoryID), excludeInactive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch subcategories", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategories retrieved successfully", subcategories))
}

// ToggleStatus toggles the active status of a subcategory
func (sc *SubcategoryController) ToggleStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid subcategory ID", err.Error()))
		return
	}

	// Toggle status using service
	subcategory, err := sc.subcategoryService.ToggleStatus(uint(id))
	if err != nil {
		logrus.Error("Failed to toggle subcategory status:", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to toggle subcategory status", err.Error()))
		return
	}

	statusText := "enabled"
	if !subcategory.IsActive {
		statusText = "disabled"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subcategory "+statusText+" successfully", subcategory))
}
