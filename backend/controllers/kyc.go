package controllers

import (
	"net/http"
	"treesindia/config"
	"treesindia/models"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// KYCController handles KYC operations
type KYCController struct {
	db *gorm.DB
}

// NewKYCController creates a new KYC controller
func NewKYCController() *KYCController {
	return &KYCController{
		db: config.GetDB(),
	}
}

// KYCRequest represents KYC submission request
type KYCRequest struct {
	AadhaarNumber      string   `json:"aadhaar_number" binding:"required"`
	AadhaarFront       string   `json:"aadhaar_front" binding:"required"`
	AadhaarBack        string   `json:"aadhaar_back" binding:"required"`
	PANNumber          string   `json:"pan_number" binding:"required"`
	PANCard            string   `json:"pan_card" binding:"required"`
	AddressProof       string   `json:"address_proof" binding:"required"`
	AddressType        string   `json:"address_type" binding:"required"`
	SkillCertificates  []string `json:"skill_certificates,omitempty"`
	ExperienceProof    string   `json:"experience_proof,omitempty"`
	BrokerLicenseDoc   string   `json:"broker_license_doc,omitempty"`
	AgencyCertificate  string   `json:"agency_certificate,omitempty"`
}

// SubmitKYC godoc
// @Summary Submit KYC documents
// @Description Submit KYC verification documents for workers and brokers
// @Tags KYC
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body KYCRequest true "KYC submission request"
// @Success 201 {object} models.Response "KYC submitted successfully"
// @Failure 400 {object} models.Response "Invalid request data or KYC not required"
// @Failure 409 {object} models.Response "KYC already submitted"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /kyc/submit [post]
func (kc *KYCController) SubmitKYC(c *gin.Context) {
	userID := c.GetUint("user_id")
	userType := c.GetString("user_type")

	// Check if user is eligible for KYC
	if userType == string(models.UserTypeNormal) {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("KYC not required", "Normal users don't need KYC verification"))
		return
	}

	// Check if KYC already exists
	var existingKYC models.KYC
	if err := kc.db.Where("user_id = ?", userID).First(&existingKYC).Error; err == nil {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("KYC already submitted", "KYC documents have already been submitted"))
		return
	}

	var req KYCRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Create KYC record
	kyc := models.KYC{
		UserID:             userID,
		AadhaarNumber:      req.AadhaarNumber,
		AadhaarFront:       req.AadhaarFront,
		AadhaarBack:        req.AadhaarBack,
		PANNumber:          req.PANNumber,
		PANCard:            req.PANCard,
		AddressProof:       req.AddressProof,
		AddressType:        req.AddressType,
		SkillCertificates:  req.SkillCertificates,
		ExperienceProof:    req.ExperienceProof,
		BrokerLicenseDoc:   req.BrokerLicenseDoc,
		AgencyCertificate:  req.AgencyCertificate,
		Status:             models.KYCStatusPending,
	}

	if err := kc.db.Create(&kyc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to submit KYC", err.Error()))
		return
	}

	// Update user KYC status
	var user models.User
	if err := kc.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user", err.Error()))
		return
	}

	user.KYCStatus = models.KYCStatusPending
	if err := kc.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user status", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("KYC submitted successfully", gin.H{
		"kyc": kyc,
		"message": "Your KYC documents have been submitted and are under review",
	}))
}

// GetKYCStatus returns KYC status for the user
func (kc *KYCController) GetKYCStatus(c *gin.Context) {
	userID := c.GetUint("user_id")

	var kyc models.KYC
	if err := kc.db.Where("user_id = ?", userID).First(&kyc).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("KYC not found", "No KYC documents submitted"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch KYC", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("KYC status retrieved", gin.H{
		"kyc": kyc,
	}))
}

// UpdateKYC updates KYC documents
func (kc *KYCController) UpdateKYC(c *gin.Context) {
	userID := c.GetUint("user_id")

	var kyc models.KYC
	if err := kc.db.Where("user_id = ?", userID).First(&kyc).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("KYC not found", "No KYC documents submitted"))
		return
	}

	// Only allow updates if KYC is pending or rejected
	if kyc.Status != models.KYCStatusPending && kyc.Status != models.KYCStatusRejected {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Cannot update KYC", "KYC has already been approved"))
		return
	}

	var req KYCRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Update KYC fields
	kyc.AadhaarNumber = req.AadhaarNumber
	kyc.AadhaarFront = req.AadhaarFront
	kyc.AadhaarBack = req.AadhaarBack
	kyc.PANNumber = req.PANNumber
	kyc.PANCard = req.PANCard
	kyc.AddressProof = req.AddressProof
	kyc.AddressType = req.AddressType
	kyc.SkillCertificates = req.SkillCertificates
	kyc.ExperienceProof = req.ExperienceProof
	kyc.BrokerLicenseDoc = req.BrokerLicenseDoc
	kyc.AgencyCertificate = req.AgencyCertificate
	kyc.Status = models.KYCStatusPending // Reset to pending for review

	if err := kc.db.Save(&kyc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update KYC", err.Error()))
		return
	}

	// Update user KYC status
	var user models.User
	if err := kc.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user", err.Error()))
		return
	}

	user.KYCStatus = models.KYCStatusPending
	if err := kc.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user status", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("KYC updated successfully", gin.H{
		"kyc": kyc,
		"message": "Your KYC documents have been updated and are under review",
	}))
}
