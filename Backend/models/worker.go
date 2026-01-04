package models

import (
	"encoding/json"
	"gorm.io/gorm"
)

// WorkerType represents the type of worker
type WorkerType string

const (
	WorkerTypeNormal        WorkerType = "normal"
	WorkerTypeTreesIndia    WorkerType = "treesindia_worker"
)

// Worker represents the worker model
type Worker struct {
	gorm.Model
	UserID             uint       `json:"user_id" gorm:"not null;uniqueIndex"`
	RoleApplicationID  *uint      `json:"role_application_id"`
	
	// Worker Type
	WorkerType         WorkerType `json:"worker_type" gorm:"default:'normal'"`
	
	// JSON Objects
	ContactInfo        string     `json:"contact_info"`        // JSONB: {"alternative_number": "string"}
	Address            string     `json:"address"`             // JSONB: {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
	BankingInfo        string     `json:"banking_info"`        // JSONB: {"account_number": "string", "ifsc_code": "string", "bank_name": "string", "account_holder_name": "string"}
	Documents          string     `json:"documents"`           // JSONB: {"aadhar_card": "cloudinary_url", "pan_card": "cloudinary_url", "profile_pic": "cloudinary_url", "police_verification": "cloudinary_url"}
	
	// Skills & Experience
	Skills             string     `json:"skills"`              // JSONB array of skill names
	Experience         int        `json:"experience_years" gorm:"column:experience_years"` // Years of experience
	
	// Operational Data
	IsAvailable        bool       `json:"is_available" gorm:"default:false"`
	Rating             float64    `json:"rating" gorm:"default:0"`
	TotalBookings      int        `json:"total_bookings" gorm:"default:0"`
	Earnings           float64    `json:"earnings" gorm:"default:0"`
	TotalJobs          int        `json:"total_jobs" gorm:"default:0"`
	IsActive           bool       `json:"is_active" gorm:"default:false"`
	
	// Relationships
	User               User            `json:"-" gorm:"foreignKey:UserID"` // Exclude to avoid circular reference
	RoleApplication    *RoleApplication `json:"role_application" gorm:"foreignKey:RoleApplicationID"`
}

// TableName returns the table name for Worker
func (Worker) TableName() string {
	return "workers"
}

// ContactInfoData represents the parsed contact information
type ContactInfoData struct {
	Name              string `json:"name"`
	Email             string `json:"email"`
	Phone             string `json:"phone"`
	AlternativeNumber string `json:"alternative_number"`
}

// AddressData represents the parsed address information
type AddressData struct {
	Street   string `json:"street"`
	City     string `json:"city"`
	State    string `json:"state"`
	Pincode  string `json:"pincode"`
	Landmark string `json:"landmark"`
}

// DocumentsData represents the parsed documents
type DocumentsData struct {
	AadharCard          string `json:"aadhar_card"`
	PANCard             string `json:"pan_card"`
	ProfilePic          string `json:"profile_pic"`
	PoliceVerification  string `json:"police_verification"`
}

// BankingInfoData represents the parsed banking information
type BankingInfoData struct {
	AccountHolderName string `json:"account_holder_name"`
	AccountNumber     string `json:"account_number"`
	IFSCCode          string `json:"ifsc_code"`
	BankName          string `json:"bank_name"`
}

// MarshalJSON customizes the JSON serialization of Worker
func (w Worker) MarshalJSON() ([]byte, error) {
	// Parse contact_info JSON
	var contactInfo ContactInfoData
	if w.ContactInfo != "" {
		if err := json.Unmarshal([]byte(w.ContactInfo), &contactInfo); err != nil {
			// If parsing fails, leave contactInfo as empty struct
			contactInfo = ContactInfoData{}
		}
	}

	// If contact info is empty or missing critical fields, try to populate from User
	if contactInfo.Name == "" || contactInfo.Phone == "" {
		// Note: User relationship must be preloaded for this to work
		if w.User.ID != 0 {
			if contactInfo.Name == "" && w.User.Name != "" {
				contactInfo.Name = w.User.Name
			}
			if contactInfo.Phone == "" && w.User.Phone != "" {
				contactInfo.Phone = w.User.Phone
			}
			if contactInfo.Email == "" && w.User.Email != nil && *w.User.Email != "" {
				contactInfo.Email = *w.User.Email
			}
		}
	}

	// Parse address JSON
	var address AddressData
	if w.Address != "" {
		if err := json.Unmarshal([]byte(w.Address), &address); err != nil {
			address = AddressData{}
		}
	}

	// Parse documents JSON
	var documents DocumentsData
	if w.Documents != "" {
		if err := json.Unmarshal([]byte(w.Documents), &documents); err != nil {
			documents = DocumentsData{}
		}
	}

	// Parse banking_info JSON
	var bankingInfo *BankingInfoData
	if w.BankingInfo != "" {
		var bi BankingInfoData
		if err := json.Unmarshal([]byte(w.BankingInfo), &bi); err == nil {
			bankingInfo = &bi
		}
	}

	// Parse skills JSON
	var skills []string
	if w.Skills != "" {
		if err := json.Unmarshal([]byte(w.Skills), &skills); err != nil {
			skills = []string{}
		}
	}

	// Create the response structure with all fields explicitly defined
	return json.Marshal(map[string]interface{}{
		"id":                 w.ID,
		"created_at":         w.CreatedAt,
		"updated_at":         w.UpdatedAt,
		"deleted_at":         w.DeletedAt,
		"user_id":            w.UserID,
		"role_application_id": w.RoleApplicationID,
		"worker_type":        w.WorkerType,
		"name":               contactInfo.Name,
		"email":              contactInfo.Email,
		"phone":              contactInfo.Phone,
		"alternative_number": contactInfo.AlternativeNumber,
		"profile_pic":        documents.ProfilePic,
		"contact_info":       contactInfo,
		"address":            address,
		"documents":          documents,
		"banking_info":       bankingInfo,
		"skills":             skills,
		"experience_years":   w.Experience,
		"is_available":       w.IsAvailable,
		"is_active":          w.IsActive,
		"rating":             w.Rating,
		"total_bookings":     w.TotalBookings,
		"total_jobs":         w.TotalJobs,
		"earnings":           w.Earnings,
		"is_verified":        false, // TODO: Add is_verified field to Worker model if needed
	})
}
