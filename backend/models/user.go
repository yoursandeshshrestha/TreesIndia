package models

import (
	"time"

	"gorm.io/gorm"
)

// UserType represents the type of user
type UserType string

const (
	UserTypeNormal UserType = "normal"
	UserTypeWorker UserType = "worker"
	UserTypeBroker UserType = "broker"
	UserTypeAdmin  UserType = "admin"
)

// KYCStatus represents the KYC verification status
type KYCStatus string

const (
	KYCStatusPending   KYCStatus = "pending"
	KYCStatusApproved  KYCStatus = "approved"
	KYCStatusRejected  KYCStatus = "rejected"
	KYCStatusNotNeeded KYCStatus = "not_needed"
)

// User represents the main user model
type User struct {
	gorm.Model
	// Basic Information
	Name        string    `json:"name"`
	Email       *string   `json:"email" gorm:"uniqueIndex"`
	Phone       string    `json:"phone" gorm:"uniqueIndex;not null"`
	UserType    UserType  `json:"user_type" gorm:"not null;default:'normal'"`
	Avatar      string    `json:"avatar"`
	
	// Location Information
	Location    string    `json:"location"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	
	// Status and Verification
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	IsVerified  bool      `json:"is_verified" gorm:"default:false"`
	KYCStatus   KYCStatus `json:"kyc_status" gorm:"default:'not_needed'"`
	
	// Authentication
	Password    string    `json:"-"` // Hashed password (optional for phone auth)
	GoogleID    *string   `json:"google_id" gorm:"uniqueIndex"`
	LastLoginAt *time.Time `json:"last_login_at"`
	
	// Worker-specific fields
	Skills      []Skill   `json:"skills,omitempty" gorm:"many2many:user_skills;"`
	ServiceAreas []ServiceArea `json:"service_areas,omitempty" gorm:"many2many:user_service_areas;"`
	Rates       []Rate    `json:"rates,omitempty" gorm:"foreignKey:UserID"`
	Earnings    float64   `json:"earnings" gorm:"default:0"`
	Rating      float64   `json:"rating" gorm:"default:0"`
	TotalJobs   int       `json:"total_jobs" gorm:"default:0"`
	
	// Broker-specific fields
	BrokerLicense string   `json:"broker_license"`
	BrokerAgency  string   `json:"broker_agency"`
	
	// KYC Documents
	KYC          *KYC      `json:"kyc,omitempty"`
	
	// Relationships
	Bookings    []Booking `json:"bookings,omitempty" gorm:"foreignKey:UserID"`
	Reviews     []Review  `json:"reviews,omitempty" gorm:"foreignKey:UserID"`
	Inquiries   []Inquiry `json:"inquiries,omitempty" gorm:"foreignKey:UserID"`
}

// KYC represents KYC verification documents
type KYC struct {
	gorm.Model
	UserID          uint      `json:"user_id" gorm:"uniqueIndex"`
	User            User      `json:"user" gorm:"foreignKey:UserID"`
	
	// Personal Documents
	AadhaarNumber   string    `json:"aadhaar_number"`
	AadhaarFront    string    `json:"aadhaar_front"` // File URL
	AadhaarBack     string    `json:"aadhaar_back"`  // File URL
	PANNumber       string    `json:"pan_number"`
	PANCard         string    `json:"pan_card"`      // File URL
	
	// Address Proof
	AddressProof    string    `json:"address_proof"` // File URL
	AddressType     string    `json:"address_type"`  // Aadhaar, Utility Bill, etc.
	
	// Worker-specific documents
	SkillCertificates []string `json:"skill_certificates" gorm:"type:text[]"`
	ExperienceProof   string   `json:"experience_proof"` // File URL
	
	// Broker-specific documents
	BrokerLicenseDoc string   `json:"broker_license_doc"` // File URL
	AgencyCertificate string  `json:"agency_certificate"` // File URL
	
	// Verification
	Status          KYCStatus `json:"status" gorm:"default:'pending'"`
	VerifiedBy      *uint     `json:"verified_by"`
	VerifiedAt      *time.Time `json:"verified_at"`
	RejectionReason string    `json:"rejection_reason"`
}

// Skill represents worker skills
type Skill struct {
	gorm.Model
	Name        string `json:"name" gorm:"uniqueIndex"`
	Description string `json:"description"`
	CategoryName string `json:"category"` // Keep for backward compatibility
	CategoryID  *uint  `json:"category_id"` // Foreign key to Category
	Icon        string `json:"icon"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	Users       []User `json:"users,omitempty" gorm:"many2many:user_skills;"`
	Category    *Category `json:"category_details,omitempty" gorm:"foreignKey:CategoryID"`
}

// ServiceArea represents worker service areas
type ServiceArea struct {
	gorm.Model
	Name        string  `json:"name"`
	City        string  `json:"city"`
	State       string  `json:"state"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Radius      int     `json:"radius"` // in kilometers
	IsActive    bool    `json:"is_active" gorm:"default:true"`
	Users       []User  `json:"users,omitempty" gorm:"many2many:user_service_areas;"`
}

// Rate represents worker service rates
type Rate struct {
	gorm.Model
	UserID      uint    `json:"user_id"`
	User        User    `json:"user" gorm:"foreignKey:UserID"`
	ServiceID   uint    `json:"service_id"`
	Service     Service `json:"service" gorm:"foreignKey:ServiceID"`
	BasePrice   float64 `json:"base_price"`
	HourlyRate  float64 `json:"hourly_rate"`
	IsActive    bool    `json:"is_active" gorm:"default:true"`
}

// LocationSource represents the source of location data
type LocationSource string

const (
	LocationSourceGPS   LocationSource = "gps"
	LocationSourceIP    LocationSource = "ip"
	LocationSourceManual LocationSource = "manual"
)

// Location represents user location data
type Location struct {
	gorm.Model
	UserID          uint            `json:"user_id" gorm:"uniqueIndex"`
	User            User            `json:"user" gorm:"foreignKey:UserID"`
	Latitude        float64         `json:"latitude"`
	Longitude       float64         `json:"longitude"`
	Accuracy        *float64        `json:"accuracy"` // GPS accuracy in meters
	Address         string          `json:"address"`
	City            string          `json:"city"`
	State           string          `json:"state"`
	Country         string          `json:"country" gorm:"default:'India'"`
	PostalCode      string          `json:"postal_code"`
	LocationSource  LocationSource  `json:"location_source" gorm:"default:'gps'"`
	IsPrimary       bool            `json:"is_primary" gorm:"default:true"`
	LastUpdated     time.Time       `json:"last_updated"`
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}

// TableName returns the table name for KYC
func (KYC) TableName() string {
	return "kyc"
}

// TableName returns the table name for Skill
func (Skill) TableName() string {
	return "skills"
}

// TableName returns the table name for ServiceArea
func (ServiceArea) TableName() string {
	return "service_areas"
}

// TableName returns the table name for Rate
func (Rate) TableName() string {
	return "rates"
}

// TableName returns the table name for Location
func (Location) TableName() string {
	return "locations"
}
