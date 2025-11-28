package middleware

import (
	"treesindia/validators"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var globalValidator *validator.Validate

// init initializes the global validator
func init() {
	globalValidator = validator.New()
	validators.RegisterDurationValidator(globalValidator)
	validators.RegisterServiceValidators(globalValidator)
	
	// Set the validator globally for Gin's binding
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		validators.RegisterDurationValidator(v)
		validators.RegisterServiceValidators(v)
	}
}

// ValidationMiddleware registers custom validators
func ValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set the global validator in the context
		c.Set("validator", globalValidator)
		c.Next()
	}
}
