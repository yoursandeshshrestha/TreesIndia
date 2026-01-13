package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type WorkerController struct {
	BaseController
	workerRepo *repositories.WorkerRepository
	userRepo   *repositories.UserRepository
}

func NewWorkerController() *WorkerController {
	return &WorkerController{
		BaseController: *NewBaseController(),
		workerRepo:     repositories.NewWorkerRepository(),
		userRepo:       repositories.NewUserRepository(),
	}
}

// GetWorkers gets worker listings with pagination and filters (requires active subscription)
// @Summary Get workers
// @Description Get worker listings with pagination and filters. Users need active subscription (except admin users).
// @Tags Workers
// @Security BearerAuth
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(12)
// @Param is_active query bool false "Filter by active status" default(true)
// @Param is_available query bool false "Filter by availability"
// @Param search query string false "Search by worker name, skills, or address"
// @Param skills query string false "Filter by skills (comma-separated)"
// @Param min_experience query int false "Minimum experience in years"
// @Param max_experience query int false "Maximum experience in years"
// @Param state query string false "Filter by state"
// @Param city query string false "Filter by city"
// @Param sortBy query string false "Sort by field (newest, oldest, highest_experience, lowest_experience, rating, total_bookings, earnings)"
// @Param sortOrder query string false "Sort order (asc, desc)"
// @Success 200 {object} views.Response{data=[]models.Worker}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Subscription required"
// @Router /workers [get]
func (wc *WorkerController) GetWorkers(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get user info for subscription status (no longer blocking request)
	var user models.User
	err := wc.userRepo.FindByID(&user, userID)
	if err != nil {
		logrus.Errorf("User not found with ID: %d, error: %v", userID, err)
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not found", err.Error()))
		return
	}

	// Parse query parameters
	page := 1
	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	limit := 12
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Parse filters
	filters := &repositories.WorkerFilters{}

	// Parse is_active filter
	if isActiveStr := ctx.Query("is_active"); isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filters.IsActive = &isActive
		}
	}

	// Parse is_available filter
	if isAvailableStr := ctx.Query("is_available"); isAvailableStr != "" {
		if isAvailable, err := strconv.ParseBool(isAvailableStr); err == nil {
			filters.IsAvailable = &isAvailable
		}
	}

	// Parse worker_type filter
	// Force worker_type to "normal" for non-admin users to hide treesindia_worker type
	if workerType := ctx.Query("worker_type"); workerType != "" {
		filters.WorkerType = models.WorkerType(workerType)
	} else {
		// Default to "normal" workers only (hide treesindia_worker from regular users)
		filters.WorkerType = "normal"
	}

	// Override: Admin users can see all worker types, non-admin users only see "normal" workers
	if user.UserType != models.UserTypeAdmin {
		filters.WorkerType = "normal"
	}

	// Parse search filter
	if search := ctx.Query("search"); search != "" {
		filters.Search = search
	}

	// Parse skills filter
	if skills := ctx.Query("skills"); skills != "" {
		filters.Skills = skills
	}

	// Parse experience range filters
	if minExpStr := ctx.Query("min_experience"); minExpStr != "" {
		if minExp, err := strconv.Atoi(minExpStr); err == nil && minExp >= 0 {
			filters.MinExperience = &minExp
		}
	}
	if maxExpStr := ctx.Query("max_experience"); maxExpStr != "" {
		if maxExp, err := strconv.Atoi(maxExpStr); err == nil && maxExp >= 0 {
			filters.MaxExperience = &maxExp
		}
	}

	// Parse location filters
	if state := ctx.Query("state"); state != "" {
		filters.State = state
	}
	if city := ctx.Query("city"); city != "" {
		filters.City = city
	}

	// Parse sorting parameters
	if sortBy := ctx.Query("sortBy"); sortBy != "" {
		filters.SortBy = sortBy
	}
	if sortOrder := ctx.Query("sortOrder"); sortOrder != "" {
		filters.SortOrder = sortOrder
	}

	// Get workers
	workers, err := wc.workerRepo.GetAllWorkers(filters)
	if err != nil {
		logrus.Errorf("Failed to get public workers: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get workers", err.Error()))
		return
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit

	var paginatedWorkers []models.Worker
	if start >= len(workers) {
		paginatedWorkers = []models.Worker{}
	} else {
		if end > len(workers) {
			end = len(workers)
		}
		paginatedWorkers = workers[start:end]
	}

	// Create pagination info
	total := len(workers)
	totalPages := (total + limit - 1) / limit
	pagination := map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"total":       total,
		"totalPages":  totalPages,
		"total_pages": totalPages,
		"has_next":    page < totalPages,
		"has_prev":    page > 1,
	}

	response := map[string]interface{}{
		"workers":    paginatedWorkers,
		"pagination": pagination,
		"user_subscription": map[string]interface{}{
			"has_active_subscription": user.HasActiveSubscription,
			"subscription_expiry_date": user.SubscriptionExpiryDate,
		},
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Workers retrieved successfully", response))
}

