package models

import (
	"time"
)

// HeroConfig represents the hero section configuration for the homepage
type HeroConfig struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Text Content
	Title       string `json:"title" gorm:"not null"`       // "Your Trusted Partner for All Services"
	Description string `json:"description"`                  // Hero description
	PromptText  string `json:"prompt_text" gorm:"not null"` // "What are you looking for?"
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"`
}

// HeroImage represents hero section images and videos
type HeroImage struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Media Information
	MediaURL    string `json:"media_url" gorm:"not null"` // URL to the media (image or video)
	ImageURL    string `json:"image_url" gorm:"not null"` // Deprecated: Use MediaURL instead
	MediaType   string `json:"media_type" gorm:"default:'image'"` // 'image' or 'video'
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"` // Show/hide media
	
	// Relationship
	HeroConfigID uint `json:"hero_config_id" gorm:"not null"`
}

// TableName returns the table name for HeroConfig
func (HeroConfig) TableName() string {
	return "hero_configs"
}

// TableName returns the table name for HeroImage
func (HeroImage) TableName() string {
	return "hero_images"
}
