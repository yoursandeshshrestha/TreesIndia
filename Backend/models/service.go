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
	Category      Category       `json:"category" gorm:"foreignKey:CategoryID"` // Include category name
	Subcategory   Subcategory    `json:"subcategory" gorm:"foreignKey:SubcategoryID"` // Include subcategory name
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relationships
	ServiceAreas []ServiceArea `json:"service_areas,omitempty" gorm:"many2many:service_service_areas;"`
}

// CreateServiceRequest represents the request structure for creating a service
type CreateServiceRequest struct {
	Name          string   `json:"name" binding:"required"`
	Description   string   `json:"description"`
	PriceType     string   `json:"price_type" binding:"required,oneof=fixed inquiry"`
	Price         *float64 `json:"price"` // Required if price_type is "fixed" (validated in service layer)
	Duration      *string  `json:"duration" binding:"omitempty,duration"` // Custom validation
	CategoryID    uint     `json:"category_id" binding:"required"`
	SubcategoryID uint     `json:"subcategory_id" binding:"required"`
	IsActive      *bool    `json:"is_active"`
	ServiceAreaIDs []uint  `json:"service_area_ids" binding:"required,min=1"` // At least one service area ID required
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
	ServiceAreaIDs []uint  `json:"service_area_ids" binding:"omitempty,min=1"` // Optional but if provided, at least one required
}

// ServiceAreaSummary represents a simplified service area response
type ServiceAreaSummary struct {
	ID        uint     `json:"id"`
	City      string   `json:"city"`
	State     string   `json:"state"`
	Country   string   `json:"country"`
	Pincodes  []string `json:"pincodes"`
	IsActive  bool     `json:"is_active"`
}

// ServiceSummary represents a simplified service response without nested objects
type ServiceSummary struct {
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
	CategoryName  string         `json:"category_name"` // Just the category name
	SubcategoryName string       `json:"subcategory_name"` // Just the subcategory name
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	ServiceAreas  []ServiceAreaSummary `json:"service_areas,omitempty"` // Include simplified service areas
}

