package services

import (
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"
)

type SearchService struct {
	db           *gorm.DB
	serviceRepo  *repositories.ServiceRepository
	categoryRepo *repositories.CategoryRepository
}

func NewSearchService() *SearchService {
	return &SearchService{
		db:           database.GetDB(),
		serviceRepo:  repositories.NewServiceRepository(),
		categoryRepo: repositories.NewCategoryRepository(),
	}
}

// GetSearchSuggestions returns 5 popular keywords and 5 popular services
func (ss *SearchService) GetSearchSuggestions() (*models.SearchSuggestionsResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("SearchService.GetSearchSuggestions panic: %v", r)
		}
	}()

	logrus.Info("SearchService.GetSearchSuggestions called")

	// Get popular keywords (mock data for now - in real implementation, this would come from search analytics)
	popularKeywords := []models.SearchSuggestion{
		{Keyword: "home cleaning", SearchCount: 1250, Category: "Cleaning"},
		{Keyword: "plumbing", SearchCount: 980, Category: "Plumbing"},
		{Keyword: "electrician", SearchCount: 750, Category: "Electrical"},
		{Keyword: "pest control", SearchCount: 620, Category: "Pest Control"},
		{Keyword: "carpenter", SearchCount: 580, Category: "Carpentry"},
	}

	// Get popular services (most booked + highest rated)
	var services []models.Service
	err := ss.db.Preload("Category").Preload("Subcategory").
		Where("services.is_active = ?", true).
		Order("services.created_at DESC").
		Limit(5).
		Find(&services).Error

	if err != nil {
		logrus.Errorf("SearchService.GetSearchSuggestions error getting services: %v", err)
		return nil, err
	}

	response := &models.SearchSuggestionsResponse{
		Keywords: popularKeywords,
		Services: services,
	}

	logrus.Infof("SearchService.GetSearchSuggestions returning %d keywords and %d services", 
		len(popularKeywords), len(services))
	
	return response, nil
}

// SearchServices performs intelligent search based on query
func (ss *SearchService) SearchServices(query string, page, limit int) (*models.SearchResponse, error) {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("SearchService.SearchServices panic: %v", r)
		}
	}()

	startTime := time.Now()
	logrus.Infof("SearchService.SearchServices called with query: '%s', page: %d, limit: %d", query, page, limit)

	// Set default values
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 20
	}

	// Analyze the query
	queryAnalysis := ss.analyzeQuery(query)
	logrus.Infof("Query analysis: %+v", queryAnalysis)

	// Parse filters based on query analysis
	filters := ss.parseFilters(query, queryAnalysis)

	// Perform search based on query type
	var results []models.SearchResult
	var total int64
	var err error

	switch queryAnalysis.DetectedType {
	case models.SearchQueryTypePrice:
		results, total, err = ss.searchByPrice(filters, page, limit)
	case models.SearchQueryTypeServiceType:
		results, total, err = ss.searchByServiceType(filters, page, limit)
	case models.SearchQueryTypeKeyword:
		results, total, err = ss.searchByKeywords(filters, page, limit)
	case models.SearchQueryTypeCombined:
		results, total, err = ss.searchCombined(filters, page, limit)
	default:
		results, total, err = ss.searchByKeywords(filters, page, limit)
	}

	if err != nil {
		logrus.Errorf("SearchService.SearchServices error: %v", err)
		return nil, err
	}

	// Calculate pagination
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := models.PaginationInfo{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    int64(page*limit) < total,
		HasPrev:    page > 1,
	}

	// Calculate search time
	searchTime := time.Since(startTime).Milliseconds()

	// Create search metadata
	metadata := models.SearchMetadata{
		Query:        query,
		SearchTimeMs: searchTime,
		TotalResults: total,
	}

	// Add filter applied info
	if filters.PriceMax != nil {
		metadata.FilterApplied = fmt.Sprintf("price <= %.0f", *filters.PriceMax)
	} else if filters.PriceMin != nil {
		metadata.FilterApplied = fmt.Sprintf("price >= %.0f", *filters.PriceMin)
	} else if filters.PriceType != nil {
		metadata.FilterApplied = fmt.Sprintf("price_type = %s", *filters.PriceType)
	}

	response := &models.SearchResponse{
		QueryAnalysis:  queryAnalysis,
		Results:        results,
		Pagination:     pagination,
		SearchMetadata: metadata,
	}

	logrus.Infof("SearchService.SearchServices returning %d results (total: %d) in %dms", 
		len(results), total, searchTime)

	return response, nil
}

