package services

import (
	"fmt"
	"time"
	"treesindia/models"

	"github.com/sirupsen/logrus"
)

type PaymentSegmentReminderService struct {
	enhancedNotificationService *EnhancedNotificationService
	stopChan                    chan bool
}

func NewPaymentSegmentReminderService(enhancedNotificationService *EnhancedNotificationService) *PaymentSegmentReminderService {
	return &PaymentSegmentReminderService{
		enhancedNotificationService: enhancedNotificationService,
		stopChan:                    make(chan bool),
	}
}

// Start begins the periodic payment segment reminder check
func (ps *PaymentSegmentReminderService) Start() {
	logrus.Info("PaymentSegmentReminderService starting...")

	// Run immediately on start
	go ps.checkAndSendReminders()

	// Then run every 12 hours
	ticker := time.NewTicker(12 * time.Hour)
	go func() {
		for {
			select {
			case <-ticker.C:
				ps.checkAndSendReminders()
			case <-ps.stopChan:
				ticker.Stop()
				logrus.Info("PaymentSegmentReminderService stopped")
				return
			}
		}
	}()

	logrus.Info("PaymentSegmentReminderService started successfully")
}

// Stop stops the reminder service
func (ps *PaymentSegmentReminderService) Stop() {
	logrus.Info("Stopping PaymentSegmentReminderService...")
	ps.stopChan <- true
}

// checkAndSendReminders checks for upcoming due dates and sends reminders
// NOTE: Due dates have been removed from payment segments. This functionality is now disabled.
func (ps *PaymentSegmentReminderService) checkAndSendReminders() {
	logrus.Info("PaymentSegmentReminderService: Due date functionality has been removed - skipping reminder checks")
	// Due dates are no longer used in the system, so this service does nothing
	return
}

// sendSegmentDueReminder sends a notification reminder for an upcoming payment segment
func (ps *PaymentSegmentReminderService) sendSegmentDueReminder(segment *models.PaymentSegment, daysUntilDue int) {
	// This runs in a goroutine, so it doesn't block the checking process
	go func() {
		// Skip if notification service is not available
		if ps.enhancedNotificationService == nil {
			logrus.Warn("Notification service not available, skipping segment due reminder")
			return
		}

		var title, body string

		if daysUntilDue == 0 {
			title = "Payment Due Today!"
			body = fmt.Sprintf("Your payment segment #%d of ₹%.2f for booking #%d is due today. Please make the payment to avoid any issues.",
				segment.SegmentNumber, segment.Amount, segment.BookingID)
		} else if daysUntilDue == 1 {
			title = "Payment Due Tomorrow!"
			body = fmt.Sprintf("Your payment segment #%d of ₹%.2f for booking #%d is due tomorrow. Please make the payment soon.",
				segment.SegmentNumber, segment.Amount, segment.BookingID)
		} else {
			title = "Payment Due Soon!"
			body = fmt.Sprintf("Your payment segment #%d of ₹%.2f for booking #%d is due in %d days. Please plan your payment accordingly.",
				segment.SegmentNumber, segment.Amount, segment.BookingID, daysUntilDue)
		}

		notificationReq := &NotificationRequest{
			UserID:   segment.Booking.UserID,
			Type:     models.NotificationTypePayment,
			Title:    title,
			Body:     body,
			Data: map[string]string{
				"type":          "payment_segment_due",
				"bookingId":     fmt.Sprintf("%d", segment.BookingID),
				"segmentId":     fmt.Sprintf("%d", segment.ID),
				"segmentNumber": fmt.Sprintf("%d", segment.SegmentNumber),
				"amount":        fmt.Sprintf("%.2f", segment.Amount),
				"daysUntilDue":  fmt.Sprintf("%d", daysUntilDue),
			},
			Priority: "high",
		}

		_, err := ps.enhancedNotificationService.SendNotification(notificationReq)
		if err != nil {
			logrus.Errorf("Failed to send due reminder notification for segment %d: %v", segment.ID, err)
		} else {
			logrus.Infof("Sent due reminder notification for segment %d (booking %d) to user %d - %d days until due",
				segment.ID, segment.BookingID, segment.Booking.UserID, daysUntilDue)
		}
	}()
}
