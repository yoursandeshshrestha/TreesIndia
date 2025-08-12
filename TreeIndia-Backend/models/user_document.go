package models

import (
	"time"

	"gorm.io/gorm"
)

// DocumentType represents the type of document
type DocumentType string

const (
	DocumentTypePANCard        DocumentType = "pan_card"
	DocumentTypeAadhaarCard    DocumentType = "aadhaar_card"
	DocumentTypeAddressProof   DocumentType = "address_proof"
	DocumentTypeSkillCertificate DocumentType = "skill_certificate"
	DocumentTypeProfilePhoto   DocumentType = "profile_photo"
)

// UserDocument represents a user's uploaded document
type UserDocument struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"not null;index"`
	User         User           `json:"-" gorm:"foreignKey:UserID"`
	DocumentType DocumentType   `json:"document_type" gorm:"not null"`
	FileURL      string         `json:"file_url" gorm:"not null"`
	FileName     string         `json:"file_name"`
	FileSize     int64          `json:"file_size"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// TableName returns the table name for UserDocument
func (UserDocument) TableName() string {
	return "user_documents"
}

// CreateUserDocumentRequest represents the request structure for uploading a document
type CreateUserDocumentRequest struct {
	DocumentType DocumentType `json:"document_type" binding:"required,oneof=pan_card aadhaar_card address_proof skill_certificate profile_photo"`
	FileURL      string       `json:"file_url" binding:"required"`
	FileName     string       `json:"file_name"`
	FileSize     int64        `json:"file_size"`
}

// UpdateUserDocumentRequest represents the request structure for updating a document
type UpdateUserDocumentRequest struct {
	FileURL  string `json:"file_url" binding:"required"`
	FileName string `json:"file_name"`
	FileSize int64  `json:"file_size"`
}
