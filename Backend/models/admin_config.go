package models

import (
	"gorm.io/gorm"
)

// AdminConfig represents system-wide configuration settings
type AdminConfig struct {
	gorm.Model
	Key         string `json:"key" gorm:"uniqueIndex;not null"`
	Value       string `json:"value" gorm:"not null"`
	Type        string `json:"type" gorm:"not null"` // "string", "int", "float", "bool"
	Category    string `json:"category" gorm:"not null"` // "wallet", "property", "service", "system", "payment"
	Description string `json:"description"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
}

// TableName returns the table name for AdminConfig
func (AdminConfig) TableName() string {
	return "admin_configs"
}


