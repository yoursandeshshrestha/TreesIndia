package routes

import (
	"net/http"
	"strconv"
	"treesindia/repositories"
	"treesindia/services"
	"treesindia/utils"

	"github.com/gin-gonic/gin"
)

// SetupTestRoutes sets up test routes for development
func SetupTestRoutes(router *gin.RouterGroup) {
	testController := NewTestController()

	// Test routes (no authentication required for development)
	test := router.Group("/test")
	{
		// Test Exotel connection
		test.GET("/exotel/status", testController.GetExotelStatus)
		
		// Simple test call with custom parameters
		test.POST("/call", testController.TestCall)
		
		// Test webhook endpoint
		test.POST("/webhook/exotel", testController.TestExotelWebhook)
		
		// Test auto-approval functionality
		test.GET("/auto-approval/:user_id", testController.TestAutoApproval)
	}
}

// TestController handles test requests for development
type TestController struct {
	callMaskingService *services.CallMaskingService
	exotelService      *services.ExotelService
}

// NewTestController creates a new test controller
func NewTestController() *TestController {
	return &TestController{
		callMaskingService: services.NewCallMaskingService(),
		exotelService:      services.NewExotelService(),
	}
}

// GetExotelStatus checks Exotel service status
func (tc *TestController) GetExotelStatus(c *gin.Context) {
	if tc.exotelService == nil {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Exotel service not configured")
		return
	}

	isAvailable := tc.exotelService.IsServiceAvailable()
	
	response := map[string]interface{}{
		"available": isAvailable,
		"message":   "Exotel service status",
	}

	if isAvailable {
		// Try to get account balance
		balance, err := tc.exotelService.GetAccountBalance()
		if err == nil {
			response["account_balance"] = balance
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Exotel status retrieved", response)
}

// TestCall makes a test call with custom parameters
func (tc *TestController) TestCall(c *gin.Context) {
	var req struct {
		From     string `json:"from" binding:"required"`
		To       string `json:"to" binding:"required"`
		CallerID string `json:"caller_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "from, to, and caller_id are required")
		return
	}

	if tc.exotelService == nil {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Exotel service not configured")
		return
	}

	// Make direct call using Exotel service
	callSID, err := tc.exotelService.TestCallWithParams(req.From, req.To, req.CallerID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"call_sid":  callSID,
		"from":      req.From,
		"to":        req.To,
		"caller_id": req.CallerID,
		"message":   "Test call initiated successfully",
	}

	utils.SuccessResponse(c, http.StatusOK, "Test call initiated", response)
}


// TestExotelWebhook tests Exotel webhook handling
func (tc *TestController) TestExotelWebhook(c *gin.Context) {
	callSID := c.PostForm("CallSid")
	callStatus := c.PostForm("CallStatus")
	callDuration := c.PostForm("CallDuration")

	if callSID == "" || callStatus == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Missing required parameters")
		return
	}

	err := tc.callMaskingService.HandleCallWebhook(callSID, callStatus, callDuration)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Webhook processed successfully", nil)
}

// TestAutoApproval tests the auto-approval functionality for a user
func (tc *TestController) TestAutoApproval(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Initialize subscription repository to test
	subscriptionRepo := repositories.NewUserSubscriptionRepository()
	hasActive, err := subscriptionRepo.HasActiveSubscription(uint(userID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to check subscription: "+err.Error())
		return
	}

	response := map[string]interface{}{
		"user_id": userID,
		"has_active_subscription": hasActive,
		"auto_approval_eligible": hasActive,
	}

	utils.SuccessResponse(c, http.StatusOK, "Auto-approval check completed", response)
}
