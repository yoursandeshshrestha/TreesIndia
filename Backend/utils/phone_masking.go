package utils

import (
	"regexp"
	"strings"
)

// MaskPhoneNumber masks a phone number by showing only the first few digits and replacing the rest with asterisks
// Example: +919609321667 -> +91960********
func MaskPhoneNumber(phone string) string {
	if phone == "" {
		return phone
	}

	// Remove any whitespace
	phone = strings.TrimSpace(phone)
	
	// If phone is too short, return as is
	if len(phone) < 6 {
		return phone
	}

	// For Indian phone numbers starting with +91, show first 6 characters and mask the rest
	if strings.HasPrefix(phone, "+91") && len(phone) >= 10 {
		// Keep first 6 characters (+91XXX) and mask the rest
		masked := phone[:6] + strings.Repeat("*", len(phone)-6)
		return masked
	}

	// For other international numbers, show first 3 characters and mask the rest
	if len(phone) >= 6 {
		// Keep first 3 characters and mask the rest
		masked := phone[:3] + strings.Repeat("*", len(phone)-3)
		return masked
	}

	// For very short numbers, just mask everything except first character
	if len(phone) >= 3 {
		masked := phone[:1] + strings.Repeat("*", len(phone)-1)
		return masked
	}

	return phone
}

// MaskPhoneNumberForDisplay masks phone number for display purposes
// This is a more conservative approach that shows more digits for better UX
func MaskPhoneNumberForDisplay(phone string) string {
	if phone == "" {
		return phone
	}

	// Remove any whitespace
	phone = strings.TrimSpace(phone)
	
	// If phone is too short, return as is
	if len(phone) < 8 {
		return phone
	}

	// For Indian phone numbers starting with +91, show first 6 characters and mask the rest
	if strings.HasPrefix(phone, "+91") && len(phone) >= 10 {
		// Keep first 6 characters (+91XXX) and mask the rest
		masked := phone[:6] + strings.Repeat("*", len(phone)-6)
		return masked
	}

	// For other international numbers, show first 4 characters and mask the rest
	if len(phone) >= 8 {
		// Keep first 4 characters and mask the rest
		masked := phone[:4] + strings.Repeat("*", len(phone)-4)
		return masked
	}

	return phone
}

// IsValidPhoneNumber checks if a phone number is valid
func IsValidPhoneNumber(phone string) bool {
	if phone == "" {
		return false
	}

	// Remove any whitespace
	phone = strings.TrimSpace(phone)
	
	// Basic validation - should start with + and contain only digits and +
	matched, _ := regexp.MatchString(`^\+[0-9]+$`, phone)
	return matched && len(phone) >= 10
}
