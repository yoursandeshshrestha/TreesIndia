package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type RoleApplicationController struct {
	applicationService *services.RoleApplicationService
	cloudinaryService  *services.CloudinaryService
}

func NewRoleApplicationController() *RoleApplicationController {
	logrus.Info("Initializing RoleApplicationController...")
	
	applicationRepo := repositories.NewRoleApplicationRepository()
	userRepo := repositories.NewUserRepository()
	
	logrus.Info("Repositories initialized")
	
	applicationService := services.NewRoleApplicationService(applicationRepo, userRepo)
	
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize Cloudinary service: %v", err)
		cloudinaryService = nil
	}
	
	logrus.Info("Services initialized")
	
	// Ensure role_applications table exists
	// DISABLED: Using Goose migrations instead of GORM AutoMigrate
	/*
	db := database.GetDB()
	if err := db.AutoMigrate(&models.RoleApplication{}); err != nil {
		logrus.Errorf("Failed to auto-migrate role_applications table: %v", err)
	} else {
		logrus.Info("Role_applications table auto-migrated successfully")
	}
	*/
	
	logrus.Info("RoleApplicationController initialization completed")
	return &RoleApplicationController{
		applicationService: applicationService,
		cloudinaryService:  cloudinaryService,
	}
}

// SubmitWorkerApplication submits a worker application for the authenticated user
// @Summary Submit worker application
// @Description Submit a worker application with detailed worker information and file uploads
// @Tags role-applications
// @Accept multipart/form-data
// @Produce json
// @Param experience_years formData int true "Years of experience"
// @Param skills formData string true "JSON array of skills"
// @Param contact_info formData string true "JSON object with name, email, phone, alternative_number"
// @Param address formData string true "JSON object with address details"
// @Param banking_info formData string true "JSON object with banking details"
// @Param aadhar_card formData file true "Aadhar card document"
// @Param pan_card formData file true "PAN card document"
// @Param profile_pic formData file true "Profile picture"
// @Param police_verification formData file true "Police verification document"
// @Success 201 {object} views.Response{data=models.RoleApplication}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /role-applications/worker [post]
func (c *RoleApplicationController) SubmitWorkerApplication(ctx *gin.Context) {
	userIDInterface, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	userID := userIDInterface.(uint)

	// Parse form data
	experienceYearsStr := ctx.PostForm("experience_years")
	skillsStr := ctx.PostForm("skills")
	contactInfoStr := ctx.PostForm("contact_info")
	addressStr := ctx.PostForm("address")
	bankingInfoStr := ctx.PostForm("banking_info")

	// Validate required fields
	if experienceYearsStr == "" || skillsStr == "" || contactInfoStr == "" || addressStr == "" || bankingInfoStr == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required fields", "All fields are required"))
		return
	}

	// Parse experience years
	experienceYears, err := strconv.Atoi(experienceYearsStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid experience years", "Experience years must be a number"))
		return
	}

	// Validate JSON fields
	if !json.Valid([]byte(skillsStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid skills format", "Skills must be valid JSON array"))
		return
	}
	if !json.Valid([]byte(contactInfoStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid contact info format", "Contact info must be valid JSON"))
		return
	}
	if !json.Valid([]byte(addressStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid address format", "Address must be valid JSON"))
		return
	}
	if !json.Valid([]byte(bankingInfoStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid banking info format", "Banking info must be valid JSON"))
		return
	}

	// Check if Cloudinary service is available
	if c.cloudinaryService == nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("File upload service unavailable", "File upload service is not configured"))
		return
	}

	// Handle file uploads
	documents := make(map[string]string)
	
	// Upload Aadhar card
	aadharFile, err := ctx.FormFile("aadhar_card")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing aadhar card", "Aadhar card file is required"))
		return
	}
	aadharURL, err := c.cloudinaryService.UploadImage(aadharFile, "role-applications/worker/documents")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload aadhar card", err.Error()))
		return
	}
	documents["aadhar_card"] = aadharURL

	// Upload PAN card
	panFile, err := ctx.FormFile("pan_card")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing pan card", "PAN card file is required"))
		return
	}
	panURL, err := c.cloudinaryService.UploadImage(panFile, "role-applications/worker/documents")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload pan card", err.Error()))
		return
	}
	documents["pan_card"] = panURL

	// Upload profile picture to user avatars folder
	profileFile, err := ctx.FormFile("profile_pic")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing profile picture", "Profile picture file is required"))
		return
	}
	profileURL, err := c.cloudinaryService.UploadImage(profileFile, "users/avatars")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload profile picture", err.Error()))
		return
	}
	documents["profile_pic"] = profileURL

	// Upload police verification
	policeFile, err := ctx.FormFile("police_verification")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing police verification", "Police verification file is required"))
		return
	}
	policeURL, err := c.cloudinaryService.UploadImage(policeFile, "role-applications/worker/documents")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload police verification", err.Error()))
		return
	}
	documents["police_verification"] = policeURL

	// Convert documents to JSON string
	documentsJSON, err := json.Marshal(documents)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process documents", "Error processing document data"))
		return
	}

	// Parse contact info to extract user updates
	var userUpdates *models.User
	var contactInfo map[string]interface{}
	if err := json.Unmarshal([]byte(contactInfoStr), &contactInfo); err == nil {
		userUpdates = &models.User{}
		
		// Extract name if provided
		if name, ok := contactInfo["name"].(string); ok && name != "" {
			userUpdates.Name = name
		}
		
		// Extract email if provided
		if email, ok := contactInfo["email"].(string); ok && email != "" {
			userUpdates.Email = &email
		}
		
		// Set avatar from uploaded profile picture
		userUpdates.Avatar = profileURL
	}

	// Create worker data
	workerData := &models.Worker{
		Experience: experienceYears,
		Skills:     skillsStr,
		ContactInfo: contactInfoStr,
		Address:    addressStr,
		BankingInfo: bankingInfoStr,
		Documents:   string(documentsJSON),
	}

	application, err := c.applicationService.SubmitWorkerApplication(userID, workerData, userUpdates)
	if err != nil {
		logrus.Errorf("Failed to submit worker application: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to submit application", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Worker application submitted successfully", application))
}

// SubmitBrokerApplication submits a broker application for the authenticated user
// @Summary Submit broker application
// @Description Submit a broker application with detailed broker information and file uploads
// @Tags role-applications
// @Accept multipart/form-data
// @Produce json
// @Param license formData string true "Broker license number"
// @Param agency formData string true "Broker agency name"
// @Param contact_info formData string true "JSON object with name, email, phone, alternative_number"
// @Param address formData string true "JSON object with address details"
// @Param aadhar_card formData file true "Aadhar card document"
// @Param pan_card formData file true "PAN card document"
// @Param profile_pic formData file true "Profile picture"
// @Success 201 {object} views.Response{data=models.RoleApplication}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /role-applications/broker [post]
func (c *RoleApplicationController) SubmitBrokerApplication(ctx *gin.Context) {
	userIDInterface, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	userID := userIDInterface.(uint)

	// Parse form data
	license := ctx.PostForm("license")
	agency := ctx.PostForm("agency")
	contactInfoStr := ctx.PostForm("contact_info")
	addressStr := ctx.PostForm("address")

	// Validate required fields
	if license == "" || agency == "" || contactInfoStr == "" || addressStr == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing required fields", "All fields are required"))
		return
	}

	// Validate JSON fields
	if !json.Valid([]byte(contactInfoStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid contact info format", "Contact info must be valid JSON"))
		return
	}
	if !json.Valid([]byte(addressStr)) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid address format", "Address must be valid JSON"))
		return
	}

	// Check if Cloudinary service is available
	if c.cloudinaryService == nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("File upload service unavailable", "File upload service is not configured"))
		return
	}

	// Handle file uploads
	documents := make(map[string]string)
	
	// Upload Aadhar card
	aadharFile, err := ctx.FormFile("aadhar_card")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing aadhar card", "Aadhar card file is required"))
		return
	}
	aadharURL, err := c.cloudinaryService.UploadImage(aadharFile, "role-applications/broker/documents")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload aadhar card", err.Error()))
		return
	}
	documents["aadhar_card"] = aadharURL

	// Upload PAN card
	panFile, err := ctx.FormFile("pan_card")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing pan card", "PAN card file is required"))
		return
	}
	panURL, err := c.cloudinaryService.UploadImage(panFile, "role-applications/broker/documents")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload pan card", err.Error()))
		return
	}
	documents["pan_card"] = panURL

	// Upload profile picture to user avatars folder
	profileFile, err := ctx.FormFile("profile_pic")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing profile picture", "Profile picture file is required"))
		return
	}
	profileURL, err := c.cloudinaryService.UploadImage(profileFile, "users/avatars")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload profile picture", err.Error()))
		return
	}

	// Convert documents to JSON string
	documentsJSON, err := json.Marshal(documents)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process documents", "Error processing document data"))
		return
	}

	// Parse contact info to extract user updates
	var userUpdates *models.User
	var contactInfo map[string]interface{}
	if err := json.Unmarshal([]byte(contactInfoStr), &contactInfo); err == nil {
		userUpdates = &models.User{}
		
		// Extract name if provided
		if name, ok := contactInfo["name"].(string); ok && name != "" {
			userUpdates.Name = name
		}
		
		// Extract email if provided
		if email, ok := contactInfo["email"].(string); ok && email != "" {
			userUpdates.Email = &email
		}
		
		// Set avatar from uploaded profile picture
		userUpdates.Avatar = profileURL
	}

	// Create broker data
	brokerData := &models.Broker{
		License:     license,
		Agency:      agency,
		ContactInfo: contactInfoStr,
		Address:     addressStr,
		Documents:   string(documentsJSON),
	}

	application, err := c.applicationService.SubmitBrokerApplication(userID, brokerData, userUpdates)
	if err != nil {
		logrus.Errorf("Failed to submit broker application: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to submit application", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Broker application submitted successfully", application))
}

// GetUserApplication gets the role application for the authenticated user
// @Summary Get user application
// @Description Get the role application for the authenticated user
// @Tags role-applications
// @Produce json
// @Success 200 {object} views.Response{data=models.RoleApplication}
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /role-applications/me [get]
func (c *RoleApplicationController) GetUserApplication(ctx *gin.Context) {
	userIDInterface, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	userID := userIDInterface.(uint)

	application, err := c.applicationService.GetEnhancedUserApplication(userID)
	if err != nil {
		logrus.Errorf("Failed to get user application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "No application found for this user"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application retrieved successfully", application))
}

// GetApplication gets a role application by ID (admin only)
// @Summary Get application by ID
// @Description Get a specific role application by ID (admin only)
// @Tags role-applications
// @Produce json
// @Param id path int true "Application ID"
// @Success 200 {object} views.Response{data=models.RoleApplication}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/role-applications/{id} [get]
func (c *RoleApplicationController) GetApplication(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid application ID", "Application ID must be a valid number"))
		return
	}

	application, err := c.applicationService.GetEnhancedApplicationByID(uint(id))
	if err != nil {
		logrus.Errorf("Failed to get application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "Application with the specified ID does not exist"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application retrieved successfully", application))
}

