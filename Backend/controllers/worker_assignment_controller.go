package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type WorkerAssignmentController struct {
	BaseController
	workerAssignmentService     *services.WorkerAssignmentService
	enhancedNotificationService *services.EnhancedNotificationService
	db                          *gorm.DB
}

func NewWorkerAssignmentController(
	workerAssignmentService *services.WorkerAssignmentService,
	enhancedNotificationService *services.EnhancedNotificationService,
	db *gorm.DB,
) *WorkerAssignmentController {
	return &WorkerAssignmentController{
		workerAssignmentService:     workerAssignmentService,
		enhancedNotificationService: enhancedNotificationService,
		db:                          db,
	}
}

// GetWorkerAssignments gets all assignments for the authenticated worker
// @Summary Get worker assignments
// @Description Get all assignments for the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param date query string false "Filter by date (YYYY-MM-DD)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} views.Response{data=[]models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Router /worker/assignments [get]
func (wac *WorkerAssignmentController) GetWorkerAssignments(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	// Parse query parameters
	status := c.Query("status")
	date := c.Query("date")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := &models.WorkerAssignmentFilters{
		Status: status,
		Date:   date,
		Page:   page,
		Limit:  limit,
	}

	assignments, pagination, err := wac.workerAssignmentService.GetWorkerAssignments(workerID, filters)
	if err != nil {
		logrus.Errorf("Failed to get worker assignments: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to get assignments", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Worker assignments retrieved successfully", gin.H{
		"assignments": assignments,
		"pagination":  pagination,
	}))
}

// GetWorkerAssignment gets a specific assignment for the authenticated worker
// @Summary Get worker assignment
// @Description Get a specific assignment by ID for the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Success 200 {object} views.Response{data=models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /worker/assignments/{id} [get]
func (wac *WorkerAssignmentController) GetWorkerAssignment(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid assignment ID", "Assignment ID must be a valid number"))
		return
	}

	assignment, err := wac.workerAssignmentService.GetWorkerAssignment(uint(assignmentID), workerID)
	if err != nil {
		logrus.Errorf("Failed to get worker assignment: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to get assignment", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Worker assignment retrieved successfully", assignment))
}

// AcceptAssignment accepts an assignment
// @Summary Accept assignment
// @Description Accept an assignment by the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Param request body models.AcceptAssignmentRequest true "Accept assignment request"
// @Success 200 {object} views.Response{data=models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /worker/assignments/{id}/accept [post]
func (wac *WorkerAssignmentController) AcceptAssignment(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid assignment ID", "Assignment ID must be a valid number"))
		return
	}

	var req models.AcceptAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	assignment, err := wac.workerAssignmentService.AcceptAssignment(uint(assignmentID), workerID, req.Notes)
	if err != nil {
		logrus.Errorf("Failed to accept assignment: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to accept assignment", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Assignment accepted successfully", assignment))
}

// RejectAssignment rejects an assignment
// @Summary Reject assignment
// @Description Reject an assignment by the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Param request body models.RejectAssignmentRequest true "Reject assignment request"
// @Success 200 {object} views.Response{data=models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /worker/assignments/{id}/reject [post]
func (wac *WorkerAssignmentController) RejectAssignment(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid assignment ID", "Assignment ID must be a valid number"))
		return
	}

	var req models.RejectAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	assignment, err := wac.workerAssignmentService.RejectAssignment(uint(assignmentID), workerID, req.Reason, req.Notes)
	if err != nil {
		logrus.Errorf("Failed to reject assignment: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to reject assignment", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Assignment rejected successfully", assignment))
}

// StartAssignment starts an assignment
// @Summary Start assignment
// @Description Start an assignment by the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Param request body models.StartServiceRequest true "Start service request"
// @Success 200 {object} views.Response{data=models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /worker/assignments/{id}/start [post]
func (wac *WorkerAssignmentController) StartAssignment(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid assignment ID", "Assignment ID must be a valid number"))
		return
	}

	var req models.StartServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	assignment, err := wac.workerAssignmentService.StartAssignment(uint(assignmentID), workerID, req.Notes)
	if err != nil {
		logrus.Errorf("Failed to start assignment: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to start assignment", err.Error()))
		return
	}

	// Send notification to customer
	wac.sendAssignmentNotification(assignment, "started")

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Assignment started successfully", assignment))
}

// CompleteAssignment completes an assignment
// @Summary Complete assignment
// @Description Complete an assignment by the authenticated worker
// @Tags Worker Assignments
// @Accept json
// @Produce json
// @Param id path int true "Assignment ID"
// @Param request body models.CompleteServiceRequest true "Complete service request"
// @Success 200 {object} views.Response{data=models.WorkerAssignment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /worker/assignments/{id}/complete [post]
func (wac *WorkerAssignmentController) CompleteAssignment(c *gin.Context) {
	workerID := wac.GetUserID(c)
	if workerID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Worker not authenticated"))
		return
	}

	assignmentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid assignment ID", "Assignment ID must be a valid number"))
		return
	}

	var req models.CompleteServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	assignment, err := wac.workerAssignmentService.CompleteAssignment(uint(assignmentID), workerID, req.Notes, req.MaterialsUsed, req.Photos)
	if err != nil {
		logrus.Errorf("Failed to complete assignment: %v", err)
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to complete assignment", err.Error()))
		return
	}

	// Send notification to customer
	wac.sendAssignmentNotification(assignment, "completed")

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Assignment completed successfully", assignment))
}

// sendAssignmentNotification sends notification about assignment status changes
func (wac *WorkerAssignmentController) sendAssignmentNotification(assignment *models.WorkerAssignment, notificationType string) {
	// This runs in a goroutine, so it doesn't block the response
	go func() {
		// Skip if notification service is not available
		if wac.enhancedNotificationService == nil {
			logrus.Warn("Notification service not available, skipping notification")
			return
		}

		var title, body string
		var recipientUserID uint
		var notifType models.NotificationType

		// Get booking to access customer information
		var booking models.Booking
		if err := wac.db.First(&booking, assignment.BookingID).Error; err != nil {
			logrus.Errorf("Failed to load booking for notification: %v", err)
			return
		}

		// Get worker information
		var worker models.User
		if err := wac.db.First(&worker, assignment.WorkerID).Error; err != nil {
			logrus.Errorf("Failed to load worker for notification: %v", err)
			return
		}

		switch notificationType {
		case "started":
			title = "Work Started!"
			body = fmt.Sprintf("%s has started working on your booking", worker.Name)
			recipientUserID = booking.UserID
			notifType = models.NotificationTypeBooking

		case "completed":
			title = "Work Completed!"
			body = fmt.Sprintf("%s has completed your booking", worker.Name)
			recipientUserID = booking.UserID
			notifType = models.NotificationTypeBooking

		default:
			return
		}

		notificationReq := &services.NotificationRequest{
			UserID:   recipientUserID,
			Type:     notifType,
			Title:    title,
			Body:     body,
			Data: map[string]string{
				"type":         "booking",
				"bookingId":    fmt.Sprintf("%d", assignment.BookingID),
				"assignmentId": fmt.Sprintf("%d", assignment.ID),
				"workerId":     fmt.Sprintf("%d", assignment.WorkerID),
			},
			Priority: "high",
		}

		_, err := wac.enhancedNotificationService.SendNotification(notificationReq)
		if err != nil {
			logrus.Errorf("Failed to send %s notification for assignment %d: %v", notificationType, assignment.ID, err)
		} else {
			logrus.Infof("Sent %s notification for assignment %d to user %d", notificationType, assignment.ID, recipientUserID)
		}
	}()
}
