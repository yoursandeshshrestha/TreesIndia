package controllers

import (
	"net/http"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type WorkerEarningsController struct {
	BaseController
	workerEarningsService *services.WorkerEarningsService
}

func NewWorkerEarningsController(workerEarningsService *services.WorkerEarningsService) *WorkerEarningsController {
	return &WorkerEarningsController{
		BaseController:        *NewBaseController(),
		workerEarningsService: workerEarningsService,
	}
}

// GetEarningsDashboard retrieves the earnings dashboard for the authenticated worker
// @Summary Get worker earnings dashboard
// @Description Get earnings metrics and recent assignments for the authenticated worker
// @Tags Worker Earnings
// @Accept json
// @Produce json
// @Param period query string false "Time period filter: 30_days, 90_days, all_time" default(30_days)
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /worker/earnings/dashboard [get]
func (wec *WorkerEarningsController) GetEarningsDashboard(c *gin.Context) {
	userID := wec.GetUserID(c)
	if userID == 0 {
		wec.Unauthorized(c, "Unauthorized", "Worker not authenticated")
		return
	}

	// Get period filter from query params (default: 30_days)
	period := c.DefaultQuery("period", "30_days")

	// Get earnings dashboard
	dashboard, err := wec.workerEarningsService.GetWorkerEarningsDashboard(userID, period)
	if err != nil {
		logrus.Errorf("Failed to get earnings dashboard for user %d: %v", userID, err)

		// Check for specific error types
		if err.Error() == "worker not found" {
			wec.NotFound(c, "Worker not found", "No worker profile associated with this account")
			return
		}
		if err.Error() == "invalid period. Valid values: 30_days, 90_days, all_time" {
			wec.BadRequest(c, "Invalid period parameter", err.Error())
			return
		}

		wec.InternalServerError(c, "Failed to retrieve earnings dashboard", "An error occurred while fetching earnings data")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Earnings dashboard retrieved successfully",
		"data": gin.H{
			"dashboard": dashboard,
		},
	})
}
