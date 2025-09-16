package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
	"treesindia/config"
	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type ChatbotService struct {
	ChatbotRepo    *repositories.ChatbotRepository
	propertyRepo   *repositories.PropertyRepository
	serviceRepo    *repositories.ServiceRepository
	projectRepo    *repositories.ProjectRepository
	userRepo       *repositories.UserRepository
	config         *config.AppConfig
	prompts        *ChatbotPrompts
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	MaxTokens   int             `json:"max_tokens"`
	Temperature float64         `json:"temperature"`
}

type OpenAIResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

func NewChatbotService() *ChatbotService {
	return &ChatbotService{
		ChatbotRepo:  repositories.NewChatbotRepository(),
		propertyRepo: repositories.NewPropertyRepository(),
		serviceRepo:  repositories.NewServiceRepository(),
		projectRepo:  repositories.NewProjectRepository(),
		userRepo:     repositories.NewUserRepository(),
		config:       config.LoadConfig(),
		prompts:      NewChatbotPrompts(),
	}
}

// CreateSession creates a new chatbot session
func (s *ChatbotService) CreateSession(req *models.CreateChatbotSessionRequest) (*models.ChatbotSession, error) {
	sessionID := uuid.New().String()
	
	session := &models.ChatbotSession{
		SessionID:      sessionID,
		UserID:         req.UserID,
		IsActive:       true,
		LastMessageAt:  time.Now(),
		ExpiresAt:      time.Now().Add(24 * time.Hour),
		CurrentContext: req.Context,
		Location:       req.Location,
	}
	
	if session.CurrentContext == nil {
		session.CurrentContext = make(map[string]interface{})
	}
	
	session, err := s.ChatbotRepo.CreateSession(session)
	if err != nil {
		logrus.Errorf("ChatbotService.CreateSession failed: %v", err)
		return nil, err
	}
	
	// Send welcome message
	welcomeMessage := "Hello! I'm your TreesIndia assistant. I can help you find properties, book services, or answer any questions about our platform. How can I assist you today?"
	
	_, err = s.SendMessage(sessionID, &models.SendChatbotMessageRequest{
		SessionID: sessionID,
		Message:   welcomeMessage,
		Context:   make(map[string]interface{}),
	})
	
	if err != nil {
		logrus.Errorf("ChatbotService.CreateSession failed to send welcome message: %v", err)
		// Don't fail the session creation for this
	}
	
	return session, nil
}

// SendMessage processes a user message and returns a chatbot response
func (s *ChatbotService) SendMessage(sessionID string, req *models.SendChatbotMessageRequest) (*models.ChatbotMessageResponse, error) {
	startTime := time.Now()
	
	// Get or create session
	session, err := s.ChatbotRepo.GetSessionByID(sessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %v", err)
	}
	
	// Save user message
	userMessage := &models.ChatbotMessage{
		SessionID:    sessionID,
		Role:         "user",
		Content:      req.Message,
		MessageType:  "text",
		Context:      req.Context,
	}
	
	userMessage, err = s.ChatbotRepo.CreateMessage(userMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to save user message: %v", err)
	}
	
	// Update session context
	if req.Context != nil {
		for k, v := range req.Context {
			session.AddContext(k, v)
		}
	}
	
	// Get conversation history for context
	recentMessages, err := s.ChatbotRepo.GetRecentMessages(sessionID, 10)
	if err != nil {
		logrus.Errorf("Failed to get recent messages: %v", err)
		recentMessages = []models.ChatbotMessage{}
	}
	
	// Process the message and generate response
	response, err := s.processMessage(req.Message, session, recentMessages)
	if err != nil {
		logrus.Errorf("Failed to process message: %v", err)
		response = &models.ChatbotResponse{
			Message:       "I'm sorry, I encountered an error processing your message. Please try again.",
			QueryType:     "general",
			DataResults:   make(map[string]interface{}),
			Suggestions:   []string{"Try again", "Contact support", "Browse properties", "Find services"},
			Context:       session.CurrentContext,
			NeedsMoreInfo: false,
			NextStep:      "",
		}
	}
	
	// Save assistant message
	assistantMessage := &models.ChatbotMessage{
		SessionID:     sessionID,
		Role:          "assistant",
		Content:       response.Message,
		MessageType:   "text",
		IsProcessed:   true,
		ProcessingTime: intPtr(int(time.Since(startTime).Milliseconds())),
		Context:       response.Context,
		DataResults:   response.DataResults,
		Suggestions:   response.Suggestions,
	}
	
	assistantMessage, err = s.ChatbotRepo.CreateMessage(assistantMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to save assistant message: %v", err)
	}
	
	// Update session
	session.QueryType = response.QueryType
	session.UpdateLastMessageAt()
	session.CurrentContext = response.Context
	
	err = s.ChatbotRepo.UpdateSession(session)
	if err != nil {
		logrus.Errorf("Failed to update session: %v", err)
	}
	
	// Return response
	return &models.ChatbotMessageResponse{
		ID:            assistantMessage.ID,
		SessionID:     sessionID,
		Role:          "assistant",
		Content:       response.Message,
		MessageType:   "text",
		CreatedAt:     assistantMessage.CreatedAt,
		Context:       response.Context,
		DataResults:   response.DataResults,
		Suggestions:   response.Suggestions,
		NeedsMoreInfo: response.NeedsMoreInfo,
		NextStep:      response.NextStep,
	}, nil
}