// GetWorkerStats gets worker statistics
// @Summary Get worker statistics
// @Description Get worker statistics including counts and metrics
// @Tags Public Workers
// @Produce json
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 500 {object} views.Response
// @Router /workers/stats [get]
func (wc *WorkerController) GetWorkerStats(ctx *gin.Context) {
	// Get total workers count
	allWorkers, err := wc.workerRepo.GetAllWorkers(nil)
	if err != nil {
		logrus.Errorf("Failed to get worker stats: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get worker statistics", err.Error()))
		return
	}

	// Calculate statistics
	totalWorkers := len(allWorkers)
	activeWorkers := 0
	availableWorkers := 0
	treesIndiaWorkers := 0
	normalWorkers := 0

	for _, worker := range allWorkers {
		if worker.IsActive {
			activeWorkers++
		}
		if worker.IsAvailable {
			availableWorkers++
		}
		if worker.WorkerType == "treesindia_worker" {
			treesIndiaWorkers++
		} else {
			normalWorkers++
		}
	}

	stats := map[string]interface{}{
		"total_workers":     totalWorkers,
		"active_workers":    activeWorkers,
		"available_workers": availableWorkers,
		"treesindia_workers": treesIndiaWorkers,
		"normal_workers":    normalWorkers,
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Worker statistics retrieved successfully", stats))
}

// GetWorkerByID gets a single worker by ID (requires active subscription)
// @Summary Get worker by ID
// @Description Get a single worker by their ID. Users need active subscription (except admin users).
// @Tags Workers
// @Security BearerAuth
// @Produce json
// @Param id path int true "Worker ID"
// @Success 200 {object} views.Response{data=models.Worker}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Subscription required"
// @Failure 404 {object} views.Response
// @Router /workers/{id} [get]
func (wc *WorkerController) GetWorkerByID(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get user info for subscription status (no longer blocking request)
	var user models.User
	err := wc.userRepo.FindByID(&user, userID)
	if err != nil {
		logrus.Errorf("User not found with ID: %d, error: %v", userID, err)
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not found", err.Error()))
		return
	}

	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		logrus.Errorf("Invalid worker ID: %s", idStr)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid worker ID", err.Error()))
		return
	}

	worker, err := wc.workerRepo.GetByID(uint(id))
	if err != nil {
		logrus.Errorf("Worker not found with ID: %d, error: %v", id, err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Worker not found", err.Error()))
		return
	}

	// Hide treesindia_worker type from non-admin users
	if user.UserType != models.UserTypeAdmin && worker.WorkerType == "treesindia_worker" {
		logrus.Warnf("Non-admin user attempted to access treesindia_worker: user_id=%d, worker_id=%d", userID, id)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Worker not found", "worker not found"))
		return
	}

	logrus.Infof("Worker retrieved successfully with ID: %d", id)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Worker retrieved successfully", gin.H{
		"worker": worker,
		"user_subscription": gin.H{
			"has_active_subscription": user.HasActiveSubscription,
			"subscription_expiry_date": user.SubscriptionExpiryDate,
		},
	}))
}

// UpdateWorkerProfileRequest represents the request body for updating worker profile
type UpdateWorkerProfileRequest struct {
	ContactInfo struct {
		AlternativeNumber string `json:"alternative_number"`
	} `json:"contact_info" binding:"required"`

	Address struct {
		Street   string  `json:"street" binding:"required"`
		City     string  `json:"city" binding:"required"`
		State    string  `json:"state" binding:"required"`
		Pincode  string  `json:"pincode" binding:"required"`
		Landmark string  `json:"landmark"`
		Lat      float64 `json:"lat"`
		Lng      float64 `json:"lng"`
	} `json:"address" binding:"required"`

	Skills             []string `json:"skills" binding:"required,min=1"`
	ExperienceYears    int      `json:"experience_years" binding:"required,min=0"`

	BankingInfo struct {
		AccountNumber     string `json:"account_number" binding:"required"`
		IFSCCode          string `json:"ifsc_code" binding:"required"`
		BankName          string `json:"bank_name" binding:"required"`
		AccountHolderName string `json:"account_holder_name" binding:"required"`
	} `json:"banking_info" binding:"required"`
}

