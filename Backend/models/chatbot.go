package models

import (
	"time"

	"gorm.io/gorm"
)

// ChatbotSession represents a chatbot conversation session
type ChatbotSession struct {
	gorm.Model
	// Session identification
	SessionID string `json:"session_id" gorm:"uniqueIndex;not null"`
	UserID    *uint  `json:"user_id"` // Optional - for logged-in users
	
	// Session metadata
	IsActive       bool      `json:"is_active" gorm:"default:true"`
	LastMessageAt  time.Time `json:"last_message_at"`
	ExpiresAt      time.Time `json:"expires_at"`
	
	// Context and state
	CurrentContext map[string]interface{} `json:"current_context" gorm:"type:jsonb;default:'{}';serializer:json"`
	QueryType      string                 `json:"query_type"` // property, service, project, general
	Location       string                 `json:"location"`   // User's location context
	
	// Relationships
	User           *User              `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Messages       []ChatbotMessage   `json:"messages,omitempty" gorm:"foreignKey:SessionID;references:SessionID"`
}

// ChatbotMessage represents a single message in a chatbot conversation
type ChatbotMessage struct {
	gorm.Model
	// Message identification
	SessionID string `json:"session_id" gorm:"not null;index"`
	
	// Message content
	Role      string `json:"role" gorm:"not null"` // user, assistant, system
	Content   string `json:"content" gorm:"not null"`
	MessageType string `json:"message_type"` // text, suggestion, data_results
	
	// Message metadata
	IsProcessed    bool                   `json:"is_processed" gorm:"default:false"`
	ProcessingTime *int                   `json:"processing_time_ms" gorm:"column:processing_time_ms"` // Processing time in milliseconds
	TokenUsage     *int                   `json:"token_usage"` // OpenAI token usage
	ModelUsed      string                 `json:"model_used"` // OpenAI model used
	
	// Context and data
	Context        map[string]interface{} `json:"context" gorm:"type:jsonb;default:'{}';serializer:json"`
	DataResults    map[string]interface{} `json:"data_results" gorm:"type:jsonb;default:'{}';serializer:json"`
	Suggestions    []string               `json:"suggestions" gorm:"type:jsonb;serializer:json"`
	
	// Relationships
	Session        *ChatbotSession `json:"session,omitempty" gorm:"foreignKey:SessionID;references:SessionID"`
}

// ChatbotSuggestion represents a suggestion for user interaction
type ChatbotSuggestion struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Suggestion content
	Text        string `json:"text" gorm:"not null"`
	Action      string `json:"action"` // click, search, navigate
	ActionData  map[string]interface{} `json:"action_data" gorm:"type:jsonb;default:'{}';serializer:json"`
	
	// Suggestion metadata
	Category    string `json:"category"` // property, service, general
	Priority    int    `json:"priority" gorm:"default:0"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	
	// Usage tracking
	UsageCount  int `json:"usage_count" gorm:"default:0"`
}

// ChatbotQuery represents a structured query extracted from user input
type ChatbotQuery struct {
	QueryType    string                 `json:"query_type"`    // property, service, project, general
	Intent       string                 `json:"intent"`        // search, filter, compare, book, info
	Entities     map[string]interface{} `json:"entities"`      // Extracted entities (location, price, etc.)
	Filters      map[string]interface{} `json:"filters"`       // Structured filters
	Confidence   float64                `json:"confidence"`    // Confidence score (0-1)
	OriginalText string                 `json:"original_text"` // Original user input
}

// ChatbotResponse represents the structured response from the chatbot
type ChatbotResponse struct {
	Message       string                 `json:"message"`
	QueryType     string                 `json:"query_type"`
	DataResults   map[string]interface{} `json:"data_results"`
	Suggestions   []string               `json:"suggestions"`
	Context       map[string]interface{} `json:"context"`
	NeedsMoreInfo bool                   `json:"needs_more_info"`
	NextStep      string                 `json:"next_step"`
}

// CreateChatbotSessionRequest represents the request to create a new chatbot session
type CreateChatbotSessionRequest struct {
	UserID    *uint  `json:"user_id"`
	Location  string `json:"location"`
	Context   map[string]interface{} `json:"context"`
}

// SendChatbotMessageRequest represents the request to send a message to the chatbot
type SendChatbotMessageRequest struct {
	SessionID string `json:"session_id" binding:"required"`
	Message   string `json:"message" binding:"required"`
	Context   map[string]interface{} `json:"context"`
}

// ChatbotSessionResponse represents the response for a chatbot session
type ChatbotSessionResponse struct {
	SessionID     string                 `json:"session_id"`
	IsActive      bool                   `json:"is_active"`
	LastMessageAt time.Time              `json:"last_message_at"`
	CurrentContext map[string]interface{} `json:"current_context"`
	QueryType     string                 `json:"query_type"`
	Location      string                 `json:"location"`
	Messages      []ChatbotMessage       `json:"messages"`
}

// ChatbotMessageResponse represents the response for a chatbot message
type ChatbotMessageResponse struct {
	ID            uint                   `json:"id"`
	SessionID     string                 `json:"session_id"`
	Role          string                 `json:"role"`
	Content       string                 `json:"content"`
	MessageType   string                 `json:"message_type"`
	CreatedAt     time.Time              `json:"created_at"`
	Context       map[string]interface{} `json:"context"`
	DataResults   map[string]interface{} `json:"data_results"`
	Suggestions   []string               `json:"suggestions"`
	NeedsMoreInfo bool                   `json:"needs_more_info"`
	NextStep      string                 `json:"next_step"`
}

// TableName returns the table name for ChatbotSession
func (ChatbotSession) TableName() string {
	return "chatbot_sessions"
}

// TableName returns the table name for ChatbotMessage
func (ChatbotMessage) TableName() string {
	return "chatbot_messages"
}

// TableName returns the table name for ChatbotSuggestion
func (ChatbotSuggestion) TableName() string {
	return "chatbot_suggestions"
}

// BeforeCreate is a GORM hook that runs before creating a chatbot session
func (cs *ChatbotSession) BeforeCreate(tx *gorm.DB) error {
	if cs.ExpiresAt.IsZero() {
		// Set session to expire after 24 hours of inactivity
		cs.ExpiresAt = time.Now().Add(24 * time.Hour)
	}
	return nil
}

// IsExpired checks if the chatbot session has expired
func (cs *ChatbotSession) IsExpired() bool {
	return time.Now().After(cs.ExpiresAt)
}

// UpdateLastMessageAt updates the last message timestamp
func (cs *ChatbotSession) UpdateLastMessageAt() {
	cs.LastMessageAt = time.Now()
	// Extend expiration time by 24 hours from now
	cs.ExpiresAt = time.Now().Add(24 * time.Hour)
}

// AddContext adds or updates context information
func (cs *ChatbotSession) AddContext(key string, value interface{}) {
	if cs.CurrentContext == nil {
		cs.CurrentContext = make(map[string]interface{})
	}
	cs.CurrentContext[key] = value
}

// GetContext retrieves context information
func (cs *ChatbotSession) GetContext(key string) (interface{}, bool) {
	if cs.CurrentContext == nil {
		return nil, false
	}
	value, exists := cs.CurrentContext[key]
	return value, exists
}
