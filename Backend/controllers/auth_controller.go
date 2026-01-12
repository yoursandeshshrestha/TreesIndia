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
	db               *gorm.DB
	authService      *services.AuthService
	otpService       *services.OTPService
	validationHelper *utils.ValidationHelper
}

// NewAuthController creates a new auth controller
func NewAuthController() *AuthController {
	return &AuthController{
		BaseController:   NewBaseController(),
		db:               database.GetDB(),
		authService:      services.NewAuthService(),
		otpService:       services.NewOTPService(),
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

// RequestOTPRequest represents OTP request
type RequestOTPRequest struct {
	Phone string `json:"phone" binding:"required,min=13,max=13,startswith=+91"`
}

// VerifyOTPRequest represents OTP verification request
type VerifyOTPRequest struct {
	Phone string `json:"phone" binding:"required,min=13,max=13,startswith=+91"`
	OTP   string `json:"otp" binding:"required,len=6"`
	// Optional device registration info
	DeviceToken string `json:"device_token,omitempty"`
	Platform    string `json:"platform,omitempty"`
	AppVersion  string `json:"app_version,omitempty"`
	DeviceModel string `json:"device_model,omitempty"`
	OSVersion   string `json:"os_version,omitempty"`
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

// RequestOTP godoc
// @Summary Request OTP
// @Description Send OTP to phone number for authentication (creates user if not exists)
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body RequestOTPRequest true "OTP request"
// @Success 200 {object} models.Response "OTP sent successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/request-otp [post]
func (ac *AuthController) RequestOTP(c *gin.Context) {
	var req RequestOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorMsg := ac.getUserFriendlyError(err.Error())
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
		return
	}

	// Custom phone number validation
	if err := ac.validationHelper.ValidatePhoneNumber(req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid phone number", err.Error()))
		return
	}

	// Check if user exists (for existing users, check if account is active)
	var user models.User
	var isExistingUser bool

	if err := ac.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// User doesn't exist yet - will be created after OTP verification
			isExistingUser = false
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
			return
		}
	} else {
		// Existing user - check if account is active
		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Account disabled", "Your account has been disabled"))
			return
		}
		isExistingUser = true
	}

	// Generate and send OTP via 2Factor API
	_, err := ac.otpService.SendOTP(req.Phone, "login")
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to send OTP", "Please try again later"))
		return
	}

	// Send admin notification for OTP request monitoring (only for existing users)
	if isExistingUser {
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("OTP sent successfully", gin.H{
		"phone":       req.Phone,
		"expires_in":  300, // 5 minutes (300 seconds)
		"is_new_user": !isExistingUser,
	}))
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
		Phone:         req.Phone,
		UserType:      models.UserTypeNormal,
		IsActive:      true,
		WalletBalance: 0, // Default 0 balance
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
// @Summary Verify OTP and login
// @Description Verify OTP and generate JWT tokens (auto-registers new users)
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body VerifyOTPRequest true "OTP verification request"
// @Success 200 {object} models.Response "Login successful"
// @Failure 400 {object} models.Response "Invalid OTP or request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /auth/verify-otp [post]
func (ac *AuthController) VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorMsg := ac.getUserFriendlyError(err.Error())
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", errorMsg))
		return
	}

	// Custom phone number validation
	if err := ac.validationHelper.ValidatePhoneNumber(req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid phone number", err.Error()))
		return
	}

	// Verify OTP using OTP service
	valid, err := ac.otpService.VerifyOTP(req.Phone, req.OTP, "login")
	if err != nil || !valid {
		// Try to find user for failed login notification
		var user models.User
		if err := ac.db.Where("phone = ?", req.Phone).First(&user).Error; err == nil {
		}

		errorMessage := "OTP is incorrect"
		if err != nil {
			// Provide more specific error messages
			if strings.Contains(err.Error(), "expired") {
				errorMessage = "OTP has expired. Please request a new one"
			} else if strings.Contains(err.Error(), "not found") {
				errorMessage = "No valid OTP found. Please request a new one"
			} else if strings.Contains(err.Error(), "too many") {
				errorMessage = "Too many failed attempts. Please request a new OTP"
			}
		}

		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid OTP", errorMessage))
		return
	}

	// Find user or create new one
	var user models.User
	var isNewUser bool

	if err := ac.db.Where("phone = ?", req.Phone).Preload("AdminRoles").First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new user
			user = models.User{
				Phone:         req.Phone,
				UserType:      models.UserTypeNormal, // Default role is user
				IsActive:      true,
				WalletBalance: 0, // Default 0 balance
			}

			if err := ac.db.Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create user", err.Error()))
				return
			}
			isNewUser = true
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
			return
		}
	} else {
		// Existing user
		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Account disabled", "Your account has been disabled"))
			return
		}
		isNewUser = false
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now

	if err := ac.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user", err.Error()))
		return
	}

	// Register device if device token is provided
	if req.DeviceToken != "" {
		if err := ac.registerDevice(&user, &req); err != nil {
			// Log error but don't fail the login
		}
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := ac.generateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to generate tokens", err.Error()))
		return
	}

	// User OTP verification and login notifications removed as per user request
	// Send admin notifications for monitoring

	// If new user, also notify admin about new user registration
	if isNewUser {
	}

	// Prepare admin roles for response (if any)
	adminRoleCodes := make([]string, 0)
	if user.UserType == models.UserTypeAdmin {
		for _, role := range user.AdminRoles {
			adminRoleCodes = append(adminRoleCodes, string(role.Code))
		}
	}

	// Get configured JWT expiry for response
	appConfig := config.LoadConfig()
	expiresInSeconds := int64(appConfig.GetJWTExpiry().Seconds())

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Login successful", gin.H{
		"user": gin.H{
			"id":             user.ID,
			"phone":          user.Phone,
			"name":           user.Name,
			"role":           user.UserType,
			"wallet_balance": user.WalletBalance,
			"created_at":     user.CreatedAt,
			"admin_roles":    adminRoleCodes,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    expiresInSeconds,
		"is_new_user":   isNewUser, // Frontend uses this to show onboarding info
	}))
}

