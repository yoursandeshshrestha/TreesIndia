package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupProjectRoutes sets up project routes
func SetupProjectRoutes(r *gin.RouterGroup) {
	projectController := controllers.NewProjectController()

	// Project routes (authentication required)
	projects := r.Group("/projects")
	projects.Use(middleware.AuthMiddleware())
	{
		// Create project
		projects.POST("", projectController.CreateProject)

		// Get projects with filters
		projects.GET("", projectController.GetProjects)

		// Search projects
		projects.GET("/search", projectController.SearchProjects)

		// Get project statistics
		projects.GET("/stats", projectController.GetProjectStats)

		// Get project by slug
		projects.GET("/slug/:slug", projectController.GetProjectBySlug)

		// Get user projects
		projects.GET("/user/:user_id", projectController.GetUserProjects)

		// Get project by ID
		projects.GET("/:id", projectController.GetProject)

		// Update project
		projects.PUT("/:id", projectController.UpdateProject)

		// Delete project
		projects.DELETE("/:id", projectController.DeleteProject)
	}
}
