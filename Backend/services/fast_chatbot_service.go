package services

import (
	"fmt"
	"strings"
	"time"
	"treesindia/models"
	"treesindia/repositories"
	
	"github.com/sirupsen/logrus"
)

// FastChatbotService handles fast chatbot responses with rule-based processing
type FastChatbotService struct {
	intentDetector    *SimpleIntentDetector
	propertyService   *FastPropertyService
	responseTemplates *ResponseTemplates
	chatbotRepo       *repositories.ChatbotRepository
	aiService         *ChatbotService // Fallback AI service
}

// NewFastChatbotService creates a new fast chatbot service
func NewFastChatbotService(chatbotRepo *repositories.ChatbotRepository, aiService *ChatbotService) *FastChatbotService {
	return &FastChatbotService{
		intentDetector:    NewSimpleIntentDetector(),
		propertyService:   NewFastPropertyService(),
		responseTemplates: NewResponseTemplates(),
		chatbotRepo:       chatbotRepo,
		aiService:         aiService,
	}
}

// FastChatbotResponse represents a fast chatbot response
type FastChatbotResponse struct {
	Message       string                 `json:"message"`
	QueryType     string                 `json:"query_type"`
	DataResults   map[string]interface{} `json:"data_results"`
	Suggestions   []string               `json:"suggestions"`
	Context       map[string]interface{} `json:"context"`
	NeedsMoreInfo bool                   `json:"needs_more_info"`
	NextStep      string                 `json:"next_step"`
	ProcessingTime int                   `json:"processing_time_ms"`
	UsedAI        bool                   `json:"used_ai"`
}

