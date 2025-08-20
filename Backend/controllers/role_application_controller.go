package controllers

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type RoleApplicationController struct {
	applicationService *services.RoleApplicationService
}

func NewRoleApplicationController() *RoleApplicationController {
	logrus.Info("Initializing RoleApplicationController...")
	
	applicationRepo := repositories.NewRoleApplicationRepository()
	documentRepo := repositories.NewUserDocumentRepository()
	skillRepo := repositories.NewUserSkillRepository()
	userRepo := repositories.NewUserRepository()
	
	logrus.Info("Repositories initialized")
	
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CloudinaryService: %v", err)
		cloudinaryService = nil
	} else {
		logrus.Info("CloudinaryService initialized successfully")
	}
	
	documentService := services.NewUserDocumentService(documentRepo, cloudinaryService)
	skillService := services.NewUserSkillService(skillRepo)
	applicationService := services.NewRoleApplicationService(applicationRepo, documentService, skillService, userRepo)
	
	logrus.Info("Services initialized")
	
	// Ensure role_applications table exists
	db := database.GetDB()
	if err := db.AutoMigrate(&models.RoleApplication{}); err != nil {
		logrus.Errorf("Failed to auto-migrate role_applications table: %v", err)
	} else {
		logrus.Info("Role_applications table auto-migrated successfully")
	}
	
	logrus.Info("RoleApplicationController initialization completed")
	return &RoleApplicationController{
		applicationService: applicationService,
	}
}

// SubmitApplication submits a comprehensive role application for the authenticated user
// @Summary Submit comprehensive role application
// @Description Submit a comprehensive role application for worker or broker role
// @Tags role-applications
// @Accept multipart/form-data
// @Produce json
// @Param account_type formData string true "Account type (worker or broker)"
// @Param email formData string false "Email address"
// @Param gender formData string false "Gender (male, female, other, prefer_not_to_say)"
// @Param aadhaar_card_front formData file true "Aadhaar card front image"
// @Param aadhaar_card_back formData file true "Aadhaar card back image"
// @Param pan_card_front formData file true "PAN card front image"
// @Param pan_card_back formData file true "PAN card back image"
// @Param avatar formData file false "Profile photo"
// @Param skills formData string true "Comma-separated list of skills"
// @Param latitude formData number false "Location latitude"
// @Param longitude formData number false "Location longitude"
// @Param address formData string false "Location address"
// @Param city formData string false "Location city"
// @Param state formData string false "Location state"
// @Param postal_code formData string false "Location postal code"
// @Param source formData string false "Location source (gps, manual)"
// @Success 201 {object} views.Response{data=models.RoleApplicationDetail}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /role-applications [post]
func (c *RoleApplicationController) SubmitApplication(ctx *gin.Context) {
	userIDInterface, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}
	userID := userIDInterface.(uint)

	// Parse form data
	accountType := ctx.PostForm("account_type")
	if accountType == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Account type required", "account_type is required"))
		return
	}

	// Parse optional email and gender
	email := ctx.PostForm("email")
	gender := ctx.PostForm("gender")
	
	// Parse skills
	skillsStr := ctx.PostForm("skills")
	if skillsStr == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Skills required", "At least one skill is required"))
		return
	}
	skills := strings.Split(skillsStr, ",")
	for i, skill := range skills {
		skills[i] = strings.TrimSpace(skill)
	}

	// Parse optional location
	city := ctx.PostForm("city")
	state := ctx.PostForm("state")
	address := ctx.PostForm("address")
	postalCode := ctx.PostForm("postal_code")
	latitudeStr := ctx.PostForm("latitude")
	longitudeStr := ctx.PostForm("longitude")

	var locationReq *models.CreateLocationRequest
	if city != "" && state != "" {
		locationReq = &models.CreateLocationRequest{
			City:       city,
			State:      state,
			Country:    "India", // Default country for now
			Address:    address,
			PostalCode: postalCode,
		}

		// Parse coordinates if provided
		if latitudeStr != "" && longitudeStr != "" {
			if latitude, err := strconv.ParseFloat(latitudeStr, 64); err == nil {
				locationReq.Latitude = latitude
			}
			if longitude, err := strconv.ParseFloat(longitudeStr, 64); err == nil {
				locationReq.Longitude = longitude
			}
		}
	}

	// Upload files to Cloudinary in parallel
	cloudinaryService, _ := services.NewCloudinaryService()
	if cloudinaryService == nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("File upload service unavailable", "Cloudinary service is not configured"))
		return
	}

	// Get all required files
	files := map[string]*multipart.FileHeader{
		"aadhaar_card_front": nil,
		"aadhaar_card_back":  nil,
		"pan_card_front":     nil,
		"pan_card_back":      nil,
	}

	// Validate all required files exist
	for key := range files {
		file, err := ctx.FormFile(key)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse(key+" required", key+" file is required"))
			return
		}
		files[key] = file
	}

	// Handle optional avatar
	avatarFile, err := ctx.FormFile("avatar")
	if err == nil {
		// User provided avatar, add it to files map
		files["avatar"] = avatarFile
	}

	// Upload files in parallel with timeout
	uploadResults := c.uploadFilesParallel(cloudinaryService, files)
	
	// Check for upload errors
	for key, result := range uploadResults {
		if result.Err != nil {
			logrus.Errorf("Failed to upload %s: %v", key, result.Err)
			ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload "+key, "File upload failed"))
			return
		}
	}

	// Create the comprehensive request
	req := &models.CreateRoleApplicationRequest{
		AccountType:      accountType,
		Email:            &email,
		Gender:           gender,
		AadhaarCardFront: uploadResults["aadhaar_card_front"].URL,
		AadhaarCardBack:  uploadResults["aadhaar_card_back"].URL,
		PanCardFront:     uploadResults["pan_card_front"].URL,
		PanCardBack:      uploadResults["pan_card_back"].URL,
		Skills:           skills,
		Location:         locationReq,
	}

	// Add avatar if provided
	if avatarURL, exists := uploadResults["avatar"]; exists {
		req.Avatar = avatarURL.URL
	}

	application, err := c.applicationService.SubmitApplication(userID, req)
	if err != nil {
		logrus.Errorf("Failed to submit application: %v", err)
		// Check if it's a validation error for missing profile information
		if strings.Contains(err.Error(), "Missing required profile information") {
			ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Profile information required", err.Error()))
			return
		}
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to submit application", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Application submitted successfully", application))
}