// registerDevice registers a device for push notifications
func (ac *AuthController) registerDevice(user *models.User, req *VerifyOTPRequest) error {
	// Validate token length (FCM tokens are typically 140-160 characters)
	if len(req.DeviceToken) < 50 || len(req.DeviceToken) > 500 {
		return fmt.Errorf("invalid token length: token must be between 50 and 500 characters, got %d", len(req.DeviceToken))
	}

	// Check if user has notification settings, create if not
	var notificationSettings models.UserNotificationSettings
	if err := ac.db.Where("user_id = ?", user.ID).First(&notificationSettings).Error; err != nil {
		// Create default notification settings
		notificationSettings = models.UserNotificationSettings{
			UserID:             user.ID,
			PushNotifications:  true,
			EmailNotifications: true,
			SMSNotifications:   true,
			MarketingEmails:    false,
			BookingReminders:   true,
			ServiceUpdates:     true,
		}
		if err := ac.db.Create(&notificationSettings).Error; err != nil {
			return fmt.Errorf("failed to create notification settings: %w", err)
		}
	}

	// Check if push notifications are enabled
	if !notificationSettings.PushNotifications {
		return fmt.Errorf("push notifications are disabled for this user")
	}

	// Check if token already exists
	var existingToken models.DeviceToken
	if err := ac.db.Where("token = ?", req.DeviceToken).First(&existingToken).Error; err == nil {
		// Token exists, update it
		updates := map[string]interface{}{
			"user_id":      user.ID,
			"platform":     req.Platform,
			"app_version":  req.AppVersion,
			"device_model": req.DeviceModel,
			"os_version":   req.OSVersion,
			"is_active":    true,
			"last_used_at": time.Now(),
			"updated_at":   time.Now(),
		}

		if err := ac.db.Model(&existingToken).Updates(updates).Error; err != nil {
			return fmt.Errorf("failed to update existing token: %w", err)
		}
		return nil
	}

	// Create new device token
	deviceToken := models.DeviceToken{
		UserID:      user.ID,
		Token:       req.DeviceToken,
		Platform:    models.DevicePlatform(req.Platform),
		AppVersion:  req.AppVersion,
		DeviceModel: req.DeviceModel,
		OSVersion:   req.OSVersion,
		IsActive:    true,
		LastUsedAt:  &time.Time{},
	}

	if err := ac.db.Create(&deviceToken).Error; err != nil {
		return fmt.Errorf("failed to create device token: %w", err)
	}

	return nil
}

