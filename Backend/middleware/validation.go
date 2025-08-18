package middleware

import (
	"treesindia/validators"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ValidationMiddleware registers custom validators
func ValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create a new validator instance
		v := validator.New()
		
		// Register custom validators
		validators.RegisterDurationValidator(v)
		validators.RegisterServiceValidators(v)
		
		// Set the validator in the context
		c.Set("validator", v)
		c.Next()
	}
}
