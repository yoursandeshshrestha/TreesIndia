package services

import (
	"sync"
	"time"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// BatchProcessingService handles batch database operations for better performance
type BatchProcessingService struct {
	db *gorm.DB
}

// NewBatchProcessingService creates a new batch processing service
func NewBatchProcessingService() *BatchProcessingService {
	return &BatchProcessingService{
		db: database.GetDB(),
	}
}

// BatchCreateDocuments creates multiple documents in a single batch operation
func (b *BatchProcessingService) BatchCreateDocuments(userID uint, documents []models.UserDocument) error {
	if len(documents) == 0 {
		return nil
	}

	// Set user ID for all documents
	for i := range documents {
		documents[i].UserID = userID
		documents[i].CreatedAt = time.Now()
		documents[i].UpdatedAt = time.Now()
	}

	// Use batch insert for better performance
	return b.db.CreateInBatches(documents, 100).Error
}

// BatchCreateSkills creates multiple skills in a single batch operation
func (b *BatchProcessingService) BatchCreateSkills(userID uint, skills []models.UserSkill) error {
	if len(skills) == 0 {
		return nil
	}

	// Set user ID for all skills
	for i := range skills {
		skills[i].UserID = userID
		skills[i].CreatedAt = time.Now()
		skills[i].UpdatedAt = time.Now()
	}

	// Use batch insert for better performance
	return b.db.CreateInBatches(skills, 100).Error
}

// BatchUpdateUsers updates multiple users in a single batch operation
func (b *BatchProcessingService) BatchUpdateUsers(updates []map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Use transaction for batch updates
	return b.db.Transaction(func(tx *gorm.DB) error {
		for _, update := range updates {
			userID := update["id"].(uint)
			delete(update, "id") // Remove ID from update fields
			
			err := tx.Model(&models.User{}).
				Where("id = ?", userID).
				Updates(update).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
}

// ParallelBatchProcessor handles multiple batch operations in parallel
type ParallelBatchProcessor struct {
	batchService *BatchProcessingService
}

// NewParallelBatchProcessor creates a new parallel batch processor
func NewParallelBatchProcessor() *ParallelBatchProcessor {
	return &ParallelBatchProcessor{
		batchService: NewBatchProcessingService(),
	}
}

// ProcessApplicationData processes all application data in parallel
func (p *ParallelBatchProcessor) ProcessApplicationData(userID uint, documents []models.UserDocument, skills []models.UserSkill) error {
	var wg sync.WaitGroup
	errors := make(chan error, 2)

	// Process documents in parallel
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := p.batchService.BatchCreateDocuments(userID, documents); err != nil {
			errors <- err
		}
	}()

	// Process skills in parallel
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := p.batchService.BatchCreateSkills(userID, skills); err != nil {
			errors <- err
		}
	}()

	// Wait for all operations to complete
	wg.Wait()
	close(errors)

	// Check for any errors
	for err := range errors {
		if err != nil {
			logrus.Errorf("Batch processing error: %v", err)
			return err
		}
	}

	return nil
}

// CacheService provides caching for frequently accessed data
type CacheService struct {
	cache map[string]interface{}
	mu    sync.RWMutex
}

// NewCacheService creates a new cache service
func NewCacheService() *CacheService {
	return &CacheService{
		cache: make(map[string]interface{}),
	}
}

// Get retrieves a value from cache
func (c *CacheService) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	value, exists := c.cache[key]
	return value, exists
}

// Set stores a value in cache
func (c *CacheService) Set(key string, value interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.cache[key] = value
}

// Delete removes a value from cache
func (c *CacheService) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.cache, key)
}

// Clear removes all values from cache
func (c *CacheService) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.cache = make(map[string]interface{})
}
