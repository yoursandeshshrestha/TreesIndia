package routes

import (
	"treesindia/controllers"

	"github.com/gin-gonic/gin"
)

// SetupAdminProjectRoutes sets up admin project management routes
func SetupAdminProjectRoutes(r *gin.RouterGroup) {
	projectController := controllers.NewProjectController()

	// Admin project management routes
	projects := r.Group("/projects")
	{
		// Create project (admin can create projects for any user)
		projects.POST("", projectController.CreateProject)

		// Get all projects with admin filters
		projects.GET("", projectController.GetProjects)

		// Search projects
		projects.GET("/search", projectController.SearchProjects)

		// Get project statistics
		projects.GET("/stats", projectController.GetProjectStats)

		// Get project by slug
		projects.GET("/slug/:slug", projectController.GetProjectBySlug)

		// Get projects by user ID
		projects.GET("/user/:user_id", projectController.GetUserProjects)

		// Get project by ID
		projects.GET("/:id", projectController.GetProject)

		// Update project (admin can update any project)
		projects.PUT("/:id", projectController.UpdateProject)

		// Delete project (admin can delete any project)
		projects.DELETE("/:id", projectController.DeleteProject)
	}
}
