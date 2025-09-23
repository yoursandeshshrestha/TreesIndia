package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// CallMaskingController handles call masking HTTP requests
type CallMaskingController struct {
	callMaskingService *services.CallMaskingService
}

// NewCallMaskingController creates a new call masking controller
func NewCallMaskingController() *CallMaskingController {
	return &CallMaskingController{
		callMaskingService: services.NewCallMaskingService(),
	}
}


// InitiateCall initiates a call between customer and worker
// @Summary Initiate a call
// @Description Initiates a call between customer and worker for a booking
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param request body models.InitiateCallRequest true "Initiate call request"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/call [post]
func (cmc *CallMaskingController) InitiateCall(c *gin.Context) {
	var req models.InitiateCallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	err := cmc.callMaskingService.InitiateCall(req.BookingID, userID.(uint))
	if err != nil {
		logrus.Errorf("Failed to initiate call for booking %d by user %d: %v", req.BookingID, userID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Call initiated successfully", nil)
}


// GetCallLogs retrieves call logs for a booking
// @Summary Get call logs for a booking
// @Description Retrieves call logs for a specific booking
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param booking_id path int true "Booking ID"
// @Success 200 {object} utils.Response{data=[]models.CallLogResponse}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/logs/{booking_id} [get]
func (cmc *CallMaskingController) GetCallLogs(c *gin.Context) {
	bookingIDStr := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid booking ID")
		return
	}

	logs, err := cmc.callMaskingService.GetCallLogs(uint(bookingID))
	if err != nil {
		logrus.Errorf("Failed to get call logs for booking %d: %v", bookingID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get call logs")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Call logs retrieved successfully", logs)
}

// GetCallMaskingStatus checks if call masking is available for a booking
// @Summary Get call masking status for a booking
// @Description Checks if call masking is available for a booking
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param booking_id path int true "Booking ID"
// @Success 200 {object} utils.Response{data=map[string]bool}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/status/{booking_id} [get]
func (cmc *CallMaskingController) GetCallMaskingStatus(c *gin.Context) {
	bookingIDStr := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid booking ID")
		return
	}

	isAvailable, err := cmc.callMaskingService.GetCallMaskingStatus(uint(bookingID))
	if err != nil {
		logrus.Errorf("Failed to get call masking status for booking %d: %v", bookingID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get call masking status")
		return
	}

	response := map[string]bool{
		"available": isAvailable,
	}

	utils.SuccessResponse(c, http.StatusOK, "Call masking status retrieved successfully", response)
}

// HandleExotelWebhook handles Exotel webhook callbacks
// @Summary Handle Exotel webhook
// @Description Handles Exotel webhook callbacks for call status updates
// @Tags Call Masking
// @Accept application/x-www-form-urlencoded
// @Produce json
// @Param CallSid formData string true "Exotel Call SID"
// @Param CallStatus formData string true "Call Status"
// @Param CallDuration formData string false "Call Duration"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/webhook/exotel [post]
func (cmc *CallMaskingController) HandleExotelWebhook(c *gin.Context) {
	callSID := c.PostForm("CallSid")
	callStatus := c.PostForm("CallStatus")
	callDuration := c.PostForm("CallDuration")

	if callSID == "" || callStatus == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Missing required parameters")
		return
	}

	err := cmc.callMaskingService.HandleCallWebhook(callSID, callStatus, callDuration)
	if err != nil {
		logrus.Errorf("Failed to handle Exotel webhook for call %s: %v", callSID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process webhook")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Webhook processed successfully", nil)
}

// TestCall makes a test call for development
// @Summary Make a test call
// @Description Makes a test call to verify Exotel integration
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param phone_number query string true "Phone number to call"
// @Success 200 {object} utils.Response{data=map[string]string}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/test [post]
func (cmc *CallMaskingController) TestCall(c *gin.Context) {
	phoneNumber := c.Query("phone_number")
	if phoneNumber == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Phone number is required")
		return
	}

	callSID, err := cmc.callMaskingService.TestCall(phoneNumber)
	if err != nil {
		logrus.Errorf("Failed to make test call to %s: %v", phoneNumber, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]string{
		"masked_number": callSID,
		"message":       "Test call initiated successfully",
	}

	utils.SuccessResponse(c, http.StatusOK, "Test call initiated", response)
}

// InitiateCallForBooking initiates a call for a specific booking
// @Summary Initiate a call for a booking
// @Description Initiates a call between customer and worker for a specific booking using CloudShope call masking
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param request body models.InitiateCallForBookingRequest true "Initiate call request"
// @Success 200 {object} utils.Response{data=models.CloudShopeCallResponse}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/booking/call [post]
func (cmc *CallMaskingController) InitiateCallForBooking(c *gin.Context) {
	var req models.InitiateCallForBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Initiate call through the service which will handle phone number retrieval and validation
	maskedNumber, err := cmc.callMaskingService.InitiateCallForBooking(req.BookingID, userID.(uint))
	if err != nil {
		logrus.Errorf("Failed to initiate call for booking %d by user %d: %v", req.BookingID, userID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := models.CloudShopeCallResponse{
		Status:  200,
		Message: "success",
		Data: struct {
			Mobile string `json:"mobile"`
		}{
			Mobile: maskedNumber,
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Call initiated successfully", response)
}

// InitiateCloudShopeCall initiates a call using CloudShope API (for testing)
// @Summary Initiate a call using CloudShope
// @Description Initiates a call using CloudShope call masking (for testing purposes)
// @Tags Call Masking
// @Accept json
// @Produce json
// @Param request body models.CloudShopeCallRequest true "CloudShope call request"
// @Success 200 {object} utils.Response{data=models.CloudShopeCallResponse}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/call-masking/cloudshope/call [post]
func (cmc *CallMaskingController) InitiateCloudShopeCall(c *gin.Context) {
	var req models.CloudShopeCallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Validate that the user is either the customer or worker for this booking
	// This validation should be done based on the booking ID and user relationship
	// For now, we'll proceed with the call initiation
	
	maskedNumber, err := cmc.callMaskingService.InitiateCloudShopeCall(req.FromNumber, req.MobileNumber)
	if err != nil {
		logrus.Errorf("Failed to initiate CloudShope call from %s to %s by user %d: %v", req.FromNumber, req.MobileNumber, userID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := models.CloudShopeCallResponse{
		Status:  200,
		Message: "success",
		Data: struct {
			Mobile string `json:"mobile"`
		}{
			Mobile: maskedNumber,
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Call initiated successfully", response)
}
