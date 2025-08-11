package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// AuthController handles authentication requests
type AuthController struct {
	*BaseController
	db *gorm.DB
	authService *services.AuthService
	validationHelper *utils.ValidationHelper
}

// NewAuthController creates a new auth controller
func NewAuthController() *AuthController {
	return &AuthController{
		BaseController:   NewBaseController(),
		db:               database.GetDB(),
		authService:      services.NewAuthService(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// RegisterRequest represents user registration request
type RegisterRequest struct {
	Phone string `json:"phone" binding:"required,min=13,max=13,startswith=+91"`
}

// LoginRequest represents user login request
type LoginRequest struct {
	Phone string `json:"phone" binding:"required,min=13,max=13,startswith=+91"`
}

// VerifyOTPRequest represents OTP verification request
type VerifyOTPRequest struct {
	Phone string `json:"phone" binding:"required,min=13,max=13,startswith=+91"`
	OTP   string `json:"otp" binding:"required,len=4"`
}

// RefreshTokenRequest represents refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// TokenResponse represents JWT token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// Register godoc
// @Summary User registration
// @Description Register a new user with phone number
// @Tags Authentication
// @Accept json
// @Accept multipart/form-data
// @Produce json
// @Param user body RegisterRequest true "User registration data"
// @Param phone formData string true "Phone number (+919876543210)"
// @Success 201 {object} models.Response "User registered successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 409 {object} models.Response "User already exists"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/register [post]
func (ac *AuthController) Register(c *gin.Context) {
	var req RegisterRequest
	
	// Check content type to handle both JSON and form-data
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			// Provide user-friendly error messages
			errorMsg := ac.getUserFriendlyError(err.Error())
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		phone := c.PostForm("phone")
		if phone == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing phone number", "Phone number is required"))
			return
		}
		req.Phone = phone
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Custom phone number validation
	if err := ac.validationHelper.ValidatePhoneNumber(req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid phone number", err.Error()))
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := ac.db.Where("phone = ?", req.Phone).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("User already exists", "Phone number already registered"))
		return
	}

	// Create user
	user := models.User{
		Phone:       req.Phone,
		UserType:    models.UserTypeNormal,
		IsActive:    true,
		KYCStatus:   models.KYCStatusNotNeeded,
		IsVerified:  false,
	}

	if err := ac.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create user", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("User registered successfully. Please verify OTP to continue.", nil))
}

// Login godoc
// @Summary User login
// @Description Login user with phone number
// @Tags Authentication
// @Accept json
// @Accept multipart/form-data
// @Produce json
// @Param credentials body LoginRequest true "Login credentials"
// @Param phone formData string true "Phone number (+919876543210)"
// @Success 200 {object} models.Response "Login successful"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/login [post]
func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	
	// Check content type to handle both JSON and form-data
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			// Provide user-friendly error messages
			errorMsg := ac.getUserFriendlyError(err.Error())
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		phone := c.PostForm("phone")
		if phone == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing phone number", "Phone number is required"))
			return
		}
		req.Phone = phone
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Custom phone number validation
	if err := ac.validationHelper.ValidatePhoneNumber(req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid phone number", err.Error()))
		return
	}

	// Find user by phone
	var user models.User
	if err := ac.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "Please register first"))
		return
	}

	// Check if user is active
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Account disabled", "Your account has been disabled"))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Login successful. Please verify OTP to continue.", nil))
}

// VerifyOTP godoc
// @Summary Verify OTP
// @Description Verify OTP and generate JWT tokens
// @Tags Authentication
// @Accept json
// @Accept multipart/form-data
// @Produce json
// @Param request body VerifyOTPRequest true "OTP verification request"
// @Param phone formData string true "Phone number (+919876543210)"
// @Param otp formData string true "4-digit OTP"
// @Success 200 {object} models.Response "OTP verified successfully"
// @Failure 400 {object} models.Response "Invalid OTP or request data"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/verify-otp [post]
func (ac *AuthController) VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	
	// Check content type to handle both JSON and form-data
	contentType := c.GetHeader("Content-Type")
	
	if strings.Contains(contentType, "application/json") {
		// Handle JSON request
		if err := c.ShouldBindJSON(&req); err != nil {
			// Provide user-friendly error messages
			errorMsg := ac.getUserFriendlyError(err.Error())
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
			return
		}
	} else if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		phone := c.PostForm("phone")
		otp := c.PostForm("otp")
		
		if phone == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing phone number", "Phone number is required"))
			return
		}
		if otp == "" {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing OTP", "OTP is required"))
			return
		}
		
		req.Phone = phone
		req.OTP = otp
	} else {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Unsupported content type", "Please use application/json or multipart/form-data"))
		return
	}

	// Custom phone number validation
	if err := ac.validationHelper.ValidatePhoneNumber(req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid phone number", err.Error()))
		return
	}

	// Find user
	var user models.User
	if err := ac.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "Please register first"))
		return
	}

	// Check if user is active
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Account disabled", "Your account has been disabled"))
		return
	}

	// Verify OTP (hardcoded to "0000" for now)
	if req.OTP != "0000" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid OTP", "OTP is incorrect"))
		return
	}

	// Mark user as verified
	user.IsVerified = true
	
	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	
	if err := ac.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user", err.Error()))
		return
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := ac.generateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to generate tokens", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("OTP verified successfully", gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    3600, // 1 hour in seconds
	}))
}

