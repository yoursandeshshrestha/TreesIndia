package utils

import (
	"fmt"
	"regexp"
	"strings"
)

// ValidationHelper provides validation utilities
type ValidationHelper struct{}

// NewValidationHelper creates a new validation helper
func NewValidationHelper() *ValidationHelper {
	return &ValidationHelper{}
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors represents multiple validation errors
type ValidationErrors []ValidationError

// Add adds a validation error
func (ve *ValidationErrors) Add(field, message string) {
	*ve = append(*ve, ValidationError{Field: field, Message: message})
}

// HasErrors checks if there are any validation errors
func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}

// ToMap converts validation errors to a map
func (ve ValidationErrors) ToMap() map[string]string {
	errors := make(map[string]string)
	for _, err := range ve {
		errors[err.Field] = err.Message
	}
	return errors
}

// ValidatePhoneNumber validates Indian mobile phone numbers
func (vh *ValidationHelper) ValidatePhoneNumber(phone string) error {
	// Check if phone starts with +91
	if !strings.HasPrefix(phone, "+91") {
		return fmt.Errorf("phone number must start with +91")
	}

	// Extract the number part (after +91)
	number := phone[3:]
	
	// Check length (should be exactly 10 digits)
	if len(number) != 10 {
		return fmt.Errorf("phone number must be exactly 10 digits after +91")
	}

	// Check if all characters are digits
	for _, char := range number {
		if char < '0' || char > '9' {
			return fmt.Errorf("phone number must contain only digits")
		}
	}

	// Check if it starts with valid Indian mobile prefixes
	firstDigit := number[0]
	validPrefixes := []byte{'6', '7', '8', '9'}
	
	isValidPrefix := false
	for _, prefix := range validPrefixes {
		if firstDigit == prefix {
			isValidPrefix = true
			break
		}
	}
	
	if !isValidPrefix {
		return fmt.Errorf("phone number must start with 6, 7, 8, or 9")
	}

	return nil
}

// ValidateEmail validates email format
func (vh *ValidationHelper) ValidateEmail(email string) error {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

// ValidateOTP validates OTP format
func (vh *ValidationHelper) ValidateOTP(otp string) error {
	if len(otp) != 4 {
		return fmt.Errorf("OTP must be exactly 4 digits")
	}
	
	for _, char := range otp {
		if char < '0' || char > '9' {
			return fmt.Errorf("OTP must contain only digits")
		}
	}
	
	return nil
}

// ValidateSlug validates slug format
func (vh *ValidationHelper) ValidateSlug(slug string) error {
	slugHelper := NewSlugHelper()
	return slugHelper.ValidateSlug(slug)
}

// GenerateSlug generates a URL-friendly slug from a name
func (vh *ValidationHelper) GenerateSlug(name string) string {
	slugHelper := NewSlugHelper()
	return slugHelper.GenerateSlug(name)
}

// ValidateFileSize validates file size
func (vh *ValidationHelper) ValidateFileSize(size int64, maxSize int64) error {
	if size > maxSize {
		return fmt.Errorf("file size must be less than %d bytes", maxSize)
	}
	return nil
}

// ValidateFileType validates file type based on content type
func (vh *ValidationHelper) ValidateFileType(contentType string, allowedTypes []string) error {
	for _, allowedType := range allowedTypes {
		if strings.HasPrefix(contentType, allowedType) {
			return nil
		}
	}
	return fmt.Errorf("file type not allowed. Allowed types: %s", strings.Join(allowedTypes, ", "))
}
