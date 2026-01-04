package models

import (
	"time"

	"gorm.io/gorm"
)

// UserSearchHistory represents a user's recent location search
type UserSearchHistory struct {
	ID               uint      `json:"id" gorm:"primarykey"`
	UserID           uint      `json:"user_id" gorm:"not null;index"`
	PlaceID          string    `json:"place_id" gorm:"not null"`
	Description      string    `json:"description" gorm:"not null"`
	FormattedAddress string    `json:"formatted_address"`
	City             string    `json:"city"`
	State            string    `json:"state"`
	Country          string    `json:"country"`
	CountryCode      string    `json:"country_code"`
	Postcode         string    `json:"postcode"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	AddressLine1     string    `json:"address_line1"`
	AddressLine2     string    `json:"address_line2"`
	SearchedAt       time.Time `json:"searched_at" gorm:"not null;index"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for UserSearchHistory
func (UserSearchHistory) TableName() string {
	return "user_search_histories"
}

// BeforeCreate hook to set SearchedAt before creating
func (ush *UserSearchHistory) BeforeCreate(tx *gorm.DB) error {
	if ush.SearchedAt.IsZero() {
		ush.SearchedAt = time.Now()
	}
	return nil
}

// SaveSearchHistoryRequest represents a request to save search history
type SaveSearchHistoryRequest struct {
	PlaceID          string  `json:"place_id" binding:"required"`
	Description      string  `json:"description" binding:"required"`
	FormattedAddress string  `json:"formatted_address"`
	City             string  `json:"city"`
	State            string  `json:"state"`
	Country          string  `json:"country"`
	CountryCode      string  `json:"country_code"`
	Postcode         string  `json:"postcode"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	AddressLine1     string  `json:"address_line1"`
	AddressLine2     string  `json:"address_line2"`
}

// SearchHistoryResponse represents a search history response
type SearchHistoryResponse struct {
	ID               uint      `json:"id"`
	PlaceID          string    `json:"place_id"`
	Description      string    `json:"description"`
	FormattedAddress string    `json:"formatted_address"`
	City             string    `json:"city"`
	State            string    `json:"state"`
	Country          string    `json:"country"`
	CountryCode      string    `json:"country_code"`
	Postcode         string    `json:"postcode"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	AddressLine1     string    `json:"address_line1"`
	AddressLine2     string    `json:"address_line2"`
	SearchedAt       time.Time `json:"searched_at"`
}
