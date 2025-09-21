package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type LedgerController struct {
	ledgerService *services.LedgerService
}

func NewLedgerController() *LedgerController {
	return &LedgerController{
		ledgerService: services.NewLedgerService(),
	}
}

// CreateEntry creates a new ledger entry
func (lc *LedgerController) CreateEntry(c *gin.Context) {
	var req models.CreateLedgerEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin ID from context (assuming it's set by auth middleware)
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	entry, err := lc.ledgerService.CreateEntry(&req, adminID.(uint))
	if err != nil {
		logrus.Errorf("Failed to create ledger entry: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Ledger entry created successfully",
		"data":    entry,
	})
}

// GetEntry gets a ledger entry by ID
func (lc *LedgerController) GetEntry(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry ID"})
		return
	}

	entry, err := lc.ledgerService.GetEntry(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    entry,
	})
}

// UpdateEntry updates a ledger entry
func (lc *LedgerController) UpdateEntry(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry ID"})
		return
	}

	var req models.UpdateLedgerEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	entry, err := lc.ledgerService.UpdateEntry(uint(id), &req, adminID.(uint))
	if err != nil {
		logrus.Errorf("Failed to update ledger entry: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Ledger entry updated successfully",
		"data":    entry,
	})
}

// DeleteEntry deletes a ledger entry
func (lc *LedgerController) DeleteEntry(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry ID"})
		return
	}

	err = lc.ledgerService.DeleteEntry(uint(id))
	if err != nil {
		logrus.Errorf("Failed to delete ledger entry: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Ledger entry deleted successfully",
	})
}

// GetAllEntries gets all ledger entries with pagination and filters
func (lc *LedgerController) GetAllEntries(c *gin.Context) {
	// Parse pagination parameters
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit > 100 {
		limit = 100 // Max limit
	}

	// Parse filters
	var entryType *models.LedgerEntryType
	if et := c.Query("entry_type"); et != "" {
		if et == string(models.LedgerEntryTypePay) || et == string(models.LedgerEntryTypeReceive) {
			entryTypeVal := models.LedgerEntryType(et)
			entryType = &entryTypeVal
		}
	}

	var status *models.LedgerStatus
	if st := c.Query("status"); st != "" {
		if st == string(models.LedgerStatusPending) || st == string(models.LedgerStatusPartial) || st == string(models.LedgerStatusCompleted) {
			statusVal := models.LedgerStatus(st)
			status = &statusVal
		}
	}

	search := c.Query("search")

	entries, total, err := lc.ledgerService.GetAllEntries(offset, limit, entryType, status, search)
	if err != nil {
		logrus.Errorf("Failed to get ledger entries: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"entries": entries,
			"total":   total,
			"offset":  offset,
			"limit":   limit,
		},
	})
}

// GetPendingPayments gets all pending payment entries
func (lc *LedgerController) GetPendingPayments(c *gin.Context) {
	entries, err := lc.ledgerService.GetPendingPayments()
	if err != nil {
		logrus.Errorf("Failed to get pending payments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    entries,
	})
}

// GetPendingReceivables gets all pending receivable entries
func (lc *LedgerController) GetPendingReceivables(c *gin.Context) {
	entries, err := lc.ledgerService.GetPendingReceivables()
	if err != nil {
		logrus.Errorf("Failed to get pending receivables: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    entries,
	})
}

// ProcessPayment processes a payment and updates balances
func (lc *LedgerController) ProcessPayment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry ID"})
		return
	}

	var req models.ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	entry, err := lc.ledgerService.ProcessPayment(uint(id), &req, adminID.(uint))
	if err != nil {
		logrus.Errorf("Failed to process payment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment processed successfully",
		"data":    entry,
	})
}

// ProcessReceive processes a receive and updates balances
func (lc *LedgerController) ProcessReceive(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry ID"})
		return
	}

	var req models.ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	entry, err := lc.ledgerService.ProcessReceive(uint(id), &req, adminID.(uint))
	if err != nil {
		logrus.Errorf("Failed to process receive: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Receive processed successfully",
		"data":    entry,
	})
}

// GetCurrentBalance gets the current cash/bank balance
func (lc *LedgerController) GetCurrentBalance(c *gin.Context) {
	balance, err := lc.ledgerService.GetCurrentBalance()
	if err != nil {
		logrus.Errorf("Failed to get current balance: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    balance,
	})
}

// UpdateBalance updates the cash/bank balance
func (lc *LedgerController) UpdateBalance(c *gin.Context) {
	var req models.UpdateBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin ID from context
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	balance, err := lc.ledgerService.UpdateBalance(&req, adminID.(uint))
	if err != nil {
		logrus.Errorf("Failed to update balance: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Balance updated successfully",
		"data":    balance,
	})
}

// GetSummary gets the financial summary
func (lc *LedgerController) GetSummary(c *gin.Context) {
	summary, err := lc.ledgerService.GetSummary()
	if err != nil {
		logrus.Errorf("Failed to get summary: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summary,
	})
}
