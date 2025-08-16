package utils

import (
	"sync"
	"time"
)

// SubscriptionCache provides caching for subscription status
type SubscriptionCache struct {
	cache map[uint]*SubscriptionStatus
	mutex sync.RWMutex
	ttl   time.Duration
}

// SubscriptionStatus represents cached subscription information
type SubscriptionStatus struct {
	UserID              uint
	HasActiveSubscription bool
	ExpiryDate          *time.Time
	LastChecked         time.Time
}

// NewSubscriptionCache creates a new subscription cache
func NewSubscriptionCache() *SubscriptionCache {
	return &SubscriptionCache{
		cache: make(map[uint]*SubscriptionStatus),
		ttl:   5 * time.Minute, // Cache for 5 minutes
	}
}

// Get retrieves subscription status from cache
func (sc *SubscriptionCache) Get(userID uint) (*SubscriptionStatus, bool) {
	sc.mutex.RLock()
	defer sc.mutex.RUnlock()
	
	status, exists := sc.cache[userID]
	if !exists {
		return nil, false
	}
	
	// Check if cache is still valid
	if time.Since(status.LastChecked) > sc.ttl {
		delete(sc.cache, userID)
		return nil, false
	}
	
	return status, true
}

// Set stores subscription status in cache
func (sc *SubscriptionCache) Set(userID uint, status *SubscriptionStatus) {
	sc.mutex.Lock()
	defer sc.mutex.Unlock()
	
	status.LastChecked = time.Now()
	sc.cache[userID] = status
}

// Invalidate removes subscription status from cache
func (sc *SubscriptionCache) Invalidate(userID uint) {
	sc.mutex.Lock()
	defer sc.mutex.Unlock()
	
	delete(sc.cache, userID)
}

// Clear removes all cached data
func (sc *SubscriptionCache) Clear() {
	sc.mutex.Lock()
	defer sc.mutex.Unlock()
	
	sc.cache = make(map[uint]*SubscriptionStatus)
}

// GetStats returns cache statistics
func (sc *SubscriptionCache) GetStats() map[string]interface{} {
	sc.mutex.RLock()
	defer sc.mutex.RUnlock()
	
	return map[string]interface{}{
		"total_entries": len(sc.cache),
		"ttl_minutes":   sc.ttl.Minutes(),
	}
}
