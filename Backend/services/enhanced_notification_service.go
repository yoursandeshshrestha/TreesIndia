package services

import (
	"fmt"
	"strings"
	"time"
	"treesindia/database"
	"treesindia/models"

	"gorm.io/gorm"
)

// EnhancedNotificationService provides unified notification sending
type EnhancedNotificationService struct {
	db                  *gorm.DB
	fcmService          *FCMService
	deviceService       *DeviceManagementService
	emailService        *EmailService
}

// NotificationRequest represents a notification to be sent
type NotificationRequest struct {
	UserID      uint                    `json:"user_id" binding:"required"`
	Type        models.NotificationType `json:"type"` // Optional, defaults to "general"
	Title       string                  `json:"title" binding:"required"`
	Body        string                  `json:"body" binding:"required"`
	Data        map[string]string       `json:"data,omitempty"`
	ImageURL    string                  `json:"image_url,omitempty"`
	ClickAction string                  `json:"click_action,omitempty"`
	Priority    string                  `json:"priority,omitempty"` // Optional, defaults to "high"
}

// NotificationResult represents the result of sending a notification
type NotificationResult struct {
	UserID           uint                           `json:"user_id"`
	Type             models.NotificationType        `json:"type"`
	PushSent         bool                           `json:"push_sent"`
	PushSuccess      bool                           `json:"push_success"`
	PushError        string                         `json:"push_error,omitempty"`
	EmailSent        bool                           `json:"email_sent,omitempty"`
	EmailSuccess     bool                           `json:"email_success,omitempty"`
	EmailError       string                         `json:"email_error,omitempty"`
	NotificationID   uint                           `json:"notification_id,omitempty"`
	SentAt           time.Time                      `json:"sent_at"`
}

// NewEnhancedNotificationService creates a new enhanced notification service
func NewEnhancedNotificationService(fcmService *FCMService, deviceService *DeviceManagementService, emailService *EmailService) *EnhancedNotificationService {
	return &EnhancedNotificationService{
		db:            database.GetDB(),
		fcmService:    fcmService,
		deviceService: deviceService,
		emailService:  emailService,
	}
}

// SendNotification sends a notification through all available channels
func (e *EnhancedNotificationService) SendNotification(req *NotificationRequest) (*NotificationResult, error) {
	// Set defaults for optional fields
	if req.Type == "" {
		req.Type = "general"
	}
	if req.Priority == "" {
		req.Priority = "high"
	}

	result := &NotificationResult{
		UserID:   req.UserID,
		Type:     req.Type,
		SentAt:   time.Now(),
	}

	// Check user notification settings
	var notificationSettings models.UserNotificationSettings
	if err := e.db.Where("user_id = ?", req.UserID).First(&notificationSettings).Error; err != nil {
		// Use default settings if none exist
		notificationSettings = models.UserNotificationSettings{
			PushNotifications: true,
			EmailNotifications: true,
			SMSNotifications:   true,
		}
	}

	// Send push notification if enabled
	if notificationSettings.PushNotifications {
		result.PushSent = true
		if err := e.sendPushNotification(req, result); err != nil {
			result.PushError = err.Error()
		} else {
			result.PushSuccess = true
		}
	}

	// Send email notification if enabled
	if notificationSettings.EmailNotifications {
		result.EmailSent = true
		if err := e.sendEmailNotification(req, result); err != nil {
			result.EmailError = err.Error()
		} else {
			result.EmailSuccess = true
		}
	}

	// Store notification record
	if err := e.storeNotificationRecord(req, result); err != nil {
		// Log error but don't fail the entire operation
		fmt.Printf("Failed to store notification record: %v\n", err)
	}

	return result, nil
}

// SendNotificationToMultipleUsers sends the same notification to multiple users
func (e *EnhancedNotificationService) SendNotificationToMultipleUsers(userIDs []uint, req *NotificationRequest) ([]*NotificationResult, error) {
	var results []*NotificationResult
	
	for _, userID := range userIDs {
		userReq := *req
		userReq.UserID = userID
		
		result, err := e.SendNotification(&userReq)
		if err != nil {
			// Log error but continue with other users
			fmt.Printf("Failed to send notification to user %d: %v\n", userID, err)
			result = &NotificationResult{
				UserID: userID,
				Type:   req.Type,
				SentAt: time.Now(),
			}
		}
		
		results = append(results, result)
	}
	
	return results, nil
}

// SendNotificationToTopic sends a notification to all users subscribed to a topic
func (e *EnhancedNotificationService) SendNotificationToTopic(topic string, req *NotificationRequest) (*FCMResponse, error) {
	// Get all users subscribed to the topic
	var users []models.User
	if err := e.db.Joins("JOIN device_tokens ON users.id = device_tokens.user_id").
		Where("device_tokens.is_active = ?", true).
		Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to get users for topic: %w", err)
	}

	// Send to topic via FCM
	fcmNotification := &FCMNotification{
		Title:       req.Title,
		Body:        req.Body,
		Data:        req.Data,
		ImageURL:    req.ImageURL,
		ClickAction: req.ClickAction,
	}

	return e.fcmService.SendToTopic(topic, fcmNotification)
}

