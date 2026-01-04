package repositories

import (
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SimpleConversationRepository struct {
	db *gorm.DB
}

func NewSimpleConversationRepository(db *gorm.DB) *SimpleConversationRepository {
	return &SimpleConversationRepository{db: db}
}

// Create creates a new simple conversation
func (r *SimpleConversationRepository) Create(conversation *models.SimpleConversation) (*models.SimpleConversation, error) {
	if err := r.db.Create(conversation).Error; err != nil {
		return nil, err
	}
	return conversation, nil
}

// GetByID gets a conversation by ID
func (r *SimpleConversationRepository) GetByID(id uint) (*models.SimpleConversation, error) {
	var conversation models.SimpleConversation
	err := r.db.Preload("User1Data").Preload("User2Data").
		First(&conversation, id).Error
	if err != nil {
		return nil, err
	}
	return &conversation, nil
}

// GetByParticipants gets a conversation by participants
func (r *SimpleConversationRepository) GetByParticipants(user1 uint, user2 uint) (*models.SimpleConversation, error) {
	var conversation models.SimpleConversation
	err := r.db.Where("(user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)", user1, user2, user2, user1).
		Preload("User1Data").Preload("User2Data").
		First(&conversation).Error
	if err != nil {
		return nil, err
	}
	return &conversation, nil
}

// GetUserConversations gets conversations for a user
func (r *SimpleConversationRepository) GetUserConversations(userID uint, page, limit int) ([]models.SimpleConversation, *Pagination, error) {
	var conversations []models.SimpleConversation
	var total int64

	// Count total
	if err := r.db.Model(&models.SimpleConversation{}).
		Where("user_1 = ? OR user_2 = ?", userID, userID).
		Count(&total).Error; err != nil {
		logrus.Errorf("GetUserConversations: Count query failed: %v", err)
		return nil, nil, err
	}

	logrus.Infof("GetUserConversations: Found %d total conversations for user %d", total, userID)

	// Get conversations with pagination
	offset := (page - 1) * limit
	err := r.db.Preload("User1Data").Preload("User2Data").
		Where("user_1 = ? OR user_2 = ?", userID, userID).
		Order("updated_at DESC").
		Offset(offset).Limit(limit).
		Find(&conversations).Error

	if err != nil {
		return nil, nil, err
	}

	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}

	return conversations, pagination, nil
}

// GetAllConversations gets conversations where admin is a participant
func (r *SimpleConversationRepository) GetAllConversations(adminID uint, page, limit int) ([]models.SimpleConversation, *Pagination, error) {
	var conversations []models.SimpleConversation
	var total int64

	// Count total conversations where admin is a participant
	if err := r.db.Model(&models.SimpleConversation{}).
		Where("user_1 = ? OR user_2 = ?", adminID, adminID).
		Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Get conversations with pagination and preload relationships including last message sender
	offset := (page - 1) * limit
	err := r.db.Preload("User1Data").Preload("User2Data").Preload("LastMessageSender").
		Where("user_1 = ? OR user_2 = ?", adminID, adminID).
		Order("updated_at DESC").
		Offset(offset).Limit(limit).
		Find(&conversations).Error

	if err != nil {
		return nil, nil, err
	}

	// Update last message data for each conversation
	for i := range conversations {
		if conversations[i].LastMessageID == nil {
			// Get the latest message for this conversation
			var lastMessage models.SimpleConversationMessage
			err := r.db.Where("conversation_id = ?", conversations[i].ID).
				Order("created_at DESC").
				First(&lastMessage).Error
			
			if err == nil {
				conversations[i].LastMessageID = &lastMessage.ID
				conversations[i].LastMessageText = &lastMessage.Message
				conversations[i].LastMessageCreatedAt = &lastMessage.CreatedAt
				conversations[i].LastMessageSenderID = &lastMessage.SenderID
				
				// Load sender information
				var sender models.User
				if err := r.db.First(&sender, lastMessage.SenderID).Error; err == nil {
					conversations[i].LastMessageSender = &sender
				}
			}
		}
	}

	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}

	return conversations, pagination, nil
}

