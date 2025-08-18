package validators

import (
	"treesindia/utils"

	"github.com/go-playground/validator/v10"
)

// RegisterDurationValidator registers the duration validator
func RegisterDurationValidator(v *validator.Validate) {
	v.RegisterValidation("duration", validateDuration)
}

// validateDuration validates duration strings
func validateDuration(fl validator.FieldLevel) bool {
	durationStr, ok := fl.Field().Interface().(string)
	if !ok {
		return false
	}

	err := utils.ValidateDuration(durationStr)
	return err == nil
}
