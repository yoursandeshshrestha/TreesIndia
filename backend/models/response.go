package models

// Response represents a standard API response
type Response struct {
	Success   bool        `json:"success" example:"true"`
	Message   string      `json:"message" example:"Operation completed successfully"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty" example:"Detailed error description"`
	Timestamp string      `json:"timestamp" example:"2024-01-01T00:00:00Z"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int  `json:"page" example:"1"`
	Limit      int  `json:"limit" example:"10"`
	Total      int64 `json:"total" example:"100"`
	TotalPages int  `json:"total_pages" example:"10"`
	HasNext    bool `json:"has_next" example:"true"`
	HasPrev    bool `json:"has_prev" example:"false"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Response
	Pagination Pagination `json:"pagination"`
}
