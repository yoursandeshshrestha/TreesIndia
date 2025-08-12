package models

import (
	"gorm.io/gorm"
)

// UserNotificationSettings represents user notification preferences
type UserNotificationSettings struct {
	gorm.Model
	UserID              uint  `json:"user_id" gorm:"uniqueIndex;not null"`
	EmailNotifications  bool  `json:"email_notifications" gorm:"default:true"`
	SMSNotifications    bool  `json:"sms_notifications" gorm:"default:true"`
	PushNotifications   bool  `json:"push_notifications" gorm:"default:true"`
	MarketingEmails     bool  `json:"marketing_emails" gorm:"default:false"`
	BookingReminders    bool  `json:"booking_reminders" gorm:"default:true"`
	ServiceUpdates      bool  `json:"service_updates" gorm:"default:true"`
	
	// Relationship (omit from JSON to avoid circular reference)
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for UserNotificationSettings
func (UserNotificationSettings) TableName() string {
	return "user_notification_settings"
}
