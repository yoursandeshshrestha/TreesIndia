package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// AdminPaymentController handles admin payment and transaction management
type AdminPaymentController struct {
	*BaseController
	paymentService *services.PaymentService
}

// NewAdminPaymentController creates a new admin payment controller
func NewAdminPaymentController() *AdminPaymentController {
	return &AdminPaymentController{
		BaseController: NewBaseController(),
		paymentService: services.NewPaymentService(),
	}
}

// GetAdminTransactions gets all transactions with comprehensive filtering and pagination
// @Summary Get admin transactions
// @Description Get all transactions with comprehensive filtering, search, and pagination for admin
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
// @Param search query string false "Search in payment reference, description, user name, email"
// @Param status query string false "Filter by payment status"
// @Param type query string false "Filter by payment type"
// @Param method query string false "Filter by payment method"
// @Param user_email query string false "Filter by user email"
// @Param user_phone query string false "Filter by user phone"
// @Param min_amount query number false "Minimum amount filter"
// @Param max_amount query number false "Maximum amount filter"
// @Param start_date query string false "Start date filter (YYYY-MM-DD)"
// @Param end_date query string false "End date filter (YYYY-MM-DD)"
// @Param sort_by query string false "Sort field (amount, created_at, etc.)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} views.Response{data=[]models.Payment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions [get]
func (apc *AdminPaymentController) GetAdminTransactions(c *gin.Context) {
	// Parse query parameters
	filters := &models.AdminPaymentFilters{
		PaymentFilters: models.PaymentFilters{
			Page:  1,
			Limit: 10,
		},
	}

	// Pagination
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filters.Page = page
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			filters.Limit = limit
		}
	}

	// Search and filters
	if search := c.Query("search"); search != "" {
		filters.Search = search
	}

	if status := c.Query("status"); status != "" {
		filters.Status = models.PaymentStatus(status)
	}

	if paymentType := c.Query("type"); paymentType != "" {
		filters.Type = models.PaymentType(paymentType)
	}

	if method := c.Query("method"); method != "" {
		filters.Method = method
	}

	if userEmail := c.Query("user_email"); userEmail != "" {
		filters.UserEmail = userEmail
	}

	if userPhone := c.Query("user_phone"); userPhone != "" {
		filters.UserPhone = userPhone
	}

	if minAmountStr := c.Query("min_amount"); minAmountStr != "" {
		if minAmount, err := strconv.ParseFloat(minAmountStr, 64); err == nil {
			filters.MinAmount = &minAmount
		}
	}

	if maxAmountStr := c.Query("max_amount"); maxAmountStr != "" {
		if maxAmount, err := strconv.ParseFloat(maxAmountStr, 64); err == nil {
			filters.MaxAmount = &maxAmount
		}
	}

	if startDate := c.Query("start_date"); startDate != "" {
		filters.StartDate = startDate
	}

	if endDate := c.Query("end_date"); endDate != "" {
		filters.EndDate = endDate
	}

	if sortBy := c.Query("sort_by"); sortBy != "" {
		filters.SortBy = sortBy
	}

	if sortOrder := c.Query("sort_order"); sortOrder != "" {
		filters.SortOrder = sortOrder
	}

	// Get transactions
	transactions, pagination, err := apc.paymentService.GetAdminPayments(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get transactions", err.Error()))
		return
	}

	response := gin.H{
		"transactions": transactions,
		"pagination":   pagination,
		"filters":      filters,
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Transactions retrieved successfully", response))
}

// GetTransactionStats gets comprehensive transaction statistics for admin dashboard
// @Summary Get transaction statistics
// @Description Get comprehensive transaction statistics for admin dashboard
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.AdminTransactionStats}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/stats [get]
func (apc *AdminPaymentController) GetTransactionStats(c *gin.Context) {
	stats, err := apc.paymentService.GetAdminTransactionStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get transaction statistics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Transaction statistics retrieved successfully", stats))
}

// GetTransactionDashboard gets comprehensive dashboard data for admin
// @Summary Get transaction dashboard
// @Description Get comprehensive dashboard data including stats, distributions, and recent transactions
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/dashboard [get]
func (apc *AdminPaymentController) GetTransactionDashboard(c *gin.Context) {
	dashboardData, err := apc.paymentService.GetTransactionDashboardData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get dashboard data", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Dashboard data retrieved successfully", dashboardData))
}

// ExportTransactions exports transactions to CSV format
// @Summary Export transactions
// @Description Export transactions to CSV format with comprehensive filtering
// @Tags Admin Transactions
// @Accept json
// @Produce application/octet-stream
// @Param request body models.TransactionExportRequest true "Export request"
// @Success 200 {file} file "CSV file"
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/export [post]
func (apc *AdminPaymentController) ExportTransactions(c *gin.Context) {
	var req models.TransactionExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Validate format
	if req.Format != "csv" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid format", "Only CSV format is supported"))
		return
	}

	// Export to CSV
	csvData, err := apc.paymentService.ExportTransactionsToCSV(&req.Filters, req.IncludeUserDetails, req.IncludeMetadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to export transactions", err.Error()))
		return
	}

	// Set response headers for file download
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Disposition", "attachment; filename=transactions.csv")
	c.Header("Content-Length", strconv.Itoa(len(csvData)))

	c.Data(http.StatusOK, "application/octet-stream", csvData)
}

