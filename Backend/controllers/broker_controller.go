package controllers

import (
	"encoding/json"
	"net/http"
	"treesindia/repositories"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type BrokerController struct {
	BaseController
	brokerRepo *repositories.BrokerRepository
	userRepo   *repositories.UserRepository
}

func NewBrokerController() *BrokerController {
	return &BrokerController{
		BaseController: *NewBaseController(),
		brokerRepo:     repositories.NewBrokerRepository(),
		userRepo:       repositories.NewUserRepository(),
	}
}

// UpdateBrokerProfileRequest represents the request body for updating broker profile
type UpdateBrokerProfileRequest struct {
	ContactInfo struct {
		AlternativeNumber string `json:"alternative_number"`
	} `json:"contact_info" binding:"required"`

	Address struct {
		Street   string `json:"street" binding:"required"`
		City     string `json:"city" binding:"required"`
		State    string `json:"state" binding:"required"`
		Pincode  string `json:"pincode" binding:"required"`
		Landmark string `json:"landmark"`
	} `json:"address" binding:"required"`

	License string `json:"license" binding:"required"`
	Agency  string `json:"agency" binding:"required"`
}

// GetBrokerProfile gets the authenticated broker's profile
// @Summary Get own broker profile
// @Description Get the authenticated broker's profile information
// @Tags Brokers
// @Security BearerAuth
// @Produce json
// @Success 200 {object} views.Response{data=models.Broker}
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Not a broker or not approved"
// @Failure 404 {object} views.Response "Broker profile not found"
// @Router /brokers/profile [get]
func (bc *BrokerController) GetBrokerProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get broker by user ID
	broker, err := bc.brokerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Broker not found for user_id: %d, error: %v", userID, err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Broker profile not found", err.Error()))
		return
	}

	logrus.Infof("Broker profile retrieved successfully for user_id: %d", userID)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Broker profile retrieved successfully", broker))
}

// UpdateBrokerProfile updates the authenticated broker's profile
// @Summary Update broker profile
// @Description Update broker's editable profile fields (contact, address, license, agency). Documents cannot be updated.
// @Tags Brokers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body UpdateBrokerProfileRequest true "Update profile request"
// @Success 200 {object} views.Response{data=models.Broker}
// @Failure 400 {object} views.Response "Invalid request"
// @Failure 401 {object} views.Response "Unauthorized"
// @Failure 403 {object} views.Response "Not approved or not a broker"
// @Failure 404 {object} views.Response "Broker profile not found"
// @Failure 409 {object} views.Response "License already exists"
// @Router /brokers/profile [put]
func (bc *BrokerController) UpdateBrokerProfile(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	// Get broker by user ID
	broker, err := bc.brokerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Broker not found for user_id: %d, error: %v", userID, err)
		ctx.JSON(http.StatusNotFound, views.CreateErrorResponse("Broker profile not found", err.Error()))
		return
	}

	// Check if broker is approved
	if !broker.IsActive {
		logrus.Warnf("Unapproved broker attempted to edit profile: user_id=%d", userID)
		ctx.JSON(http.StatusForbidden, views.CreateErrorResponse(
			"Profile editing not allowed",
			"Your broker application is pending approval or has been rejected",
		))
		return
	}

	// Parse and validate request
	var req UpdateBrokerProfileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logrus.Errorf("Invalid request body: %v", err)
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request body", err.Error()))
		return
	}

	// Additional validation for phone number (if provided)
	if req.ContactInfo.AlternativeNumber != "" && len(req.ContactInfo.AlternativeNumber) < 10 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid alternative number", "Alternative number must be at least 10 digits"))
		return
	}

	// Validate pincode
	if len(req.Address.Pincode) != 6 {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid pincode", "Pincode must be 6 digits"))
		return
	}

	// Validate license is not empty
	if req.License == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid license", "License number is required"))
		return
	}

	// Check if license already exists for a different broker
	if req.License != broker.License {
		exists, err := bc.brokerRepo.CheckLicenseExists(req.License, broker.ID)
		if err != nil {
			logrus.Errorf("Failed to check license uniqueness: %v", err)
			ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to validate license", err.Error()))
			return
		}
		if exists {
			ctx.JSON(http.StatusConflict, views.CreateErrorResponse("License already exists", "This license number is already registered to another broker"))
			return
		}
	}

	// Validate agency is not empty
	if req.Agency == "" {
		ctx.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid agency", "Agency name is required"))
		return
	}

	// Marshal JSON fields
	contactInfoJSON, err := json.Marshal(req.ContactInfo)
	if err != nil {
		logrus.Errorf("Failed to marshal contact_info: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process contact info", err.Error()))
		return
	}

	addressJSON, err := json.Marshal(req.Address)
	if err != nil {
		logrus.Errorf("Failed to marshal address: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to process address", err.Error()))
		return
	}

	// Update ONLY editable fields (exclude documents, is_active)
	broker.ContactInfo = string(contactInfoJSON)
	broker.Address = string(addressJSON)
	broker.License = req.License
	broker.Agency = req.Agency

	// Save updates
	if err := bc.brokerRepo.Update(broker); err != nil {
		logrus.Errorf("Failed to update broker profile: %v", err)
		ctx.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update profile", err.Error()))
		return
	}

	// Fetch updated broker to return
	updatedBroker, err := bc.brokerRepo.GetByUserID(userID)
	if err != nil {
		logrus.Errorf("Failed to fetch updated broker: %v", err)
		// Still return success since update worked
		ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Profile updated successfully", broker))
		return
	}

	logrus.Infof("Broker profile updated successfully for user_id: %d", userID)
	ctx.JSON(http.StatusOK, views.CreateSuccessResponse("Profile updated successfully", updatedBroker))
}
