package models

import (
	"time"

	"gorm.io/gorm"
)

// ParticipantRole represents the role of a participant in a chat room
type ParticipantRole string

const (
	ParticipantRoleUser    ParticipantRole = "user"
	ParticipantRoleWorker  ParticipantRole = "worker"
	ParticipantRoleAdmin   ParticipantRole = "admin"
)

// ChatRoomParticipant represents a participant in a chat room
type ChatRoomParticipant struct {
	gorm.Model
	// Room and user relationship
	RoomID uint `json:"room_id" gorm:"not null"`
	UserID uint `json:"user_id" gorm:"not null"`
	
	// Participant status
	JoinedAt    time.Time  `json:"joined_at" gorm:"default:now()"`
	LeftAt      *time.Time `json:"left_at"`
	LastReadAt  *time.Time `json:"last_read_at"`
	IsActive    bool       `json:"is_active" gorm:"default:true"`
	
	// Participant role
	Role ParticipantRole `json:"role" gorm:"default:'user'"`
	
	// Relationships
	Room ChatRoom `json:"room" gorm:"foreignKey:RoomID"`
	User User     `json:"user" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for ChatRoomParticipant
func (ChatRoomParticipant) TableName() string {
	return "chat_room_participants"
}

// JoinChatRoomRequest represents the request structure for joining a chat room
type JoinChatRoomRequest struct {
	RoomID uint             `json:"room_id" binding:"required"`
	UserID uint             `json:"user_id" binding:"required"`
	Role   ParticipantRole  `json:"role" binding:"required"`
}

// LeaveChatRoomRequest represents the request structure for leaving a chat room
type LeaveChatRoomRequest struct {
	RoomID uint `json:"room_id" binding:"required"`
	UserID uint `json:"user_id" binding:"required"`
}