// GetWorkerProfile gets the authenticated worker's profile
// @Summary Get own worker profile
// @Description Get the authenticated worker's profile information
// @Tags Workers
// @Security BearerAuth
// @Produce json
// @Success 200 {object} views.Response{data=models.Worker}
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Not a worker or not approved"
// @Failure 404 {object} views.Response "Worker profile not found"
// @Router /workers/profile [get]
func (wc *WorkerController) GetWorkerProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get worker by user ID
	worker, err := wc.workerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Worker not found for user_id: %d, error: %v", userID, err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Worker profile not found", err.Error()))
		return
	}

	logrus.Infof("Worker profile retrieved successfully for user_id: %d", userID)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Worker profile retrieved successfully", worker))
}

// UpdateWorkerProfile updates the authenticated worker's profile
// @Summary Update worker profile
// @Description Update worker's editable profile fields (contact, address, skills, banking). Documents and worker_type cannot be updated.
// @Tags Workers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body UpdateWorkerProfileRequest true "Update profile request"
// @Success 200 {object} views.Response{data=models.Worker}
// @Failure 400 {object} views.Response "Invalid request"
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Not approved or not a worker"
// @Failure 404 {object} views.Response "Worker profile not found"
// @Router /workers/profile [put]
func (wc *WorkerController) UpdateWorkerProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get worker by user ID
	worker, err := wc.workerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Worker not found for user_id: %d, error: %v", userID, err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Worker profile not found", err.Error()))
		return
	}

	// Check if worker is approved
	if !worker.IsActive {
		logrus.Warnf("Unapproved worker attempted to edit profile: user_id=%d", userID)
		ctx.JSON(http.StatusForbidden, views.CreateErrorResponse(
			"Profile editing not allowed",
			"Your worker application is pending approval or has been rejected",
		))
		return
	}

	// Parse and validate request
	var req UpdateWorkerProfileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request body", err.Error()))
		return
	}

	// Additional validation for phone number (if provided)
	if req.ContactInfo.AlternativeNumber != "" && len(req.ContactInfo.AlternativeNumber) < 10 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid alternative number", "Alternative number must be at least 10 digits"))
		return
	}

	// Validate pincode
	if len(req.Address.Pincode) != 6 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid pincode", "Pincode must be 6 digits"))
		return
	}

	// Validate IFSC code format (basic validation)
	if len(req.BankingInfo.IFSCCode) != 11 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid IFSC code", "IFSC code must be 11 characters"))
		return
	}

	// Validate experience years (reasonable range)
	if req.ExperienceYears < 0 || req.ExperienceYears > 70 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid experience", "Experience years must be between 0 and 70"))
		return
	}

	// Validate skills count
	if len(req.Skills) > 20 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Too many skills", "Maximum 20 skills allowed"))
		return
	}

	// Marshal JSON fields
	contactInfoJSON, err := json.Marshal(req.ContactInfo)
	if err != nil {
		logrus.Errorf("Failed to marshal contact_info: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process contact info", err.Error()))
		return
	}

	addressJSON, err := json.Marshal(req.Address)
	if err != nil {
		logrus.Errorf("Failed to marshal address: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process address", err.Error()))
		return
	}

	skillsJSON, err := json.Marshal(req.Skills)
	if err != nil {
		logrus.Errorf("Failed to marshal skills: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process skills", err.Error()))
		return
	}

	bankingInfoJSON, err := json.Marshal(req.BankingInfo)
	if err != nil {
		logrus.Errorf("Failed to marshal banking_info: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process banking info", err.Error()))
		return
	}

	// Update ONLY editable fields (exclude documents, worker_type, is_active)
	worker.ContactInfo = string(contactInfoJSON)
	worker.Address = string(addressJSON)
	worker.Skills = string(skillsJSON)
	worker.Experience = req.ExperienceYears
	worker.BankingInfo = string(bankingInfoJSON)

	// Save updates
	if err := wc.workerRepo.Update(worker); err != nil {
		logrus.Errorf("Failed to update worker profile: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update profile", err.Error()))
		return
	}

	// Fetch updated worker to return
	updatedWorker, err := wc.workerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Failed to fetch updated worker: %v", err)
		// Still return success since update worked
		ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Profile updated successfully", worker))
		return
	}

	logrus.Infof("Worker profile updated successfully for user_id: %d", userID)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Profile updated successfully", updatedWorker))
}