// analyzeQuery determines the type of search query
func (ss *SearchService) analyzeQuery(query string) models.QueryAnalysis {
	query = strings.ToLower(strings.TrimSpace(query))
	
	analysis := models.QueryAnalysis{
		OriginalQuery: query,
		DetectedType:  models.SearchQueryTypeUnknown,
		ParsedFilters: make(map[string]interface{}),
	}

	// Check for price queries
	if ss.isPriceQuery(query) {
		analysis.DetectedType = models.SearchQueryTypePrice
		return analysis
	}

	// Check for service type queries
	if ss.isServiceTypeQuery(query) {
		analysis.DetectedType = models.SearchQueryTypeServiceType
		return analysis
	}

	// Check for combined queries
	if ss.isCombinedQuery(query) {
		analysis.DetectedType = models.SearchQueryTypeCombined
		return analysis
	}

	// Default to keyword search
	analysis.DetectedType = models.SearchQueryTypeKeyword
	return analysis
}

// isPriceQuery checks if the query is a price-based search
func (ss *SearchService) isPriceQuery(query string) bool {
	// Check for numeric values
	if matched, _ := regexp.MatchString(`^\d+$`, query); matched {
		return true
	}

	// Check for price keywords
	priceKeywords := []string{"cheap", "budget", "expensive", "premium", "under", "below", "above", "over"}
	for _, keyword := range priceKeywords {
		if strings.Contains(query, keyword) {
			return true
		}
	}

	return false
}

// isServiceTypeQuery checks if the query is a service type search
func (ss *SearchService) isServiceTypeQuery(query string) bool {
	serviceTypeKeywords := []string{"fixed", "inquiry", "quote", "instant"}
	for _, keyword := range serviceTypeKeywords {
		if strings.Contains(query, keyword) {
			return true
		}
	}
	return false
}

// isCombinedQuery checks if the query contains multiple filter types
func (ss *SearchService) isCombinedQuery(query string) bool {
	hasPrice := ss.isPriceQuery(query)
	hasServiceType := ss.isServiceTypeQuery(query)
	hasKeywords := len(strings.Fields(query)) > 1

	return (hasPrice && hasKeywords) || (hasServiceType && hasKeywords) || (hasPrice && hasServiceType)
}

// parseFilters extracts filters from the query
func (ss *SearchService) parseFilters(query string, analysis models.QueryAnalysis) models.SearchFilters {
	filters := models.SearchFilters{
		SortBy:    "relevance",
		SortOrder: "desc",
		Page:      1,
		Limit:     20,
	}

	query = strings.ToLower(strings.TrimSpace(query))

	// Parse price filters
	if analysis.DetectedType == models.SearchQueryTypePrice || analysis.DetectedType == models.SearchQueryTypeCombined {
		ss.parsePriceFilters(query, &filters)
	}

	// Parse service type filters
	if analysis.DetectedType == models.SearchQueryTypeServiceType || analysis.DetectedType == models.SearchQueryTypeCombined {
		ss.parseServiceTypeFilters(query, &filters)
	}

	// Parse keyword filters
	if analysis.DetectedType == models.SearchQueryTypeKeyword || analysis.DetectedType == models.SearchQueryTypeCombined {
		ss.parseKeywordFilters(query, &filters)
	}

	return filters
}

