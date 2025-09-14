package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// InAppNotificationService handles in-app notification business logic
type InAppNotificationService struct {
	db                  *gorm.DB
	wsService           *NotificationWebSocketService
}

// NewInAppNotificationService creates a new in-app notification service
func NewInAppNotificationService(wsService *NotificationWebSocketService) *InAppNotificationService {
	return &InAppNotificationService{
		db:        database.GetDB(),
		wsService: wsService,
	}
}

// CreateNotification creates a new in-app notification
func (ns *InAppNotificationService) CreateNotification(req *models.CreateInAppNotificationRequest) (*models.InAppNotification, error) {
	notification := &models.InAppNotification{
		UserID:            req.UserID,
		Type:              req.Type,
		Title:             req.Title,
		Message:           req.Message,
		RelatedEntityType: req.RelatedEntityType,
		RelatedEntityID:   req.RelatedEntityID,
		Data:              req.Data,
		IsRead:            false,
	}

	err := ns.db.Create(notification).Error
	if err != nil {
		logrus.Errorf("Failed to create notification: %v", err)
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	// Send real-time notification via WebSocket
	go ns.sendRealTimeNotification(notification)

	logrus.Infof("Created notification: ID=%d, Type=%s, UserID=%d", notification.ID, notification.Type, notification.UserID)
	return notification, nil
}

// CreateNotificationForUser creates a notification for a specific user
func (ns *InAppNotificationService) CreateNotificationForUser(userID uint, notificationType models.InAppNotificationType, title, message string, data map[string]interface{}) error {
	req := &models.CreateInAppNotificationRequest{
		UserID:  userID,
		Type:    notificationType,
		Title:   title,
		Message: message,
		Data:    models.JSONB(data),
	}

	_, err := ns.CreateNotification(req)
	return err
}

// CreateNotificationForAdmins creates a notification for all admin users
func (ns *InAppNotificationService) CreateNotificationForAdmins(notificationType models.InAppNotificationType, title, message string, data map[string]interface{}) error {
	// Get all admin users
	var adminUsers []models.User
	err := ns.db.Where("user_type = ?", models.UserTypeAdmin).Find(&adminUsers).Error
	if err != nil {
		return fmt.Errorf("failed to get admin users: %w", err)
	}

	// Create notification for each admin
	for _, admin := range adminUsers {
		req := &models.CreateInAppNotificationRequest{
			UserID:  admin.ID,
			Type:    notificationType,
			Title:   title,
			Message: message,
			Data:    models.JSONB(data),
		}

		_, err := ns.CreateNotification(req)
		if err != nil {
			logrus.Errorf("Failed to create notification for admin %d: %v", admin.ID, err)
		}
	}

	return nil
}

// GetUserNotifications retrieves notifications for a specific user with pagination
func (ns *InAppNotificationService) GetUserNotifications(userID uint, limit, offset int) ([]models.InAppNotificationResponse, error) {
	var notifications []models.InAppNotification
	
	query := ns.db.Where("user_id = ?", userID).Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	if offset > 0 {
		query = query.Offset(offset)
	}
	
	err := query.Find(&notifications).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get user notifications: %w", err)
	}

	// Convert to response format
	var responses []models.InAppNotificationResponse
	for _, notification := range notifications {
		responses = append(responses, notification.ToResponse())
	}

	return responses, nil
}

// GetUnreadCount returns the unread notification count for a user
func (ns *InAppNotificationService) GetUnreadCount(userID uint) (int, error) {
	var count int64
	err := ns.db.Model(&models.InAppNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}
	return int(count), nil
}

// MarkNotificationAsRead marks a specific notification as read
func (ns *InAppNotificationService) MarkNotificationAsRead(notificationID uint, userID uint) error {
	var notification models.InAppNotification
	err := ns.db.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("notification not found")
		}
		return fmt.Errorf("failed to get notification: %w", err)
	}

	if notification.IsRead {
		return nil // Already read
	}

	notification.MarkAsRead()
	err = ns.db.Save(&notification).Error
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	// Send real-time update
	go ns.wsService.SendNotificationRead(userID, "user", notificationID, true)
	go ns.sendUnreadCountUpdate(userID, "user")

	logrus.Infof("Marked notification %d as read for user %d", notificationID, userID)
	return nil
}

// MarkAllNotificationsAsRead marks all notifications as read for a user
func (ns *InAppNotificationService) MarkAllNotificationsAsRead(userID uint) error {
	now := time.Now()
	err := ns.db.Model(&models.InAppNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read":  true,
			"read_at":  &now,
			"updated_at": &now,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}

	// Send real-time update
	go ns.wsService.SendAllNotificationsRead(userID, "user")

	logrus.Infof("Marked all notifications as read for user %d", userID)
	return nil
}

// DeleteNotification deletes a specific notification
func (ns *InAppNotificationService) DeleteNotification(notificationID uint, userID uint) error {
	result := ns.db.Where("id = ? AND user_id = ?", notificationID, userID).Delete(&models.InAppNotification{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete notification: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("notification not found")
	}

	// Send unread count update
	go ns.sendUnreadCountUpdate(userID, "user")

	logrus.Infof("Deleted notification %d for user %d", notificationID, userID)
	return nil
}

// GetNotificationStats returns notification statistics for a user
func (ns *InAppNotificationService) GetNotificationStats(userID uint) (map[string]interface{}, error) {
	var totalCount, unreadCount int64
	
	// Get total count
	err := ns.db.Model(&models.InAppNotification{}).Where("user_id = ?", userID).Count(&totalCount).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %w", err)
	}
	
	// Get unread count
	err = ns.db.Model(&models.InAppNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get unread count: %w", err)
	}

	// Get notifications by type
	var typeStats []struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	
	err = ns.db.Model(&models.InAppNotification{}).
		Select("type, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("type").
		Scan(&typeStats).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get type stats: %w", err)
	}

	stats := map[string]interface{}{
		"total_count":   totalCount,
		"unread_count":  unreadCount,
		"read_count":    totalCount - unreadCount,
		"type_stats":    typeStats,
	}

	return stats, nil
}

