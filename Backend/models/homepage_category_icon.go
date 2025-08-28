package models

import (
	"time"
)

// HomepageCategoryIcon represents a category icon displayed on the homepage
type HomepageCategoryIcon struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Basic Information
	Name        string `json:"name" gorm:"not null;unique"` // e.g., "Home Service", "Construction Service"
	
	// Icon (File Upload)
	IconURL     string `json:"icon_url"` // URL to the uploaded icon image
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"` // Show/hide on homepage
}

// TableName returns the table name for HomepageCategoryIcon
func (HomepageCategoryIcon) TableName() string {
	return "homepage_category_icons"
}
