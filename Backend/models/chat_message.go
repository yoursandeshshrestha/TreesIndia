package models

import (
	"time"

	"gorm.io/gorm"
)

// MessageType represents the type of chat message
type MessageType string

const (
	MessageTypeText     MessageType = "text"
	MessageTypeImage    MessageType = "image"
	MessageTypeFile     MessageType = "file"
	MessageTypeLocation MessageType = "location"
	MessageTypeSystem   MessageType = "system"
)

// MessageStatus represents the status of a chat message
type MessageStatus string

const (
	MessageStatusSent     MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead     MessageStatus = "read"
	MessageStatusFailed   MessageStatus = "failed"
)

// ChatMessage represents a message in a chat room
type ChatMessage struct {
	gorm.Model
	// Message content
	RoomID uint        `json:"room_id" gorm:"not null"`
	SenderID uint      `json:"sender_id" gorm:"not null"`
	Message string     `json:"message" gorm:"not null"`
	MessageType MessageType `json:"message_type" gorm:"default:'text'"`
	
	// Message metadata
	IsRead bool        `json:"is_read" gorm:"default:false"`
	ReadAt *time.Time  `json:"read_at"`
	ReadBy []uint      `json:"read_by" gorm:"type:jsonb;default:'[]'"`
	
	// Message attachments
	Attachments []string `json:"attachments" gorm:"type:jsonb;default:'[]'"`
	
	// Message status
	Status MessageStatus `json:"status" gorm:"default:'sent'"`
	
	// Reply to another message
	ReplyToMessageID *uint `json:"reply_to_message_id"`
	
	// Message metadata
	Metadata map[string]interface{} `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	
	// Relationships
	Room           ChatRoom    `json:"room" gorm:"foreignKey:RoomID"`
	Sender         User        `json:"sender" gorm:"foreignKey:SenderID"`
	ReplyToMessage *ChatMessage `json:"reply_to_message,omitempty" gorm:"foreignKey:ReplyToMessageID"`
}

// TableName returns the table name for ChatMessage
func (ChatMessage) TableName() string {
	return "chat_messages"
}

// SendMessageRequest represents the request structure for sending a message
type SendMessageRequest struct {
	RoomID         uint        `json:"room_id" binding:"required"`
	Message        string      `json:"message" binding:"required"`
	MessageType    MessageType `json:"message_type" binding:"required"`
	Attachments    []string    `json:"attachments"`
	ReplyToMessageID *uint     `json:"reply_to_message_id"`
}

// GetMessagesRequest represents the request structure for getting messages
type GetMessagesRequest struct {
	RoomID uint `json:"room_id" binding:"required"`
	Page   int  `json:"page" binding:"min=1"`
	Limit  int  `json:"limit" binding:"min=1,max=100"`
}

// MarkMessageReadRequest represents the request structure for marking a message as read
type MarkMessageReadRequest struct {
	MessageID uint `json:"message_id" binding:"required"`
	UserID    uint `json:"user_id" binding:"required"`
}