// SubmitBrokerApplication submits a simplified broker application for the authenticated user
// @Summary Submit broker application
// @Description Submit a simplified broker application with only required fields
// @Tags role-applications
// @Accept json
// @Produce json
// @Param request body models.CreateBrokerApplicationRequest true "Broker application details"
// @Success 201 {object} views.Response{data=models.RoleApplicationDetail}
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

	// Parse JSON request
	var req models.CreateBrokerApplicationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	application, err := c.applicationService.SubmitBrokerApplication(userID, &req)
	if err != nil {
		logrus.Errorf("Failed to submit broker application: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to submit broker application", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Broker application submitted successfully", application))
}

// SubmitWorkerApplication submits a worker application for the authenticated user
// @Summary Submit worker application
// @Description Submit a worker application with documents, skills, and location
// @Tags role-applications
// @Accept multipart/form-data
// @Produce json
// @Param email formData string false "Email address (if not in profile)"
// @Param gender formData string false "Gender (male, female, other, prefer_not_to_say)"
// @Param aadhaar_card_front formData file true "Aadhaar card front image"
// @Param aadhaar_card_back formData file true "Aadhaar card back image"
// @Param pan_card_front formData file true "PAN card front image"
// @Param pan_card_back formData file true "PAN card back image"
// @Param avatar formData file false "Profile photo"
// @Param skills formData string true "Comma-separated list of skills"
// @Param latitude formData number false "Location latitude"
// @Param longitude formData number false "Location longitude"
// @Param address formData string false "Location address"
// @Param city formData string false "Location city"
// @Param state formData string false "Location state"
// @Param postal_code formData string false "Location postal code"
// @Param source formData string false "Location source (gps, manual)"
// @Success 201 {object} views.Response{data=models.RoleApplicationDetail}
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

	// Parse optional email and gender
	email := ctx.PostForm("email")
	gender := ctx.PostForm("gender")
	
	// Parse skills
	skillsStr := ctx.PostForm("skills")
	if skillsStr == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Skills required", "At least one skill is required"))
		return
	}
	skills := strings.Split(skillsStr, ",")
	for i, skill := range skills {
		skills[i] = strings.TrimSpace(skill)
	}

	// Parse optional location
	city := ctx.PostForm("city")
	state := ctx.PostForm("state")
	address := ctx.PostForm("address")
	postalCode := ctx.PostForm("postal_code")
	latitudeStr := ctx.PostForm("latitude")
	longitudeStr := ctx.PostForm("longitude")

	var locationReq *models.CreateLocationRequest
	if city != "" && state != "" {
		locationReq = &models.CreateLocationRequest{
			City:       city,
			State:      state,
			Country:    "India", // Default country for now
			Address:    address,
			PostalCode: postalCode,
		}

		// Parse coordinates if provided
		if latitudeStr != "" && longitudeStr != "" {
			if latitude, err := strconv.ParseFloat(latitudeStr, 64); err == nil {
				locationReq.Latitude = latitude
			}
			if longitude, err := strconv.ParseFloat(longitudeStr, 64); err == nil {
				locationReq.Longitude = longitude
			}
		}
	}

	// Upload files to Cloudinary in parallel
	cloudinaryService, _ := services.NewCloudinaryService()
	if cloudinaryService == nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("File upload service unavailable", "Cloudinary service is not configured"))
		return
	}

	// Get all required files
	files := map[string]*multipart.FileHeader{
		"aadhaar_card_front": nil,
		"aadhaar_card_back":  nil,
		"pan_card_front":     nil,
		"pan_card_back":      nil,
	}

	// Validate all required files exist
	for key := range files {
		file, err := ctx.FormFile(key)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse(key+" required", key+" file is required"))
			return
		}
		files[key] = file
	}

	// Handle optional avatar
	avatarFile, err := ctx.FormFile("avatar")
	if err == nil {
		// User provided avatar, add it to files map
		files["avatar"] = avatarFile
	}

	// Upload files in parallel with timeout
	uploadResults := c.uploadFilesParallel(cloudinaryService, files)
	
	// Check for upload errors
	for key, result := range uploadResults {
		if result.Err != nil {
			logrus.Errorf("Failed to upload %s: %v", key, result.Err)
			ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to upload "+key, "File upload failed"))
			return
		}
	}

	// Create the worker application request
	req := &models.CreateWorkerApplicationRequest{
		Email:            &email,
		Gender:           gender,
		AadhaarCardFront: uploadResults["aadhaar_card_front"].URL,
		AadhaarCardBack:  uploadResults["aadhaar_card_back"].URL,
		PanCardFront:     uploadResults["pan_card_front"].URL,
		PanCardBack:      uploadResults["pan_card_back"].URL,
		Skills:           skills,
		Location:         locationReq,
	}

	// Add avatar if provided
	if avatarURL, exists := uploadResults["avatar"]; exists {
		req.Avatar = avatarURL.URL
	}

	application, err := c.applicationService.SubmitWorkerApplication(userID, req)
	if err != nil {
		logrus.Errorf("Failed to submit worker application: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to submit worker application", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Worker application submitted successfully", application))
}



// uploadFilesParallel uploads multiple files to Cloudinary in parallel with timeout
func (c *RoleApplicationController) uploadFilesParallel(cloudinaryService *services.CloudinaryService, files map[string]*multipart.FileHeader) map[string]*services.FileUploadResult {
	results := make(map[string]*services.FileUploadResult)
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Create a channel for timeout
	done := make(chan bool, 1)
	
	// Load performance configuration
	perfConfig := config.LoadPerformanceConfig()
	
	// Set timeout context from configuration
	ctx, cancel := context.WithTimeout(context.Background(), perfConfig.FileUploadTimeout)
	defer cancel()

	// Start all uploads in parallel
	for key, file := range files {
		wg.Add(1)
		go func(fileKey string, fileHeader *multipart.FileHeader) {
			defer wg.Done()
			
			url, err := cloudinaryService.UploadImage(fileHeader, "documents")
			
			mu.Lock()
			results[fileKey] = &services.FileUploadResult{
				Key: fileKey,
				URL: url,
				Err: err,
			}
			mu.Unlock()
		}(key, file)
	}

	// Wait for all uploads to complete or timeout
	go func() {
		wg.Wait()
		done <- true
	}()

	select {
	case <-done:
		// All uploads completed successfully
		return results
	case <-ctx.Done():
		// Timeout occurred
		logrus.Error("File upload timeout after 30 seconds")
		// Return partial results with timeout error for incomplete uploads
		for key := range files {
			if results[key] == nil {
				results[key] = &services.FileUploadResult{
					Key: key,
					Err: errors.New("upload timeout"),
				}
			}
		}
		return results
	}
}

// GetUserApplication gets the role application for the authenticated user
// @Summary Get user application
// @Description Get the role application for the authenticated user with detailed information
// @Tags role-applications
// @Produce json
// @Success 200 {object} views.Response{data=models.RoleApplicationDetail}
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

	application, err := c.applicationService.GetUserApplicationWithDetails(userID)
	if err != nil {
		logrus.Errorf("Failed to get user application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "No application found for this user"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application retrieved successfully", application))
}

