package models

import (
	"time"

	"gorm.io/gorm"
)

// LocationStatus represents the status of worker location
type LocationStatus string

const (
	LocationStatusOnWay    LocationStatus = "on_way"
	LocationStatusArrived  LocationStatus = "arrived"
	LocationStatusWorking  LocationStatus = "working"
	LocationStatusCompleted LocationStatus = "completed"
	LocationStatusOffline  LocationStatus = "offline"
)

// WorkerLocation represents real-time worker location tracking
type WorkerLocation struct {
	gorm.Model
	// Worker and booking
	WorkerID  uint `json:"worker_id" gorm:"not null"`
	BookingID uint `json:"booking_id" gorm:"not null"`
	
	// Location data
	Latitude  float64 `json:"latitude" gorm:"not null"`
	Longitude float64 `json:"longitude" gorm:"not null"`
	AccuracyMeters *int     `json:"accuracy_meters"`
	Altitude        *float64 `json:"altitude"`
	Heading         *float64 `json:"heading"` // Direction in degrees
	
	// Status and timing
	Status           LocationStatus `json:"status" gorm:"default:'on_way'"`
	EstimatedArrival *time.Time     `json:"estimated_arrival"`
	LastUpdated      time.Time      `json:"last_updated" gorm:"default:now()"`
	
	// Location metadata
	Metadata map[string]interface{} `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	
	// Relationships
	Worker  User     `json:"worker" gorm:"foreignKey:WorkerID"`
	Booking Booking  `json:"booking" gorm:"foreignKey:BookingID"`
}

// TableName returns the table name for WorkerLocation
func (WorkerLocation) TableName() string {
	return "worker_locations"
}

// UpdateWorkerLocationRequest represents the request structure for updating worker location
type UpdateWorkerLocationRequest struct {
	WorkerID         uint          `json:"worker_id" binding:"required"`
	BookingID        uint          `json:"booking_id" binding:"required"`
	Latitude         float64       `json:"latitude" binding:"required"`
	Longitude        float64       `json:"longitude" binding:"required"`
	AccuracyMeters   *int          `json:"accuracy_meters"`
	Altitude         *float64      `json:"altitude"`
	Heading          *float64      `json:"heading"`
	Status           LocationStatus `json:"status"`
	EstimatedArrival *time.Time    `json:"estimated_arrival"`
}

// GetWorkerLocationRequest represents the request structure for getting worker location
type GetWorkerLocationRequest struct {
	WorkerID  uint `json:"worker_id" binding:"required"`
	BookingID uint `json:"booking_id" binding:"required"`
}
