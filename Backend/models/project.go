package models

import (
	"gorm.io/gorm"
)

// ProjectStatus represents the status of a project
type ProjectStatus string

const (
	ProjectStatusStartingSoon ProjectStatus = "starting_soon"
	ProjectStatusOnGoing      ProjectStatus = "on_going"
	ProjectStatusCompleted    ProjectStatus = "completed"
	ProjectStatusCancelled    ProjectStatus = "cancelled"
	ProjectStatusOnHold       ProjectStatus = "on_hold"
)

// ProjectType represents the type of project
type ProjectType string

const (
	ProjectTypeResidential    ProjectType = "residential"
	ProjectTypeCommercial     ProjectType = "commercial"
	ProjectTypeInfrastructure ProjectType = "infrastructure"
)


// Project represents the project model
type Project struct {
	gorm.Model
	
	// Basic Information
	Title       string `json:"title" gorm:"not null"`
	Description string `json:"description" gorm:"not null"`
	Slug        string `json:"slug" gorm:"uniqueIndex;not null"`
	
	// Project Details
	ProjectType ProjectType `json:"project_type" gorm:"not null"`
	Status      ProjectStatus `json:"status" gorm:"default:'starting_soon';not null"`
	
	// Location Information
	State   string `json:"state" gorm:"not null"`
	City    string `json:"city" gorm:"not null"`
	Address string `json:"address" gorm:"not null"`
	Pincode string `json:"pincode" gorm:"not null"`
	
	// Project Timeline
	EstimatedDuration int `json:"estimated_duration_days" gorm:"column:estimated_duration_days"`
	
	// Contact Information
	ContactInfo JSONB `json:"contact_info" gorm:"type:jsonb;not null"`
	
	UploadedByAdmin bool `json:"uploaded_by_admin" gorm:"default:false"`
	
	// Images
	Images JSONStringArray `json:"images" gorm:"type:json;not null"`
	
	// Relationships
	UserID uint `json:"user_id" gorm:"not null"`
	User   *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for Project
func (Project) TableName() string {
	return "projects"
}

// BeforeCreate is a GORM hook that runs before creating a project
func (p *Project) BeforeCreate(tx *gorm.DB) error {
	// Set default status if not provided
	if p.Status == "" {
		p.Status = ProjectStatusStartingSoon
	}
	
	// Set uploaded by admin flag based on user type
	if p.User != nil && p.User.UserType == UserTypeAdmin {
		p.UploadedByAdmin = true
	}
	
	return nil
}
