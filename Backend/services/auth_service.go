package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"
	"treesindia/utils"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// AuthService handles authentication business logic
type AuthService struct {
	db               *gorm.DB
	validationHelper *utils.ValidationHelper
}

// NewAuthService creates a new auth service
func NewAuthService() *AuthService {
	return &AuthService{
		db:               database.GetDB(),
		validationHelper: utils.NewValidationHelper(),
	}
}

// RegisterUser registers a new user
func (as *AuthService) RegisterUser(phone string) (*models.User, error) {
	// Validate phone number
	if err := as.validationHelper.ValidatePhoneNumber(phone); err != nil {
		return nil, fmt.Errorf("invalid phone number: %w", err)
	}

	// Check if user already exists
	var existingUser models.User
	if err := as.db.Where("phone = ?", phone).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("user already exists")
	}

	// Create new user
	user := models.User{
		Phone:       phone,
		UserType:    models.UserTypeNormal,
		IsActive:    true,
	}

	if err := as.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

// LoginUser handles user login
func (as *AuthService) LoginUser(phone string) (*models.User, error) {
	// Validate phone number
	if err := as.validationHelper.ValidatePhoneNumber(phone); err != nil {
		return nil, fmt.Errorf("invalid phone number: %w", err)
	}

	// Find user by phone
	var user models.User
	if err := as.db.Where("phone = ?", phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Check if user is active
	if !user.IsActive {
		return nil, fmt.Errorf("account disabled")
	}

	return &user, nil
}

// VerifyOTP verifies OTP and generates tokens
func (as *AuthService) VerifyOTP(phone, otp string) (*models.User, *TokenResponse, error) {
	// Validate phone number
	if err := as.validationHelper.ValidatePhoneNumber(phone); err != nil {
		return nil, nil, fmt.Errorf("invalid phone number: %w", err)
	}

	// Validate OTP
	if err := as.validationHelper.ValidateOTP(otp); err != nil {
		return nil, nil, fmt.Errorf("invalid OTP: %w", err)
	}

	// Find user
	var user models.User
	if err := as.db.Where("phone = ?", phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, fmt.Errorf("user not found")
		}
		return nil, nil, fmt.Errorf("database error: %w", err)
	}

	// Check if user is active
	if !user.IsActive {
		return nil, nil, fmt.Errorf("account disabled")
	}

	// Verify OTP (hardcoded to "0000" for now)
	if otp != "0000" {
		return nil, nil, fmt.Errorf("invalid OTP")
	}

	// Mark user as verified and update last login
	now := time.Now()
	user.LastLoginAt = &now

	if err := as.db.Save(&user).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Generate tokens
	tokens, err := as.generateTokens(user)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &user, tokens, nil
}

// RefreshToken refreshes access token
func (as *AuthService) RefreshToken(refreshToken string) (*models.User, *TokenResponse, error) {
	// Validate refresh token and extract user information
	userID, phone, err := as.validateRefreshToken(refreshToken)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Find user
	var user models.User
	if err := as.db.First(&user, userID).Error; err != nil {
		return nil, nil, fmt.Errorf("user not found: %w", err)
	}

	// Verify phone matches
	if user.Phone != phone {
		return nil, nil, fmt.Errorf("token mismatch")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, nil, fmt.Errorf("account disabled")
	}

	// Generate new tokens
	tokens, err := as.generateTokens(user)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &user, tokens, nil
}

// GetCurrentUser gets current user information
func (as *AuthService) GetCurrentUser(userID uint) (*models.User, error) {
	var user models.User
	if err := as.db.First(&user, userID).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return &user, nil
}

// TokenResponse represents JWT token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// generateTokens generates access and refresh tokens
func (as *AuthService) generateTokens(user models.User) (*TokenResponse, error) {
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
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	refreshTokenString, err := refreshToken.SignedString([]byte(secretKey))
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    3600, // 1 hour in seconds
	}, nil
}

// validateRefreshToken validates refresh token and returns user ID and phone number
func (as *AuthService) validateRefreshToken(refreshToken string) (uint, string, error) {
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
