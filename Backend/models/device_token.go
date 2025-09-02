package models

import (
	"time"

	"gorm.io/gorm"
)

// DevicePlatform represents the platform of the device
type DevicePlatform string

const (
	DevicePlatformAndroid DevicePlatform = "android"
	DevicePlatformIOS     DevicePlatform = "ios"
	DevicePlatformWeb     DevicePlatform = "web"
)

// DeviceToken represents FCM device token for push notifications
type DeviceToken struct {
	gorm.Model
	UserID          uint           `json:"user_id" gorm:"not null;index"`
	Token           string         `json:"token" gorm:"type:text;uniqueIndex;not null"`
	Platform        DevicePlatform `json:"platform" gorm:"not null"`
	AppVersion      string         `json:"app_version"`
	DeviceModel     string         `json:"device_model" gorm:"type:text"`
	OSVersion       string         `json:"os_version" gorm:"type:text"`
	IsActive        bool           `json:"is_active" gorm:"default:true"`
	LastUsedAt      *time.Time     `json:"last_used_at"`
	LastNotificationAt *time.Time  `json:"last_notification_at"`
	
	// Relationship
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for DeviceToken
func (DeviceToken) TableName() string {
	return "device_tokens"
}
