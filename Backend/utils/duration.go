package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// DurationUnit represents a time unit
type DurationUnit struct {
	Value int    `json:"value"`
	Unit  string `json:"unit"`
}

// Duration represents a complex duration with multiple units
type Duration struct {
	Parts []DurationUnit `json:"parts"`
}

// ParseDuration parses a duration string into structured data
// Examples: "2 hours 30 minutes", "1 day 3 hours", "45 minutes"
func ParseDuration(durationStr string) (*Duration, error) {
	if durationStr == "" {
		return &Duration{Parts: []DurationUnit{}}, nil
	}

	// Regex to match "number unit" patterns
	regex := regexp.MustCompile(`(\d+)\s+(\w+)`)
	matches := regex.FindAllStringSubmatch(durationStr, -1)

	if len(matches) == 0 {
		return nil, fmt.Errorf("invalid duration format: %s", durationStr)
	}

	duration := &Duration{Parts: make([]DurationUnit, 0, len(matches))}

	for _, match := range matches {
		if len(match) != 3 {
			continue
		}

		value, err := strconv.Atoi(match[1])
		if err != nil {
			return nil, fmt.Errorf("invalid duration value: %s", match[1])
		}

		unit := strings.ToLower(match[2])
		
		// Validate unit
		if !isValidUnit(unit) {
			return nil, fmt.Errorf("invalid duration unit: %s", unit)
		}

		// Validate max values
		if err := validateUnitValue(value, unit); err != nil {
			return nil, err
		}

		duration.Parts = append(duration.Parts, DurationUnit{
			Value: value,
			Unit:  unit,
		})
	}

	return duration, nil
}

// ToMinutes converts duration to total minutes
func (d *Duration) ToMinutes() int {
	totalMinutes := 0

	for _, part := range d.Parts {
		switch part.Unit {
		case "minutes":
			totalMinutes += part.Value
		case "hours":
			totalMinutes += part.Value * 60
		case "days":
			totalMinutes += part.Value * 24 * 60
		case "weeks":
			totalMinutes += part.Value * 7 * 24 * 60
		case "months":
			totalMinutes += part.Value * 30 * 24 * 60 // Approximate
		case "years":
			totalMinutes += part.Value * 365 * 24 * 60 // Approximate
		}
	}

	return totalMinutes
}

// ToDuration converts to Go's time.Duration
func (d *Duration) ToDuration() time.Duration {
	return time.Duration(d.ToMinutes()) * time.Minute
}

// String returns the formatted duration string
func (d *Duration) String() string {
	if len(d.Parts) == 0 {
		return ""
	}

	parts := make([]string, len(d.Parts))
	for i, part := range d.Parts {
		unit := part.Unit
		if part.Value == 1 {
			// Remove 's' for singular
			unit = strings.TrimSuffix(unit, "s")
		}
		parts[i] = fmt.Sprintf("%d %s", part.Value, unit)
	}

	return strings.Join(parts, " ")
}

// ValidateDuration validates a duration string
func ValidateDuration(durationStr string) error {
	if durationStr == "" {
		return nil // Empty duration is valid
	}

	_, err := ParseDuration(durationStr)
	return err
}

// isValidUnit checks if the unit is valid
func isValidUnit(unit string) bool {
	validUnits := []string{
		"minutes", "minute",
		"hours", "hour", 
		"days", "day",
		"weeks", "week",
		"months", "month",
		"years", "year",
	}

	for _, valid := range validUnits {
		if unit == valid {
			return true
		}
	}
	return false
}

// validateUnitValue validates the value for a given unit
func validateUnitValue(value int, unit string) error {
	if value <= 0 {
		return fmt.Errorf("duration value must be positive")
	}

	switch unit {
	case "minutes", "minute":
		if value > 59 {
			return fmt.Errorf("minutes cannot exceed 59")
		}
	case "hours", "hour":
		if value > 23 {
			return fmt.Errorf("hours cannot exceed 23")
		}
	case "days", "day":
		if value > 365 {
			return fmt.Errorf("days cannot exceed 365")
		}
	case "weeks", "week":
		if value > 52 {
			return fmt.Errorf("weeks cannot exceed 52")
		}
	case "months", "month":
		if value > 12 {
			return fmt.Errorf("months cannot exceed 12")
		}
	case "years", "year":
		if value > 10 {
			return fmt.Errorf("years cannot exceed 10")
		}
	}

	return nil
}

// FormatDuration formats minutes into a human-readable string
func FormatDuration(minutes int) string {
	if minutes <= 0 {
		return ""
	}

	var parts []string

	// Years
	years := minutes / (365 * 24 * 60)
	if years > 0 {
		unit := "years"
		if years == 1 {
			unit = "year"
		}
		parts = append(parts, fmt.Sprintf("%d %s", years, unit))
		minutes %= (365 * 24 * 60)
	}

	// Months
	months := minutes / (30 * 24 * 60)
	if months > 0 {
		unit := "months"
		if months == 1 {
			unit = "month"
		}
		parts = append(parts, fmt.Sprintf("%d %s", months, unit))
		minutes %= (30 * 24 * 60)
	}

	// Weeks
	weeks := minutes / (7 * 24 * 60)
	if weeks > 0 {
		unit := "weeks"
		if weeks == 1 {
			unit = "week"
		}
		parts = append(parts, fmt.Sprintf("%d %s", weeks, unit))
		minutes %= (7 * 24 * 60)
	}

	// Days
	days := minutes / (24 * 60)
	if days > 0 {
		unit := "days"
		if days == 1 {
			unit = "day"
		}
		parts = append(parts, fmt.Sprintf("%d %s", days, unit))
		minutes %= (24 * 60)
	}

	// Hours
	hours := minutes / 60
	if hours > 0 {
		unit := "hours"
		if hours == 1 {
			unit = "hour"
		}
		parts = append(parts, fmt.Sprintf("%d %s", hours, unit))
		minutes %= 60
	}

	// Minutes
	if minutes > 0 {
		unit := "minutes"
		if minutes == 1 {
			unit = "minute"
		}
		parts = append(parts, fmt.Sprintf("%d %s", minutes, unit))
	}

	return strings.Join(parts, " ")
}
