package repositories

import (
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

type ChatbotRepository struct {
	db *gorm.DB
}

func NewChatbotRepository() *ChatbotRepository {
	return &ChatbotRepository{
		db: database.GetDB(),
	}
}

// ChatbotSession methods

// CreateSession creates a new chatbot session
func (r *ChatbotRepository) CreateSession(session *models.ChatbotSession) (*models.ChatbotSession, error) {
	if err := r.db.Create(session).Error; err != nil {
		return nil, err
	}
	return session, nil
}

// GetSessionByID retrieves a chatbot session by session ID
func (r *ChatbotRepository) GetSessionByID(sessionID string) (*models.ChatbotSession, error) {
	var session models.ChatbotSession
	err := r.db.Where("session_id = ? AND deleted_at IS NULL", sessionID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// GetSessionByUserID retrieves active chatbot sessions for a user
func (r *ChatbotRepository) GetSessionByUserID(userID uint) ([]models.ChatbotSession, error) {
	var sessions []models.ChatbotSession
	err := r.db.Where("user_id = ? AND is_active = true AND deleted_at IS NULL", userID).
		Order("last_message_at DESC").
		Find(&sessions).Error
	if err != nil {
		return nil, err
	}
	return sessions, nil
}

// UpdateSession updates a chatbot session
func (r *ChatbotRepository) UpdateSession(session *models.ChatbotSession) error {
	return r.db.Save(session).Error
}

// DeleteSession soft deletes a chatbot session
func (r *ChatbotRepository) DeleteSession(sessionID string) error {
	return r.db.Where("session_id = ?", sessionID).Delete(&models.ChatbotSession{}).Error
}

// CleanupExpiredSessions removes expired chatbot sessions
func (r *ChatbotRepository) CleanupExpiredSessions() (int64, error) {
	result := r.db.Where("expires_at < ? AND deleted_at IS NULL", time.Now()).Delete(&models.ChatbotSession{})
	return result.RowsAffected, result.Error
}

// UpdateSessionLastMessage updates the last message timestamp for a session
func (r *ChatbotRepository) UpdateSessionLastMessage(sessionID string) error {
	return r.db.Model(&models.ChatbotSession{}).
		Where("session_id = ?", sessionID).
		Updates(map[string]interface{}{
			"last_message_at": time.Now(),
			"expires_at":      time.Now().Add(24 * time.Hour),
		}).Error
}

// ChatbotMessage methods

// CreateMessage creates a new chatbot message
func (r *ChatbotRepository) CreateMessage(message *models.ChatbotMessage) (*models.ChatbotMessage, error) {
	if err := r.db.Create(message).Error; err != nil {
		return nil, err
	}
	return message, nil
}

// GetMessagesBySession retrieves messages for a chatbot session
func (r *ChatbotRepository) GetMessagesBySession(sessionID string, limit int, offset int) ([]models.ChatbotMessage, error) {
	var messages []models.ChatbotMessage
	query := r.db.Where("session_id = ? AND deleted_at IS NULL", sessionID).
		Order("created_at ASC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}
	
	err := query.Find(&messages).Error
	if err != nil {
		return nil, err
	}
	return messages, nil
}

// GetRecentMessages retrieves recent messages for context
func (r *ChatbotRepository) GetRecentMessages(sessionID string, limit int) ([]models.ChatbotMessage, error) {
	var messages []models.ChatbotMessage
	err := r.db.Where("session_id = ? AND deleted_at IS NULL", sessionID).
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error
	if err != nil {
		return nil, err
	}
	return messages, nil
}

// UpdateMessage updates a chatbot message
func (r *ChatbotRepository) UpdateMessage(message *models.ChatbotMessage) error {
	return r.db.Save(message).Error
}

// ChatbotSuggestion methods

// GetSuggestions retrieves active chatbot suggestions
func (r *ChatbotRepository) GetSuggestions(category string, limit int) ([]models.ChatbotSuggestion, error) {
	var suggestions []models.ChatbotSuggestion
	query := r.db.Where("is_active = true")
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	
	query = query.Order("priority DESC, usage_count DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&suggestions).Error
	if err != nil {
		return nil, err
	}
	return suggestions, nil
}

// GetSuggestionsByContext retrieves contextual suggestions
func (r *ChatbotRepository) GetSuggestionsByContext(context map[string]interface{}, limit int) ([]models.ChatbotSuggestion, error) {
	var suggestions []models.ChatbotSuggestion
	query := r.db.Where("is_active = true")
	
	// Add context-based filtering logic here if needed
	// For now, we'll return general suggestions
	
	query = query.Order("priority DESC, usage_count DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&suggestions).Error
	if err != nil {
		return nil, err
	}
	return suggestions, nil
}

// IncrementSuggestionUsage increments the usage count for a suggestion
func (r *ChatbotRepository) IncrementSuggestionUsage(suggestionID uint) error {
	return r.db.Model(&models.ChatbotSuggestion{}).
		Where("id = ?", suggestionID).
		Update("usage_count", gorm.Expr("usage_count + 1")).Error
}

// CreateSuggestion creates a new chatbot suggestion
func (r *ChatbotRepository) CreateSuggestion(suggestion *models.ChatbotSuggestion) (*models.ChatbotSuggestion, error) {
	if err := r.db.Create(suggestion).Error; err != nil {
		return nil, err
	}
	return suggestion, nil
}

// UpdateSuggestion updates a chatbot suggestion
func (r *ChatbotRepository) UpdateSuggestion(suggestion *models.ChatbotSuggestion) error {
	return r.db.Save(suggestion).Error
}

// DeleteSuggestion soft deletes a chatbot suggestion
func (r *ChatbotRepository) DeleteSuggestion(suggestionID uint) error {
	return r.db.Delete(&models.ChatbotSuggestion{}, suggestionID).Error
}

// GetSessionWithMessages retrieves a session with its messages
func (r *ChatbotRepository) GetSessionWithMessages(sessionID string) (*models.ChatbotSession, error) {
	var session models.ChatbotSession
	err := r.db.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).Where("session_id = ? AND deleted_at IS NULL", sessionID).First(&session).Error
	
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// GetActiveSessionsCount returns the count of active chatbot sessions
func (r *ChatbotRepository) GetActiveSessionsCount() (int64, error) {
	var count int64
	err := r.db.Model(&models.ChatbotSession{}).
		Where("is_active = true AND deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

// GetMessagesCountBySession returns the count of messages for a session
func (r *ChatbotRepository) GetMessagesCountBySession(sessionID string) (int64, error) {
	var count int64
	err := r.db.Model(&models.ChatbotMessage{}).
		Where("session_id = ? AND deleted_at IS NULL", sessionID).
		Count(&count).Error
	return count, err
}

// GetPopularSuggestions returns the most used suggestions
func (r *ChatbotRepository) GetPopularSuggestions(limit int) ([]models.ChatbotSuggestion, error) {
	var suggestions []models.ChatbotSuggestion
	err := r.db.Where("is_active = true").
		Order("usage_count DESC").
		Limit(limit).
		Find(&suggestions).Error
	if err != nil {
		return nil, err
	}
	return suggestions, nil
}
