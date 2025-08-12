package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Service struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"not null"`
	Slug          string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description   string         `json:"description"`
	Images        pq.StringArray `json:"images" gorm:"type:text[]"`
	PriceType     string         `json:"price_type" gorm:"not null;default:'inquiry'"` // "fixed" or "inquiry"
	Price         *float64       `json:"price"` // Fixed price (nil if inquiry-based)
	Duration      *string        `json:"duration"` // Optional duration
	CategoryID    uint           `json:"category_id" gorm:"not null"`
	SubcategoryID uint           `json:"subcategory_id" gorm:"not null"`
	Category      Category       `json:"-" gorm:"foreignKey:CategoryID"` // Excluded from JSON response
	Subcategory   Subcategory    `json:"-" gorm:"foreignKey:SubcategoryID"` // Excluded from JSON response
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// CreateServiceRequest represents the request structure for creating a service
type CreateServiceRequest struct {
	Name          string   `json:"name" binding:"required"`
	Description   string   `json:"description"`
	PriceType     string   `json:"price_type" binding:"required,oneof=fixed inquiry"`
	Price         *float64 `json:"price"` // Required if price_type is "fixed"
	Duration      *string  `json:"duration"`
	CategoryID    uint     `json:"category_id" binding:"required"`
	SubcategoryID uint     `json:"subcategory_id" binding:"required"`
	IsActive      *bool    `json:"is_active"`
}

// UpdateServiceRequest represents the request structure for updating a service
type UpdateServiceRequest struct {
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	PriceType     string   `json:"price_type" binding:"omitempty,oneof=fixed inquiry"`
	Price         *float64 `json:"price"`
	Duration      *string  `json:"duration"`
	CategoryID    *uint    `json:"category_id"`
	SubcategoryID *uint    `json:"subcategory_id"`
	IsActive      *bool    `json:"is_active"`
}

