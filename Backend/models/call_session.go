package models

import (
	"time"

	"gorm.io/gorm"
)

// CallType represents the type of call
type CallType string

const (
	CallTypeVoice CallType = "voice"
	CallTypeVideo CallType = "video"
)

// CallStatus represents the status of a call
type CallStatus string

const (
	CallStatusInitiated CallStatus = "initiated"
	CallStatusRinging   CallStatus = "ringing"
	CallStatusConnected CallStatus = "connected"
	CallStatusEnded     CallStatus = "ended"
	CallStatusMissed    CallStatus = "missed"
	CallStatusFailed    CallStatus = "failed"
)

// CallSession represents a call session for Twilio integration
type CallSession struct {
	gorm.Model
	// Call participants
	FromUserID uint `json:"from_user_id" gorm:"not null"`
	ToUserID   uint `json:"to_user_id" gorm:"not null"`
	
	// Twilio call details
	TwilioCallSID   string `json:"twilio_call_sid" gorm:"uniqueIndex"`
	TwilioFromNumber string `json:"twilio_from_number"`
	TwilioToNumber   string `json:"twilio_to_number"`
	MaskedNumber     string `json:"masked_number" gorm:"not null"`
	
	// Call details
	CallType CallType `json:"call_type" gorm:"default:'voice'"`
	Status   CallStatus `json:"status" gorm:"default:'initiated'"`
	
	// Call timing
	StartedAt      *time.Time `json:"started_at"`
	AnsweredAt     *time.Time `json:"answered_at"`
	EndedAt        *time.Time `json:"ended_at"`
	DurationSeconds *int      `json:"duration_seconds"`
	
	// Associated entities
	BookingID  *uint `json:"booking_id"`
	PropertyID *uint `json:"property_id"`
	RoomID     *uint `json:"room_id"`
	
	// Call metadata
	Metadata map[string]interface{} `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	
	// Relationships
	FromUser User     `json:"from_user" gorm:"foreignKey:FromUserID"`
	ToUser   User     `json:"to_user" gorm:"foreignKey:ToUserID"`
	Booking  *Booking `json:"booking,omitempty" gorm:"foreignKey:BookingID"`
	Property *Property `json:"property,omitempty" gorm:"foreignKey:PropertyID"`
	Room     *ChatRoom `json:"room,omitempty" gorm:"foreignKey:RoomID"`
}

// TableName returns the table name for CallSession
func (CallSession) TableName() string {
	return "call_sessions"
}

// InitiateCallRequest represents the request structure for initiating a call
type InitiateCallRequest struct {
	ToUserID   uint     `json:"to_user_id" binding:"required"`
	CallType   CallType `json:"call_type" binding:"required"`
	BookingID  *uint    `json:"booking_id"`
	PropertyID *uint    `json:"property_id"`
	RoomID     *uint    `json:"room_id"`
}

// CallStatusUpdateRequest represents the request structure for updating call status
type CallStatusUpdateRequest struct {
	CallSID string     `json:"call_sid" binding:"required"`
	Status  CallStatus `json:"status" binding:"required"`
}
