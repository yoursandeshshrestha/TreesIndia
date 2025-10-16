package models

import (
	"time"
)

// SearchQueryType represents the type of search query detected
type SearchQueryType string

const (
	SearchQueryTypePrice        SearchQueryType = "price_filter"
	SearchQueryTypeServiceType  SearchQueryType = "service_type_filter"
	SearchQueryTypeKeyword      SearchQueryType = "keyword_search"
	SearchQueryTypeCombined     SearchQueryType = "combined_filter"
	SearchQueryTypeUnknown      SearchQueryType = "unknown"
)

// SearchSuggestion represents a search suggestion
type SearchSuggestion struct {
	Keyword     string `json:"keyword"`
	SearchCount int    `json:"search_count"`
	Category    string `json:"category"`
}

// SearchSuggestionsResponse represents the response for search suggestions
type SearchSuggestionsResponse struct {
	Keywords []SearchSuggestion `json:"keywords"`
	Services []Service          `json:"services"`
}

// QueryAnalysis represents the analysis of a search query
type QueryAnalysis struct {
	OriginalQuery string                 `json:"original_query"`
	DetectedType  SearchQueryType        `json:"detected_type"`
	ParsedFilters map[string]interface{} `json:"parsed_filters"`
}

// SearchResult represents a single search result
type SearchResult struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	Slug            string    `json:"slug"`
	Description     string    `json:"description"`
	CategoryID      uint      `json:"category_id"`
	Category        string    `json:"category"`
	SubcategoryID   uint      `json:"subcategory_id"`
	Subcategory     string    `json:"subcategory"`
	PriceType       string    `json:"price_type"`
	Price           *float64  `json:"price"`
	Duration        *string   `json:"duration"`
	Rating          float64   `json:"rating"`
	TotalBookings   int       `json:"total_bookings"`
	Images          []string  `json:"images"`
	ServiceAreas    []string  `json:"service_areas"`
	MatchScore      float64   `json:"match_score"`
	MatchReason     string    `json:"match_reason"`
	HighlightedName string    `json:"highlighted_name,omitempty"`
	HighlightedDesc string    `json:"highlighted_description,omitempty"`
	HighlightedPrice string   `json:"highlighted_price,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// SearchMetadata represents search metadata
type SearchMetadata struct {
	Query         string  `json:"query"`
	SearchTimeMs  int64   `json:"search_time_ms"`
	TotalResults  int64   `json:"total_results"`
	FilterApplied string  `json:"filter_applied,omitempty"`
	Suggestions   []string `json:"suggestions,omitempty"`
}

// SearchResponse represents the complete search response
type SearchResponse struct {
	QueryAnalysis   QueryAnalysis   `json:"query_analysis"`
	Results         []SearchResult  `json:"results"`
	Pagination      PaginationInfo  `json:"pagination"`
	SearchMetadata  SearchMetadata  `json:"search_metadata"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// SearchFilters represents parsed search filters
type SearchFilters struct {
	Keywords    []string  `json:"keywords"`
	PriceMin    *float64  `json:"price_min"`
	PriceMax    *float64  `json:"price_max"`
	PriceType   *string   `json:"price_type"`
	Category    *string   `json:"category"`
	Subcategory *string   `json:"subcategory"`
	City        *string   `json:"city"`
	State       *string   `json:"state"`
	SortBy      string    `json:"sort_by"`
	SortOrder   string    `json:"sort_order"`
	Page        int       `json:"page"`
	Limit       int       `json:"limit"`
}

// PopularKeyword represents a popular search keyword
type PopularKeyword struct {
	Keyword     string `json:"keyword"`
	SearchCount int    `json:"search_count"`
	Category    string `json:"category"`
}

// PopularService represents a popular service for suggestions
type PopularService struct {
	ID            uint     `json:"id"`
	Name          string   `json:"name"`
	Slug          string   `json:"slug"`
	Category      string   `json:"category"`
	Subcategory   string   `json:"subcategory"`
	PriceType     string   `json:"price_type"`
	Price         *float64 `json:"price"`
	Rating        float64  `json:"rating"`
	TotalBookings int      `json:"total_bookings"`
	Images        []string `json:"images"`
	PopularityScore int    `json:"popularity_score"`
}

