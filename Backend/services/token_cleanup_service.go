package services

import (
	"time"
)

// TokenCleanupService handles periodic cleanup of invalid FCM tokens
type TokenCleanupService struct {
	deviceService *DeviceManagementService
	interval      time.Duration
	stopChan      chan bool
}

// NewTokenCleanupService creates a new token cleanup service
func NewTokenCleanupService(deviceService *DeviceManagementService) *TokenCleanupService {
	return &TokenCleanupService{
		deviceService: deviceService,
		interval:      24 * time.Hour, // Run once per day
		stopChan:      make(chan bool),
	}
}

// Start starts the token cleanup service
func (t *TokenCleanupService) Start() {
	go t.run()
}

// Stop stops the token cleanup service
func (t *TokenCleanupService) Stop() {
	t.stopChan <- true
}

// run runs the main cleanup loop
func (t *TokenCleanupService) run() {
	ticker := time.NewTicker(t.interval)
	defer ticker.Stop()

	// Run cleanup immediately on start
	t.cleanup()

	for {
		select {
		case <-ticker.C:
			t.cleanup()
		case <-t.stopChan:
			return
		}
	}
}

// cleanup performs the actual token cleanup
func (t *TokenCleanupService) cleanup() {
	if err := t.deviceService.ValidateAndCleanupTokens(); err != nil {
		return
	}
}

// SetInterval sets the cleanup interval
func (t *TokenCleanupService) SetInterval(interval time.Duration) {
	t.interval = interval
}

// GetStats returns cleanup service statistics
func (t *TokenCleanupService) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"interval": t.interval.String(),
		"running":  true,
	}
}