// Logout godoc
// @Summary User logout
// @Description Logout user and invalidate tokens
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Logout successful"
// @Failure 401 {object} models.Response "Unauthorized"
// @Router /auth/logout [post]
func (ac *AuthController) Logout(c *gin.Context) {
	// TODO: Implement token blacklisting
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Logout successful", nil))
}

// GetCurrentUser godoc
// @Summary Get current user info
// @Description Get current authenticated user information
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "User information retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Router /auth/me [get]
func (ac *AuthController) GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")

	// Get user from database
	var user models.User
	if err := ac.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User information retrieved successfully", gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"phone":      user.Phone,
		"email":      user.Email,
		"user_type":  user.UserType,
		"is_active":  user.IsActive,
		"is_verified": user.IsVerified,
	}))
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Refresh access token using refresh token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} models.Response "Token refreshed successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Invalid refresh token"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/refresh-token [post]
func (ac *AuthController) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorMsg := ac.getUserFriendlyError(err.Error())
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
		return
	}

	// Validate refresh token and extract user information
	userID, phone, err := ac.validateRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Invalid refresh token", err.Error()))
		return
	}

	// Find user
	var user models.User
	if err := ac.db.Where("id = ? AND phone = ?", userID, phone).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User account not found"))
		return
	}

	// Check if user is active
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Account disabled", "Your account has been disabled"))
		return
	}

	// Generate new access and refresh tokens
	accessToken, refreshToken, err := ac.generateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to generate tokens", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Token refreshed successfully", gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    3600, // 1 hour in seconds
	}))
}

// generateTokens generates access and refresh tokens
func (ac *AuthController) generateTokens(user models.User) (string, string, error) {
	// Generate access token (1 hour expiry)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   user.ID,
		"phone":     user.Phone,
		"user_type": user.UserType,
		"exp":       time.Now().Add(time.Hour).Unix(),
		"iat":       time.Now().Unix(),
		"type":      "access",
	})

	// Generate refresh token (30 days expiry)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"phone":   user.Phone,
		"exp":     time.Now().AddDate(0, 0, 30).Unix(), // 30 days
		"iat":     time.Now().Unix(),
		"type":    "refresh",
	})

	// Sign tokens with secret key
	appConfig := config.LoadConfig()
	secretKey := appConfig.JWTSecret
	accessTokenString, err := accessToken.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign access token: %w", err)
	}

	refreshTokenString, err := refreshToken.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return accessTokenString, refreshTokenString, nil
}

// validateRefreshToken validates refresh token and returns user ID and phone number
func (ac *AuthController) validateRefreshToken(refreshToken string) (uint, string, error) {
	// Parse and validate JWT token
	appConfig := config.LoadConfig()
	parsedToken, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(appConfig.JWTSecret), nil
	})

	if err != nil {
		return 0, "", fmt.Errorf("invalid refresh token: %w", err)
	}

	// Check if token is valid
	if !parsedToken.Valid {
		return 0, "", fmt.Errorf("refresh token is invalid or expired")
	}

	// Extract claims
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", fmt.Errorf("invalid refresh token claims")
	}

	// Check token type (should be refresh token)
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return 0, "", fmt.Errorf("invalid refresh token type")
	}

	// Extract user ID and phone number
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return 0, "", fmt.Errorf("user ID not found in refresh token")
	}

	phone, ok := claims["phone"].(string)
	if !ok {
		return 0, "", fmt.Errorf("phone not found in refresh token")
	}

	return uint(userID), phone, nil
}

// getUserFriendlyError converts technical validation errors to user-friendly messages
func (ac *AuthController) getUserFriendlyError(errorMsg string) string {
	if strings.Contains(errorMsg, "RegisterRequest.Phone") || 
	   strings.Contains(errorMsg, "LoginRequest.Phone") || 
	   strings.Contains(errorMsg, "VerifyOTPRequest.Phone") {
		
		if strings.Contains(errorMsg, "required") {
			return "Phone number is required"
		} else if strings.Contains(errorMsg, "min") {
			return "Phone number must be at least 13 characters (e.g., +919876543210)"
		} else if strings.Contains(errorMsg, "max") {
			return "Phone number must be exactly 13 characters (e.g., +919876543210)"
		} else if strings.Contains(errorMsg, "startswith") {
			return "Phone number must start with +91 (e.g., +919876543210)"
		} else {
			return "Please enter a valid Indian mobile number (e.g., +919876543210)"
		}
	}
	
	if strings.Contains(errorMsg, "VerifyOTPRequest.OTP") {
		if strings.Contains(errorMsg, "required") {
			return "OTP is required"
		} else if strings.Contains(errorMsg, "len") {
			return "OTP must be exactly 4 digits"
		} else {
			return "Please enter a valid 4-digit OTP"
		}
	}
	
	if strings.Contains(errorMsg, "RefreshTokenRequest.RefreshToken") {
		if strings.Contains(errorMsg, "required") {
			return "Refresh token is required"
		} else {
			return "Please provide a valid refresh token"
		}
	}
	
	// Default fallback
	return "Please check your input and try again"
}


