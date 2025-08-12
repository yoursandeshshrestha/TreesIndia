package middleware

import (
	"net/http"
	"strings"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// ResponseMiddleware adds common response headers and handles errors
func ResponseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add common headers (only for JSON responses)
		if !strings.Contains(c.GetHeader("Content-Type"), "multipart/form-data") {
			c.Header("Content-Type", "application/json")
		}
		c.Header("X-Powered-By", "TREESINDIA API")

		// Handle panic recovery
		defer func() {
			if err := recover(); err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse(
					"Internal server error",
					"Something went wrong",
				))
				c.Abort()
			}
		}()

		c.Next()
	}
}

// NotFoundHandler handles 404 errors
func NotFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse(
			"Route not found",
			"The requested endpoint does not exist",
		))
	}
}

// MethodNotAllowedHandler handles 405 errors
func MethodNotAllowedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, views.CreateErrorResponse(
			"Method not allowed",
			"The requested HTTP method is not supported for this endpoint",
		))
	}
}
