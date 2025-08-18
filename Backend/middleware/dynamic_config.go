package middleware

import (
	"net/http"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// DynamicConfigMiddleware provides dynamic configuration checking middleware
type DynamicConfigMiddleware struct {
	configChecker *services.DynamicConfigChecker
}

// NewDynamicConfigMiddleware creates a new dynamic config middleware
func NewDynamicConfigMiddleware() *DynamicConfigMiddleware {
	return &DynamicConfigMiddleware{
		configChecker: services.NewDynamicConfigChecker(),
	}
}

// CheckFeatureEnabled middleware checks if a feature is enabled
func (dcm *DynamicConfigMiddleware) CheckFeatureEnabled(featureKey string, defaultValue bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !dcm.configChecker.IsFeatureEnabled(featureKey, defaultValue) {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse(
				"Feature disabled",
				"This feature is currently disabled by administrator",
			))
			c.Abort()
			return
		}
		c.Next()
	}
}

// CheckPermission middleware checks if a permission is granted
func (dcm *DynamicConfigMiddleware) CheckPermission(permissionKey string, defaultValue bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !dcm.configChecker.CheckPermission(permissionKey, defaultValue) {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse(
				"Permission denied",
				"You don't have permission to perform this action",
			))
			c.Abort()
			return
		}
		c.Next()
	}
}

// BookingSystem middleware checks if booking system is enabled
func (dcm *DynamicConfigMiddleware) BookingSystem() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if booking system is enabled
		if !dcm.configChecker.IsBookingEnabled() {
			c.JSON(http.StatusServiceUnavailable, views.CreateErrorResponse(
				"Booking system disabled",
				"The booking system is currently disabled. Please try again later.",
			))
			c.Abort()
			return
		}
		c.Next()
	}
}

// RateLimit middleware applies dynamic rate limiting
func (dcm *DynamicConfigMiddleware) RateLimit(limitKey string, defaultLimit int) gin.HandlerFunc {
	return func(c *gin.Context) {
		_ = dcm.configChecker.GetLimit(limitKey, "int", defaultLimit).(int)
		// Here you would implement actual rate limiting logic
		// For now, we'll just pass through
		c.Next()
	}
}

// FileUploadLimit middleware checks file upload limits
func (dcm *DynamicConfigMiddleware) FileUploadLimit(limitKey string, defaultLimit int) gin.HandlerFunc {
	return func(c *gin.Context) {
		limit := dcm.configChecker.GetLimit(limitKey, "int", defaultLimit).(int)
		// Store the limit in context for use in handlers
		c.Set("file_upload_limit_mb", limit)
		c.Next()
	}
}
