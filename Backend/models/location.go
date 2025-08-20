package models

import (
	"time"

	"gorm.io/gorm"
)

// Location represents a user's primary location (one per user)
type Location struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;uniqueIndex"`
	User      User           `json:"-" gorm:"foreignKey:UserID"`
	
	// Location details (for service matching)
	City      string         `json:"city" gorm:"not null"`
	State     string         `json:"state" gorm:"not null"`
	Country   string         `json:"country" gorm:"not null"`
	
	// Optional address details
	Address   string         `json:"address,omitempty"`
	PostalCode string        `json:"postal_code,omitempty"`
	Latitude  float64        `json:"latitude,omitempty"`
	Longitude float64        `json:"longitude,omitempty"`
	
	// Metadata
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	UpdatedAt time.Time      `json:"updated_at"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}