// CleanupOldNotifications removes notifications older than specified days
func (ns *InAppNotificationService) CleanupOldNotifications(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	
	result := ns.db.Where("created_at < ?", cutoffDate).Delete(&models.InAppNotification{})
	if result.Error != nil {
		return fmt.Errorf("failed to cleanup old notifications: %w", result.Error)
	}

	logrus.Infof("Cleaned up %d old notifications (older than %d days)", result.RowsAffected, days)
	return nil
}

// sendRealTimeNotification sends notification via WebSocket
func (ns *InAppNotificationService) sendRealTimeNotification(notification *models.InAppNotification) {
	if ns.wsService == nil {
		return
	}

	// Determine user type (for now, assume all are regular users unless we have admin logic)
	userType := "user"
	
	// Send the notification
	ns.wsService.SendNotification(notification.UserID, userType, map[string]interface{}{
		"id":                notification.ID,
		"type":              notification.Type,
		"title":             notification.Title,
		"message":           notification.Message,
		"is_read":           notification.IsRead,
		"read_at":           notification.ReadAt,
		"related_entity_type": notification.RelatedEntityType,
		"related_entity_id":   notification.RelatedEntityID,
		"data":              map[string]interface{}(notification.Data),
		"created_at":        notification.CreatedAt,
		"updated_at":        notification.UpdatedAt,
	})

	// Send unread count update
	ns.sendUnreadCountUpdate(notification.UserID, userType)
}

// sendUnreadCountUpdate sends unread count update via WebSocket
func (ns *InAppNotificationService) sendUnreadCountUpdate(userID uint, userType string) {
	if ns.wsService == nil {
		return
	}

	count, err := ns.GetUnreadCount(userID)
	if err != nil {
		logrus.Errorf("Failed to get unread count for user %d: %v", userID, err)
		return
	}

	ns.wsService.SendUnreadCountUpdate(userID, userType, count)
}

// CreateBookingNotification creates a notification for booking events
func (ns *InAppNotificationService) CreateBookingNotification(userID uint, bookingType models.InAppNotificationType, bookingID uint, message string, additionalData map[string]interface{}) error {
	data := map[string]interface{}{
		"booking_id": bookingID,
	}
	
	// Merge additional data
	for k, v := range additionalData {
		data[k] = v
	}

	title := ns.getNotificationTitle(bookingType)
	
	return ns.CreateNotificationForUser(userID, bookingType, title, message, data)
}

// CreatePaymentNotification creates a notification for payment events
func (ns *InAppNotificationService) CreatePaymentNotification(userID uint, paymentType models.InAppNotificationType, paymentID uint, amount float64, message string) error {
	data := map[string]interface{}{
		"payment_id": paymentID,
		"amount":     amount,
	}

	title := ns.getNotificationTitle(paymentType)
	
	return ns.CreateNotificationForUser(userID, paymentType, title, message, data)
}

// CreateWorkerNotification creates a notification for worker events
func (ns *InAppNotificationService) CreateWorkerNotification(userID uint, workerType models.InAppNotificationType, workerID uint, message string, additionalData map[string]interface{}) error {
	data := map[string]interface{}{
		"worker_id": workerID,
	}
	
	// Merge additional data
	for k, v := range additionalData {
		data[k] = v
	}

	title := ns.getNotificationTitle(workerType)
	
	return ns.CreateNotificationForUser(userID, workerType, title, message, data)
}

// getNotificationTitle returns a default title for notification type
func (ns *InAppNotificationService) getNotificationTitle(notificationType models.InAppNotificationType) string {
	switch notificationType {
	case models.InAppNotificationTypeUserRegistered:
		return "New User Registered"
	case models.InAppNotificationTypeBookingCreated:
		return "New Booking Created"
	case models.InAppNotificationTypeWorkerAssigned:
		return "Worker Assigned"
	case models.InAppNotificationTypeWorkerStarted:
		return "Work Started"
	case models.InAppNotificationTypeWorkerCompleted:
		return "Work Completed"
	case models.InAppNotificationTypePaymentReceived:
		return "Payment Received"
	case models.InAppNotificationTypeSubscriptionPurchase:
		return "Subscription Purchased"
	case models.InAppNotificationTypeConversationStarted:
		return "Conversation Started"
	case models.InAppNotificationTypeApplicationAccepted:
		return "Application Accepted"
	case models.InAppNotificationTypeApplicationRejected:
		return "Application Rejected"
	case models.InAppNotificationTypeNewAssignment:
		return "New Assignment"
	case models.InAppNotificationTypePropertyCreated:
		return "Property Created"
	case models.InAppNotificationTypeProjectCreated:
		return "Project Created"
	case models.InAppNotificationTypeServiceAdded:
		return "New Service Added"
	case models.InAppNotificationTypeOTPRequested:
		return "OTP Sent"
	case models.InAppNotificationTypeOTPVerified:
		return "Phone Verified"
	case models.InAppNotificationTypeLoginSuccess:
		return "Login Successful"
	case models.InAppNotificationTypeLoginFailed:
		return "Login Failed"
	default:
		return "Notification"
	}
}