// processMessage processes the user message and generates a response
func (s *ChatbotService) processMessage(message string, session *models.ChatbotSession, history []models.ChatbotMessage) (*models.ChatbotResponse, error) {
	// Parse the query to understand intent
	query, err := s.parseQuery(message, session)
	if err != nil {
		logrus.Errorf("Failed to parse query: %v", err)
		query = &models.ChatbotQuery{
			QueryType:    "general",
			Intent:       "info",
			Entities:     make(map[string]interface{}),
			Filters:      make(map[string]interface{}),
			Confidence:   0.5,
			OriginalText: message,
		}
	}
	
	logrus.Infof("Parsed query - Type: %s, Intent: %s, Entities: %v, Filters: %v", 
		query.QueryType, query.Intent, query.Entities, query.Filters)
	
	// Fetch relevant data based on query type
	dataResults := make(map[string]interface{})
	switch query.QueryType {
	case "property":
		dataResults, err = s.fetchPropertyData(query, session)
	case "service":
		dataResults, err = s.fetchServiceData(query, session)
	case "project":
		dataResults, err = s.fetchProjectData(query, session)
	default:
		dataResults = make(map[string]interface{})
	}
	
	// Generate AI response
	aiResponse, err := s.generateAIResponse(message, session, history, query, dataResults)
	if err != nil {
		logrus.Errorf("Failed to generate AI response: %v", err)
		aiResponse = "I'm here to help you with properties, services, and projects on TreesIndia. Could you please be more specific about what you're looking for?"
	}
	
	// Generate suggestions
	suggestions, err := s.generateSuggestions(query, session)
	if err != nil {
		logrus.Errorf("Failed to generate suggestions: %v", err)
		suggestions = []string{"Find properties", "Book services", "Contact support"}
	}
	
	// Determine if more info is needed
	needsMoreInfo := s.needsMoreInfo(query, dataResults)
	nextStep := s.getNextStep(query, needsMoreInfo)
	
	return &models.ChatbotResponse{
		Message:       aiResponse,
		QueryType:     query.QueryType,
		DataResults:   dataResults,
		Suggestions:   suggestions,
		Context:       session.CurrentContext,
		NeedsMoreInfo: needsMoreInfo,
		NextStep:      nextStep,
	}, nil
}

// parseQuery uses AI to parse and understand the user query
func (s *ChatbotService) parseQuery(message string, session *models.ChatbotSession) (*models.ChatbotQuery, error) {
	prompt := fmt.Sprintf(`Analyze this user query and extract structured information for TreesIndia platform.

IMPORTANT: Only classify as property/service/project if CLEARLY related:
- Property queries: Must contain "rent", "sale", "buy", "property", "house", "apartment", "BHK", "bedroom"
- Service queries: Must contain "service", "book", "cleaning", "plumbing", "electrical", "maintenance"
- Project queries: Must contain "project", "construction", "build", "contractor"
- General queries: Everything else (greetings, questions, "test", "hello", etc.)

User Query: "%s"
User Location: "%s"
Session Context: %s

Please respond with a JSON object containing:
{
  "query_type": "property|service|project|general",
  "intent": "search|filter|compare|book|info",
  "entities": {
    "location": "city/state if mentioned",
    "property_type": "residential|commercial",
    "listing_type": "rent|sale",
    "bedrooms": "number if mentioned (1, 2, 3, 4, etc.)",
    "budget": "price range if mentioned",
    "service_category": "category if mentioned"
  },
  "filters": {
    "min_price": "number if mentioned",
    "max_price": "number if mentioned",
    "city": "city name",
    "state": "state name"
  },
  "confidence": 0.0-1.0
}

Only respond with the JSON object, no additional text.`, message, session.Location, session.CurrentContext)
	
	aiResponse, err := s.callOpenAI(prompt)
	if err != nil {
		return nil, err
	}
	
	// Parse AI response
	var query models.ChatbotQuery
	logrus.Infof("AI Response: %s", aiResponse)
	err = json.Unmarshal([]byte(aiResponse), &query)
	if err != nil {
		logrus.Errorf("Failed to parse AI response: %v", err)
		// Fallback parsing
		query = s.fallbackParseQuery(message, session)
	}
	
	query.OriginalText = message
	return &query, nil
}

