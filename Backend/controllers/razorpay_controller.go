package controllers

import (
	"io"
	"net/http"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// RazorpayController handles Razorpay payment gateway operations
type RazorpayController struct {
	razorpayService *services.RazorpayService
	walletService   *services.WalletService
}

// NewRazorpayController creates a new Razorpay controller
func NewRazorpayController() *RazorpayController {
	razorpayService := services.NewRazorpayService()
	walletService := services.NewWalletService()

	return &RazorpayController{
		razorpayService: razorpayService,
		walletService:   walletService,
	}
}

// CreatePaymentOrder creates a new Razorpay payment order
// @Summary Create payment order
// @Description Create a new Razorpay payment order for wallet recharge
// @Tags Razorpay
// @Accept json
// @Produce json
// @Param request body CreateOrderRequest true "Order request"
// @Success 200 {object} views.Response{data=map[string]interface{}}
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /razorpay/create-order [post]
func (c *RazorpayController) CreatePaymentOrder(ctx *gin.Context) {
	var req CreateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get user ID from context
	userID := ctx.GetUint("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	// Create Razorpay order
	order, err := c.razorpayService.CreateOrder(req.Amount, req.Receipt, "Wallet recharge")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create payment order", err.Error()))
		return
	}

	// Create pending wallet transaction
	orderID := order["id"].(string)
	transaction, err := c.walletService.RechargeWallet(userID, req.Amount, "razorpay", orderID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create wallet transaction", err.Error()))
		return
	}

	response := map[string]interface{}{
		"order":       order,
		"transaction": transaction,
		"key_id":      order["key_id"],
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Payment order created successfully", response))
}

// HandleWebhook handles Razorpay webhook notifications
// @Summary Handle webhook
// @Description Handle Razorpay webhook notifications for payment status updates
// @Tags Razorpay
// @Accept json
// @Produce json
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Failure 500 {object} views.Response
// @Router /razorpay/webhook [post]
func (c *RazorpayController) HandleWebhook(ctx *gin.Context) {
	// Read the request body
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Failed to read request body", err.Error()))
		return
	}

	// Get the signature from headers
	signature := ctx.GetHeader("X-Razorpay-Signature")
	if signature == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing signature", "X-Razorpay-Signature header is required"))
		return
	}

	// Verify webhook signature
	if !c.razorpayService.VerifyWebhookSignature(body, signature) {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid signature", "Webhook signature verification failed"))
		return
	}

	// Parse webhook payload
	webhookData, err := c.razorpayService.ParseWebhookPayload(body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid webhook payload", err.Error()))
		return
	}

	// Handle payment events
	event := webhookData["event"].(string)
	logrus.Infof("Received Razorpay webhook event: %s", event)

	switch event {
	case "payment.captured":
		err = c.handlePaymentCaptured(webhookData)
	case "payment.failed":
		err = c.handlePaymentFailed(webhookData)
	default:
		logrus.Infof("Unhandled webhook event: %s", event)
	}

	if err != nil {
		logrus.Errorf("Error handling webhook event %s: %v", event, err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process webhook", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Webhook processed successfully", nil))
}

// handlePaymentCaptured handles successful payment events
func (c *RazorpayController) handlePaymentCaptured(webhookData map[string]interface{}) error {
	payload := webhookData["payload"].(map[string]interface{})
	entity := payload["payment"].(map[string]interface{})

	paymentID := entity["id"].(string)
	orderID := entity["order_id"].(string)

	// Get payment details
	paymentDetails, err := c.razorpayService.GetPaymentDetails(paymentID)
	if err != nil {
		return err
	}

	// Verify payment was successful
	if !c.razorpayService.IsPaymentSuccessful(paymentDetails) {
		return nil // Payment not successful, ignore
	}

	// Get amount from payment
	amount, err := c.razorpayService.GetPaymentAmount(paymentDetails)
	if err != nil {
		return err
	}

	// Find and complete the wallet transaction
	// Note: In a real implementation, you'd need to store the mapping between order ID and transaction ID
	// For now, we'll use the order ID as the reference ID
	logrus.Infof("Payment captured: %s, Order: %s, Amount: ₹%.2f", paymentID, orderID, amount)

	// TODO: Implement transaction completion logic
	// This would involve finding the pending transaction by order ID and completing it

	return nil
}

// handlePaymentFailed handles failed payment events
func (c *RazorpayController) handlePaymentFailed(webhookData map[string]interface{}) error {
	payload := webhookData["payload"].(map[string]interface{})
	entity := payload["payment"].(map[string]interface{})

	paymentID := entity["id"].(string)
	orderID := entity["order_id"].(string)

	logrus.Infof("Payment failed: %s, Order: %s", paymentID, orderID)

	// TODO: Implement failed payment handling
	// This would involve updating the transaction status to failed

	return nil
}

// VerifyPayment verifies a payment signature
// @Summary Verify payment
// @Description Verify a payment signature from Razorpay
// @Tags Razorpay
// @Accept json
// @Produce json
// @Param request body VerifyPaymentRequest true "Verification request"
// @Success 200 {object} views.Response
// @Failure 400 {object} views.Response
// @Router /razorpay/verify [post]
func (c *RazorpayController) VerifyPayment(ctx *gin.Context) {
	var req VerifyPaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Verify payment signature
	isValid := c.razorpayService.VerifyPaymentSignature(req.OrderID, req.PaymentID, req.Signature)

	if !isValid {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid payment signature", "Payment signature verification failed"))
		return
	}

	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Payment signature verified successfully", nil))
}

// Request structs
type CreateOrderRequest struct {
	Amount  float64 `json:"amount" binding:"required"`
	Receipt string  `json:"receipt" binding:"required"`
}

type VerifyPaymentRequest struct {
	OrderID   string `json:"order_id" binding:"required"`
	PaymentID string `json:"payment_id" binding:"required"`
	Signature string `json:"signature" binding:"required"`
}