// UpdateApplicationRequest represents the request body for updating an application
type UpdateApplicationRequest struct {
	Status     string `json:"status" binding:"required,oneof=approved rejected"`
	AdminNotes string `json:"admin_notes,omitempty"`
}

// UpdateApplication updates a role application (admin only)
// @Summary Update application
// @Description Update a role application status (admin only)
// @Tags role-applications
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param request body UpdateApplicationRequest true "Update application request"
// @Success 200 {object} views.Response{data=models.RoleApplication}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/role-applications/{id} [put]
func (c *RoleApplicationController) UpdateApplication(ctx *gin.Context) {
	adminIDInterface, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	adminID := adminIDInterface.(uint)

	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid application ID", "Application ID must be a valid number"))
		return
	}

	// Parse JSON request body
	var req UpdateApplicationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	if req.Status == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Status required", "status is required"))
		return
	}

	var applicationStatus models.ApplicationStatus
	if req.Status == "approved" {
		applicationStatus = models.ApplicationStatusApproved
	} else if req.Status == "rejected" {
		applicationStatus = models.ApplicationStatusRejected
	} else {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid status", "status must be 'approved' or 'rejected'"))
		return
	}

	application, err := c.applicationService.UpdateApplication(uint(id), adminID, applicationStatus)
	if err != nil {
		logrus.Errorf("Failed to update application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "Application with the specified ID does not exist"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application updated successfully", application))
}

