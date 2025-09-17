package models

import (
	"time"

	"gorm.io/gorm"
)

// InAppNotificationType represents the type of in-app notification
type InAppNotificationType string

const (
	// User Management
	InAppNotificationTypeUserRegistered     InAppNotificationType = "user_registered"
	InAppNotificationTypeWorkerApplication  InAppNotificationType = "worker_application"
	InAppNotificationTypeBrokerApplication  InAppNotificationType = "broker_application"
	InAppNotificationTypeWorkerAssignedToWork InAppNotificationType = "worker_assigned_to_work"
	
	// Booking & Service Management
	InAppNotificationTypeBookingCreated     InAppNotificationType = "booking_created"
	InAppNotificationTypeServiceAdded       InAppNotificationType = "service_added"
	InAppNotificationTypeServiceUpdated     InAppNotificationType = "service_updated"
	InAppNotificationTypeServiceDeactivated InAppNotificationType = "service_deactivated"
	
	// Property & Project Management
	InAppNotificationTypePropertyCreated    InAppNotificationType = "property_created"
	InAppNotificationTypeProjectCreated     InAppNotificationType = "project_created"
	InAppNotificationTypeVendorProfileCreated InAppNotificationType = "vendor_profile_created"
	
	// Payment & Subscription
	InAppNotificationTypePaymentReceived    InAppNotificationType = "payment_received"
	InAppNotificationTypeSubscriptionPurchase InAppNotificationType = "subscription_purchase"
	InAppNotificationTypeWalletTransaction  InAppNotificationType = "wallet_transaction"
	
	// Booking Status Updates
	InAppNotificationTypeBookingCancelled   InAppNotificationType = "booking_cancelled"
	InAppNotificationTypeWorkerAssigned     InAppNotificationType = "worker_assigned"
	InAppNotificationTypeWorkerStarted      InAppNotificationType = "worker_started"
	InAppNotificationTypeWorkerCompleted    InAppNotificationType = "worker_completed"
	InAppNotificationTypeBookingConfirmed   InAppNotificationType = "booking_confirmed"
	InAppNotificationTypeQuoteProvided      InAppNotificationType = "quote_provided"
	InAppNotificationTypeQuoteAccepted      InAppNotificationType = "quote_accepted"
	InAppNotificationTypeQuoteRejected      InAppNotificationType = "quote_rejected"
	InAppNotificationTypeQuoteExpired       InAppNotificationType = "quote_expired"
	
	// Payment & Subscription for Users
	InAppNotificationTypePaymentConfirmation InAppNotificationType = "payment_confirmation"
	InAppNotificationTypeSubscriptionExpiryWarning InAppNotificationType = "subscription_expiry_warning"
	InAppNotificationTypeSubscriptionExpired InAppNotificationType = "subscription_expired"
	
	// Communication
	InAppNotificationTypeConversationStarted InAppNotificationType = "conversation_started"
	
	// Worker Notifications
	InAppNotificationTypeApplicationAccepted InAppNotificationType = "application_accepted"
	InAppNotificationTypeApplicationRejected InAppNotificationType = "application_rejected"
	InAppNotificationTypeNewAssignment      InAppNotificationType = "new_assignment"
	InAppNotificationTypeAssignmentAccepted InAppNotificationType = "assignment_accepted"
	InAppNotificationTypeAssignmentRejected InAppNotificationType = "assignment_rejected"
	InAppNotificationTypeWorkStarted        InAppNotificationType = "work_started"
	InAppNotificationTypeWorkCompleted      InAppNotificationType = "work_completed"
	InAppNotificationTypeWorkerPaymentReceived InAppNotificationType = "worker_payment_received"
	
	// Broker Notifications
	InAppNotificationTypeBrokerApplicationStatus InAppNotificationType = "broker_application_status"
	InAppNotificationTypePropertyApproval   InAppNotificationType = "property_approval"
	InAppNotificationTypePropertyExpiryWarning InAppNotificationType = "property_expiry_warning"
	
	// System Updates
	InAppNotificationTypeNewServiceAvailable InAppNotificationType = "new_service_available"
	InAppNotificationTypeSystemMaintenance  InAppNotificationType = "system_maintenance"
	InAppNotificationTypeFeatureUpdate      InAppNotificationType = "feature_update"
	
	// Authentication Events
	InAppNotificationTypeOTPRequested       InAppNotificationType = "otp_requested"
	InAppNotificationTypeOTPVerified        InAppNotificationType = "otp_verified"
	InAppNotificationTypeLoginSuccess       InAppNotificationType = "login_success"
	InAppNotificationTypeLoginFailed        InAppNotificationType = "login_failed"
)

// InAppNotification represents an in-app notification
type InAppNotification struct {
	gorm.Model
	UserID        uint                    `json:"user_id" gorm:"not null;index"`
	Type          InAppNotificationType   `json:"type" gorm:"not null"`
	Title         string                  `json:"title" gorm:"not null"`
	Message       string                  `json:"message" gorm:"not null"`
	IsRead        bool                    `json:"is_read" gorm:"default:false"`
	ReadAt        *time.Time              `json:"read_at"`
	
	// Related entity references
	RelatedEntityType string              `json:"related_entity_type"` // "booking", "user", "payment", etc.
	RelatedEntityID   *uint               `json:"related_entity_id"`
	
	// Additional data for rich notifications
	Data          JSONB                  `json:"data" gorm:"type:jsonb"`
	
	// Relationships
	User          User                    `json:"user" gorm:"foreignKey:UserID"`
}

// TableName returns the table name for InAppNotification
func (InAppNotification) TableName() string {
	return "in_app_notifications"
}

// MarkAsRead marks the notification as read
func (n *InAppNotification) MarkAsRead() {
	n.IsRead = true
	now := time.Now()
	n.ReadAt = &now
}

// CreateInAppNotificationRequest represents the request to create a notification
type CreateInAppNotificationRequest struct {
	UserID            uint                    `json:"user_id" binding:"required"`
	Type              InAppNotificationType   `json:"type" binding:"required"`
	Title             string                  `json:"title" binding:"required"`
	Message           string                  `json:"message" binding:"required"`
	RelatedEntityType string                  `json:"related_entity_type,omitempty"`
	RelatedEntityID   *uint                   `json:"related_entity_id,omitempty"`
	Data              JSONB                   `json:"data,omitempty"`
}

// InAppNotificationResponse represents the response structure for notifications
type InAppNotificationResponse struct {
	ID                uint                    `json:"id"`
	Type              InAppNotificationType   `json:"type"`
	Title             string                  `json:"title"`
	Message           string                  `json:"message"`
	IsRead            bool                    `json:"is_read"`
	ReadAt            *time.Time              `json:"read_at"`
	RelatedEntityType string                  `json:"related_entity_type"`
	RelatedEntityID   *uint                   `json:"related_entity_id"`
	Data              JSONB                   `json:"data"`
	CreatedAt         time.Time               `json:"created_at"`
	UpdatedAt         time.Time               `json:"updated_at"`
}

// ToResponse converts InAppNotification to InAppNotificationResponse
func (n *InAppNotification) ToResponse() InAppNotificationResponse {
	return InAppNotificationResponse{
		ID:                n.ID,
		Type:              n.Type,
		Title:             n.Title,
		Message:           n.Message,
		IsRead:            n.IsRead,
		ReadAt:            n.ReadAt,
		RelatedEntityType: n.RelatedEntityType,
		RelatedEntityID:   n.RelatedEntityID,
		Data:              n.Data,
		CreatedAt:         n.CreatedAt,
		UpdatedAt:         n.UpdatedAt,
	}
}
