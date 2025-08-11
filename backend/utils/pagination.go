package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

// PaginationResponse represents pagination response
type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int64 `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// PaginationHelper provides pagination utilities
type PaginationHelper struct{}

// NewPaginationHelper creates a new pagination helper
func NewPaginationHelper() *PaginationHelper {
	return &PaginationHelper{}
}

// ParsePaginationParams parses pagination parameters from query string
func (ph *PaginationHelper) ParsePaginationParams(c *gin.Context) PaginationParams {
	page := 1
	limit := 10

	// Parse page parameter
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	// Parse limit parameter
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	return PaginationParams{
		Page:  page,
		Limit: limit,
	}
}

// ApplyPagination applies pagination to a GORM query
func (ph *PaginationHelper) ApplyPagination(query *gorm.DB, params PaginationParams) *gorm.DB {
	offset := (params.Page - 1) * params.Limit
	return query.Offset(offset).Limit(params.Limit)
}

// CalculatePagination calculates pagination metadata
func (ph *PaginationHelper) CalculatePagination(total int64, params PaginationParams) PaginationResponse {
	totalPages := (total + int64(params.Limit) - 1) / int64(params.Limit)
	
	return PaginationResponse{
		Page:       params.Page,
		Limit:      params.Limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    int64(params.Page*params.Limit) < total,
		HasPrev:    params.Page > 1,
	}
}

// PaginateQuery executes a paginated query and returns results with metadata
func (ph *PaginationHelper) PaginateQuery(query *gorm.DB, params PaginationParams, result interface{}) (PaginationResponse, error) {
	var total int64
	
	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return PaginationResponse{}, err
	}
	
	// Apply pagination and get results
	if err := ph.ApplyPagination(query, params).Find(result).Error; err != nil {
		return PaginationResponse{}, err
	}
	
	// Calculate pagination metadata
	pagination := ph.CalculatePagination(total, params)
	
	return pagination, nil
}
