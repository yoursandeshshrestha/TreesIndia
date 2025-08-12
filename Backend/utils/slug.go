// Package utils provides global utility functions for the TREESINDIA application.
// 
// SlugHelper provides comprehensive slug generation and validation utilities.
// Slugs are URL-friendly versions of strings, typically used for:
// - Category URLs (e.g., "plumbing-services")
// - User profile URLs (e.g., "john-doe")
// - Service URLs (e.g., "ac-repair-mumbai")
// - Blog post URLs (e.g., "how-to-fix-leaky-faucet")
//
// Usage Examples:
//   slugHelper := NewSlugHelper()
//   slug := slugHelper.GenerateSlug("Plumbing Services") // Returns "plumbing-services"
//   uniqueSlug := slugHelper.GenerateUniqueSlug("John Doe", existsFunc) // Returns "john-doe" or "john-doe-1"
//   isValid := slugHelper.IsSlugValid("my-slug") // Returns true/false
//
// For direct usage without creating instances, see slug_global.go
package utils

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// SlugHelper provides slug generation and validation utilities
type SlugHelper struct{}

// NewSlugHelper creates a new slug helper
func NewSlugHelper() *SlugHelper {
	return &SlugHelper{}
}

// GenerateSlug generates a URL-friendly slug from a name
func (sh *SlugHelper) GenerateSlug(name string) string {
	if name == "" {
		return ""
	}

	// Convert to lowercase
	slug := strings.ToLower(name)
	
	// Replace spaces and underscores with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	
	// Remove special characters and keep only alphanumeric and hyphens
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}
	
	slug = result.String()
	
	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}

// GenerateUniqueSlug generates a unique slug by appending a number if the base slug already exists
func (sh *SlugHelper) GenerateUniqueSlug(baseName string, existsFunc func(string) bool) string {
	baseSlug := sh.GenerateSlug(baseName)
	slug := baseSlug
	counter := 1
	
	// Keep trying until we find a unique slug
	for existsFunc(slug) {
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}
	
	return slug
}

// ValidateSlug validates slug format
func (sh *SlugHelper) ValidateSlug(slug string) error {
	if slug == "" {
		return fmt.Errorf("slug cannot be empty")
	}
	
	// Check length
	if len(slug) < 2 {
		return fmt.Errorf("slug must be at least 2 characters long")
	}
	
	if len(slug) > 100 {
		return fmt.Errorf("slug must be less than 100 characters")
	}
	
	// Check format using regex
	slugRegex := regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	if !slugRegex.MatchString(slug) {
		return fmt.Errorf("slug must contain only lowercase letters, numbers, and hyphens")
	}
	
	// Check for reserved words (optional - can be extended)
	reservedWords := []string{"admin", "api", "auth", "login", "logout", "register", "profile", "settings"}
	for _, reserved := range reservedWords {
		if slug == reserved {
			return fmt.Errorf("slug cannot be a reserved word: %s", reserved)
		}
	}
	
	return nil
}

// NormalizeSlug normalizes a slug to ensure it follows the proper format
func (sh *SlugHelper) NormalizeSlug(input string) string {
	return sh.GenerateSlug(input)
}

// Slugify converts any string to a slug format
func (sh *SlugHelper) Slugify(input string) string {
	if input == "" {
		return ""
	}
	
	// Convert to lowercase
	result := strings.ToLower(input)
	
	// Replace common special characters
	replacements := map[string]string{
		"&": "and",
		"@": "at",
		"#": "hash",
		"$": "dollar",
		"%": "percent",
		"*": "star",
		"+": "plus",
		"=": "equals",
		"|": "or",
		"\\": "backslash",
		"/": "slash",
		"<": "less",
		">": "greater",
		"(": "",
		")": "",
		"[": "",
		"]": "",
		"{": "",
		"}": "",
		"'": "",
		"\"": "",
		"`": "",
		"~": "",
		"!": "",
		"?": "",
		".": "",
		",": "",
		":": "",
		";": "",
	}
	
	for old, new := range replacements {
		result = strings.ReplaceAll(result, old, new)
	}
	
	// Replace spaces and underscores with hyphens
	result = strings.ReplaceAll(result, " ", "-")
	result = strings.ReplaceAll(result, "_", "-")
	
	// Remove non-alphanumeric characters except hyphens
	var cleaned strings.Builder
	for _, char := range result {
		if unicode.IsLetter(char) || unicode.IsDigit(char) || char == '-' {
			cleaned.WriteRune(char)
		}
	}
	
	result = cleaned.String()
	
	// Remove multiple consecutive hyphens
	for strings.Contains(result, "--") {
		result = strings.ReplaceAll(result, "--", "-")
	}
	
	// Remove leading and trailing hyphens
	result = strings.Trim(result, "-")
	
	return result
}

// GenerateSlugFromMultiple generates a slug from multiple fields (e.g., first name + last name)
func (sh *SlugHelper) GenerateSlugFromMultiple(fields ...string) string {
	combined := strings.Join(fields, " ")
	return sh.GenerateSlug(combined)
}

// IsSlugValid checks if a slug is valid without returning an error
func (sh *SlugHelper) IsSlugValid(slug string) bool {
	return sh.ValidateSlug(slug) == nil
}
