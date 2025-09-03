package models

import (
	"time"

	"gorm.io/gorm"
)

// WorkerLocation represents real-time location tracking for workers during assignments
type WorkerLocation struct {
	gorm.Model
	WorkerID       uint      `json:"worker_id" gorm:"not null;index"`
	AssignmentID   uint      `json:"assignment_id" gorm:"not null;index"`
	BookingID      uint      `json:"booking_id" gorm:"not null;index"`
	
	// GPS Coordinates
	Latitude       float64   `json:"latitude" gorm:"not null"`
	Longitude      float64   `json:"longitude" gorm:"not null"`
	Accuracy       float64   `json:"accuracy,omitempty"` // GPS accuracy in meters
	
	// Status
	Status         string    `json:"status" gorm:"default:'tracking'"` // tracking, completed, stopped
	
	// Metadata
	LastUpdated    time.Time `json:"last_updated" gorm:"not null"`
	IsActive       bool      `json:"is_active" gorm:"default:true"`
	
	// Relationships
	Worker         User             `json:"worker" gorm:"foreignKey:WorkerID"`
	Assignment     WorkerAssignment `json:"assignment" gorm:"foreignKey:AssignmentID"`
	Booking        Booking          `json:"booking" gorm:"foreignKey:BookingID"`
}

// TableName returns the table name for WorkerLocation
func (WorkerLocation) TableName() string {
	return "worker_locations"
}

// LocationUpdate represents a location update request from worker
type LocationUpdate struct {
	Latitude     float64 `json:"latitude" binding:"required"`
	Longitude    float64 `json:"longitude" binding:"required"`
	Accuracy     float64 `json:"accuracy,omitempty"`
}

// WorkerLocationResponse represents the response for location queries
type WorkerLocationResponse struct {
	WorkerID       uint      `json:"worker_id"`
	AssignmentID   uint      `json:"assignment_id"`
	BookingID      uint      `json:"booking_id"`
	Latitude       float64   `json:"latitude"`
	Longitude      float64   `json:"longitude"`
	Accuracy       float64   `json:"accuracy,omitempty"`
	Status         string    `json:"status"`
	LastUpdated    time.Time `json:"last_updated"`
	WorkerName     string    `json:"worker_name,omitempty"`
	CustomerName   string    `json:"customer_name,omitempty"`
	HasArrived        bool    `json:"has_arrived,omitempty"`        // Whether worker has arrived at customer location
}

// CustomerLocationResponse represents the customer location response for workers
type CustomerLocationResponse struct {
	AssignmentID   uint      `json:"assignment_id"`
	BookingID      uint      `json:"booking_id"`
	CustomerName   string    `json:"customer_name"`
	Address        string    `json:"address"`
	ContactPerson  string    `json:"contact_person"`
	ContactPhone   string    `json:"contact_phone"`
	Latitude       float64   `json:"latitude"`
	Longitude      float64   `json:"longitude"`
	Description    string    `json:"description"`
	ScheduledDate  *time.Time `json:"scheduled_date,omitempty"`
	ScheduledTime  *time.Time `json:"scheduled_time,omitempty"`
}

// LocationCoordinates represents GPS coordinates
type LocationCoordinates struct {
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}