// sendPushNotification sends a push notification via FCM
func (e *EnhancedNotificationService) sendPushNotification(req *NotificationRequest, result *NotificationResult) error {
	// Get user's device tokens
	tokens, err := e.deviceService.GetUserDeviceTokens(req.UserID)
	if err != nil {
		return fmt.Errorf("failed to get user device tokens: %w", err)
	}

	fmt.Printf("[EnhancedNotification] Found %d tokens for user_id %d\n", len(tokens), req.UserID)

	if len(tokens) == 0 {
		return fmt.Errorf("no active devices found for user")
	}

	// Filter out empty tokens
	var validTokens []string
	for _, token := range tokens {
		if strings.TrimSpace(token) != "" {
			validTokens = append(validTokens, token)
			fmt.Printf("[EnhancedNotification] Token: %s...\n", token[:20])
		}
	}

	if len(validTokens) == 0 {
		return fmt.Errorf("no valid device tokens found for user")
	}

	// Create FCM notification
	fcmNotification := &FCMNotification{
		Title:       req.Title,
		Body:        req.Body,
		Data:        req.Data,
		ImageURL:    req.ImageURL,
		ClickAction: req.ClickAction,
	}

	fmt.Printf("[EnhancedNotification] Sending notification: Title='%s', Body='%s'\n", req.Title, req.Body)

	// Send to all user devices
	fcmResponse, err := e.fcmService.SendToMultipleDevices(validTokens, fcmNotification)
	if err != nil {
		fmt.Printf("[EnhancedNotification] FCM Error: %v\n", err)
		return fmt.Errorf("failed to send FCM notification: %w", err)
	}

	fmt.Printf("[EnhancedNotification] FCM Response: Success=%d, Failure=%d\n", fcmResponse.SuccessCount, fcmResponse.FailureCount)
	if len(fcmResponse.Errors) > 0 {
		fmt.Printf("[EnhancedNotification] FCM Errors: %v\n", fcmResponse.Errors)
	}

	// Update device last used timestamps for successful tokens
	if fcmResponse.SuccessCount > 0 {
		for _, token := range validTokens {
			e.deviceService.UpdateDeviceLastUsed(token)
		}
	}



	return nil
}

// sendEmailNotification sends an email notification
func (e *EnhancedNotificationService) sendEmailNotification(req *NotificationRequest, result *NotificationResult) error {
	// Get user details
	var user models.User
	if err := e.db.First(&user, req.UserID).Error; err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if user.Email == nil || *user.Email == "" {
		return fmt.Errorf("user has no email address")
	}





	return nil
}

// storeNotificationRecord stores the notification in the database
func (e *EnhancedNotificationService) storeNotificationRecord(req *NotificationRequest, result *NotificationResult) error {
	notification := models.PushNotification{
		UserID:        req.UserID,
		Type:          req.Type,
		Title:         req.Title,
		Body:          req.Body,
		Data:          req.Data,
		Status:        models.NotificationStatusSent,
		SentAt:        &result.SentAt,
		RetryCount:    0,
	}

	if err := e.db.Create(&notification).Error; err != nil {
		return fmt.Errorf("failed to create notification record: %w", err)
	}

	result.NotificationID = notification.ID
	return nil
}

// GetNotificationHistory returns notification history for a user
func (e *EnhancedNotificationService) GetNotificationHistory(userID uint, limit int, offset int) ([]models.PushNotification, error) {
	var notifications []models.PushNotification
	
	query := e.db.Where("user_id = ?", userID).Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	if offset > 0 {
		query = query.Offset(offset)
	}
	
	if err := query.Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to get notification history: %w", err)
	}
	
	return notifications, nil
}

// MarkNotificationAsDelivered marks a notification as delivered
func (e *EnhancedNotificationService) MarkNotificationAsDelivered(notificationID uint) error {
	now := time.Now()
	if err := e.db.Model(&models.PushNotification{}).
		Where("id = ?", notificationID).
		Updates(map[string]interface{}{
			"status":        models.NotificationStatusDelivered,
			"delivered_at":  &now,
			"updated_at":    &now,
		}).Error; err != nil {
		return fmt.Errorf("failed to mark notification as delivered: %w", err)
	}
	
	return nil
}

// GetNotificationStats returns statistics about notifications
func (e *EnhancedNotificationService) GetNotificationStats(userID uint) (map[string]interface{}, error) {
	var totalNotifications int64
	var sentNotifications int64
	var deliveredNotifications int64
	var failedNotifications int64

	if err := e.db.Model(&models.PushNotification{}).Where("user_id = ?", userID).Count(&totalNotifications).Error; err != nil {
		return nil, err
	}
	
	if err := e.db.Model(&models.PushNotification{}).Where("user_id = ? AND status = ?", userID, models.NotificationStatusSent).Count(&sentNotifications).Error; err != nil {
		return nil, err
	}
	
	if err := e.db.Model(&models.PushNotification{}).Where("user_id = ? AND status = ?", userID, models.NotificationStatusDelivered).Count(&deliveredNotifications).Error; err != nil {
		return nil, err
	}
	
	if err := e.db.Model(&models.PushNotification{}).Where("user_id = ? AND status = ?", userID, models.NotificationStatusFailed).Count(&failedNotifications).Error; err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_notifications":     totalNotifications,
		"sent_notifications":      sentNotifications,
		"delivered_notifications": deliveredNotifications,
		"failed_notifications":    failedNotifications,
		"delivery_rate":           float64(deliveredNotifications) / float64(totalNotifications) * 100,
	}, nil
}