// fallbackParseQuery provides basic parsing when AI fails
func (s *ChatbotService) fallbackParseQuery(message string, session *models.ChatbotSession) models.ChatbotQuery {
	message = strings.ToLower(message)
	
	query := models.ChatbotQuery{
		QueryType:    "general",
		Intent:       "info",
		Entities:     make(map[string]interface{}),
		Filters:      make(map[string]interface{}),
		Confidence:   0.5,
		OriginalText: message,
	}
	
	// Enhanced keyword-based classification
	propertyKeywords := []string{"rent", "rental", "sale", "buy", "property", "house", "apartment", "bhk", "bedroom", "room", "flat", "villa", "home"}
	propertyCount := 0
	for _, keyword := range propertyKeywords {
		if strings.Contains(message, keyword) {
			propertyCount++
		}
	}
	
	// More aggressive property detection - if any property keyword is found
	if propertyCount >= 1 {
		query.QueryType = "property"
		query.Intent = "search"
		query.Confidence = 0.8
		
		// Determine listing type
		if strings.Contains(message, "rent") || strings.Contains(message, "rental") {
			query.Entities["listing_type"] = "rent"
		} else if strings.Contains(message, "sale") || strings.Contains(message, "buy") {
			query.Entities["listing_type"] = "sale"
		} else {
			// Default to rent if no specific type mentioned
			query.Entities["listing_type"] = "rent"
		}
		
		// Extract bedroom count - more comprehensive
		if strings.Contains(message, "1bhk") || strings.Contains(message, "1 bhk") || strings.Contains(message, "1 bedroom") {
			query.Entities["bedrooms"] = "1"
		} else if strings.Contains(message, "2bhk") || strings.Contains(message, "2 bhk") || strings.Contains(message, "2 bedroom") {
			query.Entities["bedrooms"] = "2"
		} else if strings.Contains(message, "3bhk") || strings.Contains(message, "3 bhk") || strings.Contains(message, "3 bedroom") {
			query.Entities["bedrooms"] = "3"
		} else if strings.Contains(message, "4bhk") || strings.Contains(message, "4 bhk") || strings.Contains(message, "4 bedroom") {
			query.Entities["bedrooms"] = "4"
		}
		
		// Extract property type
		if strings.Contains(message, "commercial") {
			query.Entities["property_type"] = "commercial"
		} else {
			query.Entities["property_type"] = "residential"
		}
		
		// Extract location from message
		commonCities := []string{"mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "ahmedabad", "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "pimpri", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "kalyan", "vasai", "varanasi", "srinagar", "aurangabad", "noida", "solapur", "ranchi", "howrah", "coimbatore", "raipur", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "guwahati", "chandigarh", "tiruchirappalli", "mysore", "bhubaneswar", "kochi", "bhavnagar", "salem", "warangal", "guntur", "bhiwandi", "amravati", "nanded", "kolhapur", "sangli", "malegaon", "ulhasnagar", "jalgaon", "latur", "ahmednagar", "chandrapur", "parbhani", "ichalkaranji", "jalna", "ambarnath", "bhusawal", "ratnagiri", "beed", "yavatmal", "kamptee", "gondia", "barshi", "achalpur", "osmanabad", "nandurbar", "wardha", "udgir", "hinganghat", "siliguri"}
		
		for _, city := range commonCities {
			if strings.Contains(message, city) {
				query.Filters["city"] = city
				break
			}
		}
		
		// Extract budget if mentioned
		if strings.Contains(message, "7k") || strings.Contains(message, "7000") {
			query.Filters["max_price"] = 7000.0
		} else if strings.Contains(message, "10k") || strings.Contains(message, "10000") {
			query.Filters["max_price"] = 10000.0
		} else if strings.Contains(message, "15k") || strings.Contains(message, "15000") {
			query.Filters["max_price"] = 15000.0
		} else if strings.Contains(message, "20k") || strings.Contains(message, "20000") {
			query.Filters["max_price"] = 20000.0
		} else if strings.Contains(message, "25k") || strings.Contains(message, "25000") {
			query.Filters["max_price"] = 25000.0
		}
		
	} else if strings.Contains(message, "service") || strings.Contains(message, "book") || strings.Contains(message, "cleaning") || strings.Contains(message, "plumbing") || strings.Contains(message, "electrical") || strings.Contains(message, "maintenance") {
		query.QueryType = "service"
		query.Intent = "search"
		query.Confidence = 0.7
		
		// Extract service category
		if strings.Contains(message, "cleaning") {
			query.Entities["service_category"] = "cleaning"
		} else if strings.Contains(message, "plumbing") {
			query.Entities["service_category"] = "plumbing"
		} else if strings.Contains(message, "electrical") {
			query.Entities["service_category"] = "electrical"
		} else if strings.Contains(message, "maintenance") {
			query.Entities["service_category"] = "maintenance"
		}
		
	} else if strings.Contains(message, "project") || strings.Contains(message, "construction") || strings.Contains(message, "build") {
		query.QueryType = "project"
		query.Intent = "search"
		query.Confidence = 0.7
	}
	
	// Set default location if not specified
	if query.Filters["city"] == nil && session.Location != "" {
		query.Filters["city"] = session.Location
	}
	
	return query
}

