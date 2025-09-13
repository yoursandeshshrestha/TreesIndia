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

	UserID   uint  `json:"user_id" gorm:"not null"`
	WorkerID *uint `json:"worker_id"`
	AdminID  *uint `json:"admin_id"`

	// Last message fields
	LastMessageID        *uint      `json:"last_message_id"`
	LastMessageText      *string    `json:"last_message_text"`
	LastMessageCreatedAt *time.Time `json:"last_message_created_at"`
	LastMessageSenderID  *uint      `json:"last_message_sender_id"`

	// Unread count (computed field, not stored in DB)
	UnreadCount int `json:"unread_count" gorm:"-"`

	// Relationships
	User              User                        `json:"user" gorm:"foreignKey:UserID"`
	Worker            *User                       `json:"worker,omitempty" gorm:"foreignKey:WorkerID"`
	Admin             *User                       `json:"admin,omitempty" gorm:"foreignKey:AdminID"`
	Messages          []SimpleConversationMessage `json:"messages,omitempty" gorm:"foreignKey:ConversationID"`
	LastMessageSender *User                       `json:"last_message_sender,omitempty" gorm:"foreignKey:LastMessageSenderID"`
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

	ConversationID uint   `json:"conversation_id" gorm:"not null"`
	SenderID       uint   `json:"sender_id" gorm:"not null"`
	Message        string `json:"message" gorm:"not null"`
	IsRead         bool   `json:"is_read" gorm:"default:false"`
	ReadAt         *time.Time `json:"read_at"`

	// Relationships
	Conversation SimpleConversation `json:"conversation" gorm:"foreignKey:ConversationID"`
	Sender       User               `json:"sender" gorm:"foreignKey:SenderID"`
}

// TableName returns the table name for SimpleConversationMessage
func (SimpleConversationMessage) TableName() string {
	return "simple_conversation_messages"
}

// CreateSimpleConversationRequest represents the request structure for creating a conversation
type CreateSimpleConversationRequest struct {
	UserID   uint `json:"user_id" binding:"required"`
	WorkerID uint `json:"worker_id"`
	AdminID  uint `json:"admin_id"`
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