// GetApplication gets a role application by ID (admin only)
// @Summary Get application by ID
// @Description Get a specific role application by ID with detailed information (admin only)
// @Tags role-applications
// @Produce json
// @Param id path int true "Application ID"
// @Success 200 {object} views.Response{data=models.RoleApplicationDetail}
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

	application, err := c.applicationService.GetApplicationWithDetails(uint(id))
	if err != nil {
		logrus.Errorf("Failed to get application: %v", err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Application not found", "Application with the specified ID does not exist"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Application retrieved successfully", application))
}

// UpdateApplication updates a role application (admin only)
// @Summary Update application
// @Description Update a role application status (admin only)
// @Tags role-applications
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param application body models.UpdateRoleApplicationRequest true "Updated application information"
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

	var req models.UpdateRoleApplicationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	application, err := c.applicationService.UpdateApplication(uint(id), adminID, &req)
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
	applications, err := c.applicationService.GetPendingApplications()
	if err != nil {
		logrus.Errorf("Failed to get pending applications: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get applications", "Database error occurred"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Pending applications retrieved successfully", applications))
}

// GetAllApplications gets all applications with detailed information (admin only)
// @Summary Get all applications
// @Description Get all role applications with detailed user, document, skill, and location information (admin only)
// @Tags role-applications
// @Produce json
// @Success 200 {object} views.Response{data=[]models.RoleApplicationDetail}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/role-applications [get]
func (c *RoleApplicationController) GetAllApplications(ctx *gin.Context) {
	applications, err := c.applicationService.GetAllApplicationsWithDetails()
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
// @Param role_type query string false "Role type filter (worker, broker)"
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
	roleType := ctx.Query("role_type")
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
