package utils

import (
	"net/http"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// ResponseHandler provides centralized response handling
type ResponseHandler struct{}

// NewResponseHandler creates a new response handler
func NewResponseHandler() *ResponseHandler {
	return &ResponseHandler{}
}

// Success sends a success response
func (rh *ResponseHandler) Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, views.CreateSuccessResponse(message, data))
}

// Created sends a created response
func (rh *ResponseHandler) Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, views.CreateSuccessResponse(message, data))
}

// BadRequest sends a bad request response
func (rh *ResponseHandler) BadRequest(c *gin.Context, message string, error string) {
	c.JSON(http.StatusBadRequest, views.CreateErrorResponse(message, error))
}

// Unauthorized sends an unauthorized response
func (rh *ResponseHandler) Unauthorized(c *gin.Context, message string, error string) {
	c.JSON(http.StatusUnauthorized, views.CreateErrorResponse(message, error))
}

// Forbidden sends a forbidden response
func (rh *ResponseHandler) Forbidden(c *gin.Context, message string, error string) {
	c.JSON(http.StatusForbidden, views.CreateErrorResponse(message, error))
}

// NotFound sends a not found response
func (rh *ResponseHandler) NotFound(c *gin.Context, message string, error string) {
	c.JSON(http.StatusNotFound, views.CreateErrorResponse(message, error))
}

// Conflict sends a conflict response
func (rh *ResponseHandler) Conflict(c *gin.Context, message string, error string) {
	c.JSON(http.StatusConflict, views.CreateErrorResponse(message, error))
}

// InternalServerError sends an internal server error response
func (rh *ResponseHandler) InternalServerError(c *gin.Context, message string, error string) {
	c.JSON(http.StatusInternalServerError, views.CreateErrorResponse(message, error))
}

// ValidationError sends a validation error response
func (rh *ResponseHandler) ValidationError(c *gin.Context, message string, errors map[string]string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"success": false,
		"message": message,
		"errors":  errors,
	})
}
