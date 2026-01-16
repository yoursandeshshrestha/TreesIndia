package services

import (
	"fmt"
	"strconv"
	"time"

	"treesindia/models"

	"github.com/sirupsen/logrus"
)

// CleanupService handles cleanup tasks
type CleanupService struct {
	bookingService     *BookingService
	paymentService     *PaymentService
	adminConfigService *AdminConfigService
}

// NewCleanupService creates a new cleanup service
func NewCleanupService() *CleanupService {
	return &CleanupService{
		bookingService:     NewBookingService(nil), // No notification service needed for cleanup
		paymentService:     NewPaymentService(),
		adminConfigService: NewAdminConfigService(),
	}
}

// RunCleanupTasks runs all cleanup tasks
func (cs *CleanupService) RunCleanupTasks() error {
	logrus.Info("Starting cleanup tasks...")

	// Clean up expired temporary holds
	if err := cs.bookingService.CleanupExpiredTemporaryHolds(); err != nil {
		logrus.Errorf("Failed to cleanup expired temporary holds: %v", err)
	}

	// Cleanup abandoned wallet payments
	if err := cs.cleanupAbandonedWalletPayments(); err != nil {
		logrus.Errorf("Failed to cleanup abandoned wallet payments: %v", err)
	}

	logrus.Info("Cleanup tasks completed successfully")
	return nil
}

// cleanupAbandonedWalletPayments marks pending wallet payments as expired after timeout
func (cs *CleanupService) cleanupAbandonedWalletPayments() error {
	// Get timeout configuration
	timeoutConfig, err := cs.adminConfigService.repo.GetValueByKey("wallet_payment_timeout_minutes")
	if err != nil {
		logrus.Warnf("Failed to get wallet payment timeout config, using default 30 minutes: %v", err)
		timeoutConfig = "30"
	}

	timeoutMinutes, err := strconv.Atoi(timeoutConfig)
	if err != nil {
		logrus.Warnf("Invalid wallet payment timeout config, using default 30 minutes: %v", err)
		timeoutMinutes = 30
	}

	// Calculate cutoff time
	cutoffTime := time.Now().Add(-time.Duration(timeoutMinutes) * time.Minute)

	// Get abandoned payments
	abandonedPayments, err := cs.paymentService.GetAbandonedWalletPayments(cutoffTime)
	if err != nil {
		return fmt.Errorf("failed to get abandoned payments: %w", err)
	}

	// Mark payments as expired
	for _, payment := range abandonedPayments {
		payment.Status = models.PaymentStatusExpired
		now := time.Now()
		payment.FailedAt = &now
		payment.Notes = fmt.Sprintf("Payment expired after %d minutes", timeoutMinutes)

		if err := cs.paymentService.UpdatePayment(payment); err != nil {
			logrus.Errorf("Failed to mark payment %d as expired: %v", payment.ID, err)
			continue
		}

		logrus.Infof("Marked abandoned wallet payment %d as expired", payment.ID)
	}

	if len(abandonedPayments) > 0 {
		logrus.Infof("Cleaned up %d abandoned wallet payments", len(abandonedPayments))
	}

	return nil
}

// StartPeriodicCleanup starts a periodic cleanup job
func (cs *CleanupService) StartPeriodicCleanup() {
	ticker := time.NewTicker(5 * time.Minute) // Run every 5 minutes
	go func() {
		for range ticker.C {
			if err := cs.RunCleanupTasks(); err != nil {
				logrus.Errorf("Periodic cleanup failed: %v", err)
			}
		}
	}()
	logrus.Info("Periodic cleanup job started")
}
