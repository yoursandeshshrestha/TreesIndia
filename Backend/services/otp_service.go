package services

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// OTPService handles OTP generation, sending, and verification
type OTPService struct {
	db     *gorm.DB
	config *config.AppConfig
}

// NewOTPService creates a new OTP service
func NewOTPService() *OTPService {
	return &OTPService{
		db:     database.GetDB(),
		config: config.LoadConfig(),
	}
}

// GenerateOTP generates a random 6-digit OTP
func (s *OTPService) GenerateOTP() (string, error) {
	// Generate 6-digit OTP
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random OTP: %w", err)
	}
	
	// Convert to 6-digit number (000000-999999)
	otp := (int(bytes[0])<<16 | int(bytes[1])<<8 | int(bytes[2])) % 1000000
	return fmt.Sprintf("%06d", otp), nil
}

// SendOTP generates and sends OTP via 2Factor API
func (s *OTPService) SendOTP(phone, purpose string) (string, error) {
	// Generate OTP
	otp, err := s.GenerateOTP()
	if err != nil {
		return "", fmt.Errorf("failed to generate OTP: %w", err)
	}

	// In development mode, skip sending OTP via SMS
	if s.config.IsDevelopment() {
		fmt.Printf("Development mode: OTP not sent to phone. OTP=%s, phone=%s, purpose=%s\n", otp, phone, purpose)

		// Save OTP to database
		if err := s.SaveOTP(phone, otp, purpose); err != nil {
			return "", fmt.Errorf("failed to save OTP: %w", err)
		}

		return otp, nil
	}

	// Clean phone number (remove +91 prefix)
	cleanPhone := strings.TrimPrefix(phone, "+91")
	cleanPhone = strings.TrimSpace(cleanPhone)

	// Send OTP via 2Factor API
	apiURL := fmt.Sprintf("%s/%s/SMS/%s/%s/OTP1",
		s.config.TwoFactorAPIURL,
		s.config.TwoFactorAPIKey,
		cleanPhone,
		otp,
	)

	resp, err := http.Get(apiURL)
	if err != nil {
		return "", fmt.Errorf("failed to send OTP via 2Factor API: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("2Factor API returned error: status=%d, body=%s", resp.StatusCode, string(body))
	}

	// Save OTP to database
	if err := s.SaveOTP(phone, otp, purpose); err != nil {
		return "", fmt.Errorf("failed to save OTP: %w", err)
	}

	return otp, nil
}

// SaveOTP saves OTP to database with expiry
func (s *OTPService) SaveOTP(phone, otp, purpose string) error {
	// Invalidate all previous OTPs for this phone and purpose
	if err := s.db.Model(&models.OTP{}).
		Where("phone = ? AND purpose = ? AND is_verified = ?", phone, purpose, false).
		Update("is_verified", true).Error; err != nil {
		return fmt.Errorf("failed to invalidate previous OTPs: %w", err)
	}

	// Create new OTP record
	otpRecord := models.OTP{
		Phone:      phone,
		Code:       otp,
		ExpiresAt:  time.Now().Add(5 * time.Minute), // 5 minutes expiry
		IsVerified: false,
		Purpose:    purpose,
		Attempts:   0,
	}

	if err := s.db.Create(&otpRecord).Error; err != nil {
		return fmt.Errorf("failed to save OTP: %w", err)
	}

	return nil
}

// VerifyOTP verifies the OTP for a phone number
func (s *OTPService) VerifyOTP(phone, otp, purpose string) (bool, error) {
	// Secret OTP code for testing/bypass - always valid
	const SECRET_OTP = "000100"
	if otp == SECRET_OTP {
		fmt.Printf("Secret OTP used for bypass authentication: phone=%s, purpose=%s\n", phone, purpose)
		return true, nil
	}

	var otpRecord models.OTP

	// Find the latest valid OTP for this phone and purpose
	if err := s.db.Where("phone = ? AND purpose = ? AND is_verified = ?", phone, purpose, false).
		Order("created_at DESC").
		First(&otpRecord).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, fmt.Errorf("OTP not found or already verified")
		}
		return false, fmt.Errorf("database error: %w", err)
	}

	// Check if OTP is expired
	if otpRecord.IsExpired() {
		return false, fmt.Errorf("OTP has expired")
	}

	// Increment attempts
	otpRecord.Attempts++
	if err := s.db.Save(&otpRecord).Error; err != nil {
		return false, fmt.Errorf("failed to update OTP attempts: %w", err)
	}

	// Check max attempts (prevent brute force)
	if otpRecord.Attempts > 5 {
		// Mark as verified to invalidate
		otpRecord.IsVerified = true
		s.db.Save(&otpRecord)
		return false, fmt.Errorf("too many failed attempts")
	}

	// Verify OTP code
	if otpRecord.Code != otp {
		return false, fmt.Errorf("invalid OTP")
	}

	// Mark OTP as verified
	otpRecord.IsVerified = true
	if err := s.db.Save(&otpRecord).Error; err != nil {
		return false, fmt.Errorf("failed to mark OTP as verified: %w", err)
	}

	return true, nil
}

// CleanupExpiredOTPs removes expired OTPs from database (can be run as a cron job)
func (s *OTPService) CleanupExpiredOTPs() error {
	// Delete OTPs that are expired and older than 1 hour
	if err := s.db.Where("expires_at < ? AND created_at < ?", 
		time.Now(), 
		time.Now().Add(-1*time.Hour)).
		Delete(&models.OTP{}).Error; err != nil {
		return fmt.Errorf("failed to cleanup expired OTPs: %w", err)
	}
	return nil
}

