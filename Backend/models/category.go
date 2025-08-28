package models

import (
	"time"
)

// Category represents a main service category
type Category struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Basic Information
	Name        string `json:"name" gorm:"not null"`
	Slug        string `json:"slug" gorm:"uniqueIndex"` // URL-friendly name
	Description string `json:"description"`
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"`
	
	// Relationship with subcategories
	Subcategories []Subcategory `json:"subcategories,omitempty" gorm:"foreignKey:ParentID"`
}

// Subcategory represents a subcategory that belongs to a main category
type Subcategory struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Basic Information
	Name        string `json:"name" gorm:"not null"`
	Slug        string `json:"slug" gorm:"uniqueIndex"` // URL-friendly name
	Description string `json:"description"`
	Icon        string `json:"icon"` // Subcategory icon (e.g., Lucide icon name)
	
	// Parent relationship
	ParentID    uint      `json:"parent_id" gorm:"not null"`
	Parent      Category  `json:"parent,omitempty" gorm:"foreignKey:ParentID"` // Include parent in JSON response
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for Category
func (Category) TableName() string {
	return "categories"
}

// TableName returns the table name for Subcategory
func (Subcategory) TableName() string {
	return "subcategories"
}

// HasSubcategories checks if this category has subcategories
func (c *Category) HasSubcategories() bool {
	return len(c.Subcategories) > 0
}

// GetSubcategoriesCount returns the number of subcategories
func (c *Category) GetSubcategoriesCount() int {
	return len(c.Subcategories)
}