// fetchPropertyData retrieves property data based on the query
func (s *ChatbotService) fetchPropertyData(query *models.ChatbotQuery, session *models.ChatbotSession) (map[string]interface{}, error) {
	filters := make(map[string]interface{})
	
	// Apply filters from query
	for key, value := range query.Filters {
		filters[key] = value
	}
	
	// Apply entities as filters
	if listingType, ok := query.Entities["listing_type"].(string); ok {
		filters["listing_type"] = listingType
	} else if strings.Contains(strings.ToLower(query.OriginalText), "rent") {
		filters["listing_type"] = "rent"
	}
	
	if propertyType, ok := query.Entities["property_type"].(string); ok {
		filters["property_type"] = propertyType
	}
	
	if bedrooms, ok := query.Entities["bedrooms"].(string); ok {
		if bedroomNum, err := strconv.Atoi(bedrooms); err == nil {
			filters["bedrooms"] = bedroomNum
		}
	}
	
	// Set default location if not specified
	if filters["city"] == nil && session.Location != "" {
		filters["city"] = session.Location
	}
	
	// Set default limit
	filters["limit"] = 5
	
	// Fetch properties from database
	var properties []models.Property
	db := database.GetDB()
	
	// Build query with proper joins and preloading
	queryBuilder := db.Preload("User").Preload("Broker").
		Where("is_approved = true AND status = 'available' AND expires_at > ?", time.Now())
	
	// Apply filters
	if listingType, ok := filters["listing_type"].(string); ok {
		queryBuilder = queryBuilder.Where("listing_type = ?", listingType)
	}
	if propertyType, ok := filters["property_type"].(string); ok {
		queryBuilder = queryBuilder.Where("property_type = ?", propertyType)
	}
	if bedrooms, ok := filters["bedrooms"].(int); ok {
		queryBuilder = queryBuilder.Where("bedrooms = ?", bedrooms)
	}
	if city, ok := filters["city"].(string); ok {
		queryBuilder = queryBuilder.Where("city ILIKE ?", "%"+city+"%")
	}
	if state, ok := filters["state"].(string); ok {
		queryBuilder = queryBuilder.Where("state ILIKE ?", "%"+state+"%")
	}
	
	// Price filters - handle both rent and sale
	if maxPrice, ok := filters["max_price"].(float64); ok {
		if listingType, ok := filters["listing_type"].(string); ok {
			if listingType == "rent" {
				queryBuilder = queryBuilder.Where("monthly_rent <= ?", maxPrice)
			} else if listingType == "sale" {
				queryBuilder = queryBuilder.Where("sale_price <= ?", maxPrice)
			}
		}
	}
	if minPrice, ok := filters["min_price"].(float64); ok {
		if listingType, ok := filters["listing_type"].(string); ok {
			if listingType == "rent" {
				queryBuilder = queryBuilder.Where("monthly_rent >= ?", minPrice)
			} else if listingType == "sale" {
				queryBuilder = queryBuilder.Where("sale_price >= ?", minPrice)
			}
		}
	}
	
	// Order by priority score and created date
	queryBuilder = queryBuilder.Order("priority_score DESC, created_at DESC")
	
	// Execute query
	err := queryBuilder.Limit(5).Find(&properties).Error
	if err != nil {
		logrus.Errorf("Failed to fetch properties: %v", err)
		return map[string]interface{}{
			"properties": []interface{}{},
			"total":      0,
			"filters":    filters,
		}, nil
	}
	
	// Convert to interface slice with more detailed information
	propertyInterfaces := make([]interface{}, len(properties))
	for i, prop := range properties {
		propertyData := map[string]interface{}{
			"id":                prop.ID,
			"title":             prop.Title,
			"description":       prop.Description,
			"listing_type":      prop.ListingType,
			"property_type":     prop.PropertyType,
			"bedrooms":          prop.Bedrooms,
			"bathrooms":         prop.Bathrooms,
			"area":              prop.Area,
			"city":              prop.City,
			"state":             prop.State,
			"address":           prop.Address,
			"pincode":           prop.Pincode,
			"images":            prop.Images,
			"price_negotiable":  prop.PriceNegotiable,
			"treesindia_assured": prop.TreesIndiaAssured,
			"created_at":        prop.CreatedAt,
		}
		
		// Add appropriate price field
		if prop.ListingType == "rent" && prop.MonthlyRent != nil {
			propertyData["monthly_rent"] = *prop.MonthlyRent
		} else if prop.ListingType == "sale" && prop.SalePrice != nil {
			propertyData["sale_price"] = *prop.SalePrice
		}
		
		// Add user information
		if prop.User != nil {
			propertyData["user_name"] = prop.User.Name
			propertyData["user_phone"] = prop.User.Phone
		}
		
		// Add broker information if available
		if prop.Broker != nil {
			propertyData["broker_name"] = prop.Broker.Name
			propertyData["broker_phone"] = prop.Broker.Phone
		}
		
		propertyInterfaces[i] = propertyData
	}
	
	return map[string]interface{}{
		"properties": propertyInterfaces,
		"total":      len(properties),
		"filters":    filters,
	}, nil
}