// GetPendingApplications gets all pending applications (admin only)
// @Summary Get pending applications
// @Description Get all pending role applications (admin only)
// @Tags role-applications
// @Produce json
// @Success 200 {object} views.Response{data=[]models.RoleApplication}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/role-applications/pending [get]
func (c *RoleApplicationController) GetPendingApplications(ctx *gin.Context) {
	applications, err := c.applicationService.GetEnhancedPendingApplications()
	if err != nil {
		logrus.Errorf("Failed to get pending applications: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get applications", "Database error occurred"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Pending applications retrieved successfully", applications))
}

// GetAllApplications gets all applications (admin only)
// @Summary Get all applications
// @Description Get all role applications (admin only)
// @Tags role-applications
// @Produce json
// @Success 200 {object} views.Response{data=[]models.RoleApplication}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/role-applications [get]
func (c *RoleApplicationController) GetAllApplications(ctx *gin.Context) {
	applications, err := c.applicationService.GetAllApplications()
	if err != nil {
		logrus.Errorf("Failed to get all applications: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get applications", "Database error occurred"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("All applications retrieved successfully", applications))
}

// GetApplicationsByStatus gets applications by status (admin only)
// @Summary Get applications by status
// @Description Get role applications by status with optional role type filter (admin only)
// @Tags role-applications
// @Produce json
// @Param status query string true "Application status (pending, approved, rejected)"
// @Param requested_role query string false "Role type filter (worker, broker)"
// @Success 200 {object} views.Response{data=[]models.RoleApplication}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/role-applications [get]
func (c *RoleApplicationController) GetApplicationsByStatus(ctx *gin.Context) {
	status := ctx.Query("status")
	if status == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Status required", "Status parameter is required"))
		return
	}

	applicationStatus := models.ApplicationStatus(status)
	if applicationStatus != models.ApplicationStatusPending && 
	   applicationStatus != models.ApplicationStatusApproved && 
	   applicationStatus != models.ApplicationStatusRejected {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid status", "Status must be pending, approved, or rejected"))
		return
	}

	// Get optional role type filter
	roleType := ctx.Query("requested_role")
	if roleType != "" {
		if roleType != "worker" && roleType != "broker" {
			ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid role type", "Role type must be worker or broker"))
			return
		}
	}

	applications, err := c.applicationService.GetApplicationsByStatusAndRole(applicationStatus, roleType)
	if err != nil {
		logrus.Errorf("Failed to get applications by status: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get applications", "Database error occurred"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Applications retrieved successfully", applications))
}

// GetApplicationsWithFilters gets applications with pagination and filters (admin only)
// @Summary Get applications with filters
// @Description Get role applications with pagination and optional filters (admin only)
// @Tags role-applications
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10)"
// @Param search query string false "Search by user name, email, or phone"
// @Param status query string false "Filter by status (pending, approved, rejected)"
// @Param requested_role query string false "Filter by role type (worker, broker)"
// @Param date_from query string false "Filter by submission date from (YYYY-MM-DD)"
// @Param date_to query string false "Filter by submission date to (YYYY-MM-DD)"
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/role-applications [get]
func (c *RoleApplicationController) GetApplicationsWithFilters(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	
	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	
	// Parse filter parameters
	search := ctx.Query("search")
	status := ctx.Query("status")
	roleType := ctx.Query("requested_role")
	dateFrom := ctx.Query("date_from")
	dateTo := ctx.Query("date_to")
	
	// Get applications with filters using enhanced data
	applications, total, err := c.applicationService.GetEnhancedApplicationsWithFilters(page, limit, search, status, roleType, dateFrom, dateTo)
	if err != nil {
		logrus.Errorf("Failed to get applications with filters: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get applications", "Database error occurred"))
		return
	}
	
	// Calculate pagination info
	totalPages := (total + int64(limit) - 1) / int64(limit)
	
	response := map[string]interface{}{
		"applications": applications,
		"pagination": map[string]interface{}{
			"current_page": page,
			"total_pages":  totalPages,
			"total":        total,
			"limit":        limit,
		},
	}
	
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Applications retrieved successfully", response))
}

// DeleteApplication deletes a role application (admin only)
// @Summary Delete application
// @Description Delete a role application (admin only)
// @Tags role-applications
// @Produce json
// @Param id path int true "Application ID"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/role-applications/{id} [delete]
func (c *RoleApplicationController) DeleteApplication(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid application ID", "Application ID must be a valid number"))
		return
	}

	err = c.applicationService.DeleteApplication(uint(id))
	if err != nil {
		logrus.Errorf("Failed to delete application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "Application with the specified ID does not exist"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application deleted successfully", nil))
}
