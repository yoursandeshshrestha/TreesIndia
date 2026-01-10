package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type WorkerWithdrawalController struct {
	BaseController
	withdrawalService *services.WorkerWithdrawalService
}

func NewWorkerWithdrawalController() *WorkerWithdrawalController {
	return &WorkerWithdrawalController{
		BaseController:    *NewBaseController(),
		withdrawalService: services.NewWorkerWithdrawalService(),
	}
}

// RequestWithdrawal creates a new withdrawal request
// @Summary Request withdrawal
// @Description Worker requests to withdraw earnings
// @Tags Worker Withdrawals
// @Accept json
// @Produce json
// @Param request body models.WorkerWithdrawalRequest true "Withdrawal request"
// @Success 201 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /worker/withdrawals/request [post]
func (wc *WorkerWithdrawalController) RequestWithdrawal(c *gin.Context) {
	userID := wc.GetUserID(c)
	if userID == 0 {
		wc.Unauthorized(c, "Unauthorized", "User not authenticated")
		return
	}

	var req models.WorkerWithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		wc.BadRequest(c, "Invalid request data", err.Error())
		return
	}

	// Create withdrawal request
	payment, err := wc.withdrawalService.RequestWithdrawal(userID, &req)
	if err != nil {
		logrus.Errorf("Failed to create withdrawal request for user %d: %v", userID, err)
		wc.BadRequest(c, "Failed to create withdrawal request", err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Withdrawal request submitted successfully. Admin will review and process your request.",
		"data": gin.H{
			"payment_reference": payment.PaymentReference,
			"amount":            payment.Amount,
			"status":            payment.Status,
		},
	})
}

// GetWithdrawals retrieves withdrawal history for the authenticated worker
// @Summary Get withdrawal history
// @Description Get withdrawal history for the authenticated worker
// @Tags Worker Withdrawals
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /worker/withdrawals [get]
func (wc *WorkerWithdrawalController) GetWithdrawals(c *gin.Context) {
	userID := wc.GetUserID(c)
	if userID == 0 {
		wc.Unauthorized(c, "Unauthorized", "User not authenticated")
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Get withdrawals
	withdrawals, total, err := wc.withdrawalService.GetWorkerWithdrawals(userID, page, limit)
	if err != nil {
		logrus.Errorf("Failed to get withdrawals for user %d: %v", userID, err)
		wc.InternalServerError(c, "Failed to retrieve withdrawals", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Withdrawals retrieved successfully",
		"data": gin.H{
			"withdrawals": withdrawals,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (int(total) + limit - 1) / limit,
			},
		},
	})
}

// GetPendingWithdrawals retrieves pending withdrawal requests for the authenticated worker
// @Summary Get pending withdrawals
// @Description Get pending withdrawal requests for the authenticated worker
// @Tags Worker Withdrawals
// @Accept json
// @Produce json
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /worker/withdrawals/pending [get]
func (wc *WorkerWithdrawalController) GetPendingWithdrawals(c *gin.Context) {
	userID := wc.GetUserID(c)
	if userID == 0 {
		wc.Unauthorized(c, "Unauthorized", "User not authenticated")
		return
	}

	// Get pending withdrawals
	withdrawals, err := wc.withdrawalService.GetPendingWithdrawals(userID)
	if err != nil {
		logrus.Errorf("Failed to get pending withdrawals for user %d: %v", userID, err)
		wc.InternalServerError(c, "Failed to retrieve pending withdrawals", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pending withdrawals retrieved successfully",
		"data": gin.H{
			"withdrawals": withdrawals,
		},
	})
}