// GetTransactionByID gets a specific transaction by ID (admin access)
// @Summary Get transaction by ID
// @Description Get a specific transaction by ID with full details (admin access)
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Param id path int true "Transaction ID"
// @Success 200 {object} views.Response{data=models.Payment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/{id} [get]
func (apc *AdminPaymentController) GetTransactionByID(c *gin.Context) {
	transactionIDStr := c.Param("id")
	transactionID, err := strconv.ParseUint(transactionIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid transaction ID", "Transaction ID must be a valid integer"))
		return
	}

	transaction, err := apc.paymentService.GetPaymentByID(uint(transactionID))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Transaction not found", "No transaction found with the specified ID"))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Transaction retrieved successfully", transaction))
}

// GetTransactionByReference gets a specific transaction by reference ID (admin access)
// @Summary Get transaction by reference
// @Description Get a specific transaction by reference ID with full details (admin access)
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Param reference_id path string true "Transaction reference ID"
// @Success 200 {object} views.Response{data=models.Payment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/reference/{reference_id} [get]
func (apc *AdminPaymentController) GetTransactionByReference(c *gin.Context) {
	referenceID := c.Param("reference_id")
	if referenceID == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Reference ID is required", "Reference ID parameter cannot be empty"))
		return
	}

	transaction, err := apc.paymentService.GetPaymentByReference(referenceID)
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Transaction not found", "No transaction found with the specified reference ID"))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Transaction retrieved successfully", transaction))
}

// RefundTransaction refunds a transaction (admin only)
// @Summary Refund transaction
// @Description Refund a completed transaction (admin only)
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Param id path int true "Transaction ID"
// @Param request body models.RefundPaymentRequest true "Refund request"
// @Success 200 {object} views.Response{data=models.Payment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 404 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/{id}/refund [post]
func (apc *AdminPaymentController) RefundTransaction(c *gin.Context) {
	var req models.RefundPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	transactionIDStr := c.Param("id")
	transactionID, err := strconv.ParseUint(transactionIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid transaction ID", "Transaction ID must be a valid integer"))
		return
	}

	// Get admin ID from context
	adminID := c.GetUint("user_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Admin not authenticated"))
		return
	}

	// Add admin note to refund reason
	req.Notes = req.Notes + " (Refunded by admin ID: " + strconv.Itoa(int(adminID)) + ")"

	transaction, err := apc.paymentService.RefundPayment(uint(transactionID), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to refund transaction", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Transaction refunded successfully", transaction))
}

// GetTransactionFilters gets available filter options for transactions
// @Summary Get transaction filter options
// @Description Get available filter options for transaction queries
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/filters [get]
func (apc *AdminPaymentController) GetTransactionFilters(c *gin.Context) {
	filterOptions := map[string]interface{}{
		"payment_types": []string{
			string(models.PaymentTypeBooking),
			string(models.PaymentTypeSubscription),
			string(models.PaymentTypeWalletRecharge),
			string(models.PaymentTypeWalletDebit),
			string(models.PaymentTypeSegmentPay),
			string(models.PaymentTypeQuote),
			string(models.PaymentTypeRefund),
			string(models.PaymentTypeManual),
		},
		"payment_statuses": []string{
			string(models.PaymentStatusPending),
			string(models.PaymentStatusCompleted),
			string(models.PaymentStatusFailed),
			string(models.PaymentStatusRefunded),
			string(models.PaymentStatusCancelled),
		},
		"payment_methods": []string{
			"razorpay",
			"wallet",
			"cash",
			"admin",
		},
		"related_entity_types": []string{
			"booking",
			"subscription",
			"wallet",
			"service",
			"property",
		},
		"sort_fields": []string{
			"created_at",
			"amount",
			"status",
			"type",
			"method",
			"user_id",
		},
		"sort_orders": []string{
			"asc",
			"desc",
		},
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Filter options retrieved successfully", filterOptions))
}

// CreateManualTransaction creates a manual transaction (admin only)
// @Summary Create manual transaction
// @Description Create a manual transaction entry (admin only)
// @Tags Admin Transactions
// @Accept json
// @Produce json
// @Param request body models.ManualTransactionRequest true "Manual transaction request"
// @Success 200 {object} views.Response{data=models.Payment}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 403 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /admin/transactions/manual [post]
func (apc *AdminPaymentController) CreateManualTransaction(c *gin.Context) {
	var req models.ManualTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Set default user ID if not provided (admin can create transactions without specific user)
	if req.UserID == 0 {
		req.UserID = 1 // Default to admin user or system user
	}

	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Amount must be greater than zero", "Invalid amount"))
		return
	}

	if req.Description == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Description is required", "Description cannot be empty"))
		return
	}

	// Set default values
	if req.Currency == "" {
		req.Currency = "INR"
	}

	if req.Status == "" {
		req.Status = models.PaymentStatusCompleted
	}

	if req.Type == "" {
		req.Type = models.PaymentTypeBooking
	}

	if req.Method == "" {
		req.Method = "admin"
	}

	// Get admin ID from context for audit trail
	adminID := c.GetUint("user_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "Admin not authenticated"))
		return
	}

	// Add admin note to the transaction
	if req.Notes == "" {
		req.Notes = "Manual transaction created by admin ID: " + strconv.Itoa(int(adminID))
	} else {
		req.Notes = req.Notes + " (Created by admin ID: " + strconv.Itoa(int(adminID)) + ")"
	}

	// Create the manual transaction
	transaction, err := apc.paymentService.CreateManualTransaction(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create manual transaction", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Manual transaction created successfully", transaction))
}
