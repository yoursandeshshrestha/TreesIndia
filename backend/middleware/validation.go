package middleware

import (
	"net/http"
	"strconv"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrorResponse represents a validation error response
type ValidationErrorResponse struct {
	Success        bool             `json:"success"`
	Message        string           `json:"message"`
	ValidationErrors []ValidationError `json:"validation_errors"`
	Timestamp      string           `json:"timestamp"`
}

// ValidatePagination validates pagination parameters
func ValidatePagination() gin.HandlerFunc {
	return func(c *gin.Context) {
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse(
				"Invalid page parameter",
				"Page must be a positive integer",
			))
			c.Abort()
			return
		}

		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 100 {
			c.JSON(http.StatusBadRequest, views.CreateErrorResponse(
				"Invalid limit parameter",
				"Limit must be between 1 and 100",
			))
			c.Abort()
			return
		}

		c.Next()
	}
}