// fetchServiceData retrieves service data based on the query
func (s *ChatbotService) fetchServiceData(query *models.ChatbotQuery, session *models.ChatbotSession) (map[string]interface{}, error) {
	filters := make(map[string]interface{})
	
	// Apply filters from query
	for key, value := range query.Filters {
		filters[key] = value
	}
	
	// Set default location if not specified
	if filters["city"] == nil && session.Location != "" {
		filters["city"] = session.Location
	}
	
	// Set default limit
	filters["limit"] = 5
	
	// Fetch services from database
	var services []models.Service
	db := database.GetDB()
	
	// Build query with proper joins and preloading
	queryBuilder := db.Preload("Category").Preload("Subcategory").Preload("ServiceAreas").
		Where("is_active = true")
	
	// Apply filters
	if city, ok := filters["city"].(string); ok {
		queryBuilder = queryBuilder.Joins("JOIN service_service_areas ON services.id = service_service_areas.service_id").
			Joins("JOIN service_areas ON service_service_areas.service_area_id = service_areas.id").
			Where("service_areas.city ILIKE ?", "%"+city+"%")
	}
	if state, ok := filters["state"].(string); ok {
		queryBuilder = queryBuilder.Joins("JOIN service_service_areas ON services.id = service_service_areas.service_id").
			Joins("JOIN service_areas ON service_service_areas.service_area_id = service_areas.id").
			Where("service_areas.state ILIKE ?", "%"+state+"%")
	}
	
	// Filter by category if mentioned in query
	if categoryName, ok := query.Entities["service_category"].(string); ok {
		queryBuilder = queryBuilder.Joins("JOIN categories ON services.category_id = categories.id").
			Where("categories.name ILIKE ? OR categories.slug ILIKE ?", "%"+categoryName+"%", "%"+categoryName+"%")
	}
	
	// Filter by subcategory if mentioned
	if subcategoryName, ok := query.Entities["service_subcategory"].(string); ok {
		queryBuilder = queryBuilder.Joins("JOIN subcategories ON services.subcategory_id = subcategories.id").
			Where("subcategories.name ILIKE ? OR subcategories.slug ILIKE ?", "%"+subcategoryName+"%", "%"+subcategoryName+"%")
	}
	
	// Filter by price type if mentioned
	if priceType, ok := query.Entities["price_type"].(string); ok {
		queryBuilder = queryBuilder.Where("price_type = ?", priceType)
	}
	
	// Order by created date
	queryBuilder = queryBuilder.Order("created_at DESC")
	
	// Execute query
	err := queryBuilder.Limit(5).Find(&services).Error
	if err != nil {
		logrus.Errorf("Failed to fetch services: %v", err)
		return map[string]interface{}{
			"services": []interface{}{},
			"total":    0,
			"filters":  filters,
		}, nil
	}
	
	// Convert to interface slice with detailed information
	serviceInterfaces := make([]interface{}, len(services))
	for i, service := range services {
		serviceData := map[string]interface{}{
			"id":              service.ID,
			"name":            service.Name,
			"description":     service.Description,
			"price_type":      service.PriceType,
			"price":           service.Price,
			"duration":        service.Duration,
			"images":          service.Images,
			"created_at":      service.CreatedAt,
		}
		
		// Add category information
		if service.Category.ID != 0 {
			serviceData["category"] = map[string]interface{}{
				"id":   service.Category.ID,
				"name": service.Category.Name,
				"slug": service.Category.Slug,
			}
		}
		
		// Add subcategory information
		if service.Subcategory.ID != 0 {
			serviceData["subcategory"] = map[string]interface{}{
				"id":   service.Subcategory.ID,
				"name": service.Subcategory.Name,
				"slug": service.Subcategory.Slug,
			}
		}
		
		// Add service areas
		if len(service.ServiceAreas) > 0 {
			areas := make([]interface{}, len(service.ServiceAreas))
			for j, area := range service.ServiceAreas {
				areas[j] = map[string]interface{}{
					"id":    area.ID,
					"city":  area.City,
					"state": area.State,
				}
			}
			serviceData["service_areas"] = areas
		}
		
		serviceInterfaces[i] = serviceData
	}
	
	return map[string]interface{}{
		"services": serviceInterfaces,
		"total":    len(services),
		"filters":  filters,
	}, nil
}