// parsePriceFilters extracts price-related filters
func (ss *SearchService) parsePriceFilters(query string, filters *models.SearchFilters) {
	// Check for exact numeric values
	if matched, _ := regexp.MatchString(`^\d+$`, query); matched {
		if price, err := strconv.ParseFloat(query, 64); err == nil {
			filters.PriceMax = &price
			return
		}
	}

	// Check for "under", "below", "less than"
	if matched, _ := regexp.MatchString(`(under|below|less than)\s+(\d+)`, query); matched {
		re := regexp.MustCompile(`(under|below|less than)\s+(\d+)`)
		matches := re.FindStringSubmatch(query)
		if len(matches) >= 3 {
			if price, err := strconv.ParseFloat(matches[2], 64); err == nil {
				filters.PriceMax = &price
			}
		}
	}

	// Check for "above", "over", "more than"
	if matched, _ := regexp.MatchString(`(above|over|more than)\s+(\d+)`, query); matched {
		re := regexp.MustCompile(`(above|over|more than)\s+(\d+)`)
		matches := re.FindStringSubmatch(query)
		if len(matches) >= 3 {
			if price, err := strconv.ParseFloat(matches[2], 64); err == nil {
				filters.PriceMin = &price
			}
		}
	}

	// Check for price keywords
	if strings.Contains(query, "cheap") || strings.Contains(query, "budget") {
		price := 500.0
		filters.PriceMax = &price
	}

	if strings.Contains(query, "expensive") || strings.Contains(query, "premium") {
		price := 1000.0
		filters.PriceMin = &price
	}
}

// parseServiceTypeFilters extracts service type filters
func (ss *SearchService) parseServiceTypeFilters(query string, filters *models.SearchFilters) {
	if strings.Contains(query, "fixed") || strings.Contains(query, "instant") {
		priceType := "fixed"
		filters.PriceType = &priceType
	}

	if strings.Contains(query, "inquiry") || strings.Contains(query, "quote") {
		priceType := "inquiry"
		filters.PriceType = &priceType
	}
}

// parseKeywordFilters extracts keyword filters
func (ss *SearchService) parseKeywordFilters(query string, filters *models.SearchFilters) {
	// Remove price and service type keywords to get clean keywords
	cleanQuery := query
	
	// Remove price-related words
	priceWords := []string{"under", "below", "above", "over", "cheap", "budget", "expensive", "premium", "less than", "more than"}
	for _, word := range priceWords {
		cleanQuery = strings.ReplaceAll(cleanQuery, word, "")
	}
	
	// Remove service type words
	serviceTypeWords := []string{"fixed", "inquiry", "quote", "instant"}
	for _, word := range serviceTypeWords {
		cleanQuery = strings.ReplaceAll(cleanQuery, word, "")
	}
	
	// Extract remaining keywords
	keywords := strings.Fields(cleanQuery)
	filters.Keywords = keywords
}

