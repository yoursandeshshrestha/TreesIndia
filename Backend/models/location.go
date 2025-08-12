package models

import (
	"time"

	"gorm.io/gorm"
)

// Location represents a user's location
type Location struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;uniqueIndex"`
	User        User           `json:"-" gorm:"foreignKey:UserID"`
	
	// Coordinates
	Latitude    float64        `json:"latitude" gorm:"not null"`
	Longitude   float64        `json:"longitude" gorm:"not null"`
	
	// Address
	Address     string         `json:"address"`
	City        string         `json:"city"`
	State       string         `json:"state"`
	PostalCode  string         `json:"postal_code"`
	
	// Metadata
	Source      string         `json:"source" gorm:"not null"` // "gps", "manual"
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// CreateLocationRequest represents the request structure for creating a location
type CreateLocationRequest struct {
	Latitude   float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude  float64 `json:"longitude" binding:"required,min=-180,max=180"`
	Address    string  `json:"address"`
	City       string  `json:"city"`
	State      string  `json:"state"`
	PostalCode string  `json:"postal_code"`
	Source     string  `json:"source" binding:"required,oneof=gps manual"`
}

// UpdateLocationRequest represents the request structure for updating a location
type UpdateLocationRequest struct {
	Latitude   float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude  float64 `json:"longitude" binding:"required,min=-180,max=180"`
	Address    string  `json:"address"`
	City       string  `json:"city"`
	State      string  `json:"state"`
	PostalCode string  `json:"postal_code"`
	Source     string  `json:"source" binding:"required,oneof=gps manual"`
}

// LocationResponse represents the response structure for location data
type LocationResponse struct {
	ID          uint      `json:"id"`
	UserID      uint      `json:"user_id"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Address     string    `json:"address"`
	City        string    `json:"city"`
	State       string    `json:"state"`
	PostalCode  string    `json:"postal_code"`
	Source      string    `json:"source"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName returns the table name for Location
func (Location) TableName() string {
	return "locations"
}
