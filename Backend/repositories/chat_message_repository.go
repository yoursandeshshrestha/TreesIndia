package repositories

import (
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// ChatMessageRepository handles chat message database operations
type ChatMessageRepository struct {
	db *gorm.DB
}

// NewChatMessageRepository creates a new chat message repository
func NewChatMessageRepository() *ChatMessageRepository {
	return &ChatMessageRepository{
		db: database.GetDB(),
	}
}

// Create creates a new chat message
func (cmr *ChatMessageRepository) Create(message *models.ChatMessage) (*models.ChatMessage, error) {
	err := cmr.db.Create(message).Error
	if err != nil {
		return nil, err
	}
	return message, nil
}

// GetByID gets a chat message by ID
func (cmr *ChatMessageRepository) GetByID(id uint) (*models.ChatMessage, error) {
	var message models.ChatMessage
	err := cmr.db.Preload("Sender").Preload("ReplyToMessage").First(&message, id).Error
	if err != nil {
		return nil, err
	}
	return &message, nil
}

// GetRoomMessages gets messages for a chat room with pagination
func (cmr *ChatMessageRepository) GetRoomMessages(roomID uint, page, limit int) ([]models.ChatMessage, *Pagination, error) {
	var messages []models.ChatMessage
	var total int64

	// Count total messages in room
	err := cmr.db.Model(&models.ChatMessage{}).Where("room_id = ?", roomID).Count(&total).Error
	if err != nil {
		return nil, nil, err
	}

	// Apply pagination
	offset := (page - 1) * limit

	// Get messages with relationships
	err = cmr.db.Where("room_id = ?", roomID).
		Preload("Sender").
		Preload("ReplyToMessage").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error
	if err != nil {
		return nil, nil, err
	}

	// Calculate pagination
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	pagination := &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return messages, pagination, nil
}

// MarkAsRead marks a message as read by a user
func (cmr *ChatMessageRepository) MarkAsRead(messageID, userID uint) error {
	// Get the message
	message, err := cmr.GetByID(messageID)
	if err != nil {
		return err
	}

	// Check if user already read the message
	for _, readUserID := range message.ReadBy {
		if readUserID == userID {
			return nil // Already read
		}
	}

	// Add user to read_by array
	message.ReadBy = append(message.ReadBy, userID)
	message.IsRead = true

	// Update the message
	return cmr.db.Save(message).Error
}

// GetUnreadCount gets unread message count for a user in a room
func (cmr *ChatMessageRepository) GetUnreadCount(roomID, userID uint) (int64, error) {
	var count int64
	err := cmr.db.Model(&models.ChatMessage{}).
		Where("room_id = ? AND sender_id != ? AND is_read = ?", roomID, userID, false).
		Count(&count).Error
	return count, err
}

// GetLastMessage gets the last message in a chat room
func (cmr *ChatMessageRepository) GetLastMessage(roomID uint) (*models.ChatMessage, error) {
	var message models.ChatMessage
	err := cmr.db.Where("room_id = ?", roomID).
		Preload("Sender").
		Order("created_at DESC").
		First(&message).Error
	if err != nil {
		return nil, err
	}
	return &message, nil
}

// DeleteMessage deletes a message (soft delete)
func (cmr *ChatMessageRepository) DeleteMessage(messageID, userID uint) error {
	// Get the message
	message, err := cmr.GetByID(messageID)
	if err != nil {
		return err
	}

	// Check if user is the sender
	if message.SenderID != userID {
		return gorm.ErrRecordNotFound
	}

	// Soft delete the message
	return cmr.db.Delete(message).Error
}
