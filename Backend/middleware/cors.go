package middleware

import (
	"net/http"
	"strings"
	"treesindia/config"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// CORSMiddleware creates a CORS middleware with configurable origins
func CORSMiddleware(config *config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		allowed := isOriginAllowed(origin, config.CORSAllowedOrigins)
		
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			logrus.Debugf("CORS: Origin %s not allowed", origin)
		}
		
		// Set CORS headers
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", strings.Join(config.CORSAllowedMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(config.CORSAllowedHeaders, ", "))
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Max-Age", "86400") // 24 hours
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}

// isOriginAllowed checks if the given origin is in the allowed origins list
func isOriginAllowed(origin string, allowedOrigins []string) bool {
	// If no origin is provided, deny
	if origin == "" {
		return false
	}
	
	// If wildcard is allowed, accept all origins (not recommended for production)
	if len(allowedOrigins) == 1 && allowedOrigins[0] == "*" {
		return true
	}
	
	// Check if origin is in the allowed list
	for _, allowed := range allowedOrigins {
		if allowed == origin {
			return true
		}
	}
	
	return false
}

// SecureCORSMiddleware creates a more secure CORS middleware for production
func SecureCORSMiddleware(config *config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		allowed := isOriginAllowed(origin, config.CORSAllowedOrigins)
		
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			// In production, don't set Access-Control-Allow-Origin for disallowed origins
			if config.IsProduction() {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		}
		
		// Set security headers
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", strings.Join(config.CORSAllowedMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(config.CORSAllowedHeaders, ", "))
		
		// Additional security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Max-Age", "86400") // 24 hours
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}
