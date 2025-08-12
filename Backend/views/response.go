package views

import (
	"time"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Pagination *Pagination `json:"pagination,omitempty"`
	Timestamp  time.Time   `json:"timestamp"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success   bool      `json:"success"`
	Message   string    `json:"message"`
	Error     string    `json:"error,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// CreateSuccessResponse creates a success response
func CreateSuccessResponse(message string, data interface{}) SuccessResponse {
	return SuccessResponse{
		Success:   true,
		Message:   message,
		Data:      data,
		Timestamp: time.Now(),
	}
}

// CreateSuccessResponseWithPagination creates a success response with pagination
func CreateSuccessResponseWithPagination(message string, data interface{}, pagination *Pagination) SuccessResponse {
	return SuccessResponse{
		Success:    true,
		Message:    message,
		Data:       data,
		Pagination: pagination,
		Timestamp:  time.Now(),
	}
}

// CreateErrorResponse creates an error response
func CreateErrorResponse(message string, error string) ErrorResponse {
	return ErrorResponse{
		Success:   false,
		Message:   message,
		Error:     error,
		Timestamp: time.Now(),
	}
}

// CreatePagination creates pagination information
func CreatePagination(page, limit int, total int64) *Pagination {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	return &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}
}
