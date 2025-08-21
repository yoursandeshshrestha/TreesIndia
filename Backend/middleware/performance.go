package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// PerformanceMiddleware tracks response times and logs performance metrics
func PerformanceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Process request
		c.Next()
		
		// Calculate response time
		duration := time.Since(start)
		
		// Log performance metrics
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		
		// Log based on response time thresholds
		switch {
		case duration > 10*time.Second:
			logrus.Errorf("SLOW REQUEST: %s %s - %d - %v", method, path, status, duration)
		case duration > 5*time.Second:
			logrus.Warnf("SLOW REQUEST: %s %s - %d - %v", method, path, status, duration)
		case duration > 1*time.Second:
			logrus.Infof("MODERATE REQUEST: %s %s - %d - %v", method, path, status, duration)
		default:
			// Fast requests don't need logging
		}
		
		// Add performance headers
		c.Header("X-Response-Time", duration.String())
		c.Header("X-Request-ID", c.GetString("request_id"))
	}
}

// RequestIDMiddleware adds a unique request ID for tracking
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// randomString generates a random string of specified length
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
