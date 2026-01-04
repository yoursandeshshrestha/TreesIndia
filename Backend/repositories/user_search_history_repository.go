package repositories

import (
	"fmt"
	"time"
	"treesindia/models"
)

// UserSearchHistoryRepository handles user search history database operations
type UserSearchHistoryRepository struct {
	*BaseRepository
}

// NewUserSearchHistoryRepository creates a new user search history repository
func NewUserSearchHistoryRepository() *UserSearchHistoryRepository {
	return &UserSearchHistoryRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateSearchHistory creates a new search history entry
func (ushr *UserSearchHistoryRepository) CreateSearchHistory(history *models.UserSearchHistory) error {
	return ushr.Create(history)
}

// FindByID finds a search history entry by ID
func (ushr *UserSearchHistoryRepository) FindByID(history *models.UserSearchHistory, id uint) error {
	if id == 0 {
		return fmt.Errorf("invalid search history ID")
	}
	return ushr.BaseRepository.FindByID(history, id)
}

// FindByUserID finds all search history entries for a user, ordered by most recent
func (ushr *UserSearchHistoryRepository) FindByUserID(histories *[]models.UserSearchHistory, userID uint, limit int) error {
	query := ushr.db.Where("user_id = ?", userID).Order("searched_at DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	return query.Find(histories).Error
}

// FindByUserIDAndPlaceID finds a search history entry by user ID and place ID
func (ushr *UserSearchHistoryRepository) FindByUserIDAndPlaceID(history *models.UserSearchHistory, userID uint, placeID string) error {
	return ushr.db.Where("user_id = ? AND place_id = ?", userID, placeID).First(history).Error
}

// UpdateSearchHistory updates a search history entry
func (ushr *UserSearchHistoryRepository) UpdateSearchHistory(history *models.UserSearchHistory) error {
	return ushr.Update(history)
}

// UpdateSearchedAt updates the searched_at timestamp for an existing search
func (ushr *UserSearchHistoryRepository) UpdateSearchedAt(id uint) error {
	return ushr.db.Model(&models.UserSearchHistory{}).Where("id = ?", id).Update("searched_at", time.Now()).Error
}

// DeleteSearchHistory deletes a search history entry
func (ushr *UserSearchHistoryRepository) DeleteSearchHistory(history *models.UserSearchHistory) error {
	return ushr.Delete(history)
}

// DeleteByID deletes a search history entry by ID
func (ushr *UserSearchHistoryRepository) DeleteByID(id uint) error {
	return ushr.db.Delete(&models.UserSearchHistory{}, id).Error
}

// DeleteByUserID deletes all search history entries for a user
func (ushr *UserSearchHistoryRepository) DeleteByUserID(userID uint) error {
	return ushr.db.Where("user_id = ?", userID).Delete(&models.UserSearchHistory{}).Error
}

// CountByUserID counts search history entries for a specific user
func (ushr *UserSearchHistoryRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := ushr.db.Model(&models.UserSearchHistory{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// ExistsByPlaceID checks if a search with this place_id exists for a user
func (ushr *UserSearchHistoryRepository) ExistsByPlaceID(userID uint, placeID string) (bool, error) {
	var count int64
	err := ushr.db.Model(&models.UserSearchHistory{}).Where("user_id = ? AND place_id = ?", userID, placeID).Count(&count).Error
	return count > 0, err
}

// DeleteOldestForUser deletes the oldest search history entry for a user
// Useful when enforcing a maximum number of recent searches
func (ushr *UserSearchHistoryRepository) DeleteOldestForUser(userID uint) error {
	var oldest models.UserSearchHistory
	err := ushr.db.Where("user_id = ?", userID).Order("searched_at ASC").First(&oldest).Error
	if err != nil {
		return err
	}
	return ushr.DeleteSearchHistory(&oldest)
}