// searchByPrice searches services by price filter
func (ss *SearchService) searchByPrice(filters models.SearchFilters, page, limit int) ([]models.SearchResult, int64, error) {
	offset := (page - 1) * limit
	
	query := ss.db.Model(&models.Service{}).
		Preload("Category").Preload("Subcategory").
		Where("services.is_active = ?", true)

	// Apply price filters
	if filters.PriceMax != nil {
		query = query.Where("services.price <= ?", *filters.PriceMax)
	}
	if filters.PriceMin != nil {
		query = query.Where("services.price >= ?", *filters.PriceMin)
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get results
	var services []models.Service
	err := query.Order("services.price ASC").
		Offset(offset).
		Limit(limit).
		Find(&services).Error

	if err != nil {
		return nil, 0, err
	}

	// Convert to search results
	results := ss.convertToSearchResults(services, "price_filter")
	return results, total, nil
}

// searchByServiceType searches services by service type
func (ss *SearchService) searchByServiceType(filters models.SearchFilters, page, limit int) ([]models.SearchResult, int64, error) {
	offset := (page - 1) * limit
	
	query := ss.db.Model(&models.Service{}).
		Preload("Category").Preload("Subcategory").
		Where("services.is_active = ?", true)

	// Apply service type filter
	if filters.PriceType != nil {
		query = query.Where("services.price_type = ?", *filters.PriceType)
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get results
	var services []models.Service
	err := query.Order("services.created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&services).Error

	if err != nil {
		return nil, 0, err
	}

	// Convert to search results
	results := ss.convertToSearchResults(services, "service_type_filter")
	return results, total, nil
}

// searchByKeywords searches services by keywords
func (ss *SearchService) searchByKeywords(filters models.SearchFilters, page, limit int) ([]models.SearchResult, int64, error) {
	offset := (page - 1) * limit
	
	query := ss.db.Model(&models.Service{}).
		Preload("Category").Preload("Subcategory").
		Where("services.is_active = ?", true)

	// Apply keyword filters
	if len(filters.Keywords) > 0 {
		for _, keyword := range filters.Keywords {
			keyword = strings.TrimSpace(keyword)
			if keyword != "" {
				// Use proper joins to access category and subcategory names
				query = query.Joins("LEFT JOIN categories ON services.category_id = categories.id").
					Joins("LEFT JOIN subcategories ON services.subcategory_id = subcategories.id").
					Where("services.name ILIKE ? OR services.description ILIKE ? OR categories.name ILIKE ? OR subcategories.name ILIKE ?", 
						"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
			}
		}
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get results
	var services []models.Service
	err := query.Order("services.name ASC").
		Offset(offset).
		Limit(limit).
		Find(&services).Error

	if err != nil {
		return nil, 0, err
	}

	// Convert to search results with relevance scoring
	results := ss.convertToSearchResultsWithRelevance(services, filters.Keywords)
	return results, total, nil
}

// searchCombined searches services with combined filters
func (ss *SearchService) searchCombined(filters models.SearchFilters, page, limit int) ([]models.SearchResult, int64, error) {
	offset := (page - 1) * limit
	
	query := ss.db.Model(&models.Service{}).
		Preload("Category").Preload("Subcategory").
		Where("services.is_active = ?", true)

	// Apply price filters
	if filters.PriceMax != nil {
		query = query.Where("services.price <= ?", *filters.PriceMax)
	}
	if filters.PriceMin != nil {
		query = query.Where("services.price >= ?", *filters.PriceMin)
	}

	// Apply service type filter
	if filters.PriceType != nil {
		query = query.Where("services.price_type = ?", *filters.PriceType)
	}

	// Apply keyword filters
	if len(filters.Keywords) > 0 {
		for _, keyword := range filters.Keywords {
			keyword = strings.TrimSpace(keyword)
			if keyword != "" {
				// Use proper joins to access category and subcategory names
				query = query.Joins("LEFT JOIN categories ON services.category_id = categories.id").
					Joins("LEFT JOIN subcategories ON services.subcategory_id = subcategories.id").
					Where("services.name ILIKE ? OR services.description ILIKE ? OR categories.name ILIKE ? OR subcategories.name ILIKE ?", 
						"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
			}
		}
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get results
	var services []models.Service
	err := query.Order("services.name ASC").
		Offset(offset).
		Limit(limit).
		Find(&services).Error

	if err != nil {
		return nil, 0, err
	}

	// Convert to search results with relevance scoring
	results := ss.convertToSearchResultsWithRelevance(services, filters.Keywords)
	return results, total, nil
}

// convertToSearchResults converts services to search results
func (ss *SearchService) convertToSearchResults(services []models.Service, matchReason string) []models.SearchResult {
	results := make([]models.SearchResult, len(services))
	
	for i, service := range services {
		results[i] = models.SearchResult{
			ID:            service.ID,
			Name:          service.Name,
			Slug:          service.Slug,
			Description:   service.Description,
			Category:      service.Category.Name,
			Subcategory:   service.Subcategory.Name,
			PriceType:     service.PriceType,
			Price:         service.Price,
			Duration:      service.Duration,
			Rating:        4.5, // Mock rating - in real implementation, calculate from reviews
			TotalBookings: 50,  // Mock booking count - in real implementation, get from bookings table
			Images:        service.Images,
			ServiceAreas:  []string{"Mumbai", "Delhi"}, // Mock service areas
			MatchScore:    1.0,
			MatchReason:   matchReason,
			CreatedAt:     service.CreatedAt,
			UpdatedAt:     service.UpdatedAt,
		}

		// Add highlighted price if it's a price filter
		if matchReason == "price_filter" && service.Price != nil {
			results[i].HighlightedPrice = fmt.Sprintf("₹%.0f", *service.Price)
		}
	}

	return results
}

// convertToSearchResultsWithRelevance converts services to search results with relevance scoring
func (ss *SearchService) convertToSearchResultsWithRelevance(services []models.Service, keywords []string) []models.SearchResult {
	results := make([]models.SearchResult, len(services))
	
	for i, service := range services {
		// Calculate relevance score
		score := ss.calculateRelevanceScore(service, keywords)
		
		results[i] = models.SearchResult{
			ID:            service.ID,
			Name:          service.Name,
			Slug:          service.Slug,
			Description:   service.Description,
			Category:      service.Category.Name,
			Subcategory:   service.Subcategory.Name,
			PriceType:     service.PriceType,
			Price:         service.Price,
			Duration:      service.Duration,
			Rating:        4.5, // Mock rating
			TotalBookings: 50,  // Mock booking count
			Images:        service.Images,
			ServiceAreas:  []string{"Mumbai", "Delhi"}, // Mock service areas
			MatchScore:    score,
			MatchReason:   "keyword_match",
			CreatedAt:     service.CreatedAt,
			UpdatedAt:     service.UpdatedAt,
		}

		// Add highlighted text
		results[i].HighlightedName = ss.highlightKeywords(service.Name, keywords)
		results[i].HighlightedDesc = ss.highlightKeywords(service.Description, keywords)
	}

	// Sort by relevance score
	sort.Slice(results, func(i, j int) bool {
		return results[i].MatchScore > results[j].MatchScore
	})

	return results
}

// calculateRelevanceScore calculates relevance score for a service
func (ss *SearchService) calculateRelevanceScore(service models.Service, keywords []string) float64 {
	score := 0.0
	
	for _, keyword := range keywords {
		keyword = strings.ToLower(keyword)
		
		// Exact match in name (highest score)
		if strings.Contains(strings.ToLower(service.Name), keyword) {
			score += 100.0
		}
		
		// Partial match in name
		if strings.Contains(strings.ToLower(service.Name), keyword) {
			score += 80.0
		}
		
		// Category match
		if strings.Contains(strings.ToLower(service.Category.Name), keyword) {
			score += 60.0
		}
		
		// Subcategory match
		if strings.Contains(strings.ToLower(service.Subcategory.Name), keyword) {
			score += 60.0
		}
		
		// Description match
		if strings.Contains(strings.ToLower(service.Description), keyword) {
			score += 40.0
		}
	}
	
	// Normalize score
	if len(keywords) > 0 {
		score = score / float64(len(keywords))
	}
	
	return score
}

// highlightKeywords highlights matching keywords in text
func (ss *SearchService) highlightKeywords(text string, keywords []string) string {
	highlighted := text
	
	for _, keyword := range keywords {
		keyword = strings.TrimSpace(keyword)
		if keyword != "" {
			// Case-insensitive replacement
			re := regexp.MustCompile(`(?i)` + regexp.QuoteMeta(keyword))
			highlighted = re.ReplaceAllString(highlighted, "<mark>$0</mark>")
		}
	}
	
	return highlighted
}
