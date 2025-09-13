package controllers

import (
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
}

func NewWorkerController() *WorkerController {
	return &WorkerController{
		BaseController: *NewBaseController(),
		workerRepo:     repositories.NewWorkerRepository(),
	}
}

// GetPublicWorkers gets public worker listings with pagination and filters
// @Summary Get public workers
// @Description Get public worker listings with pagination and filters
// @Tags Public Workers
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(12)
// @Param is_active query bool false "Filter by active status" default(true)
// @Param is_available query bool false "Filter by availability"
// @Param worker_type query string false "Filter by worker type (normal, treesindia_worker)"
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
// @Router /public/workers [get]
func (wc *WorkerController) GetPublicWorkers(ctx *gin.Context) {
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
	if workerType := ctx.Query("worker_type"); workerType != "" {
		filters.WorkerType = models.WorkerType(workerType)
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

// GetWorkerByID gets a single worker by ID
// @Summary Get worker by ID
// @Description Get a single worker by their ID
// @Tags Public Workers
// @Produce json
// @Param id path int true "Worker ID"
// @Success 200 {object} views.Response{data=models.Worker}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /public/workers/{id} [get]
func (wc *WorkerController) GetWorkerByID(ctx *gin.Context) {
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

	logrus.Infof("Worker retrieved successfully with ID: %d", id)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Worker retrieved successfully", gin.H{
		"worker": worker,
	}))
}
