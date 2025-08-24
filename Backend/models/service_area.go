package models

import (
	"time"

	"gorm.io/gorm"
)

// ServiceArea represents the geographic areas where a service is available
type ServiceArea struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	City      string         `json:"city" gorm:"not null"`
	State     string         `json:"state" gorm:"not null"`
	Country   string         `json:"country" gorm:"not null;default:'India'"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relationships
	Services []Service `json:"services,omitempty" gorm:"many2many:service_service_areas;"`
}

// TableName returns the table name for ServiceArea
func (ServiceArea) TableName() string {
	return "service_areas"
}

// CreateServiceAreaRequest represents the request structure for creating a service area
type CreateServiceAreaRequest struct {
	City     string `json:"city" binding:"required"`
	State    string `json:"state" binding:"required"`
	Country  string `json:"country" binding:"required"`
	IsActive *bool  `json:"is_active"`
}

// UpdateServiceAreaRequest represents the request structure for updating a service area
type UpdateServiceAreaRequest struct {
	City     string `json:"city" binding:"required"`
	State    string `json:"state" binding:"required"`
	Country  string `json:"country" binding:"required"`
	IsActive *bool  `json:"is_active"`
}

// ServiceAreaResponse represents the response structure for service area data
type ServiceAreaResponse struct {
	ID        uint      `json:"id"`
	City      string    `json:"city"`
	State     string    `json:"state"`
	Country   string    `json:"country"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
