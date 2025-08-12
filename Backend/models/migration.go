package models

import (
	"time"
)

// Migration represents a database migration record
type Migration struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Version   string    `json:"version" gorm:"uniqueIndex;not null"`
	Name      string    `json:"name" gorm:"not null"`
	AppliedAt time.Time `json:"applied_at" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for Migration
func (Migration) TableName() string {
	return "migrations"
}
