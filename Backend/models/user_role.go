package models

import (
	"gorm.io/gorm"
)

// UserRole represents the polymorphic association between users and their roles
type UserRole struct {
	gorm.Model
	UserID   uint   `json:"user_id" gorm:"not null;index"`
	RoleType string `json:"role_type" gorm:"not null;index"` // "worker", "broker"
	RoleID   uint   `json:"role_id" gorm:"not null"`         // ID in the respective role table
	IsActive bool   `json:"is_active" gorm:"default:true"`
	
	// Relationships
	User *User `json:"user" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for UserRole
func (UserRole) TableName() string {
	return "user_roles"
}
