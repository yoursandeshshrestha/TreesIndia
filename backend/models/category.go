package models

import (
	"gorm.io/gorm"
)

// Category represents a service category
type Category struct {
	gorm.Model
	Name        string `json:"name" gorm:"uniqueIndex;not null"`
	Description string `json:"description"`
	Image       string `json:"image"` // Image URL for category
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	SortOrder   int    `json:"sort_order" gorm:"default:0"`
	
	// Relationships
	Services    []Service `json:"services,omitempty"`
	Skills      []Skill   `json:"skills,omitempty"`
}

// TableName returns the table name for Category
func (Category) TableName() string {
	return "categories"
}
