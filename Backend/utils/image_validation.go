package utils

import "strings"

// IsValidImageType checks if the content type is a valid image type
func IsValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/webp",
	}
	
	for _, validType := range validTypes {
		if strings.EqualFold(contentType, validType) {
			return true
		}
	}
	return false
}

// IsValidVideoType checks if the content type is a valid video type
func IsValidVideoType(contentType string) bool {
	validTypes := []string{
		"video/mp4",
		"video/webm",
		"video/avi",
		"video/quicktime", // .mov files
		"video/x-msvideo", // .avi files
	}
	
	for _, validType := range validTypes {
		if strings.EqualFold(contentType, validType) {
			return true
		}
	}
	return false
}

// GetMediaType determines if the file is an image or video
func GetMediaType(contentType string) string {
	if IsValidImageType(contentType) {
		return "image"
	}
	if IsValidVideoType(contentType) {
		return "video"
	}
	return ""
}
