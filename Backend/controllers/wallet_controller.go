package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// WalletController handles HTTP requests for wallet operations
type WalletController struct {
	service *services.UnifiedWalletService
}

// NewWalletController creates a new wallet controller
func NewWalletController() *WalletController {
	return &WalletController{
		service: services.NewUnifiedWalletService(),
	}
}

// RechargeWalletRequest represents the request for wallet recharge
type RechargeWalletRequest struct {
	Amount        float64 `json:"amount" binding:"required,min=1"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
	ReferenceID   string  `json:"reference_id,omitempty"`
}



// AdminAdjustWalletRequest represents the request for admin wallet adjustment
type AdminAdjustWalletRequest struct {
	UserID uint    `json:"user_id" binding:"required"`
	Amount float64 `json:"amount" binding:"required"`
	Reason string  `json:"reason" binding:"required"`
}

// RechargeWallet initiates a wallet recharge
// @Summary Recharge wallet
// @Description Initiate a wallet recharge for the authenticated user
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body RechargeWalletRequest true "Recharge request"
// @Success 201 {object} views.Response{data=models.WalletTransaction}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/recharge [post]
func (c *WalletController) RechargeWallet(ctx *gin.Context) {
	var req RechargeWalletRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Validate payment method
	if req.PaymentMethod != models.PaymentMethodRazorpay && req.PaymentMethod != models.PaymentMethodWallet {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid payment method", "Payment method must be razorpay or wallet"))
		return
	}

	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Create recharge transaction
	payment, razorpayOrder, err := c.service.RechargeWallet(userID, req.Amount, req.PaymentMethod)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to recharge wallet", err.Error()))
		return
	}

	response := gin.H{
		"payment": payment,
		"payment_order": razorpayOrder,
		"message": "Wallet recharge initiated successfully. Complete payment to add funds to your wallet.",
	}

	ctx.JSON(http.StatusCreated, views.CreateSuccessResponse("Wallet recharge initiated successfully", response))
}



// CompleteRechargeRequest represents the request for completing a wallet recharge
type CompleteRechargeRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// CompleteRecharge completes a wallet recharge with payment verification
// @Summary Complete recharge
// @Description Complete a pending wallet recharge with payment verification
// @Tags Wallet
// @Accept json
// @Produce json
// @Param id path int true "Transaction ID"
// @Param request body CompleteRechargeRequest true "Payment verification data"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/recharge/{id}/complete [post]
func (c *WalletController) CompleteRecharge(ctx *gin.Context) {
	transactionIDStr := ctx.Param("id")
	transactionID, err := strconv.ParseUint(transactionIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid transaction ID", "Transaction ID must be a valid integer"))
		return
	}

	// Parse payment verification data
	var req CompleteRechargeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Complete the recharge (payment verification happens in the service)
	if err := c.service.CompleteWalletRecharge(uint(transactionID), req.RazorpayPaymentID, req.RazorpaySignature); err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to complete recharge", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Wallet recharge completed successfully", nil))
}

// CancelRecharge allows users to cancel a pending wallet recharge
// @Summary Cancel wallet recharge
// @Description Cancel a pending wallet recharge payment
// @Tags Wallet
// @Accept json
// @Produce json
// @Param id path int true "Payment ID"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/recharge/{id}/cancel [post]
func (c *WalletController) CancelRecharge(ctx *gin.Context) {
	paymentIDStr := ctx.Param("id")
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid payment ID", "Payment ID must be a valid integer"))
		return
	}

	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Cancel the recharge
	if err := c.service.CancelWalletRecharge(uint(paymentID), userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to cancel recharge", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Wallet recharge cancelled successfully", nil))
}



// GetUserTransactions gets user's transaction history
// @Summary Get transaction history
// @Description Get the authenticated user's wallet transaction history
// @Tags Wallet
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Success 200 {object} views.Response{data=[]models.WalletTransaction}
// @Failure 401 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/transactions [get]
func (c *WalletController) GetUserTransactions(ctx *gin.Context) {
	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Get transactions
	transactions, total, err := c.service.GetUserWalletTransactions(userID, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get transactions", err.Error()))
		return
	}

	response := gin.H{
		"transactions": transactions,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Transactions retrieved successfully", response))
}

// GetUserTransactionsByType gets user's transactions by type
// @Summary Get transactions by type
// @Description Get the authenticated user's wallet transactions filtered by type
// @Tags Wallet
// @Accept json
// @Produce json
// @Param type path string true "Transaction type"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Success 200 {object} views.Response{data=[]models.WalletTransaction}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/transactions/type/{type} [get]
func (c *WalletController) GetUserTransactionsByType(ctx *gin.Context) {
	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Get transaction type and convert to payment type
	transactionType := ctx.Param("type")
	if transactionType == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Transaction type is required", "Transaction type parameter cannot be empty"))
		return
	}

	// Convert transaction type to payment type
	var paymentType models.PaymentType
	switch transactionType {
	case "recharge":
		paymentType = models.PaymentTypeWalletRecharge
	case "debit":
		paymentType = models.PaymentTypeWalletDebit
	default:
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid transaction type", "Transaction type must be 'recharge' or 'debit'"))
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Get transactions
	transactions, total, err := c.service.GetUserWalletTransactionsByType(userID, paymentType, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get transactions", err.Error()))
		return
	}

	response := gin.H{
		"transactions": transactions,
		"transaction_type": transactionType,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Transactions retrieved successfully", response))
}

// GetUserWalletSummary gets user's wallet summary
// @Summary Get wallet summary
// @Description Get a summary of the authenticated user's wallet activity
// @Tags Wallet
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 401 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/summary [get]
func (c *WalletController) GetUserWalletSummary(ctx *gin.Context) {
	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Get wallet summary
	summary, err := c.service.GetUserWalletSummary(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get wallet summary", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Wallet summary retrieved successfully", summary))
}

// AdminAdjustWallet allows admin to adjust user's wallet balance
// @Summary Admin adjust wallet
// @Description Admin adjustment of user's wallet balance
// @Tags Wallet
// @Accept json
// @Produce json
// @Param request body AdminAdjustWalletRequest true "Admin adjustment request"
// @Success 200 {object} views.Response{data=models.WalletTransaction}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/wallet/adjust [post]
func (c *WalletController) AdminAdjustWallet(ctx *gin.Context) {
	var req AdminAdjustWalletRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get admin ID from context
	adminID := ctx.GetUint("user_id")
	if adminID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Admin not authenticated"))
		return
	}

	// Adjust wallet
	transaction, err := c.service.AdminAdjustWallet(req.UserID, req.Amount, req.Reason, adminID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to adjust wallet", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Wallet adjusted successfully", transaction))
}

// GetTransactionByReference gets a transaction by reference ID
// @Summary Get transaction by reference
// @Description Get a wallet transaction by its reference ID
// @Tags Wallet
// @Accept json
// @Produce json
// @Param reference_id path string true "Transaction reference ID"
// @Success 200 {object} views.Response{data=models.WalletTransaction}
// @Failure 400 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /wallet/transaction/{reference_id} [get]
func (c *WalletController) GetTransactionByReference(ctx *gin.Context) {
	referenceID := ctx.Param("reference_id")
	if referenceID == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Reference ID is required", "Reference ID parameter cannot be empty"))
		return
	}

	transaction, err := c.service.GetTransactionByReference(referenceID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Transaction not found", "No transaction found with the specified reference ID"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Transaction retrieved successfully", transaction))
}