// GetAllConversationsForOversight gets all conversations for admin oversight (excluding admin's conversations)
func (r *SimpleConversationRepository) GetAllConversationsForOversight(adminID uint, page, limit int) ([]models.SimpleConversation, *Pagination, error) {
	var conversations []models.SimpleConversation
	var total int64

	// Count total conversations excluding those where admin is a participant
	if err := r.db.Model(&models.SimpleConversation{}).
		Where("user_1 != ? AND user_2 != ?", adminID, adminID).
		Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Get conversations with pagination and preload relationships including last message sender
	offset := (page - 1) * limit
	err := r.db.Preload("User1Data").Preload("User2Data").Preload("LastMessageSender").
		Where("user_1 != ? AND user_2 != ?", adminID, adminID).
		Order("updated_at DESC").
		Offset(offset).Limit(limit).
		Find(&conversations).Error

	if err != nil {
		return nil, nil, err
	}

	// Update last message data for each conversation
	for i := range conversations {
		if conversations[i].LastMessageID == nil {
			// Get the latest message for this conversation
			var lastMessage models.SimpleConversationMessage
			err := r.db.Where("conversation_id = ?", conversations[i].ID).
				Order("created_at DESC").
				First(&lastMessage).Error
			
			if err == nil {
				conversations[i].LastMessageID = &lastMessage.ID
				conversations[i].LastMessageText = &lastMessage.Message
				conversations[i].LastMessageCreatedAt = &lastMessage.CreatedAt
				conversations[i].LastMessageSenderID = &lastMessage.SenderID
				
				// Load sender information
				var sender models.User
				if err := r.db.First(&sender, lastMessage.SenderID).Error; err == nil {
					conversations[i].LastMessageSender = &sender
				}
			}
		}
	}

	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}

	return conversations, pagination, nil
}

// UpdateLastMessage updates the conversation's last message timestamp and fields
func (r *SimpleConversationRepository) UpdateLastMessage(conversationID uint) error {
	// Get the latest message for this conversation
	var lastMessage models.SimpleConversationMessage
	err := r.db.Where("conversation_id = ?", conversationID).
		Order("created_at DESC").
		First(&lastMessage).Error
	
	if err != nil {
		// If no messages found, just update the timestamp
		return r.db.Model(&models.SimpleConversation{}).
			Where("id = ?", conversationID).
			Update("updated_at", gorm.Expr("NOW()")).Error
	}

	// Update conversation with last message data
	return r.db.Model(&models.SimpleConversation{}).
		Where("id = ?", conversationID).
		Updates(map[string]interface{}{
			"updated_at":                gorm.Expr("NOW()"),
			"last_message_id":          lastMessage.ID,
			"last_message_text":        lastMessage.Message,
			"last_message_created_at":  lastMessage.CreatedAt,
			"last_message_sender_id":   lastMessage.SenderID,
		}).Error
}

// SimpleConversationMessageRepository handles conversation messages
type SimpleConversationMessageRepository struct {
	db *gorm.DB
}

func NewSimpleConversationMessageRepository(db *gorm.DB) *SimpleConversationMessageRepository {
	return &SimpleConversationMessageRepository{db: db}
}

// Create creates a new conversation message
func (r *SimpleConversationMessageRepository) Create(message *models.SimpleConversationMessage) (*models.SimpleConversationMessage, error) {
	if err := r.db.Create(message).Error; err != nil {
		return nil, err
	}
	return message, nil
}

// GetByID gets a message by ID
func (r *SimpleConversationMessageRepository) GetByID(id uint) (*models.SimpleConversationMessage, error) {
	var message models.SimpleConversationMessage
	err := r.db.Preload("Sender").First(&message, id).Error
	if err != nil {
		return nil, err
	}
	return &message, nil
}

// GetConversationMessages gets messages for a conversation
func (r *SimpleConversationMessageRepository) GetConversationMessages(conversationID uint, page, limit int) ([]models.SimpleConversationMessage, *Pagination, error) {
	var messages []models.SimpleConversationMessage
	var total int64

	// Count total
	if err := r.db.Model(&models.SimpleConversationMessage{}).
		Where("conversation_id = ?", conversationID).
		Count(&total).Error; err != nil {
		return nil, nil, err
	}

	// Get messages with pagination (latest first)
	offset := (page - 1) * limit
	err := r.db.Preload("Sender").
		Where("conversation_id = ?", conversationID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&messages).Error

	if err != nil {
		return nil, nil, err
	}

	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}

	return messages, pagination, nil
}

