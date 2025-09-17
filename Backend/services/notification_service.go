package services

import (
	"fmt"
	"treesindia/models"
)

type NotificationService struct {
	inAppNotificationService *InAppNotificationService
}

func NewNotificationService() *NotificationService {
	// Initialize the in-app notification service
	wsService := NewNotificationWebSocketService()
	inAppService := NewInAppNotificationService(wsService)
	
	return &NotificationService{
		inAppNotificationService: inAppService,
	}
}

// SendBookingConfirmation sends booking confirmation notification to user
func (ns *NotificationService) SendBookingConfirmation(booking *models.Booking) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendWorkerAssignmentNotification sends assignment notification to worker
func (ns *NotificationService) SendWorkerAssignmentNotification(assignment *models.WorkerAssignment) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendBufferRequestNotification sends buffer request notification to admin
func (ns *NotificationService) SendBufferRequestNotification(request *models.BufferRequest) error {
	// TODO: Implement actual notification sending
	return nil
}

// SendBufferResponseNotification sends buffer response notification to worker
func (ns *NotificationService) SendBufferResponseNotification(request *models.BufferRequest) error {
	// TODO: Implement actual notification sending
	return nil
}

// SendSubscriptionExpiryWarning sends subscription expiry warning notification
func (ns *NotificationService) SendSubscriptionExpiryWarning(user *models.User, daysLeft int) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendSubscriptionExpiredNotification sends subscription expired notification
func (ns *NotificationService) SendSubscriptionExpiredNotification(user *models.User) error {
	// TODO: Implement actual notification sending
	return nil
}

// SendSubscriptionConfirmationNotification sends subscription confirmation notification
func (ns *NotificationService) SendSubscriptionConfirmationNotification(user *models.User, subscription *models.UserSubscription) error {
	// Create in-app notification for subscription activation
	title := "Subscription Activated! 🎉"
	message := fmt.Sprintf("Your subscription has been successfully activated. You now have access to premium features until %s.", 
		subscription.EndDate.Format("January 2, 2006"))
	
	// Prepare notification data
	data := map[string]interface{}{
		"subscription_id": subscription.ID,
		"plan_id":        subscription.PlanID,
		"start_date":     subscription.StartDate,
		"end_date":       subscription.EndDate,
		"amount":         subscription.Amount,
		"status":         subscription.Status,
	}
	
	// Create the in-app notification
	err := ns.inAppNotificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeSubscriptionPurchase,
		title,
		message,
		data,
	)
	
	if err != nil {
		return fmt.Errorf("failed to create subscription confirmation notification: %w", err)
	}
	
	return nil
}

// SendSubscriptionExtendedNotification sends subscription extension notification
func (ns *NotificationService) SendSubscriptionExtendedNotification(user *models.User, days int) error {
	// TODO: Implement actual notification sending
	return nil
}

// SendWorkerAssignmentAcceptedNotification sends assignment accepted notification
func (ns *NotificationService) SendWorkerAssignmentAcceptedNotification(assignment *models.WorkerAssignment) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendWorkerAssignmentRejectedNotification sends assignment rejected notification
func (ns *NotificationService) SendWorkerAssignmentRejectedNotification(assignment *models.WorkerAssignment) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendWorkerAssignmentStartedNotification sends assignment started notification
func (ns *NotificationService) SendWorkerAssignmentStartedNotification(assignment *models.WorkerAssignment) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}

// SendWorkerAssignmentCompletedNotification sends assignment completed notification
func (ns *NotificationService) SendWorkerAssignmentCompletedNotification(assignment *models.WorkerAssignment) error {
	// TODO: Implement actual notification sending
	// For now, just log the notification
	return nil
}
