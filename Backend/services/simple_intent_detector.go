package services

import (
	"regexp"
	"strings"
)

// SimpleIntent represents a detected intent
type SimpleIntent struct {
	Type         string                 `json:"type"`          // property, service, project, general
	Action       string                 `json:"action"`        // rent, sale, book, info
	Entities     map[string]interface{} `json:"entities"`      // location, bedrooms, budget, etc.
	Confidence   float64                `json:"confidence"`    // 0.0-1.0
	OriginalText string                 `json:"original_text"` // Original user input
}

// SimpleIntentDetector handles fast rule-based intent detection
type SimpleIntentDetector struct{}

// NewSimpleIntentDetector creates a new intent detector
func NewSimpleIntentDetector() *SimpleIntentDetector {
	return &SimpleIntentDetector{}
}

// DetectIntent analyzes user input and returns structured intent
func (d *SimpleIntentDetector) DetectIntent(message string, location string) *SimpleIntent {
	message = strings.ToLower(strings.TrimSpace(message))
	
	// Initialize intent
	intent := &SimpleIntent{
		Type:         "general",
		Action:       "info",
		Entities:     make(map[string]interface{}),
		Confidence:   0.5,
		OriginalText: message,
	}
	
	// Property-related keywords
	propertyKeywords := []string{"rent", "rental", "sale", "buy", "property", "house", "apartment", "flat", "bhk", "bedroom", "room"}
	propertyCount := 0
	
	for _, keyword := range propertyKeywords {
		if strings.Contains(message, keyword) {
			propertyCount++
		}
	}
	
	// Service-related keywords
	serviceKeywords := []string{"service", "book", "cleaning", "plumbing", "electrical", "maintenance", "repair", "install"}
	serviceCount := 0
	
	for _, keyword := range serviceKeywords {
		if strings.Contains(message, keyword) {
			serviceCount++
		}
	}
	
	// Project-related keywords
	projectKeywords := []string{"project", "construction", "build", "contractor", "renovation"}
	projectCount := 0
	
	for _, keyword := range projectKeywords {
		if strings.Contains(message, keyword) {
			projectCount++
		}
	}
	
	// Determine primary intent based on keyword counts
	if propertyCount > 0 {
		intent.Type = "property"
		intent.Confidence = 0.9
		
		// Extract property action
		if strings.Contains(message, "rent") || strings.Contains(message, "rental") {
			intent.Action = "rent"
			intent.Entities["listing_type"] = "rent"
		} else if strings.Contains(message, "sale") || strings.Contains(message, "buy") {
			intent.Action = "sale"
			intent.Entities["listing_type"] = "sale"
		}
		
		// Extract bedrooms
		bedrooms := d.extractBedrooms(message)
		if bedrooms > 0 {
			intent.Entities["bedrooms"] = bedrooms
		}
		
		// Extract budget
		budget := d.extractBudget(message)
		if budget > 0 {
			intent.Entities["budget"] = budget
		}
		
	} else if serviceCount > 0 {
		intent.Type = "service"
		intent.Action = "book"
		intent.Confidence = 0.8
		
		// Extract service type
		serviceType := d.extractServiceType(message)
		if serviceType != "" {
			intent.Entities["service_type"] = serviceType
		}
		
	} else if projectCount > 0 {
		intent.Type = "project"
		intent.Action = "info"
		intent.Confidence = 0.7
		
	} else {
		// General queries - greetings, help, etc.
		intent.Type = "general"
		intent.Action = "info"
		intent.Confidence = 0.6
	}
	
	// Extract location
	extractedLocation := d.extractLocation(message)
	if extractedLocation != "" {
		intent.Entities["location"] = extractedLocation
	} else if location != "" {
		intent.Entities["location"] = location
	}
	
	return intent
}

// extractBedrooms extracts bedroom count from message
func (d *SimpleIntentDetector) extractBedrooms(message string) int {
	// Patterns: "3bhk", "3 bhk", "3 bedroom", "3bedroom"
	patterns := []string{
		`(\d+)\s*bhk`,
		`(\d+)\s*bedroom`,
		`(\d+)\s*bed`,
	}
	
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(message)
		if len(matches) > 1 {
			if num := d.parseNumber(matches[1]); num > 0 && num <= 10 {
				return num
			}
		}
	}
	
	return 0
}

