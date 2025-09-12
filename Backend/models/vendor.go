package models

import (
	"encoding/json"

	"gorm.io/gorm"
)

// Vendor represents the vendor profile model
type Vendor struct {
	gorm.Model
	
	// Basic Information
	VendorName        string `json:"vendor_name" gorm:"not null"`
	BusinessDescription string `json:"business_description"`
	
	// Contact Person & Address
	ContactPersonName  string `json:"contact_person_name"`
	ContactPersonPhone string `json:"contact_person_phone"`
	ContactPersonEmail string `json:"contact_person_email"`
	BusinessAddress    string `json:"business_address"` // JSONB: {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
	
	// Business Details
	BusinessType       string `json:"business_type"` // "individual", "partnership", "company", etc.
	YearsInBusiness    int    `json:"years_in_business"`
	ServicesOffered    string `json:"services_offered"` // JSONB array of services
	
	// Pictures
	ProfilePicture     string `json:"profile_picture"`
	BusinessGallery    string `json:"business_gallery"` // JSONB array of image URLs
	
	// Operational Data
	IsActive           bool   `json:"is_active" gorm:"default:true"`
	
	// Relationships
	UserID             uint   `json:"user_id" gorm:"not null"`
	User               *User  `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for Vendor
func (Vendor) TableName() string {
	return "vendors"
}

// MarshalJSON custom JSON marshaling for Vendor
func (v *Vendor) MarshalJSON() ([]byte, error) {
	// Create a temporary struct with the same fields but with proper types for JSONB fields
	type Alias Vendor
	aux := &struct {
		*Alias
		ServicesOffered []string `json:"services_offered"`
		BusinessGallery []string `json:"business_gallery"`
	}{
		Alias: (*Alias)(v),
	}

	// Parse ServicesOffered JSON string to array
	if v.ServicesOffered != "" {
		if err := json.Unmarshal([]byte(v.ServicesOffered), &aux.ServicesOffered); err != nil {
			aux.ServicesOffered = []string{}
		}
	} else {
		aux.ServicesOffered = []string{}
	}

	// Parse BusinessGallery JSON string to array
	if v.BusinessGallery != "" {
		if err := json.Unmarshal([]byte(v.BusinessGallery), &aux.BusinessGallery); err != nil {
			aux.BusinessGallery = []string{}
		}
	} else {
		aux.BusinessGallery = []string{}
	}

	return json.Marshal(aux)
}

// UnmarshalJSON custom JSON unmarshaling for Vendor
func (v *Vendor) UnmarshalJSON(data []byte) error {
	// Create a temporary struct with the same fields but with proper types for JSONB fields
	type Alias Vendor
	aux := &struct {
		*Alias
		ServicesOffered []string `json:"services_offered"`
		BusinessGallery []string `json:"business_gallery"`
	}{
		Alias: (*Alias)(v),
	}

	// Unmarshal into the temporary struct
	if err := json.Unmarshal(data, aux); err != nil {
		return err
	}

	// Convert ServicesOffered array to JSON string
	if len(aux.ServicesOffered) > 0 {
		servicesJSON, err := json.Marshal(aux.ServicesOffered)
		if err != nil {
			return err
		}
		v.ServicesOffered = string(servicesJSON)
	} else {
		v.ServicesOffered = ""
	}

	// Convert BusinessGallery array to JSON string
	if len(aux.BusinessGallery) > 0 {
		galleryJSON, err := json.Marshal(aux.BusinessGallery)
		if err != nil {
			return err
		}
		v.BusinessGallery = string(galleryJSON)
	} else {
		v.BusinessGallery = ""
	}

	return nil
}

// CreateVendorRequest represents the request for creating a vendor profile
type CreateVendorRequest struct {
	VendorName         string   `json:"vendor_name" binding:"required,min=2,max=100"`
	BusinessDescription string  `json:"business_description" binding:"max=1000"`
	ContactPersonName  string   `json:"contact_person_name" binding:"required,min=2,max=100"`
	ContactPersonPhone string   `json:"contact_person_phone" binding:"required"`
	ContactPersonEmail string   `json:"contact_person_email" binding:"omitempty,email"`
	BusinessAddress    JSONB    `json:"business_address" binding:"required"`
	BusinessType       string   `json:"business_type" binding:"required,oneof=individual partnership company llp pvt_ltd public_ltd other"`
	YearsInBusiness    int      `json:"years_in_business" binding:"min=0,max=100"`
	ServicesOffered    []string `json:"services_offered" binding:"required,min=1"`
	ProfilePicture     string   `json:"profile_picture"`
	BusinessGallery    []string `json:"business_gallery"`
}

// UpdateVendorRequest represents the request for updating a vendor profile
type UpdateVendorRequest struct {
	VendorName         *string   `json:"vendor_name" binding:"omitempty,min=2,max=100"`
	BusinessDescription *string  `json:"business_description" binding:"omitempty,max=1000"`
	ContactPersonName  *string   `json:"contact_person_name" binding:"omitempty,min=2,max=100"`
	ContactPersonPhone *string   `json:"contact_person_phone"`
	ContactPersonEmail *string   `json:"contact_person_email" binding:"omitempty,email"`
	BusinessAddress    *JSONB    `json:"business_address"`
	BusinessType       *string   `json:"business_type" binding:"omitempty,oneof=individual partnership company llp pvt_ltd public_ltd other"`
	YearsInBusiness    *int      `json:"years_in_business" binding:"omitempty,min=0,max=100"`
	ServicesOffered    []string  `json:"services_offered" binding:"omitempty,min=1"`
	IsActive           *bool     `json:"is_active"`
}
