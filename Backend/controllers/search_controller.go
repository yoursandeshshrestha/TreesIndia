package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"treesindia/services"
	"treesindia/views"
)

type SearchController struct {
	searchService *services.SearchService
}

func NewSearchController() *SearchController {
	return &SearchController{
		searchService: services.NewSearchService(),
	}
}

// GetSearchSuggestions godoc
// @Summary Get search suggestions
// @Description Get 5 popular keywords and 5 popular services for search suggestions
// @Tags Search
// @Accept json
// @Produce json
// @Success 200 {object} views.Response{data=models.SearchSuggestionsResponse} "Suggestions retrieved successfully"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/services/search/suggestions [get]
func (sc *SearchController) GetSearchSuggestions(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("SearchController.GetSearchSuggestions panic: %v", r)
		}
	}()

	logrus.Info("SearchController.GetSearchSuggestions called")

	suggestions, err := sc.searchService.GetSearchSuggestions()
	if err != nil {
		logrus.Errorf("SearchController.GetSearchSuggestions error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to retrieve search suggestions", err.Error()))
		return
	}

	logrus.Infof("SearchController.GetSearchSuggestions returning %d keywords and %d services", 
		len(suggestions.Keywords), len(suggestions.Services))
	
	c.JSON(200, views.CreateSuccessResponse("Search suggestions retrieved successfully", suggestions))
}

// SearchServices godoc
// @Summary Search services with intelligent query parsing
// @Description Search services with intelligent query parsing that understands price, service type, and keyword queries
// @Tags Search
// @Accept json
// @Produce json
// @Param q query string true "Search query (e.g., '500', 'fixed', 'cleaning', 'cleaning under 500')"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Results per page (default: 20, max: 100)"
// @Success 200 {object} views.Response{data=models.SearchResponse} "Search completed successfully"
// @Failure 400 {object} views.Response "Bad request"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/services/search [get]
func (sc *SearchController) SearchServices(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("SearchController.SearchServices panic: %v", r)
		}
	}()

	// Get query parameter
	query := c.Query("q")
	if query == "" {
		logrus.Warn("SearchController.SearchServices called without query parameter")
		c.JSON(400, views.CreateErrorResponse("Query parameter 'q' is required", "Please provide a search query"))
		return
	}

	// Get pagination parameters
	pageStr := c.Query("page")
	limitStr := c.Query("limit")

	// Parse pagination parameters
	page := 1
	limit := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	logrus.Infof("SearchController.SearchServices called with query: '%s', page: %d, limit: %d", query, page, limit)

	// Perform search
	searchResponse, err := sc.searchService.SearchServices(query, page, limit)
	if err != nil {
		logrus.Errorf("SearchController.SearchServices error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to perform search", err.Error()))
		return
	}

	logrus.Infof("SearchController.SearchServices returning %d results (total: %d) for query: '%s'", 
		len(searchResponse.Results), searchResponse.Pagination.Total, query)

	c.JSON(200, views.CreateSuccessResponse("Search completed successfully", searchResponse))
}

// SearchServicesWithFilters godoc
// @Summary Search services with advanced filters
// @Description Search services with advanced filters including category, subcategory, price range, location, etc.
// @Tags Search
// @Accept json
// @Produce json
// @Param q query string false "Search query"
// @Param category query string false "Category name or ID"
// @Param subcategory query string false "Subcategory name or ID"
// @Param price_min query number false "Minimum price"
// @Param price_max query number false "Maximum price"
// @Param price_type query string false "Price type (fixed or inquiry)"
// @Param city query string false "City name"
// @Param state query string false "State name"
// @Param sort_by query string false "Sort by field (relevance, price, rating, popularity, newest)"
// @Param sort_order query string false "Sort order (asc or desc)"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Results per page (default: 20, max: 100)"
// @Success 200 {object} views.Response{data=models.SearchResponse} "Search completed successfully"
// @Failure 400 {object} views.Response "Bad request"
// @Failure 500 {object} views.Response "Internal server error"
// @Router /api/v1/services/search/advanced [get]
func (sc *SearchController) SearchServicesWithFilters(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("SearchController.SearchServicesWithFilters panic: %v", r)
		}
	}()

	// Get query parameter
	query := c.Query("q")

	// Get pagination parameters
	pageStr := c.Query("page")
	limitStr := c.Query("limit")

	// Parse pagination parameters
	page := 1
	limit := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	logrus.Infof("SearchController.SearchServicesWithFilters called with query: '%s', page: %d, limit: %d", query, page, limit)

	// For now, use the same search service but with additional filters
	// In a more advanced implementation, we would parse all the filter parameters
	// and pass them to a more sophisticated search method
	
	searchResponse, err := sc.searchService.SearchServices(query, page, limit)
	if err != nil {
		logrus.Errorf("SearchController.SearchServicesWithFilters error: %v", err)
		c.JSON(500, views.CreateErrorResponse("Failed to perform advanced search", err.Error()))
		return
	}

	logrus.Infof("SearchController.SearchServicesWithFilters returning %d results (total: %d) for query: '%s'", 
		len(searchResponse.Results), searchResponse.Pagination.Total, query)

	c.JSON(200, views.CreateSuccessResponse("Advanced search completed successfully", searchResponse))
}