// RegisterDeviceAfterLogin registers a device after user has already logged in
func (ac *AuthController) RegisterDeviceAfterLogin(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, views.CreateErrorResponse("Unauthorized", "User not authenticated"))
		return
	}

	var req struct {
		DeviceToken string `json:"device_token" binding:"required"`
		Platform    string `json:"platform" binding:"required"`
		AppVersion  string `json:"app_version"`
		DeviceModel string `json:"device_model"`
		OSVersion   string `json:"os_version"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Validate token length (FCM tokens are typically 140-160 characters)
	if len(req.DeviceToken) < 50 || len(req.DeviceToken) > 500 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid token length", fmt.Sprintf("Token must be between 50 and 500 characters, got %d", len(req.DeviceToken))))
		return
	}

	// Get user
	var user models.User
	if err := ac.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", err.Error()))
		return
	}

	// Register device
	deviceReq := &VerifyOTPRequest{
		DeviceToken: req.DeviceToken,
		Platform:    req.Platform,
		AppVersion:  req.AppVersion,
		DeviceModel: req.DeviceModel,
		OSVersion:   req.OSVersion,
	}

	if err := ac.registerDevice(&user, deviceReq); err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to register device", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Device registered successfully", nil))
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

	// Check subscription status
	subscriptionService := services.NewUserSubscriptionService()
	userWithSubscription, err := subscriptionService.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		// If subscription check fails, use the original user data
		userWithSubscription = &user
	}

	// Determine subscription status
	subscriptionStatus := "inactive"
	if userWithSubscription.HasActiveSubscription {
		subscriptionStatus = "active"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User information retrieved successfully", gin.H{
		"id":             user.ID,
		"name":           user.Name,
		"phone":          user.Phone,
		"email":          user.Email,
		"avatar":         user.Avatar,
		"user_type":      user.UserType,
		"is_active":      user.IsActive,
		"wallet_balance": user.WalletBalance,
		"subscription":   subscriptionStatus,
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
	if err := ac.db.Where("id = ? AND phone = ?", userID, phone).Preload("AdminRoles").First(&user).Error; err != nil {
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

	// Prepare admin roles for response (if any)
	adminRoleCodes := make([]string, 0)
	if user.UserType == models.UserTypeAdmin {
		for _, role := range user.AdminRoles {
			adminRoleCodes = append(adminRoleCodes, string(role.Code))
		}
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Token refreshed successfully", gin.H{
		"user": gin.H{
			"id":             user.ID,
			"phone":          user.Phone,
			"name":           user.Name,
			"role":           user.UserType,
			"wallet_balance": user.WalletBalance,
			"created_at":     user.CreatedAt,
			"admin_roles":    adminRoleCodes,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    int64(appConfig.GetJWTExpiry().Seconds()),
		"is_new_user":   false, // Always false for refresh token (user already exists)
	}))
}

// generateTokens generates access and refresh tokens
func (ac *AuthController) generateTokens(user models.User) (string, string, error) {
	// Load admin roles for admin users so they can be embedded in JWT
	var adminRoleCodes []string
	if user.UserType == models.UserTypeAdmin {
		var loadedUser models.User
		if err := ac.db.Preload("AdminRoles").First(&loadedUser, user.ID).Error; err == nil {
			for _, role := range loadedUser.AdminRoles {
				adminRoleCodes = append(adminRoleCodes, string(role.Code))
			}
		}
	}

	// Load config first to get expiry settings
	appConfig := config.LoadConfig()

	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"phone":     user.Phone,
		"user_type": user.UserType,
		"exp":       time.Now().Add(appConfig.GetJWTExpiry()).Unix(),
		"iat":       time.Now().Unix(),
		"type":      "access",
	}
	if len(adminRoleCodes) > 0 {
		claims["admin_roles"] = adminRoleCodes
	}

	// Generate access token with configured expiry
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate refresh token with configured expiry
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"phone":   user.Phone,
		"exp":     time.Now().Add(appConfig.GetRefreshExpiry()).Unix(),
		"iat":     time.Now().Unix(),
		"type":    "refresh",
	})

	// Sign tokens with secret key
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
			return "OTP must be exactly 6 digits"
		} else {
			return "Please enter a valid 6-digit OTP"
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
