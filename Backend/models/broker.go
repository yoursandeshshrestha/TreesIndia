package models

import (
	"gorm.io/gorm"
)

// Broker represents the broker model
type Broker struct {
	gorm.Model
	UserID             uint    `json:"user_id" gorm:"not null;uniqueIndex"`
	RoleApplicationID  *uint   `json:"role_application_id"`
	
	// JSON Objects
	ContactInfo        string  `json:"contact_info"`        // JSONB: {"alternative_number": "string"}
	Address            string  `json:"address"`             // JSONB: {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
	Documents          string  `json:"documents"`           // JSONB: {"aadhar_card": "cloudinary_url", "pan_card": "cloudinary_url", "profile_pic": "cloudinary_url"}
	
	// Broker Specific
	License            string  `json:"license" gorm:"uniqueIndex"`
	Agency             string  `json:"agency"`
	
	// Operational Data
	IsActive           bool    `json:"is_active" gorm:"default:false"`
	
	// Relationships
	User               User            `json:"-" gorm:"foreignKey:UserID"` // Exclude to avoid circular reference
	RoleApplication    *RoleApplication `json:"role_application" gorm:"foreignKey:RoleApplicationID"`
}

// TableName returns the table name for Broker
func (Broker) TableName() string {
	return "brokers"
}
