package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type WorkerInquiryController struct {
	inquiryService *services.WorkerInquiryService
}

func NewWorkerInquiryController() *WorkerInquiryController {
	return &WorkerInquiryController{
		inquiryService: services.NewWorkerInquiryService(),
	}
}

// CreateInquiry creates a new inquiry from user to worker
// @Summary Create inquiry to worker
// @Description Create a new inquiry from user to worker with project details
// @Tags Worker Inquiries
// @Accept json
// @Produce json
// @Param worker_id path int true "Worker ID"
// @Param inquiry body models.CreateInquiryRequest true "Inquiry details"
// @Success 201 {object} views.Response{data=models.WorkerInquiry}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /workers/{worker_id}/inquiry [post]
func (wic *WorkerInquiryController) CreateInquiry(ctx *gin.Context) {
	// Get user ID from context
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Get worker ID from path
	workerIDStr := ctx.Param("worker_id")
	workerID, err := strconv.ParseUint(workerIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid worker ID", "Worker ID must be a valid number"))
		return
	}

	// Parse request body
	var req models.CreateInquiryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	// Create inquiry
	inquiry, err := wic.inquiryService.CreateInquiry(uint(userID.(float64)), uint(workerID), &req)
	if err != nil {
		logrus.Errorf("Failed to create inquiry: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to create inquiry", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Inquiry created successfully", inquiry))
}

// GetUserInquiries gets inquiries sent by the authenticated user
// @Summary Get user inquiries
// @Description Get all inquiries sent by the authenticated user
// @Tags Worker Inquiries
// @Produce json
// @Param status query string false "Filter by status (pending, approved, rejected, completed)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} views.Response{data=[]models.WorkerInquiry}
// @Failure 401 {object} views.Response
// @Router /workers/inquiries [get]
func (wic *WorkerInquiryController) GetUserInquiries(ctx *gin.Context) {
	// Get user ID from context
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse query parameters
	page := 1
	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	limit := 10
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	filters := &repositories.WorkerInquiryFilters{
		Status: ctx.Query("status"),
		Page:   page,
		Limit:  limit,
	}

	// Get inquiries
	inquiries, pagination, err := wic.inquiryService.GetUserInquiries(uint(userID.(float64)), filters)
	if err != nil {
		logrus.Errorf("Failed to get user inquiries: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get inquiries", err.Error()))
		return
	}

	response := map[string]interface{}{
		"inquiries":  inquiries,
		"pagination": pagination,
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Inquiries retrieved successfully", response))
}

// GetWorkerInquiries gets inquiries received by the authenticated worker
// @Summary Get worker inquiries
// @Description Get all inquiries received by the authenticated worker
// @Tags Worker Inquiries
// @Produce json
// @Param status query string false "Filter by status (pending, approved, rejected, completed)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} views.Response{data=[]models.WorkerInquiry}
// @Failure 401 {object} views.Response
// @Router /workers/received-inquiries [get]
func (wic *WorkerInquiryController) GetWorkerInquiries(ctx *gin.Context) {
	// Get user ID from context
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Parse query parameters
	page := 1
	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	limit := 10
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	filters := &repositories.WorkerInquiryFilters{
		Status: ctx.Query("status"),
		Page:   page,
		Limit:  limit,
	}

	// Get inquiries
	inquiries, pagination, err := wic.inquiryService.GetWorkerInquiries(uint(userID.(float64)), filters)
	if err != nil {
		logrus.Errorf("Failed to get worker inquiries: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get inquiries", err.Error()))
		return
	}

	response := map[string]interface{}{
		"inquiries":  inquiries,
		"pagination": pagination,
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Inquiries retrieved successfully", response))
}

// UpdateWorkerResponse updates worker response to inquiry
// @Summary Update worker response
// @Description Update worker response to an approved inquiry
// @Tags Worker Inquiries
// @Accept json
// @Produce json
// @Param inquiry_id path int true "Inquiry ID"
// @Param response body map[string]string true "Worker response"
// @Success 200 {object} views.Response{data=models.WorkerInquiry}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /workers/received-inquiries/{inquiry_id}/response [put]
func (wic *WorkerInquiryController) UpdateWorkerResponse(ctx *gin.Context) {
	// Get user ID from context
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Get inquiry ID from path
	inquiryIDStr := ctx.Param("inquiry_id")
	inquiryID, err := strconv.ParseUint(inquiryIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid inquiry ID", "Inquiry ID must be a valid number"))
		return
	}

	// Parse request body
	var req map[string]string
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	response, exists := req["response"]
	if !exists {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing response", "Response field is required"))
		return
	}

	// Update worker response
	inquiry, err := wic.inquiryService.UpdateWorkerResponse(uint(inquiryID), uint(userID.(float64)), response)
	if err != nil {
		logrus.Errorf("Failed to update worker response: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to update response", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Response updated successfully", inquiry))
}

// GetAllInquiries gets all inquiries with admin filters
// @Summary Get all inquiries (admin)
// @Description Get all inquiries with admin filters
// @Tags Admin Inquiries
// @Produce json
// @Param status query string false "Filter by status (pending, approved, rejected, completed)"
// @Param worker_id query int false "Filter by worker ID"
// @Param user_id query int false "Filter by user ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} views.Response{data=[]models.WorkerInquiry}
// @Failure 401 {object} views.Response
// @Router /admin/inquiries [get]
func (wic *WorkerInquiryController) GetAllInquiries(ctx *gin.Context) {
	// Parse query parameters
	page := 1
	if pageStr := ctx.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	limit := 10
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	workerID := uint(0)
	if workerIDStr := ctx.Query("worker_id"); workerIDStr != "" {
		if w, err := strconv.ParseUint(workerIDStr, 10, 32); err == nil {
			workerID = uint(w)
		}
	}
	
	userID := uint(0)
	if userIDStr := ctx.Query("user_id"); userIDStr != "" {
		if u, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
			userID = uint(u)
		}
	}
	
	filters := &repositories.AdminInquiryFilters{
		Status:   ctx.Query("status"),
		WorkerID: workerID,
		UserID:   userID,
		Page:     page,
		Limit:    limit,
	}

	// Get inquiries
	inquiries, pagination, err := wic.inquiryService.GetAllInquiries(filters)
	if err != nil {
		logrus.Errorf("Failed to get all inquiries: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get inquiries", err.Error()))
		return
	}

	response := map[string]interface{}{
		"inquiries":  inquiries,
		"pagination": pagination,
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Inquiries retrieved successfully", response))
}

// ApproveInquiry approves an inquiry (admin only)
// @Summary Approve inquiry (admin)
// @Description Approve an inquiry by admin
// @Tags Admin Inquiries
// @Accept json
// @Produce json
// @Param inquiry_id path int true "Inquiry ID"
// @Param notes body map[string]string true "Admin notes"
// @Success 200 {object} views.Response{data=models.WorkerInquiry}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/inquiries/{inquiry_id}/approve [put]
func (wic *WorkerInquiryController) ApproveInquiry(ctx *gin.Context) {
	// Get admin ID from context
	adminID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Admin not authenticated"))
		return
	}

	// Get inquiry ID from path
	inquiryIDStr := ctx.Param("inquiry_id")
	inquiryID, err := strconv.ParseUint(inquiryIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid inquiry ID", "Inquiry ID must be a valid number"))
		return
	}

	// Parse request body
	var req map[string]string
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	notes := ""
	if notesVal, exists := req["notes"]; exists {
		notes = notesVal
	}

	// Approve inquiry
	inquiry, err := wic.inquiryService.ApproveInquiry(uint(inquiryID), uint(adminID.(float64)), notes)
	if err != nil {
		logrus.Errorf("Failed to approve inquiry: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to approve inquiry", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Inquiry approved successfully", inquiry))
}

// RejectInquiry rejects an inquiry (admin only)
// @Summary Reject inquiry (admin)
// @Description Reject an inquiry by admin
// @Tags Admin Inquiries
// @Accept json
// @Produce json
// @Param inquiry_id path int true "Inquiry ID"
// @Param notes body map[string]string true "Admin notes"
// @Success 200 {object} views.Response{data=models.WorkerInquiry}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/inquiries/{inquiry_id}/reject [put]
func (wic *WorkerInquiryController) RejectInquiry(ctx *gin.Context) {
	// Get admin ID from context
	adminID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Admin not authenticated"))
		return
	}

	// Get inquiry ID from path
	inquiryIDStr := ctx.Param("inquiry_id")
	inquiryID, err := strconv.ParseUint(inquiryIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid inquiry ID", "Inquiry ID must be a valid number"))
		return
	}

	// Parse request body
	var req map[string]string
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	notes := ""
	if notesVal, exists := req["notes"]; exists {
		notes = notesVal
	}

	// Reject inquiry
	inquiry, err := wic.inquiryService.RejectInquiry(uint(inquiryID), uint(adminID.(float64)), notes)
	if err != nil {
		logrus.Errorf("Failed to reject inquiry: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to reject inquiry", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Inquiry rejected successfully", inquiry))
}