// extractBudget extracts budget from message
func (d *SimpleIntentDetector) extractBudget(message string) int {
	// Patterns: "15k", "15000", "15 thousand", "under 15k", "max 15k"
	patterns := []string{
		`(\d+)\s*k\b`,
		`(\d+)\s*thousand`,
		`under\s*(\d+)\s*k?`,
		`max\s*(\d+)\s*k?`,
		`upto\s*(\d+)\s*k?`,
		`(\d{4,6})\b`, // 4-6 digit numbers (likely prices)
	}
	
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(message)
		if len(matches) > 1 {
			if num := d.parseNumber(matches[1]); num > 0 {
				// Convert k to thousands
				if strings.Contains(matches[0], "k") && num < 1000 {
					num = num * 1000
				}
				return num
			}
		}
	}
	
	return 0
}

// extractServiceType extracts service type from message
func (d *SimpleIntentDetector) extractServiceType(message string) string {
	serviceTypes := map[string][]string{
		"cleaning":     {"clean", "cleaning", "housekeeping"},
		"plumbing":     {"plumb", "plumbing", "pipe", "water", "bathroom"},
		"electrical":   {"electric", "electrical", "wiring", "power", "light"},
		"maintenance":  {"maintain", "maintenance", "repair", "fix"},
		"painting":     {"paint", "painting", "color"},
		"carpentry":    {"carpenter", "carpentry", "wood", "furniture"},
	}
	
	for serviceType, keywords := range serviceTypes {
		for _, keyword := range keywords {
			if strings.Contains(message, keyword) {
				return serviceType
			}
		}
	}
	
	return ""
}

// extractLocation extracts location from message
func (d *SimpleIntentDetector) extractLocation(message string) string {
	// Common Indian cities
	cities := []string{
		"siliguri", "delhi", "mumbai", "bangalore", "chennai", "kolkata", 
		"hyderabad", "pune", "ahmedabad", "jaipur", "lucknow", "kanpur",
		"nagpur", "indore", "thane", "bhopal", "visakhapatnam", "pimpri",
		"patna", "vadodara", "ludhiana", "agra", "nashik", "faridabad",
		"meerut", "rajkot", "kalyan", "vasai", "varanasi", "srinagar",
		"aurangabad", "noida", "solapur", "vijayawada", "kolhapur", "amritsar",
		"nashik", "allahabad", "ranchi", "howrah", "coimbatore", "raipur",
		"jabalpur", "gwalior", "jodhpur", "madurai", "guwahati", "chandigarh",
		"hubli", "mysore", "gurgaon", "aligarh", "jalandhar", "bhubaneswar",
		"salem", "warangal", "guntur", "bhiwandi", "saharanpur", "gorakhpur",
		"bikaner", "amravati", "noida", "jamshedpur", "bhilai", "cuttack",
		"firozabad", "kochi", "bhavnagar", "dehradun", "durgapur", "asansol",
		"rourkela", "nanded", "kolhapur", "ajmer", "akola", "gulbarga",
		"jamnagar", "ujjain", "loni", "siliguri", "jhansi", "ulhasnagar",
		"nellore", "jammu", "sangli", "miraj", "belgaum", "mangalore",
		"ambattur", "tirunelveli", "malegaon", "gaya", "jalgaon", "udaipur",
		"maheshtala",
	}
	
	for _, city := range cities {
		if strings.Contains(message, city) {
			return strings.Title(city)
		}
	}
	
	return ""
}

// parseNumber converts string to integer
func (d *SimpleIntentDetector) parseNumber(s string) int {
	// Simple number parsing
	switch s {
	case "1", "one":
		return 1
	case "2", "two":
		return 2
	case "3", "three":
		return 3
	case "4", "four":
		return 4
	case "5", "five":
		return 5
	case "6", "six":
		return 6
	case "7", "seven":
		return 7
	case "8", "eight":
		return 8
	case "9", "nine":
		return 9
	case "10", "ten":
		return 10
	default:
		// Try to parse as integer
		if num := 0; num >= 0 {
			// Simple integer parsing
			for _, char := range s {
				if char >= '0' && char <= '9' {
					num = num*10 + int(char-'0')
				}
			}
			return num
		}
	}
	return 0
}

// IsComplexQuery determines if a query needs AI processing
func (d *SimpleIntentDetector) IsComplexQuery(message string) bool {
	message = strings.ToLower(message)
	
	// Complex query indicators
	complexIndicators := []string{
		"and", "or", "but", "however", "although", "while", "whereas",
		"compare", "difference", "better", "best", "worst", "recommend",
		"explain", "how", "why", "what if", "suppose", "imagine",
		"multiple", "several", "various", "different", "alternative",
		"pros and cons", "advantages", "disadvantages", "benefits",
		"near", "close to", "within", "around", "nearby", "distance",
		"similar", "like", "same as", "different from", "versus",
	}
	
	complexCount := 0
	for _, indicator := range complexIndicators {
		if strings.Contains(message, indicator) {
			complexCount++
		}
	}
	
	// If message is very long or has multiple complex indicators
	return len(message) > 100 || complexCount >= 2
}