// fetchProjectData retrieves project data based on the query
func (s *ChatbotService) fetchProjectData(query *models.ChatbotQuery, session *models.ChatbotSession) (map[string]interface{}, error) {
	filters := make(map[string]interface{})
	
	// Apply filters from query
	for key, value := range query.Filters {
		filters[key] = value
	}
	
	// Set default location if not specified
	if filters["city"] == nil && session.Location != "" {
		filters["city"] = session.Location
	}
	
	// Set default limit
	filters["limit"] = 5
	
	// Fetch projects from database
	var projects []models.Project
	db := database.GetDB()
	
	// Build query with proper joins and preloading
	queryBuilder := db.Preload("User").Where("deleted_at IS NULL")
	
	// Apply filters
	if projectType, ok := query.Entities["project_type"].(string); ok {
		queryBuilder = queryBuilder.Where("project_type = ?", projectType)
	}
	if status, ok := query.Entities["project_status"].(string); ok {
		queryBuilder = queryBuilder.Where("status = ?", status)
	}
	if city, ok := filters["city"].(string); ok {
		queryBuilder = queryBuilder.Where("city ILIKE ?", "%"+city+"%")
	}
	if state, ok := filters["state"].(string); ok {
		queryBuilder = queryBuilder.Where("state ILIKE ?", "%"+state+"%")
	}
	
	// Order by created date
	queryBuilder = queryBuilder.Order("created_at DESC")
	
	// Execute query
	err := queryBuilder.Limit(5).Find(&projects).Error
	if err != nil {
		logrus.Errorf("Failed to fetch projects: %v", err)
		return map[string]interface{}{
			"projects": []interface{}{},
			"total":    0,
			"filters":  filters,
		}, nil
	}
	
	// Convert to interface slice with detailed information
	projectInterfaces := make([]interface{}, len(projects))
	for i, project := range projects {
		projectData := map[string]interface{}{
			"id":                    project.ID,
			"title":                 project.Title,
			"description":           project.Description,
			"project_type":          project.ProjectType,
			"status":                project.Status,
			"city":                  project.City,
			"state":                 project.State,
			"address":               project.Address,
			"pincode":               project.Pincode,
			"estimated_duration_days": project.EstimatedDuration,
			"contact_info":          project.ContactInfo,
			"images":                project.Images,
			"uploaded_by_admin":     project.UploadedByAdmin,
			"created_at":            project.CreatedAt,
		}
		
		// Add user information
		if project.User != nil {
			projectData["user_name"] = project.User.Name
			projectData["user_phone"] = project.User.Phone
		}
		
		projectInterfaces[i] = projectData
	}
	
	return map[string]interface{}{
		"projects": projectInterfaces,
		"total":    len(projects),
		"filters":  filters,
	}, nil
}

