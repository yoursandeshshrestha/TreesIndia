package services

import (
	"fmt"
	"time"
	"treesindia/models"
	"treesindia/repositories"
)

const MaxRecentSearches = 10 // Maximum number of recent searches to keep per user

// UserSearchHistoryService handles user search history business logic
type UserSearchHistoryService struct {
	searchHistoryRepo *repositories.UserSearchHistoryRepository
	userRepo          *repositories.UserRepository
}

// NewUserSearchHistoryService creates a new user search history service
func NewUserSearchHistoryService() *UserSearchHistoryService {
	return &UserSearchHistoryService{
		searchHistoryRepo: repositories.NewUserSearchHistoryRepository(),
		userRepo:          repositories.NewUserRepository(),
	}
}

// SaveSearchHistory saves or updates a search history entry
// If the same place_id exists for the user, it updates the searched_at timestamp
// Otherwise, it creates a new entry and ensures the limit is maintained
func (ushs *UserSearchHistoryService) SaveSearchHistory(userID uint, req *models.SaveSearchHistoryRequest) (*models.UserSearchHistory, error) {
	// Check if user exists
	var user models.User
	if err := ushs.userRepo.FindByID(&user, userID); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if this place_id already exists for the user
	var existingHistory models.UserSearchHistory
	err := ushs.searchHistoryRepo.FindByUserIDAndPlaceID(&existingHistory, userID, req.PlaceID)

	if err == nil {
		// Entry exists, just update the searched_at timestamp
		existingHistory.SearchedAt = time.Now()
		existingHistory.Description = req.Description // Update description in case it changed
		existingHistory.FormattedAddress = req.FormattedAddress
		existingHistory.City = req.City
		existingHistory.State = req.State
		existingHistory.Country = req.Country
		existingHistory.CountryCode = req.CountryCode
		existingHistory.Postcode = req.Postcode
		existingHistory.Latitude = req.Latitude
		existingHistory.Longitude = req.Longitude
		existingHistory.AddressLine1 = req.AddressLine1
		existingHistory.AddressLine2 = req.AddressLine2

		if err := ushs.searchHistoryRepo.UpdateSearchHistory(&existingHistory); err != nil {
			return nil, fmt.Errorf("failed to update search history: %w", err)
		}
		return &existingHistory, nil
	}

	// New entry - check if we need to delete the oldest entry
	count, err := ushs.searchHistoryRepo.CountByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count search history: %w", err)
	}

	// If we've reached the limit, delete the oldest entry
	if count >= MaxRecentSearches {
		if err := ushs.searchHistoryRepo.DeleteOldestForUser(userID); err != nil {
			return nil, fmt.Errorf("failed to delete oldest search history: %w", err)
		}
	}

	// Create new search history entry
	searchHistory := &models.UserSearchHistory{
		UserID:           userID,
		PlaceID:          req.PlaceID,
		Description:      req.Description,
		FormattedAddress: req.FormattedAddress,
		City:             req.City,
		State:            req.State,
		Country:          req.Country,
		CountryCode:      req.CountryCode,
		Postcode:         req.Postcode,
		Latitude:         req.Latitude,
		Longitude:         req.Longitude,
		AddressLine1:     req.AddressLine1,
		AddressLine2:     req.AddressLine2,
		SearchedAt:       time.Now(),
	}

	if err := ushs.searchHistoryRepo.CreateSearchHistory(searchHistory); err != nil {
		return nil, fmt.Errorf("failed to create search history: %w", err)
	}

	return searchHistory, nil
}

// GetRecentSearches gets recent search history for a user
func (ushs *UserSearchHistoryService) GetRecentSearches(userID uint, limit int) ([]models.UserSearchHistory, error) {
	if limit <= 0 || limit > MaxRecentSearches {
		limit = MaxRecentSearches
	}

	var histories []models.UserSearchHistory
	if err := ushs.searchHistoryRepo.FindByUserID(&histories, userID, limit); err != nil {
		return nil, fmt.Errorf("failed to get search history: %w", err)
	}

	return histories, nil
}

// DeleteSearchHistory deletes a specific search history entry
func (ushs *UserSearchHistoryService) DeleteSearchHistory(id uint, userID uint) error {
	var history models.UserSearchHistory
	if err := ushs.searchHistoryRepo.FindByID(&history, id); err != nil {
		return fmt.Errorf("search history not found")
	}

	// Verify the search history belongs to the user
	if history.UserID != userID {
		return fmt.Errorf("access denied")
	}

	if err := ushs.searchHistoryRepo.DeleteSearchHistory(&history); err != nil {
		return fmt.Errorf("failed to delete search history: %w", err)
	}

	return nil
}

// ClearAllSearchHistory deletes all search history for a user
func (ushs *UserSearchHistoryService) ClearAllSearchHistory(userID uint) error {
	if err := ushs.searchHistoryRepo.DeleteByUserID(userID); err != nil {
		return fmt.Errorf("failed to clear search history: %w", err)
	}
	return nil
}
