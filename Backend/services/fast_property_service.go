package services

import (
	"database/sql"
	"fmt"
	"strings"
	"treesindia/database"
	"treesindia/models"
)

// FastPropertyService handles fast property searches with direct SQL
type FastPropertyService struct {
	db *sql.DB
}

// NewFastPropertyService creates a new fast property service
func NewFastPropertyService() *FastPropertyService {
	db, _ := database.GetDB().DB()
	return &FastPropertyService{
		db: db,
	}
}

// PropertySearchResult represents search results
type PropertySearchResult struct {
	Properties []map[string]interface{} `json:"properties"`
	Total      int                      `json:"total"`
	Filters    map[string]interface{}   `json:"filters"`
}

// SearchProperties performs fast property search with direct SQL
func (s *FastPropertyService) SearchProperties(intent *SimpleIntent) (*PropertySearchResult, error) {
	// Build SQL query
	query, args := s.buildPropertyQuery(intent)
	
	// Execute query
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute property query: %v", err)
	}
	defer rows.Close()
	
	// Parse results
	properties := make([]map[string]interface{}, 0)
	
	for rows.Next() {
		var prop models.Property
		var images sql.NullString
		
		err := rows.Scan(
			&prop.ID,
			&prop.Title,
			&prop.Description,
			&prop.MonthlyRent,
			&prop.SalePrice,
			&prop.Bedrooms,
			&prop.Bathrooms,
			&prop.Area,
			&prop.City,
			&prop.State,
			&prop.Address,
			&prop.ListingType,
			&prop.PropertyType,
			&images,
		)
		if err != nil {
			continue // Skip invalid rows
		}
		
		// Convert to map
		propMap := map[string]interface{}{
			"id":            prop.ID,
			"title":         prop.Title,
			"description":   prop.Description,
			"monthly_rent":  prop.MonthlyRent,
			"sale_price":    prop.SalePrice,
			"bedrooms":      prop.Bedrooms,
			"bathrooms":     prop.Bathrooms,
			"area":          prop.Area,
			"city":          prop.City,
			"state":         prop.State,
			"address":       prop.Address,
			"listing_type":  prop.ListingType,
			"property_type": prop.PropertyType,
			"images":        s.parseImages(images.String),
		}
		
		properties = append(properties, propMap)
	}
	
	// Build filters for response
	filters := s.buildFilters(intent)
	
	return &PropertySearchResult{
		Properties: properties,
		Total:      len(properties),
		Filters:    filters,
	}, nil
}

