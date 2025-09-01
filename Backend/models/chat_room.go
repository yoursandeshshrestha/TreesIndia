package models

import (
	"time"

	"gorm.io/gorm"
)

// RoomType represents the type of chat room
type RoomType string

const (
	RoomTypeBooking       RoomType = "booking"
	RoomTypeProperty      RoomType = "property"
	RoomTypeWorkerInquiry RoomType = "worker_inquiry"
)

// ChatRoom represents a chat room for communication
type ChatRoom struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	// Room identification
	RoomType RoomType `json:"room_type" gorm:"not null"`
	RoomName string   `json:"room_name"`
	
	// Associated entities (only one should be set)
	BookingID       *uint `json:"booking_id"`
	PropertyID      *uint `json:"property_id"`
	WorkerInquiryID *uint `json:"worker_inquiry_id"`
	
	// Room status
	IsActive       bool       `json:"is_active" gorm:"default:true"`
	LastMessageAt  *time.Time `json:"last_message_at"`
	ClosedAt       *time.Time `json:"closed_at"`
	ClosedReason   string     `json:"closed_reason"`
	
	// Metadata
	Metadata map[string]interface{} `json:"metadata" gorm:"type:jsonb;default:'{}';serializer:json"`
	
	// Relationships
	Booking       *Booking       `json:"booking,omitempty" gorm:"foreignKey:BookingID"`
	Property      *Property      `json:"property,omitempty" gorm:"foreignKey:PropertyID"`
	WorkerInquiry *WorkerInquiry `json:"worker_inquiry,omitempty" gorm:"foreignKey:WorkerInquiryID"`
	// Participants relationship removed - using direct user associations instead
	Messages      []ChatMessage         `json:"messages,omitempty" gorm:"foreignKey:RoomID"`
}

// TableName returns the table name for ChatRoom
func (ChatRoom) TableName() string {
	return "chat_rooms"
}

// CreateChatRoomRequest represents the request structure for creating a chat room
type CreateChatRoomRequest struct {
	RoomType       RoomType `json:"room_type" binding:"required"`
	RoomName       string   `json:"room_name"`
	BookingID      *uint    `json:"booking_id"`
	PropertyID     *uint    `json:"property_id"`
	WorkerInquiryID *uint   `json:"worker_inquiry_id"`
	ParticipantIDs []uint   `json:"participant_ids" binding:"required"`
}

// GetChatRoomsRequest represents the request structure for getting chat rooms
type GetChatRoomsRequest struct {
	UserID   uint   `json:"user_id"`
	RoomType *RoomType `json:"room_type"`
	Page     int    `json:"page" binding:"min=1"`
	Limit    int    `json:"limit" binding:"min=1,max=50"`
}