// generateAIResponse generates the AI response using OpenAI
func (s *ChatbotService) generateAIResponse(message string, session *models.ChatbotSession, history []models.ChatbotMessage, query *models.ChatbotQuery, dataResults map[string]interface{}) (string, error) {
	// Build conversation context
	var messages []OpenAIMessage
	
	// System prompt
	messages = append(messages, OpenAIMessage{
		Role:    "system",
		Content: s.prompts.GetSystemPrompt(),
	})
	
	// Add conversation history (last 5 messages for context)
	historyLimit := 5
	if len(history) > historyLimit {
		history = history[len(history)-historyLimit:]
	}
	
	for _, msg := range history {
		messages = append(messages, OpenAIMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}
	
	// Add specialized prompt based on query type
	var specializedPrompt string
	switch query.QueryType {
	case "property":
		specializedPrompt = s.prompts.GetPropertySearchPrompt(query, dataResults, session)
	case "service":
		specializedPrompt = s.prompts.GetServiceSearchPrompt(query, dataResults, session)
	case "project":
		specializedPrompt = s.prompts.GetProjectSearchPrompt(query, dataResults, session)
	default:
		specializedPrompt = s.prompts.GetGeneralPrompt(query, session)
	}
	
	// Add current message with specialized context
	messages = append(messages, OpenAIMessage{
		Role:    "user",
		Content: message,
	})
	
	messages = append(messages, OpenAIMessage{
		Role:    "system",
		Content: specializedPrompt,
	})
	
	// Call OpenAI
	response, err := s.callOpenAIWithMessages(messages)
	if err != nil {
		return "", err
	}
	
	return response, nil
}

// callOpenAI makes a request to OpenAI API
func (s *ChatbotService) callOpenAI(prompt string) (string, error) {
	messages := []OpenAIMessage{
		{
			Role:    "user",
			Content: prompt,
		},
	}
	
	return s.callOpenAIWithMessages(messages)
}

// callOpenAIWithMessages makes a request to OpenAI API with message history
func (s *ChatbotService) callOpenAIWithMessages(messages []OpenAIMessage) (string, error) {
	if s.config.OpenAIAPIKey == "" {
		return "I'm sorry, but the AI service is currently unavailable. Please try again later.", nil
	}
	
	requestBody := OpenAIRequest{
		Model:       s.config.OpenAIModel,
		Messages:    messages,
		MaxTokens:   s.config.OpenAIMaxTokens,
		Temperature: s.config.OpenAITemperature,
	}
	
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}
	
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.config.OpenAIAPIKey)
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		logrus.Errorf("OpenAI API request failed: %v", err)
		return "", err
	}
	defer resp.Body.Close()
	
	// Read response body for debugging
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		logrus.Errorf("Failed to read OpenAI response body: %v", err)
		return "", err
	}
	
	logrus.Infof("OpenAI API Response Status: %d, Body: %s", resp.StatusCode, string(bodyBytes))
	
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("OpenAI API error: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}
	
	var openAIResp OpenAIResponse
	err = json.Unmarshal(bodyBytes, &openAIResp)
	if err != nil {
		logrus.Errorf("Failed to parse OpenAI response: %v", err)
		return "", err
	}
	
	if len(openAIResp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}
	
	return openAIResp.Choices[0].Message.Content, nil
}

// generateSuggestions generates contextual suggestions
func (s *ChatbotService) generateSuggestions(query *models.ChatbotQuery, session *models.ChatbotSession) ([]string, error) {
	// First, get AI-generated suggestions
	aiSuggestions, err := s.generateAISuggestions(query, session)
	if err != nil {
		logrus.Errorf("Failed to generate AI suggestions: %v", err)
	}
	
	// Fallback to database suggestions
	dbSuggestions, err := s.ChatbotRepo.GetSuggestions(query.QueryType, 5)
	if err != nil {
		logrus.Errorf("Failed to get database suggestions: %v", err)
	}
	
	// Combine suggestions (prioritize AI-generated ones)
	var allSuggestions []string
	
	// Add AI suggestions first
	if len(aiSuggestions) > 0 {
		allSuggestions = append(allSuggestions, aiSuggestions...)
	}
	
	// Add database suggestions if we don't have enough
	for _, suggestion := range dbSuggestions {
		if len(allSuggestions) >= 5 {
			break
		}
		// Avoid duplicates
		exists := false
		for _, existing := range allSuggestions {
			if existing == suggestion.Text {
				exists = true
				break
			}
		}
		if !exists {
			allSuggestions = append(allSuggestions, suggestion.Text)
		}
	}
	
	// Ensure we have at least some suggestions
	if len(allSuggestions) == 0 {
		allSuggestions = []string{"Find properties", "Book services", "Contact support"}
	}
	
	// Limit to 5 suggestions
	if len(allSuggestions) > 5 {
		allSuggestions = allSuggestions[:5]
	}
	
	return allSuggestions, nil
}

