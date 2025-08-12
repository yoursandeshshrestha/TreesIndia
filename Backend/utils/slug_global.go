// Package utils provides global utility functions for the TREESINDIA application.
//
// This file contains global slug utility functions that can be used directly
// without creating SlugHelper instances. These are convenience functions
// that wrap the SlugHelper methods for easier usage.
//
// Global Functions Available:
//   - GenerateSlug(name string) string
//   - GenerateUniqueSlug(baseName string, existsFunc func(string) bool) string
//   - ValidateSlug(slug string) error
//   - NormalizeSlug(input string) string
//   - Slugify(input string) string
//   - GenerateSlugFromMultiple(fields ...string) string
//   - IsSlugValid(slug string) bool
//
// Quick Usage Examples:
//   import "treesindia/utils"
//
//   // Basic slug generation
//   slug := utils.GenerateSlug("Plumbing Services") // Returns "plumbing-services"
//
//   // Generate unique slug with database check
//   existsFunc := func(slug string) bool {
//       // Check if slug exists in database
//       return false // Replace with actual check
//   }
//   uniqueSlug := utils.GenerateUniqueSlug("John Doe", existsFunc)
//
//   // Validate existing slug
//   isValid := utils.IsSlugValid("my-slug") // Returns true/false
//
//   // Generate slug from multiple fields
//   userSlug := utils.GenerateSlugFromMultiple("John", "Doe") // Returns "john-doe"
//
//   // Handle complex strings
//   complexSlug := utils.Slugify("AC Repair & Installation!") // Returns "ac-repair-and-installation"
package utils

// Global slug utility functions for direct usage

// GenerateSlug generates a URL-friendly slug from a name
// This is a convenience function that can be used directly
func GenerateSlug(name string) string {
	slugHelper := NewSlugHelper()
	return slugHelper.GenerateSlug(name)
}

// GenerateUniqueSlug generates a unique slug by appending a number if the base slug already exists
// This is a convenience function that can be used directly
func GenerateUniqueSlug(baseName string, existsFunc func(string) bool) string {
	slugHelper := NewSlugHelper()
	return slugHelper.GenerateUniqueSlug(baseName, existsFunc)
}

// ValidateSlug validates slug format
// This is a convenience function that can be used directly
func ValidateSlug(slug string) error {
	slugHelper := NewSlugHelper()
	return slugHelper.ValidateSlug(slug)
}

// NormalizeSlug normalizes a slug to ensure it follows the proper format
// This is a convenience function that can be used directly
func NormalizeSlug(input string) string {
	slugHelper := NewSlugHelper()
	return slugHelper.NormalizeSlug(input)
}

// Slugify converts any string to a slug format
// This is a convenience function that can be used directly
func Slugify(input string) string {
	slugHelper := NewSlugHelper()
	return slugHelper.Slugify(input)
}

// GenerateSlugFromMultiple generates a slug from multiple fields
// This is a convenience function that can be used directly
func GenerateSlugFromMultiple(fields ...string) string {
	slugHelper := NewSlugHelper()
	return slugHelper.GenerateSlugFromMultiple(fields...)
}

// IsSlugValid checks if a slug is valid without returning an error
// This is a convenience function that can be used directly
func IsSlugValid(slug string) bool {
	slugHelper := NewSlugHelper()
	return slugHelper.IsSlugValid(slug)
}
