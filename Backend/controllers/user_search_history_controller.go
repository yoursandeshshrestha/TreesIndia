package controllers

import (
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// UserSearchHistoryController handles user search history HTTP requests
type UserSearchHistoryController struct {
	*BaseController
	searchHistoryService *services.UserSearchHistoryService
}

// NewUserSearchHistoryController creates a new user search history controller
func NewUserSearchHistoryController() *UserSearchHistoryController {
	return &UserSearchHistoryController{
		BaseController:       NewBaseController(),
		searchHistoryService: services.NewUserSearchHistoryService(),
	}
}

// SaveSearchHistory saves or updates a search history entry
// @Summary Save search history
// @Description Save or update a user's location search history
// @Tags search-history
// @Accept json
// @Produce json
// @Param searchHistory body models.SaveSearchHistoryRequest true "Search history details"
// @Success 201 {object} models.SearchHistoryResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /search-history [post]
// @Security BearerAuth
func (ushc *UserSearchHistoryController) SaveSearchHistory(c *gin.Context) {
	userID := ushc.GetUserID(c)
	if userID == 0 {
		ushc.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	var req models.SaveSearchHistoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ushc.BadRequest(c, "Invalid request data", err.Error())
		return
	}

	history, err := ushc.searchHistoryService.SaveSearchHistory(userID, &req)
	if err != nil {
		ushc.InternalServerError(c, "Failed to save search history", err.Error())
		return
	}

	response := models.SearchHistoryResponse{
		ID:               history.ID,
		PlaceID:          history.PlaceID,
		Description:      history.Description,
		FormattedAddress: history.FormattedAddress,
		City:             history.City,
		State:            history.State,
		Country:          history.Country,
		CountryCode:      history.CountryCode,
		Postcode:         history.Postcode,
		Latitude:         history.Latitude,
		Longitude:        history.Longitude,
		AddressLine1:     history.AddressLine1,
		AddressLine2:     history.AddressLine2,
		SearchedAt:       history.SearchedAt,
	}

	ushc.Created(c, "Search history saved successfully", response)
}

// GetRecentSearches gets recent search history for the authenticated user
// @Summary Get recent searches
// @Description Get recent location searches for the authenticated user
// @Tags search-history
// @Produce json
// @Param limit query int false "Maximum number of results" default(10)
// @Success 200 {array} models.SearchHistoryResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /search-history [get]
// @Security BearerAuth
func (ushc *UserSearchHistoryController) GetRecentSearches(c *gin.Context) {
	userID := ushc.GetUserID(c)
	if userID == 0 {
		ushc.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	// Parse limit query parameter
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	histories, err := ushc.searchHistoryService.GetRecentSearches(userID, limit)
	if err != nil {
		ushc.InternalServerError(c, "Failed to get recent searches", err.Error())
		return
	}

	var responses []models.SearchHistoryResponse
	for _, history := range histories {
		response := models.SearchHistoryResponse{
			ID:               history.ID,
			PlaceID:          history.PlaceID,
			Description:      history.Description,
			FormattedAddress: history.FormattedAddress,
			City:             history.City,
			State:            history.State,
			Country:          history.Country,
			CountryCode:      history.CountryCode,
			Postcode:         history.Postcode,
			Latitude:         history.Latitude,
			Longitude:        history.Longitude,
			AddressLine1:     history.AddressLine1,
			AddressLine2:     history.AddressLine2,
			SearchedAt:       history.SearchedAt,
		}
		responses = append(responses, response)
	}

	ushc.Success(c, "Recent searches retrieved successfully", responses)
}

// DeleteSearchHistory deletes a specific search history entry
// @Summary Delete search history
// @Description Delete a specific search history entry
// @Tags search-history
// @Produce json
// @Param id path int true "Search History ID"
// @Success 200 {object} views.SuccessResponse
// @Failure 400 {object} views.ErrorResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 403 {object} views.ErrorResponse
// @Failure 404 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /search-history/{id} [delete]
// @Security BearerAuth
func (ushc *UserSearchHistoryController) DeleteSearchHistory(c *gin.Context) {
	userID := ushc.GetUserID(c)
	if userID == 0 {
		ushc.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ushc.BadRequest(c, "Invalid search history ID", "Invalid search history ID format")
		return
	}

	err = ushc.searchHistoryService.DeleteSearchHistory(uint(id), userID)
	if err != nil {
		if err.Error() == "search history not found" {
			ushc.NotFound(c, "Search history not found", "Search history does not exist")
		} else if err.Error() == "access denied" {
			ushc.Forbidden(c, "Access denied", "Search history does not belong to user")
		} else {
			ushc.InternalServerError(c, "Failed to delete search history", err.Error())
		}
		return
	}

	ushc.Success(c, "Search history deleted successfully", nil)
}

// ClearAllSearchHistory deletes all search history for the authenticated user
// @Summary Clear all search history
// @Description Delete all search history entries for the authenticated user
// @Tags search-history
// @Produce json
// @Success 200 {object} views.SuccessResponse
// @Failure 401 {object} views.ErrorResponse
// @Failure 500 {object} views.ErrorResponse
// @Router /search-history/clear [delete]
// @Security BearerAuth
func (ushc *UserSearchHistoryController) ClearAllSearchHistory(c *gin.Context) {
	userID := ushc.GetUserID(c)
	if userID == 0 {
		ushc.Unauthorized(c, "User not authenticated", "Authentication required")
		return
	}

	err := ushc.searchHistoryService.ClearAllSearchHistory(userID)
	if err != nil {
		ushc.InternalServerError(c, "Failed to clear search history", err.Error())
		return
	}

	ushc.Success(c, "All search history cleared successfully", nil)
}