// MarkAsRead marks a message as read
func (r *SimpleConversationMessageRepository) MarkAsRead(messageID uint, userID uint) error {
	return r.db.Model(&models.SimpleConversationMessage{}).
		Where("id = ? AND sender_id != ?", messageID, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": gorm.Expr("NOW()"),
		}).Error
}

// GetUnreadCount gets unread message count for a conversation
func (r *SimpleConversationMessageRepository) GetUnreadCount(conversationID uint, userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.SimpleConversationMessage{}).
		Where("conversation_id = ? AND sender_id != ? AND is_read = false", conversationID, userID).
		Count(&count).Error
	return count, err
}

// GetConversationUnreadCounts gets unread counts for multiple conversations
func (r *SimpleConversationMessageRepository) GetConversationUnreadCounts(conversationIDs []uint, userID uint) (map[uint]int64, error) {
	var results []struct {
		ConversationID uint  `json:"conversation_id"`
		Count          int64 `json:"count"`
	}

	err := r.db.Model(&models.SimpleConversationMessage{}).
		Select("conversation_id, COUNT(*) as count").
		Where("conversation_id IN ? AND sender_id != ? AND is_read = false", conversationIDs, userID).
		Group("conversation_id").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	counts := make(map[uint]int64)
	for _, result := range results {
		counts[result.ConversationID] = result.Count
	}

	return counts, nil
}


// GetConversationUnreadCountsForAdmin gets unread counts for multiple conversations (admin view - all unread messages)
func (r *SimpleConversationMessageRepository) GetConversationUnreadCountsForAdmin(conversationIDs []uint) (map[uint]int64, error) {
	var results []struct {
		ConversationID uint  `json:"conversation_id"`
		Count          int64 `json:"count"`
	}

	// Count all unread messages in the specified conversations (admin can see all unread messages)
	err := r.db.Model(&models.SimpleConversationMessage{}).
		Select("conversation_id, COUNT(*) as count").
		Where("conversation_id IN ? AND is_read = false", conversationIDs).
		Group("conversation_id").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	counts := make(map[uint]int64)
	for _, result := range results {
		counts[result.ConversationID] = result.Count
	}

	return counts, nil
}

// MarkConversationAsRead marks all unread messages in a conversation as read for a user
func (r *SimpleConversationMessageRepository) MarkConversationAsRead(conversationID uint, userID uint) error {
	result := r.db.Model(&models.SimpleConversationMessage{}).
		Where("conversation_id = ? AND sender_id != ? AND is_read = false", conversationID, userID).
		Update("is_read", true)

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// GetTotalUnreadCount gets total unread count for a user across all conversations
func (r *SimpleConversationRepository) GetTotalUnreadCount(userID uint) (int, error) {
	var totalUnreadCount int64

	// Count unread messages where the user is a participant but not the sender
	err := r.db.Model(&models.SimpleConversationMessage{}).
		Joins("JOIN simple_conversations ON simple_conversation_messages.conversation_id = simple_conversations.id").
		Where("(simple_conversations.user_1 = ? OR simple_conversations.user_2 = ?) AND simple_conversation_messages.sender_id != ? AND simple_conversation_messages.is_read = ?",
			userID, userID, userID, false).
		Count(&totalUnreadCount).Error

	if err != nil {
		return 0, err
	}

	return int(totalUnreadCount), nil
}

// GetAdminTotalUnreadCount gets total unread count for admin across all conversations
func (r *SimpleConversationRepository) GetAdminTotalUnreadCount(adminID uint) (int, error) {
	var totalUnreadCount int64

	// Count unread messages where the admin is a participant but not the sender
	// This includes all conversations where admin is involved (either as user_1 or user_2)
	err := r.db.Model(&models.SimpleConversationMessage{}).
		Joins("JOIN simple_conversations ON simple_conversation_messages.conversation_id = simple_conversations.id").
		Where("(simple_conversations.user_1 = ? OR simple_conversations.user_2 = ?) AND simple_conversation_messages.sender_id != ? AND simple_conversation_messages.is_read = ?",
			adminID, adminID, adminID, false).
		Count(&totalUnreadCount).Error

	if err != nil {
		return 0, err
	}

	return int(totalUnreadCount), nil
}