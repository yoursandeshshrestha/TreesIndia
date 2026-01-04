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

// BusinessAddressData represents the parsed business address
type BusinessAddressData struct {
	Street   string `json:"street"`
	City     string `json:"city"`
	State    string `json:"state"`
	Pincode  string `json:"pincode"`
	Landmark string `json:"landmark"`
}

// MarshalJSON custom JSON marshaling for Vendor
func (v *Vendor) MarshalJSON() ([]byte, error) {
	// Parse ServicesOffered JSON string to array
	var servicesOffered []string
	if v.ServicesOffered != "" {
		if err := json.Unmarshal([]byte(v.ServicesOffered), &servicesOffered); err != nil {
			servicesOffered = []string{}
		}
	} else {
		servicesOffered = []string{}
	}

	// Parse BusinessGallery JSON string to array
	var businessGallery []string
	if v.BusinessGallery != "" {
		if err := json.Unmarshal([]byte(v.BusinessGallery), &businessGallery); err != nil {
			businessGallery = []string{}
		}
	} else {
		businessGallery = []string{}
	}

	// Parse BusinessAddress JSON string to object
	var businessAddress BusinessAddressData
	if v.BusinessAddress != "" {
		if err := json.Unmarshal([]byte(v.BusinessAddress), &businessAddress); err != nil {
			businessAddress = BusinessAddressData{}
		}
	}

	// Create the response structure with all fields explicitly defined
	return json.Marshal(map[string]interface{}{
		"id":                   v.ID,
		"created_at":           v.CreatedAt,
		"updated_at":           v.UpdatedAt,
		"deleted_at":           v.DeletedAt,
		"user_id":              v.UserID,
		"vendor_name":          v.VendorName,
		"business_description": v.BusinessDescription,
		"contact_person_name":  v.ContactPersonName,
		"contact_person_phone": v.ContactPersonPhone,
		"contact_person_email": v.ContactPersonEmail,
		"business_address":     businessAddress,
		"business_type":        v.BusinessType,
		"years_in_business":    v.YearsInBusiness,
		"services_offered":     servicesOffered,
		"profile_picture":      v.ProfilePicture,
		"business_gallery":     businessGallery,
		"is_active":            v.IsActive,
		"is_verified":          false, // TODO: Add is_verified field to Vendor model if needed
		"rating":               0.0,   // TODO: Add rating field to Vendor model if needed
		"total_jobs":           0,     // TODO: Add total_jobs field to Vendor model if needed
	})
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
	ProfilePicture     *string   `json:"profile_picture"`
	BusinessGallery    []string  `json:"business_gallery"`
	IsActive           *bool     `json:"is_active"`
}
