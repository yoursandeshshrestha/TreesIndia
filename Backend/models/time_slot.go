package models

import (
	"time"

	"gorm.io/gorm"
)

// TimeSlot represents the time slot model
type TimeSlot struct {
	gorm.Model
	// Basic Information
	ServiceID           uint      `json:"service_id" gorm:"not null"`
	Date                time.Time `json:"date" gorm:"not null"`
	StartTime           time.Time `json:"start_time" gorm:"not null"`
	EndTime             time.Time `json:"end_time" gorm:"not null"`
	
	// Capacity Management
	AvailableWorkers    int       `json:"available_workers" gorm:"not null"`
	TotalWorkers        int       `json:"total_workers" gorm:"not null"`
	
	// Service Configuration
	ServiceDuration     int       `json:"service_duration_minutes" gorm:"not null"`
	BufferDuration      int       `json:"buffer_duration_minutes" gorm:"not null"`
	
	// Status
	IsActive            bool      `json:"is_active" gorm:"default:true"`
	
	// Relationships
	Service             Service   `json:"service" gorm:"foreignKey:ServiceID"`
	Bookings            []Booking `json:"bookings,omitempty" gorm:"foreignKey:TimeSlotID"`
}

// TableName returns the table name for TimeSlot
func (TimeSlot) TableName() string {
	return "time_slots"
}

// ServiceConfig represents the service configuration for time slots
type ServiceConfig struct {
	gorm.Model
	// Service Configuration
	ServiceID           uint      `json:"service_id" gorm:"not null;uniqueIndex"`
	StartTime           time.Time `json:"start_time" gorm:"not null"` // Daily start time (e.g., 10:00)
	EndTime             time.Time `json:"end_time" gorm:"not null"`   // Daily end time (e.g., 22:00)
	ServiceDurationMinutes int    `json:"service_duration_minutes" gorm:"not null"`
	BufferTimeMinutes   int       `json:"buffer_time_minutes" gorm:"not null"`
	
	// Booking Configuration
	AdvanceBookingDays  int       `json:"advance_booking_days" gorm:"default:7"`
	MaxWorkersPerSlot   int       `json:"max_workers_per_slot" gorm:"default:10"`
	
	// Status
	IsActive            bool      `json:"is_active" gorm:"default:true"`
	
	// Relationships
	Service             Service   `json:"service" gorm:"foreignKey:ServiceID"`
}

// TableName returns the table name for ServiceConfig
func (ServiceConfig) TableName() string {
	return "service_configs"
}
