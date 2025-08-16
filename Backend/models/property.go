package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// PropertyType represents the type of property
type PropertyType string

const (
	PropertyTypeResidential PropertyType = "residential"
	PropertyTypeCommercial  PropertyType = "commercial"
)

// ListingType represents the listing type
type ListingType string

const (
	ListingTypeSale  ListingType = "sale"
	ListingTypeRent  ListingType = "rent"
)

// PropertyStatus represents the status of a property
type PropertyStatus string

const (
	PropertyStatusAvailable    PropertyStatus = "available"
	PropertyStatusSold         PropertyStatus = "sold"
	PropertyStatusRented       PropertyStatus = "rented"
	PropertyStatusUnderContract PropertyStatus = "under_contract"
	PropertyStatusOffMarket    PropertyStatus = "off_market"
	PropertyStatusExpired      PropertyStatus = "expired"
)

// FurnishingStatus represents the furnishing status
type FurnishingStatus string

const (
	FurnishingStatusFurnished      FurnishingStatus = "furnished"
	FurnishingStatusSemiFurnished  FurnishingStatus = "semi_furnished"
	FurnishingStatusUnfurnished    FurnishingStatus = "unfurnished"
)

// JSONStringArray represents a JSON array of strings
type JSONStringArray []string

// Value implements the driver.Valuer interface
func (a JSONStringArray) Value() (driver.Value, error) {
	if a == nil {
		return nil, nil
	}
	return json.Marshal(a)
}

// Scan implements the sql.Scanner interface
func (a *JSONStringArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}
	
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, a)
	case string:
		return json.Unmarshal([]byte(v), a)
	default:
		return nil
	}
}

// Property represents the property model
type Property struct {
	gorm.Model
	// Basic Information
	Title       string      `json:"title" gorm:"not null"`
	Description string      `json:"description"`
	PropertyType PropertyType `json:"property_type" gorm:"not null"`
	ListingType  ListingType  `json:"listing_type" gorm:"not null"`
	Slug        string      `json:"slug" gorm:"uniqueIndex;not null"`
	
	// Pricing
	SalePrice       *float64 `json:"sale_price"`        // For sale properties
	MonthlyRent     *float64 `json:"monthly_rent"`      // For rental properties
	PriceNegotiable bool     `json:"price_negotiable" gorm:"default:true"`
	
	// Property Details (all optional)
	Bedrooms        *int              `json:"bedrooms"`
	Bathrooms       *int              `json:"bathrooms"`
	Area            *float64          `json:"area"`              // in sq ft
	ParkingSpaces   *int              `json:"parking_spaces"`
	FloorNumber     *int              `json:"floor_number"`
	Age             *int              `json:"age"`               // age in years
	FurnishingStatus *FurnishingStatus `json:"furnishing_status"`
	
	// Location Information
	State   string `json:"state" gorm:"not null"`
	City    string `json:"city" gorm:"not null"`
	Locality string `json:"locality"`
	Address string `json:"address"`
	Pincode string `json:"pincode"`
	
	// Status and Approval
	Status           PropertyStatus `json:"status" gorm:"default:'available'"`
	IsApproved       bool           `json:"is_approved" gorm:"default:false"` // For user listings
	ApprovedAt       *time.Time     `json:"approved_at"`
	ApprovedBy       *uint          `json:"approved_by"` // Admin ID who approved
	UploadedByAdmin  bool           `json:"uploaded_by_admin" gorm:"default:false"` // Track if admin uploaded
	
	// Priority and Subscription
	PriorityScore        int  `json:"priority_score" gorm:"default:0"`           // Priority for listing order
	SubscriptionRequired bool `json:"subscription_required" gorm:"default:false"` // If broker needed subscription to post
	
	// Images
	Images           JSONStringArray `json:"images" gorm:"type:json"` // Array of image URLs
	
	// Expiry
	ExpiresAt        *time.Time `json:"expires_at"`
	
	// Relationships
	UserID           uint      `json:"user_id" gorm:"not null"`
	BrokerID         *uint     `json:"broker_id"` // If listed by broker
	
	// Preloaded relationships
	User             *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Broker           *User     `json:"broker,omitempty" gorm:"foreignKey:BrokerID"`
	ApprovedByUser   *User     `json:"approved_by_user,omitempty" gorm:"foreignKey:ApprovedBy"`
}

// TableName returns the table name for Property
func (Property) TableName() string {
	return "properties"
}

// BeforeCreate is a GORM hook that runs before creating a property
func (p *Property) BeforeCreate(tx *gorm.DB) error {
	// Set expiry date to 30 days from now
	expiryDate := time.Now().AddDate(0, 0, 30)
	p.ExpiresAt = &expiryDate
	
	// Auto-approve if listed by broker or admin
	if p.BrokerID != nil || p.UploadedByAdmin {
		p.IsApproved = true
		now := time.Now()
		p.ApprovedAt = &now
	}
	
	// Set priority score based on property type
	if p.BrokerID != nil {
		p.PriorityScore = 100 // Broker properties get high priority
	} else if p.UploadedByAdmin {
		p.PriorityScore = 50 // Admin properties get medium priority
	} else {
		p.PriorityScore = 0 // Normal user properties get low priority
	}
	
	return nil
}

// IsExpired checks if the property listing has expired
func (p *Property) IsExpired() bool {
	if p.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*p.ExpiresAt)
}

// ShouldExpire checks if the property should be marked as expired
func (p *Property) ShouldExpire() bool {
	return p.Status == PropertyStatusAvailable && p.IsExpired()
}
