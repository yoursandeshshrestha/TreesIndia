package models

import (
	"time"

	"gorm.io/gorm"
)

// Address represents a user's address (multiple per user)
type Address struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	LocationID  uint           `json:"location_id" gorm:"not null;index"`
	User        User           `json:"-" gorm:"foreignKey:UserID"`
	Location    Location       `json:"location" gorm:"foreignKey:LocationID"`
	
	// Address details
	Name        string         `json:"name" gorm:"not null"`
	Address     string         `json:"address" gorm:"not null"`
	PostalCode  string         `json:"postal_code"`
	Latitude    float64        `json:"latitude"`
	Longitude   float64        `json:"longitude"`
	
	// Optional fields
	Landmark    string         `json:"landmark,omitempty"`
	HouseNumber string         `json:"house_number,omitempty"`
	
	// Metadata
	IsDefault   bool           `json:"is_default" gorm:"default:false"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// CreateLocationRequest represents the request structure for creating a location
type CreateLocationRequest struct {
	City       string  `json:"city" binding:"required"`
	State      string  `json:"state" binding:"required"`
	Country    string  `json:"country" binding:"required"`
	Address    string  `json:"address,omitempty"`
	PostalCode string  `json:"postal_code,omitempty"`
	Latitude   float64 `json:"latitude,omitempty"`
	Longitude  float64 `json:"longitude,omitempty"`
}

// UpdateLocationRequest represents the request structure for updating a location
type UpdateLocationRequest struct {
	City       string  `json:"city" binding:"required"`
	State      string  `json:"state" binding:"required"`
	Country    string  `json:"country" binding:"required"`
	Address    string  `json:"address,omitempty"`
	PostalCode string  `json:"postal_code,omitempty"`
	Latitude   float64 `json:"latitude,omitempty"`
	Longitude  float64 `json:"longitude,omitempty"`
}

// CreateAddressRequest represents the request structure for creating an address
type CreateAddressRequest struct {
	Name        string  `json:"name" binding:"required"`
	Address     string  `json:"address" binding:"required"`
	PostalCode  string  `json:"postal_code"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Landmark    string  `json:"landmark,omitempty"`
	HouseNumber string  `json:"house_number,omitempty"`
	IsDefault   bool    `json:"is_default,omitempty"`
}

// UpdateAddressRequest represents the request structure for updating an address
type UpdateAddressRequest struct {
	Name        string  `json:"name,omitempty"`
	Address     string  `json:"address,omitempty"`
	PostalCode  string  `json:"postal_code,omitempty"`
	Latitude    float64 `json:"latitude,omitempty"`
	Longitude   float64 `json:"longitude,omitempty"`
	Landmark    string  `json:"landmark,omitempty"`
	HouseNumber string  `json:"house_number,omitempty"`
	IsDefault   bool    `json:"is_default,omitempty"`
}

// LocationResponse represents the response structure for location data
type LocationResponse struct {
	ID         uint      `json:"id"`
	UserID     uint      `json:"user_id"`
	City       string    `json:"city"`
	State      string    `json:"state"`
	Country    string    `json:"country"`
	Address    string    `json:"address,omitempty"`
	PostalCode string    `json:"postal_code,omitempty"`
	Latitude   float64   `json:"latitude,omitempty"`
	Longitude  float64   `json:"longitude,omitempty"`
	IsActive   bool      `json:"is_active"`
	UpdatedAt  time.Time `json:"updated_at"`
	CreatedAt  time.Time `json:"created_at"`
}

// AddressResponse represents the response structure for address data
type AddressResponse struct {
	ID          uint      `json:"id"`
	UserID      uint      `json:"user_id"`
	LocationID  uint      `json:"location_id"`
	Name        string    `json:"name"`
	Address     string    `json:"address"`
	PostalCode  string    `json:"postal_code"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Landmark    string    `json:"landmark,omitempty"`
	HouseNumber string    `json:"house_number,omitempty"`
	IsDefault   bool      `json:"is_default"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName returns the table name for Location
func (Location) TableName() string {
	return "locations"
}

// TableName returns the table name for Address
func (Address) TableName() string {
	return "addresses"
}
