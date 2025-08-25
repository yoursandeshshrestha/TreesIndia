package models

import (
	"time"
)

// PromotionBanner represents a promotional banner for the application
type PromotionBanner struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Basic Information
	Title     string `json:"title" gorm:"not null"`
	Image     string `json:"image" gorm:"not null"` // Banner image URL
	Link      string `json:"link"` // Optional link for the banner
	
	// Status
	IsActive  bool `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for PromotionBanner
func (PromotionBanner) TableName() string {
	return "promotion_banners"
}
