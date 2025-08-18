package validators

import (
	"reflect"

	"github.com/go-playground/validator/v10"
)

// RegisterServiceValidators registers service-specific validators
func RegisterServiceValidators(v *validator.Validate) {
	v.RegisterValidation("price_required_for_fixed", validatePriceRequiredForFixed)
}

// validatePriceRequiredForFixed validates that price is provided when price_type is "fixed"
func validatePriceRequiredForFixed(fl validator.FieldLevel) bool {
	// Get the struct that contains this field
	parent := fl.Parent()
	if parent.Kind() == reflect.Ptr {
		parent = parent.Elem()
	}

	// Get price_type field
	priceTypeField := parent.FieldByName("PriceType")
	if !priceTypeField.IsValid() {
		return true // If price_type field doesn't exist, skip validation
	}

	priceType := priceTypeField.String()

	// If price_type is "fixed", price must be provided
	if priceType == "fixed" {
		// Get price field
		priceField := parent.FieldByName("Price")
		if !priceField.IsValid() {
			return false
		}

		// Check if price is nil (not provided)
		if priceField.IsNil() {
			return false
		}

		// Check if price value is positive
		priceValue := priceField.Elem().Float()
		return priceValue > 0
	}

	// For inquiry-based services, price is optional
	return true
}