// ApproveWithdrawal approves a withdrawal request (admin only)
// @Summary Approve withdrawal
// @Description Admin approves a withdrawal request
// @Tags Admin Withdrawals
// @Accept json
// @Produce json
// @Param id path int true "Payment ID"
// @Param notes body string false "Admin notes"
// @Success 200 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /admin/withdrawals/{id}/approve [post]
func (wc *WorkerWithdrawalController) ApproveWithdrawal(c *gin.Context) {
	adminID := wc.GetUserID(c)
	if adminID == 0 {
		wc.Unauthorized(c, "Unauthorized", "Admin not authenticated")
		return
	}

	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		wc.BadRequest(c, "Invalid payment ID", "Payment ID must be a valid integer")
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	c.ShouldBindJSON(&req)

	// Approve withdrawal
	if err := wc.withdrawalService.ApproveWithdrawal(uint(paymentID), adminID, req.Notes); err != nil {
		logrus.Errorf("Failed to approve withdrawal %d by admin %d: %v", paymentID, adminID, err)
		wc.BadRequest(c, "Failed to approve withdrawal", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Withdrawal approved and processed successfully",
	})
}

// RejectWithdrawal rejects a withdrawal request (admin only)
// @Summary Reject withdrawal
// @Description Admin rejects a withdrawal request
// @Tags Admin Withdrawals
// @Accept json
// @Produce json
// @Param id path int true "Payment ID"
// @Param request body object{reason:string} true "Rejection reason"
// @Success 200 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /admin/withdrawals/{id}/reject [post]
func (wc *WorkerWithdrawalController) RejectWithdrawal(c *gin.Context) {
	adminID := wc.GetUserID(c)
	if adminID == 0 {
		wc.Unauthorized(c, "Unauthorized", "Admin not authenticated")
		return
	}

	paymentIDStr := c.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		wc.BadRequest(c, "Invalid payment ID", "Payment ID must be a valid integer")
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		wc.BadRequest(c, "Invalid request data", "Rejection reason is required")
		return
	}

	// Reject withdrawal
	if err := wc.withdrawalService.RejectWithdrawal(uint(paymentID), adminID, req.Reason); err != nil {
		logrus.Errorf("Failed to reject withdrawal %d by admin %d: %v", paymentID, adminID, err)
		wc.BadRequest(c, "Failed to reject withdrawal", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Withdrawal rejected successfully",
	})
}

// GetAllWithdrawals retrieves all withdrawal requests for admin
// @Summary Get all withdrawals
// @Description Admin gets all withdrawal requests with filters
// @Tags Admin Withdrawals
// @Accept json
// @Produce json
// @Param status query string false "Status filter (pending, completed, failed, cancelled, all)"
// @Param search query string false "Search in payment reference, user name, email, phone"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /admin/withdrawals [get]
func (wc *WorkerWithdrawalController) GetAllWithdrawals(c *gin.Context) {
	adminID := wc.GetUserID(c)
	if adminID == 0 {
		wc.Unauthorized(c, "Unauthorized", "Admin not authenticated")
		return
	}

	// Get query parameters
	status := c.DefaultQuery("status", "all")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Get withdrawals
	withdrawals, total, err := wc.withdrawalService.GetAllWithdrawals(status, search, page, limit)
	if err != nil {
		logrus.Errorf("Failed to get all withdrawals: %v", err)
		wc.InternalServerError(c, "Failed to retrieve withdrawals", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Withdrawals retrieved successfully",
		"data": gin.H{
			"withdrawals": withdrawals,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (int(total) + limit - 1) / limit,
			},
		},
	})
}

// GetAllPendingWithdrawals retrieves all pending withdrawal requests for admin
// @Summary Get all pending withdrawals
// @Description Admin gets all pending withdrawal requests
// @Tags Admin Withdrawals
// @Accept json
// @Produce json
// @Success 200 {object} gin.H
// @Failure 401 {object} gin.H
// @Router /admin/withdrawals/pending [get]
func (wc *WorkerWithdrawalController) GetAllPendingWithdrawals(c *gin.Context) {
	adminID := wc.GetUserID(c)
	if adminID == 0 {
		wc.Unauthorized(c, "Unauthorized", "Admin not authenticated")
		return
	}

	// Get pending withdrawals
	withdrawals, err := wc.withdrawalService.GetAllPendingWithdrawals()
	if err != nil {
		logrus.Errorf("Failed to get all pending withdrawals: %v", err)
		wc.InternalServerError(c, "Failed to retrieve pending withdrawals", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pending withdrawals retrieved successfully",
		"data": gin.H{
			"withdrawals": withdrawals,
		},
	})
}
