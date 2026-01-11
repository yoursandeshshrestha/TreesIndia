package services

import (
	"time"
	"treesindia/repositories"
)

// SubscriptionWarningService handles subscription warning notifications
type SubscriptionWarningService struct {
	subscriptionRepo    *repositories.UserSubscriptionRepository
	notificationService *NotificationService
}

// NewSubscriptionWarningService creates a new subscription warning service
func NewSubscriptionWarningService() *SubscriptionWarningService {
	return &SubscriptionWarningService{
		subscriptionRepo:    repositories.NewUserSubscriptionRepository(),
		notificationService: NewNotificationService(),
	}
}

// CheckAndSendExpiryWarnings checks for expiring subscriptions and sends warnings
func (sws *SubscriptionWarningService) CheckAndSendExpiryWarnings() error {
	// Check subscriptions expiring in 7 days
	sevenDaysFromNow := time.Now().AddDate(0, 0, 7)
	subscriptions7Days, err := sws.subscriptionRepo.GetExpiringSubscriptions(sevenDaysFromNow)
	if err != nil {
		return err
	}

	for _, subscription := range subscriptions7Days {
		// Check if we already sent a warning for this user
		if !sws.hasWarningBeenSent(subscription.UserID, 7) {
		sws.markWarningAsSent(subscription.UserID, 7)
		}
	}

	// Check subscriptions expiring in 1 day
	oneDayFromNow := time.Now().AddDate(0, 0, 1)
	subscriptions1Day, err := sws.subscriptionRepo.GetExpiringSubscriptions(oneDayFromNow)
	if err != nil {
		return err
	}

	for _, subscription := range subscriptions1Day {
		if !sws.hasWarningBeenSent(subscription.UserID, 1) {
			sws.markWarningAsSent(subscription.UserID, 1)
		}
	}

	return nil
}

// hasWarningBeenSent checks if a warning was already sent for a user
func (sws *SubscriptionWarningService) hasWarningBeenSent(userID uint, daysLeft int) bool {
	// TODO: Implement with database check
	// For now, return false to always send warnings
	_, _ = userID, daysLeft // Suppress unused parameter warnings
	return false
}

// markWarningAsSent marks a warning as sent for a user
func (sws *SubscriptionWarningService) markWarningAsSent(userID uint, daysLeft int) {
	// TODO: Implement with database storage
	// For now, just log the action
	_, _ = userID, daysLeft // Suppress unused parameter warnings
}

// StartWarningJob starts the background warning job
func (sws *SubscriptionWarningService) StartWarningJob() {
	ticker := time.NewTicker(24 * time.Hour) // Run daily
	go func() {
		for range ticker.C {
			if err := sws.CheckAndSendExpiryWarnings(); err != nil {
				// Handle error silently
			}
		}
	}()
}
