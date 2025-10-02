package models

import (
	"time"
)

// BannerImage represents a banner image for the homepage (max 3)
type BannerImage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Basic Information
	Title     string `json:"title" gorm:"not null"`
	Image     string `json:"image" gorm:"column:image;not null"` // Banner image URL
	Link      string `json:"link"` // Optional link for the banner
	SortOrder int    `json:"sort_order" gorm:"default:0"` // Order of display (0, 1, 2 for max 3 images)
	
	// Status
	IsActive  bool `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for BannerImage
func (BannerImage) TableName() string {
	return "banner_images"
}
