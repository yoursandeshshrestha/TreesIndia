package models

import (
	"time"
	"gorm.io/gorm"
)

// PropertyType represents the type of property
type PropertyType string

const (
	PropertyTypeResidential PropertyType = "residential"
	PropertyTypeCommercial  PropertyType = "commercial"
	PropertyTypeLand        PropertyType = "land"
	PropertyTypeIndustrial  PropertyType = "industrial"
)

// PropertyStatus represents the status of property listing
type PropertyStatus string

const (
	PropertyStatusActive   PropertyStatus = "active"
	PropertyStatusInactive PropertyStatus = "inactive"
	PropertyStatusSold     PropertyStatus = "sold"
	PropertyStatusRented   PropertyStatus = "rented"
	PropertyStatusPending  PropertyStatus = "pending"
)

// Property represents a real estate property listing
type Property struct {
	gorm.Model
	Title         string         `json:"title" gorm:"not null"`
	Description   string         `json:"description"`
	PropertyType  PropertyType   `json:"property_type" gorm:"not null"`
	Status        PropertyStatus `json:"status" gorm:"default:'pending'"`
	
	// Location
	Address       string  `json:"address" gorm:"not null"`
	City          string  `json:"city" gorm:"not null"`
	State         string  `json:"state" gorm:"not null"`
	Pincode       string  `json:"pincode"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	
	// Property Details
	Area          float64 `json:"area"` // in sq ft
	Bedrooms      int     `json:"bedrooms"`
	Bathrooms     int     `json:"bathrooms"`
	Floors        int     `json:"floors"`
	YearBuilt     int     `json:"year_built"`
	
	// Pricing
	Price         float64 `json:"price" gorm:"not null"`
	PriceType     string  `json:"price_type"` // sale, rent, lease
	RentAmount    float64 `json:"rent_amount"` // for rental properties
	SecurityDeposit float64 `json:"security_deposit"`
	
	// Features
	Amenities     string  `json:"amenities"` // JSON array of amenities
	Furnished     bool    `json:"furnished" gorm:"default:false"`
	Parking       bool    `json:"parking" gorm:"default:false"`
	Balcony       bool    `json:"balcony" gorm:"default:false"`
	
	// Images and Media
	Images        string  `json:"images"` // JSON array of image URLs
	Videos        string  `json:"videos"` // JSON array of video URLs
	Documents     string  `json:"documents"` // JSON array of document URLs
	
	// Verification
	IsVerified    bool    `json:"is_verified" gorm:"default:false"`
	IsTREESINDIAAssured bool `json:"is_treesindia_assured" gorm:"default:false"`
	
	// Ownership
	OwnerID       uint    `json:"owner_id" gorm:"not null"`
	Owner         User    `json:"owner" gorm:"foreignKey:OwnerID"`
	
	// Relationships
	Inquiries     []Inquiry `json:"inquiries,omitempty" gorm:"foreignKey:PropertyID"`
	Visits        []Visit   `json:"visits,omitempty" gorm:"foreignKey:PropertyID"`
}

// Visit represents property viewing appointments
type Visit struct {
	gorm.Model
	PropertyID    uint      `json:"property_id" gorm:"not null"`
	Property      Property  `json:"property" gorm:"foreignKey:PropertyID"`
	UserID        uint      `json:"user_id" gorm:"not null"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
	ScheduledAt   time.Time `json:"scheduled_at" gorm:"not null"`
	Status        string    `json:"status" gorm:"default:'pending'"` // pending, confirmed, completed, cancelled
	Notes         string    `json:"notes"`
}

// TableName returns the table name for Property
func (Property) TableName() string {
	return "properties"
}

// TableName returns the table name for Visit
func (Visit) TableName() string {
	return "visits"
}