// buildPropertyQuery builds optimized SQL query
func (s *FastPropertyService) buildPropertyQuery(intent *SimpleIntent) (string, []interface{}) {
	baseQuery := `
		SELECT id, title, description, monthly_rent, sale_price, bedrooms, bathrooms, 
		       area, city, state, address, listing_type, property_type, images
		FROM properties 
		WHERE is_approved = true AND status = 'available'
	`
	
	var conditions []string
	var args []interface{}
	argIndex := 1
	
	// Add listing type filter
	if listingType, ok := intent.Entities["listing_type"].(string); ok {
		conditions = append(conditions, fmt.Sprintf("listing_type = $%d", argIndex))
		args = append(args, listingType)
		argIndex++
	}
	
	// Add bedrooms filter
	if bedrooms, ok := intent.Entities["bedrooms"].(int); ok {
		conditions = append(conditions, fmt.Sprintf("bedrooms = $%d", argIndex))
		args = append(args, bedrooms)
		argIndex++
	}
	
	// Add location filter
	if location, ok := intent.Entities["location"].(string); ok {
		conditions = append(conditions, fmt.Sprintf("(city ILIKE $%d OR state ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+location+"%")
		argIndex++
	}
	
	// Add budget filter
	if budget, ok := intent.Entities["budget"].(int); ok {
		if intent.Action == "rent" {
			conditions = append(conditions, fmt.Sprintf("monthly_rent <= $%d", argIndex))
		} else if intent.Action == "sale" {
			conditions = append(conditions, fmt.Sprintf("sale_price <= $%d", argIndex))
		}
		args = append(args, budget)
		argIndex++
	}
	
	// Add property type filter (default to residential)
	conditions = append(conditions, fmt.Sprintf("property_type = $%d", argIndex))
	args = append(args, "residential")
	argIndex++
	
	// Combine conditions
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}
	
	// Add ordering and limit
	baseQuery += " ORDER BY created_at DESC LIMIT 10"
	
	return baseQuery, args
}

// buildFilters builds filter information for response
func (s *FastPropertyService) buildFilters(intent *SimpleIntent) map[string]interface{} {
	filters := make(map[string]interface{})
	
	if bedrooms, ok := intent.Entities["bedrooms"].(int); ok {
		filters["bedrooms"] = bedrooms
	}
	
	if location, ok := intent.Entities["location"].(string); ok {
		filters["city"] = location
	}
	
	if budget, ok := intent.Entities["budget"].(int); ok {
		filters["max_price"] = budget
	}
	
	if listingType, ok := intent.Entities["listing_type"].(string); ok {
		filters["listing_type"] = listingType
	}
	
	filters["property_type"] = "residential"
	filters["limit"] = 10
	
	return filters
}

// parseImages parses images JSON string
func (s *FastPropertyService) parseImages(imagesStr string) []string {
	if imagesStr == "" {
		return []string{}
	}
	
	// Simple JSON array parsing for images
	// Remove brackets and split by comma
	imagesStr = strings.Trim(imagesStr, "[]")
	if imagesStr == "" {
		return []string{}
	}
	
	// Split by comma and clean up
	parts := strings.Split(imagesStr, ",")
	images := make([]string, 0, len(parts))
	
	for _, part := range parts {
		part = strings.Trim(part, `" `)
		if part != "" {
			images = append(images, part)
		}
	}
	
	return images
}

// GetPropertySuggestions returns property-related suggestions
func (s *FastPropertyService) GetPropertySuggestions(intent *SimpleIntent) []string {
	suggestions := make([]string, 0)
	
	if intent.Type == "property" {
		if intent.Action == "rent" {
			suggestions = append(suggestions, 
				"Filter properties by location on TreesIndia",
				"Set up alerts for new rental listings",
				"Compare rental properties in your area",
				"Contact property owners directly",
				"Schedule property visits",
			)
		} else if intent.Action == "sale" {
			suggestions = append(suggestions,
				"Browse properties for sale on TreesIndia",
				"Get property valuation estimates",
				"Find home loan options",
				"Contact real estate agents",
				"Schedule property inspections",
			)
		}
	}
	
	// Add general property suggestions
	suggestions = append(suggestions,
		"Search properties by budget range",
		"Find properties near your location",
		"Compare property features and prices",
		"Get property recommendations",
	)
	
	return suggestions
}

// GetMissingInfo determines what information is missing
func (s *FastPropertyService) GetMissingInfo(intent *SimpleIntent) []string {
	missing := make([]string, 0)
	
	if intent.Type == "property" {
		if _, ok := intent.Entities["location"]; !ok {
			missing = append(missing, "location")
		}
		if _, ok := intent.Entities["bedrooms"]; !ok {
			missing = append(missing, "number of bedrooms")
		}
		if _, ok := intent.Entities["budget"]; !ok {
			missing = append(missing, "budget range")
		}
	}
	
	return missing
}

// FormatPropertyPrice formats property price for display
func (s *FastPropertyService) FormatPropertyPrice(prop map[string]interface{}) string {
	if monthlyRent, ok := prop["monthly_rent"].(int); ok && monthlyRent > 0 {
		return fmt.Sprintf("₹%d/month", monthlyRent)
	}
	if salePrice, ok := prop["sale_price"].(int); ok && salePrice > 0 {
		return fmt.Sprintf("₹%d", salePrice)
	}
	return "Price on inquiry"
}

// FormatPropertyLocation formats property location
func (s *FastPropertyService) FormatPropertyLocation(prop map[string]interface{}) string {
	city, _ := prop["city"].(string)
	state, _ := prop["state"].(string)
	
	if city != "" && state != "" {
		return fmt.Sprintf("%s, %s", city, state)
	} else if city != "" {
		return city
	} else if state != "" {
		return state
	}
	return "Location not specified"
}
