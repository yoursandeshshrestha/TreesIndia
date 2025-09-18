package models

import (
	"time"

	"gorm.io/gorm"
)

// SimpleConversation represents a simple conversation between users
type SimpleConversation struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	User1 uint `json:"user_1" gorm:"column:user_1;not null"`
	User2 uint `json:"user_2" gorm:"column:user_2;not null"`

	// Last message fields
	LastMessageID        *uint      `json:"last_message_id" gorm:"column:last_message_id"`
	LastMessageText      *string    `json:"last_message_text" gorm:"column:last_message_text"`
	LastMessageCreatedAt *time.Time `json:"last_message_created_at" gorm:"column:last_message_created_at"`
	LastMessageSenderID  *uint      `json:"last_message_sender_id" gorm:"column:last_message_sender_id"`

	// Unread count (computed field, not stored in DB)
	UnreadCount int `json:"unread_count" gorm:"-"`

	// Relationships
	User1Data         User                        `json:"user_1_data" gorm:"foreignKey:User1;references:ID"`
	User2Data         User                        `json:"user_2_data" gorm:"foreignKey:User2;references:ID"`
	Messages          []SimpleConversationMessage `json:"messages,omitempty" gorm:"foreignKey:ConversationID;references:ID"`
	LastMessageSender *User                       `json:"last_message_sender,omitempty" gorm:"foreignKey:LastMessageSenderID;references:ID"`
}

// TableName returns the table name for SimpleConversation
func (SimpleConversation) TableName() string {
	return "simple_conversations"
}

// SimpleConversationMessage represents a message in a simple conversation
type SimpleConversationMessage struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	ConversationID uint   `json:"conversation_id" gorm:"column:conversation_id;not null"`
	SenderID       uint   `json:"sender_id" gorm:"column:sender_id;not null"`
	Message        string `json:"message" gorm:"column:message;not null"`
	IsRead         bool   `json:"is_read" gorm:"column:is_read;default:false"`
	ReadAt         *time.Time `json:"read_at" gorm:"column:read_at"`

	// Relationships
	Conversation SimpleConversation `json:"conversation" gorm:"foreignKey:ConversationID;references:ID"`
	Sender       User               `json:"sender" gorm:"foreignKey:SenderID;references:ID"`
}

// TableName returns the table name for SimpleConversationMessage
func (SimpleConversationMessage) TableName() string {
	return "simple_conversation_messages"
}

// CreateSimpleConversationRequest represents the request structure for creating a conversation
type CreateSimpleConversationRequest struct {
	User1 uint `json:"user_1" binding:"required"`
	User2 uint `json:"user_2" binding:"required"`
}

// SendSimpleConversationMessageRequest represents the request structure for sending a message
type SendSimpleConversationMessageRequest struct {
	Message string `json:"message" binding:"required"`
}

// GetSimpleConversationsRequest represents the request structure for getting conversations
type GetSimpleConversationsRequest struct {
	Page  int `form:"page" binding:"min=1"`
	Limit int `form:"limit" binding:"min=1,max=50"`
}

// GetSimpleConversationMessagesRequest represents the request structure for getting messages
type GetSimpleConversationMessagesRequest struct {
	Page  int `form:"page" binding:"min=1"`
	Limit int `form:"limit" binding:"min=1,max=100"`
}

// SimpleConversationWithUnreadCount represents a conversation with unread message count
type SimpleConversationWithUnreadCount struct {
	SimpleConversation
	UnreadCount int64 `json:"unread_count"`
}
