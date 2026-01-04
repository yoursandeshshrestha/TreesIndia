package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupUserSearchHistoryRoutes sets up user search history routes
func SetupUserSearchHistoryRoutes(router *gin.RouterGroup) {
	searchHistoryController := controllers.NewUserSearchHistoryController()

	// Search history routes (authentication required)
	searchHistory := router.Group("/search-history")
	searchHistory.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/search-history - Save a search history entry
		searchHistory.POST("", searchHistoryController.SaveSearchHistory)

		// GET /api/v1/search-history - Get recent searches
		searchHistory.GET("", searchHistoryController.GetRecentSearches)

		// DELETE /api/v1/search-history/clear - Clear all search history
		searchHistory.DELETE("/clear", searchHistoryController.ClearAllSearchHistory)

		// DELETE /api/v1/search-history/{id} - Delete a specific search history entry
		searchHistory.DELETE("/:id", searchHistoryController.DeleteSearchHistory)
	}
}
