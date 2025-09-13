package controllers

import (
	"net/http"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// UserSubscriptionController handles user subscription requests
type UserSubscriptionController struct {
	*BaseController
	subscriptionService *services.UserSubscriptionService
}

// NewUserSubscriptionController creates a new user subscription controller
func NewUserSubscriptionController() *UserSubscriptionController {
	return &UserSubscriptionController{
		BaseController:     NewBaseController(),
		subscriptionService: services.NewUserSubscriptionService(),
	}
}

// PurchaseSubscriptionRequest represents subscription purchase request
type PurchaseSubscriptionRequest struct {
	PlanID        uint   `json:"plan_id" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"`
	DurationType  string `json:"duration_type" binding:"required"`
}

// CreateSubscriptionPaymentOrderRequest represents subscription payment order request
type CreateSubscriptionPaymentOrderRequest struct {
	PlanID       uint   `json:"plan_id" binding:"required"`
	DurationType string `json:"duration_type" binding:"required"`
}

// CompleteSubscriptionPurchaseRequest represents subscription purchase completion request
type CompleteSubscriptionPurchaseRequest struct {
	PaymentID         uint   `json:"payment_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// ExtendSubscriptionRequest represents subscription extension request
type ExtendSubscriptionRequest struct {
	Days int `json:"days" binding:"required,min=1"`
}

// PurchaseSubscription godoc
// @Summary Purchase subscription
// @Description Purchase a subscription for the authenticated user
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Param request body PurchaseSubscriptionRequest true "Purchase request"
// @Success 200 {object} models.Response "Subscription purchased successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscriptions/purchase [post]
func (usc *UserSubscriptionController) PurchaseSubscription(c *gin.Context) {
	var req PurchaseSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Validate payment method
	if req.PaymentMethod != models.PaymentMethodWallet && req.PaymentMethod != models.PaymentMethodRazorpay {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid payment method", "Payment method must be wallet or razorpay"))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	subscription, err := usc.subscriptionService.PurchaseSubscription(userID.(uint), req.PlanID, req.PaymentMethod, req.DurationType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to purchase subscription", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subscription purchased successfully", subscription))
}

// CreateSubscriptionPaymentOrder godoc
// @Summary Create subscription payment order
// @Description Create a Razorpay payment order for subscription purchase
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Param request body CreateSubscriptionPaymentOrderRequest true "Payment order request"
// @Success 200 {object} models.Response "Payment order created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscriptions/create-payment-order [post]
func (usc *UserSubscriptionController) CreateSubscriptionPaymentOrder(c *gin.Context) {
	var req CreateSubscriptionPaymentOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	payment, razorpayOrder, err := usc.subscriptionService.CreateSubscriptionPaymentOrder(userID.(uint), req.PlanID, req.DurationType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create payment order", err.Error()))
		return
	}

	response := map[string]interface{}{
		"payment": payment,
		"order":   razorpayOrder,
		"key_id":  razorpayOrder["key_id"],
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Payment order created successfully", response))
}

// CompleteSubscriptionPurchase godoc
// @Summary Complete subscription purchase
// @Description Complete subscription purchase with verified Razorpay payment
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Param request body CompleteSubscriptionPurchaseRequest true "Purchase completion request"
// @Success 200 {object} models.Response "Subscription purchased successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscriptions/complete-purchase [post]
func (usc *UserSubscriptionController) CompleteSubscriptionPurchase(c *gin.Context) {
	var req CompleteSubscriptionPurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	subscription, err := usc.subscriptionService.CompleteSubscriptionPurchase(
		userID.(uint),
		req.PaymentID,
		req.RazorpayPaymentID,
		req.RazorpaySignature,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to complete subscription purchase", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subscription purchased successfully", subscription))
}

// GetUserSubscription godoc
// @Summary Get user subscription
// @Description Get current user's active subscription
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Subscription retrieved successfully"
// @Failure 404 {object} models.Response "No active subscription"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscriptions/my-subscription [get]
func (usc *UserSubscriptionController) GetUserSubscription(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	subscription, err := usc.subscriptionService.GetUserSubscription(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("No active subscription", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subscription retrieved successfully", subscription))
}

// GetUserSubscriptionHistory godoc
// @Summary Get user subscription history
// @Description Get user's subscription history
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Subscription history retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscriptions/history [get]
func (usc *UserSubscriptionController) GetUserSubscriptionHistory(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("User not authenticated", "Please login to continue"))
		return
	}

	subscriptions, err := usc.subscriptionService.GetUserSubscriptionHistory(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve subscription history", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Subscription history retrieved successfully", subscriptions))
}

// ExtendSubscription godoc
// @Summary Extend user subscription
// @Description Extend user subscription by specified days (Admin only)
// @Tags User Subscriptions
// @Accept json
// @Produce json
// @Param user_id path int true "User ID"
// @Param request body ExtendSubscriptionRequest true "Extension request"
// @Success 200 {object} models.Response "Subscription extended successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscriptions/users/{user_id}/extend [put]