// generateAISuggestions uses AI to generate contextual suggestions
func (s *ChatbotService) generateAISuggestions(query *models.ChatbotQuery, session *models.ChatbotSession) ([]string, error) {
	prompt := s.prompts.GetSuggestionsPrompt(query, session)
	
	response, err := s.callOpenAI(prompt)
	if err != nil {
		return nil, err
	}
	
	// Parse JSON response
	var suggestions []string
	err = json.Unmarshal([]byte(response), &suggestions)
	if err != nil {
		logrus.Errorf("Failed to parse AI suggestions JSON: %v", err)
		return nil, err
	}
	
	return suggestions, nil
}

// needsMoreInfo determines if more information is needed from the user
func (s *ChatbotService) needsMoreInfo(query *models.ChatbotQuery, dataResults map[string]interface{}) bool {
	// Check if we have enough information to provide a meaningful response
	switch query.QueryType {
	case "property":
		// Check if we have any property results
		if properties, ok := dataResults["properties"].([]interface{}); ok && len(properties) > 0 {
			return false // We have results, no need for more info
		}
		
		// If no results, check if we have basic search criteria
		hasLocation := query.Filters["city"] != nil || query.Filters["state"] != nil
		hasBedrooms := query.Entities["bedrooms"] != nil
		hasListingType := query.Entities["listing_type"] != nil
		
		// If we have at least 2 of these criteria, we can search
		criteriaCount := 0
		if hasLocation { criteriaCount++ }
		if hasBedrooms { criteriaCount++ }
		if hasListingType { criteriaCount++ }
		
		return criteriaCount < 2 // Need at least 2 criteria for a meaningful search
		
	case "service":
		// Check if we have any service results
		if services, ok := dataResults["services"].([]interface{}); ok && len(services) > 0 {
			return false // We have results, no need for more info
		}
		
		// If no results, check if we have basic search criteria
		hasLocation := query.Filters["city"] != nil || query.Filters["state"] != nil
		hasCategory := query.Entities["service_category"] != nil
		
		return !hasLocation && !hasCategory // Need at least location or category
		
	case "project":
		// Check if we have any project results
		if projects, ok := dataResults["projects"].([]interface{}); ok && len(projects) > 0 {
			return false // We have results, no need for more info
		}
		
		// For projects, we can search with minimal criteria
		return false
		
	default:
		return false
	}
}

// getNextStep suggests the next step for the user
func (s *ChatbotService) getNextStep(query *models.ChatbotQuery, needsMoreInfo bool) string {
	if needsMoreInfo {
		switch query.QueryType {
		case "property":
			return "Please provide your preferred location and budget range for better property recommendations."
		case "service":
			return "Please provide your location to find available services in your area."
		default:
			return "Could you please provide more details about what you're looking for?"
		}
	}
	return ""
}

// GetSession retrieves a chatbot session with messages
func (s *ChatbotService) GetSession(sessionID string) (*models.ChatbotSessionResponse, error) {
	session, err := s.ChatbotRepo.GetSessionWithMessages(sessionID)
	if err != nil {
		return nil, err
	}
	
	return &models.ChatbotSessionResponse{
		SessionID:      session.SessionID,
		IsActive:       session.IsActive,
		LastMessageAt:  session.LastMessageAt,
		CurrentContext: session.CurrentContext,
		QueryType:      session.QueryType,
		Location:       session.Location,
		Messages:       session.Messages,
	}, nil
}

// GetSuggestions retrieves contextual suggestions
func (s *ChatbotService) GetSuggestions(category string, limit int) ([]models.ChatbotSuggestion, error) {
	return s.ChatbotRepo.GetSuggestions(category, limit)
}

// Helper function to create int pointer
func intPtr(i int) *int {
	return &i
}
