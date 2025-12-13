package models

import (
	"time"
)

// Category represents a hierarchical service category
// Supports unlimited levels: Level 1 (root), Level 2, Level 3, etc.
type Category struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Basic Information
	Name        string `json:"name" gorm:"not null"`
	Slug        string `json:"slug" gorm:"uniqueIndex"` // URL-friendly name
	Description string `json:"description"`
	Icon        string `json:"icon"` // Category icon (e.g., Lucide icon name or image URL)
	
	// Hierarchical relationship (self-referential)
	ParentID    *uint      `json:"parent_id" gorm:"index"` // NULL for root categories (Level 1)
	Parent      *Category  `json:"parent,omitempty" gorm:"foreignKey:ParentID"` // Parent category
	Children    []Category `json:"children,omitempty" gorm:"foreignKey:ParentID"` // Child categories
	
	// Status
	IsActive    bool `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for Category
func (Category) TableName() string {
	return "categories"
}

// GetLevel calculates the level of this category in the hierarchy
// Level 1 = root (no parent), Level 2 = child of root, Level 3 = child of level 2, etc.
func (c *Category) GetLevel() int {
	if c.ParentID == nil {
		return 1
	}
	if c.Parent == nil {
		return 1 // If parent is not loaded, assume level 1 (shouldn't happen in practice)
	}
	return c.Parent.GetLevel() + 1
}

// IsRoot checks if this is a root category (Level 1)
func (c *Category) IsRoot() bool {
	return c.ParentID == nil
}

// IsLeaf checks if this category has no children
func (c *Category) IsLeaf() bool {
	return len(c.Children) == 0
}

// HasChildren checks if this category has children
func (c *Category) HasChildren() bool {
	return len(c.Children) > 0
}

// GetChildrenCount returns the number of direct children
func (c *Category) GetChildrenCount() int {
	return len(c.Children)
}

// GetAncestors returns all ancestor categories (parent, grandparent, etc.)
// Note: This requires the parent chain to be preloaded
func (c *Category) GetAncestors() []Category {
	var ancestors []Category
	current := c.Parent
	for current != nil {
		ancestors = append(ancestors, *current)
		current = current.Parent
	}
	return ancestors
}

// GetFullPath returns the full path of category names from root to this category
func (c *Category) GetFullPath() []string {
	ancestors := c.GetAncestors()
	path := make([]string, 0, len(ancestors)+1)
	
	// Add ancestors in reverse order (root to parent)
	for i := len(ancestors) - 1; i >= 0; i-- {
		path = append(path, ancestors[i].Name)
	}
	
	// Add current category
	path = append(path, c.Name)
	return path
}
