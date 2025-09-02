package models

import (
	"time"

	"gorm.io/gorm"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeBooking        NotificationType = "booking"
	NotificationTypeWorkerAssignment NotificationType = "worker_assignment"
	NotificationTypePayment        NotificationType = "payment"
	NotificationTypeSubscription   NotificationType = "subscription"
	NotificationTypeChat           NotificationType = "chat"
	NotificationTypePromotional    NotificationType = "promotional"
	NotificationTypeSystem         NotificationType = "system"
)

// NotificationStatus represents the delivery status
type NotificationStatus string

const (
	NotificationStatusPending   NotificationStatus = "pending"
	NotificationStatusSent      NotificationStatus = "sent"
	NotificationStatusDelivered NotificationStatus = "delivered"
	NotificationStatusFailed    NotificationStatus = "failed"
)

// PushNotification represents a sent push notification
type PushNotification struct {
	gorm.Model
	UserID            uint              `json:"user_id" gorm:"not null;index"`
	DeviceTokenID     *uint             `json:"device_token_id"`
	Type              NotificationType  `json:"type" gorm:"not null"`
	Title             string            `json:"title" gorm:"not null"`
	Body              string            `json:"body" gorm:"not null"`
	Data              map[string]string `json:"data" gorm:"type:jsonb"`
	Status            NotificationStatus `json:"status" gorm:"default:'pending'"`
	FCMResponse       string            `json:"fcm_response"`
	SentAt            *time.Time        `json:"sent_at"`
	DeliveredAt       *time.Time        `json:"delivered_at"`
	FailureReason     string            `json:"failure_reason"`
	RetryCount        int               `json:"retry_count" gorm:"default:0"`
	
	// Relationships
	User        User         `json:"user" gorm:"foreignKey:UserID"`
	DeviceToken *DeviceToken `json:"device_token,omitempty" gorm:"foreignKey:DeviceTokenID"`
}

// TableName returns the table name for PushNotification
func (PushNotification) TableName() string {
	return "push_notifications"
}
