package models

import (
	"gorm.io/gorm"
)

// ServiceType represents the type of service
type ServiceType string

const (
	ServiceTypeDirect   ServiceType = "direct"   // Fixed pricing, immediate booking
	ServiceTypeInquiry  ServiceType = "inquiry"  // Custom quote required
)

// Service represents a service that can be booked
type Service struct {
	gorm.Model
	Name          string      `json:"name" gorm:"not null"`
	Description   string      `json:"description"`
	ServiceType   ServiceType `json:"service_type" gorm:"not null;default:'direct'"`
	BasePrice     float64     `json:"base_price" gorm:"default:0"`
	Icon          string      `json:"icon"`
	CategoryName  string      `json:"category"` // Keep for backward compatibility
	CategoryID    *uint       `json:"category_id"` // Foreign key to Category
	
	// Coverage and availability
	MaxRadius     int         `json:"max_radius" gorm:"default:10"` // in kilometers
	CoverageAreas string      `json:"coverage_areas"` // JSON array of cities/states
	IsActive      bool        `json:"is_active" gorm:"default:true"`
	
	// Inquiry-based service fields
	InquiryDescription string `json:"inquiry_description"` // What details are needed for quote
	
	// Relationships
	Category      *Category  `json:"category_details,omitempty" gorm:"foreignKey:CategoryID"`
	Rates         []Rate     `json:"rates,omitempty" gorm:"foreignKey:ServiceID"`
	Bookings      []Booking  `json:"bookings,omitempty" gorm:"foreignKey:ServiceID"`
	Workers       []User     `json:"workers,omitempty" gorm:"many2many:user_services;"`
}

// TableName returns the table name for Service
func (Service) TableName() string {
	return "services"
}
