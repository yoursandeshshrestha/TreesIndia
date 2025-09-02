package models

import (
	"gorm.io/gorm"
)

// NotificationTemplate represents a reusable notification template
type NotificationTemplate struct {
	gorm.Model
	Name        string            `json:"name" gorm:"uniqueIndex;not null"`
	Type        NotificationType  `json:"type" gorm:"not null"`
	Title       string            `json:"title" gorm:"not null"`
	Body        string            `json:"body" gorm:"not null"`
	Description string            `json:"description"`
	IsActive    bool              `json:"is_active" gorm:"default:true"`
	Variables   map[string]string `json:"variables" gorm:"type:jsonb"` // Template variables like {{user_name}}, {{booking_id}}
	Platforms   []string          `json:"platforms" gorm:"type:jsonb"` // Which platforms this template applies to
}

// TableName returns the table name for NotificationTemplate
func (NotificationTemplate) TableName() string {
	return "notification_templates"
}