// SendMessage processes a user message and returns a fast response
func (s *FastChatbotService) SendMessage(sessionID string, req *models.SendChatbotMessageRequest) (*models.ChatbotMessageResponse, error) {
	startTime := time.Now()
	
	// Get or create session
	session, err := s.chatbotRepo.GetSessionByID(sessionID)
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
	
	userMessage, err = s.chatbotRepo.CreateMessage(userMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to save user message: %v", err)
	}
	
	// Update session context
	if req.Context != nil {
		for k, v := range req.Context {
			session.AddContext(k, v)
		}
	}
	
	// Process message with fast service
	response, err := s.processMessageFast(req.Message, session)
	if err != nil {
		logrus.Errorf("Failed to process message with fast service: %v", err)
		// Fallback to AI service
		response, err = s.processMessageWithAI(req.Message, session)
		if err != nil {
			return nil, fmt.Errorf("failed to process message: %v", err)
		}
	}
	
	// Save assistant message
	assistantMessage := &models.ChatbotMessage{
		SessionID:      sessionID,
		Role:           "assistant",
		Content:        response.Message,
		MessageType:    "text",
		IsProcessed:    true,
		ProcessingTime: intPtr(int(time.Since(startTime).Milliseconds())),
		Context:        response.Context,
		DataResults:    response.DataResults,
		Suggestions:    response.Suggestions,
	}
	
	assistantMessage, err = s.chatbotRepo.CreateMessage(assistantMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to save assistant message: %v", err)
	}
	
	// Update session
	session.QueryType = response.QueryType
	session.UpdateLastMessageAt()
	session.CurrentContext = response.Context
	
	err = s.chatbotRepo.UpdateSession(session)
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

// processMessageFast processes message using rule-based approach
func (s *FastChatbotService) processMessageFast(message string, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	startTime := time.Now()
	
	// Detect intent using simple rules
	intent := s.intentDetector.DetectIntent(message, session.Location)
	
	// Check if we need AI processing
	if s.intentDetector.IsComplexQuery(message) {
		return nil, fmt.Errorf("complex query detected, falling back to AI")
	}
	
	// Handle different intent types
	var response *FastChatbotResponse
	var err error
	
	switch intent.Type {
	case "property":
		response, err = s.handlePropertyQuery(intent, session)
	case "service":
		response, err = s.handleServiceQuery(intent, session)
	case "project":
		response, err = s.handleProjectQuery(intent, session)
	default:
		response, err = s.handleGeneralQuery(intent, session)
	}
	
	if err != nil {
		return nil, err
	}
	
	// Set processing time
	response.ProcessingTime = int(time.Since(startTime).Milliseconds())
	response.UsedAI = false
	
	return response, nil
}

// processMessageWithAI processes message using AI service as fallback
func (s *FastChatbotService) processMessageWithAI(message string, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	startTime := time.Now()
	
	// Get recent messages for context
	recentMessages, err := s.chatbotRepo.GetRecentMessages(session.SessionID, 5)
	if err != nil {
		recentMessages = []models.ChatbotMessage{}
	}
	
	// Use AI service
	aiResponse, err := s.aiService.processMessage(message, session, recentMessages)
	if err != nil {
		return nil, err
	}
	
	// Convert to fast response format
	response := &FastChatbotResponse{
		Message:       aiResponse.Message,
		QueryType:     aiResponse.QueryType,
		DataResults:   aiResponse.DataResults,
		Suggestions:   aiResponse.Suggestions,
		Context:       aiResponse.Context,
		NeedsMoreInfo: aiResponse.NeedsMoreInfo,
		NextStep:      aiResponse.NextStep,
		ProcessingTime: int(time.Since(startTime).Milliseconds()),
		UsedAI:        true,
	}
	
	return response, nil
}

// handlePropertyQuery handles property-related queries
func (s *FastChatbotService) handlePropertyQuery(intent *SimpleIntent, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	// Search properties
	searchResult, err := s.propertyService.SearchProperties(intent)
	if err != nil {
		return nil, fmt.Errorf("failed to search properties: %v", err)
	}
	
	// Check for missing information
	missingInfo := s.propertyService.GetMissingInfo(intent)
	
	// Prepare template data
	templateData := &TemplateData{
		Properties:  searchResult.Properties,
		Total:       searchResult.Total,
		Location:    s.getStringFromEntities(intent.Entities, "location"),
		Bedrooms:    s.getIntFromEntities(intent.Entities, "bedrooms"),
		Budget:      s.getIntFromEntities(intent.Entities, "budget"),
		MissingInfo: missingInfo,
		Suggestions: s.propertyService.GetPropertySuggestions(intent),
	}
	
	// Generate response
	message := s.responseTemplates.GenerateResponse(intent, templateData)
	
	// Determine if more info is needed
	needsMoreInfo := len(missingInfo) > 0
	nextStep := ""
	if needsMoreInfo {
		nextStep = "Please provide the missing information to get better results"
	} else if searchResult.Total > 0 {
		nextStep = "Would you like to see more details about any property?"
	}
	
	return &FastChatbotResponse{
		Message:       message,
		QueryType:     "property",
		DataResults:   map[string]interface{}{"properties": searchResult.Properties, "total": searchResult.Total, "filters": searchResult.Filters},
		Suggestions:   templateData.Suggestions,
		Context:       session.CurrentContext,
		NeedsMoreInfo: needsMoreInfo,
		NextStep:      nextStep,
	}, nil
}

// handleServiceQuery handles service-related queries
func (s *FastChatbotService) handleServiceQuery(intent *SimpleIntent, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	// Prepare template data
	templateData := &TemplateData{
		ServiceType: s.getStringFromEntities(intent.Entities, "service_type"),
		Suggestions: []string{
			"Book cleaning service on TreesIndia",
			"Find plumbing services in your area",
			"Schedule electrical maintenance",
			"Get quotes for home renovation",
			"Contact service providers directly",
		},
	}
	
	// Generate response
	message := s.responseTemplates.GenerateResponse(intent, templateData)
	
	return &FastChatbotResponse{
		Message:       message,
		QueryType:     "service",
		DataResults:   make(map[string]interface{}),
		Suggestions:   templateData.Suggestions,
		Context:       session.CurrentContext,
		NeedsMoreInfo: false,
		NextStep:      "What type of service do you need?",
	}, nil
}

// handleProjectQuery handles project-related queries
func (s *FastChatbotService) handleProjectQuery(intent *SimpleIntent, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	// Prepare template data
	templateData := &TemplateData{
		Suggestions: []string{
			"Browse construction projects on TreesIndia",
			"Find infrastructure development projects",
			"Get project quotes and timelines",
			"Contact project managers",
			"Start your own project",
		},
	}
	
	// Generate response
	message := s.responseTemplates.GenerateResponse(intent, templateData)
	
	return &FastChatbotResponse{
		Message:       message,
		QueryType:     "project",
		DataResults:   make(map[string]interface{}),
		Suggestions:   templateData.Suggestions,
		Context:       session.CurrentContext,
		NeedsMoreInfo: false,
		NextStep:      "What type of project are you interested in?",
	}, nil
}

// handleGeneralQuery handles general queries
func (s *FastChatbotService) handleGeneralQuery(intent *SimpleIntent, session *models.ChatbotSession) (*FastChatbotResponse, error) {
	message := strings.ToLower(strings.TrimSpace(intent.OriginalText))
	
	// Handle common greetings and help requests
	var responseMessage string
	var suggestions []string
	
	if s.isGreeting(message) {
		responseMessage = s.responseTemplates.GetGreetingResponse()
		suggestions = []string{
			"Find rental properties",
			"Browse properties for sale",
			"Book home services",
			"Explore construction projects",
		}
	} else if s.isHelpRequest(message) {
		responseMessage = s.responseTemplates.GetHelpResponse()
		suggestions = []string{
			"3BHK rent in Siliguri",
			"Book cleaning service",
			"Find construction projects",
			"Contact support",
		}
	} else {
		// Default general response
		responseMessage = s.responseTemplates.GenerateResponse(intent, &TemplateData{})
		suggestions = []string{
			"Search properties",
			"Book services",
			"Find projects",
			"Get help",
		}
	}
	
	return &FastChatbotResponse{
		Message:       responseMessage,
		QueryType:     "general",
		DataResults:   make(map[string]interface{}),
		Suggestions:   suggestions,
		Context:       session.CurrentContext,
		NeedsMoreInfo: false,
		NextStep:      "What would you like to do next?",
	}, nil
}

// Helper methods

// getStringFromEntities safely gets string value from entities
func (s *FastChatbotService) getStringFromEntities(entities map[string]interface{}, key string) string {
	if value, ok := entities[key].(string); ok {
		return value
	}
	return ""
}

// getIntFromEntities safely gets int value from entities
func (s *FastChatbotService) getIntFromEntities(entities map[string]interface{}, key string) int {
	if value, ok := entities[key].(int); ok {
		return value
	}
	return 0
}

// isGreeting checks if message is a greeting
func (s *FastChatbotService) isGreeting(message string) bool {
	greetings := []string{
		"hello", "hi", "hey", "good morning", "good afternoon", "good evening",
		"namaste", "namaskar", "greetings", "welcome",
	}
	
	for _, greeting := range greetings {
		if strings.Contains(message, greeting) {
			return true
		}
	}
	return false
}

// isHelpRequest checks if message is a help request
func (s *FastChatbotService) isHelpRequest(message string) bool {
	helpWords := []string{
		"help", "assist", "support", "guide", "how", "what", "can you",
		"do you", "are you", "tell me", "explain", "show me",
	}
	
	for _, word := range helpWords {
		if strings.Contains(message, word) {
			return true
		}
	}
	return false
}

