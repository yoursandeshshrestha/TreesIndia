package controllers

import (
	"treesindia/utils"

	"github.com/gin-gonic/gin"
)

// BaseController provides common functionality for all controllers
type BaseController struct {
	responseHandler *utils.ResponseHandler
}

// NewBaseController creates a new base controller
func NewBaseController() *BaseController {
	return &BaseController{
		responseHandler: utils.NewResponseHandler(),
	}
}

// Success sends a success response
func (bc *BaseController) Success(c *gin.Context, message string, data interface{}) {
	bc.responseHandler.Success(c, message, data)
}

// Created sends a created response
func (bc *BaseController) Created(c *gin.Context, message string, data interface{}) {
	bc.responseHandler.Created(c, message, data)
}

// BadRequest sends a bad request response
func (bc *BaseController) BadRequest(c *gin.Context, message string, error string) {
	bc.responseHandler.BadRequest(c, message, error)
}

// Unauthorized sends an unauthorized response
func (bc *BaseController) Unauthorized(c *gin.Context, message string, error string) {
	bc.responseHandler.Unauthorized(c, message, error)
}

// Forbidden sends a forbidden response
func (bc *BaseController) Forbidden(c *gin.Context, message string, error string) {
	bc.responseHandler.Forbidden(c, message, error)
}

// NotFound sends a not found response
func (bc *BaseController) NotFound(c *gin.Context, message string, error string) {
	bc.responseHandler.NotFound(c, message, error)
}

// Conflict sends a conflict response
func (bc *BaseController) Conflict(c *gin.Context, message string, error string) {
	bc.responseHandler.Conflict(c, message, error)
}

// InternalServerError sends an internal server error response
func (bc *BaseController) InternalServerError(c *gin.Context, message string, error string) {
	bc.responseHandler.InternalServerError(c, message, error)
}

// ValidationError sends a validation error response
func (bc *BaseController) ValidationError(c *gin.Context, message string, errors map[string]string) {
	bc.responseHandler.ValidationError(c, message, errors)
}

// GetUserID gets the user ID from the context
func (bc *BaseController) GetUserID(c *gin.Context) uint {
	return c.GetUint("user_id")
}

// GetUserType gets the user type from the context
func (bc *BaseController) GetUserType(c *gin.Context) string {
	return c.GetString("user_type")
}

// GetUser gets the user from the context
func (bc *BaseController) GetUser(c *gin.Context) interface{} {
	return c.MustGet("user")
}
