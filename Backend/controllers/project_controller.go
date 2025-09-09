package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"treesindia/models"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// ProjectController handles project HTTP requests
type ProjectController struct {
	*BaseController
	projectService *services.ProjectService
}

// NewProjectController creates a new project controller
func NewProjectController() *ProjectController {
	// Initialize Cloudinary service
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CloudinaryService: %v", err)
		// Don't panic, create a nil cloudinary service
		cloudinaryService = nil
	} else {
		logrus.Info("CloudinaryService initialized successfully")
	}

	projectService := services.NewProjectService(cloudinaryService)
	
	return &ProjectController{
		BaseController:  NewBaseController(),
		projectService:  projectService,
	}
}

// CreateProject godoc
// @Summary Create a new project
// @Description Create a new project. Users need active subscription to create projects (except admin users).
// @Tags Projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param project body services.CreateProjectRequest true "Project data"
// @Success 201 {object} models.Response{data=models.Project} "Project created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects [post]
func (pc *ProjectController) CreateProject(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var req services.CreateProjectRequest
	
	// Check content type to determine how to parse the request
	contentType := c.GetHeader("Content-Type")
	
	var err error
	if strings.Contains(contentType, "multipart/form-data") {
		// Handle form-data request
		err = pc.parseFormDataProject(c, &req)
	} else {
		// Handle JSON request
		err = c.ShouldBindJSON(&req)
	}
	
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	project, err := pc.projectService.CreateProject(userID, &req)
	if err != nil {
		if err.Error() == "active subscription required to create projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create project", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Project created successfully", project))
}

// GetProject godoc
// @Summary Get project by ID
// @Description Get a project by its ID. Users need active subscription to view projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} models.Response{data=models.Project} "Project retrieved successfully"
// @Failure 400 {object} models.Response "Invalid project ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 404 {object} models.Response "Project not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/{id} [get]
func (pc *ProjectController) GetProject(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	projectIDStr := c.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Invalid project ID", err.Error()))
		return
	}

	project, err := pc.projectService.GetProject(userID, uint(projectID))
	if err != nil {
		if err.Error() == "active subscription required to view projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Project not found", err.Error()))
			return
		}
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Failed to get project", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Project retrieved successfully", project))
}

// GetProjectBySlug godoc
// @Summary Get project by slug
// @Description Get a project by its slug. Users need active subscription to view projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Project slug"
// @Success 200 {object} models.Response{data=models.Project} "Project retrieved successfully"
// @Failure 400 {object} models.Response "Invalid slug"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 404 {object} models.Response "Project not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/slug/{slug} [get]
func (pc *ProjectController) GetProjectBySlug(c *gin.Context) {
	userID := c.GetUint("user_id")
	slug := c.Param("slug")

	if slug == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Invalid slug", "slug parameter is required"))
		return
	}

	project, err := pc.projectService.GetProjectBySlug(userID, slug)
	if err != nil {
		if err.Error() == "active subscription required to view projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Project not found", err.Error()))
			return
		}
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Failed to get project", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Project retrieved successfully", project))
}

// GetProjects godoc
// @Summary Get projects with filters
// @Description Get projects with optional filters. Users need active subscription to view projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param project_type query string false "Filter by project type (residential, commercial, infrastructure)"
// @Param status query string false "Filter by status (starting_soon, on_going, completed, cancelled, on_hold)"
// @Param state query string false "Filter by state"
// @Param city query string false "Filter by city"
// @Param limit query int false "Limit number of results (default: 20)"
// @Param offset query int false "Offset for pagination (default: 0)"
// @Success 200 {object} models.Response{data=[]models.Project} "Projects retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects [get]
func (pc *ProjectController) GetProjects(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	// Parse query parameters
	limit := pc.getIntQuery(c, "limit", 20)
	offset := pc.getIntQuery(c, "offset", 0)
	
	// Build filters
	filters := make(map[string]interface{})
	
	if projectType := c.Query("project_type"); projectType != "" {
		filters["project_type"] = projectType
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if state := c.Query("state"); state != "" {
		filters["state"] = state
	}
	if city := c.Query("city"); city != "" {
		filters["city"] = city
	}

	projects, err := pc.projectService.GetProjects(userID, filters, limit, offset)
	if err != nil {
		if err.Error() == "active subscription required to view projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get projects", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Projects retrieved successfully", projects))
}

// GetUserProjects godoc
// @Summary Get projects by user
// @Description Get projects created by a specific user. Users can only view their own projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param user_id path int true "User ID"
// @Param limit query int false "Limit number of results (default: 20)"
// @Param offset query int false "Offset for pagination (default: 0)"
// @Success 200 {object} models.Response{data=[]models.Project} "User projects retrieved successfully"
// @Failure 400 {object} models.Response "Invalid user ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required or access denied"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/user/{user_id} [get]
func (pc *ProjectController) GetUserProjects(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	targetUserIDStr := c.Param("user_id")
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Invalid user ID", err.Error()))
		return
	}

	limit := pc.getIntQuery(c, "limit", 20)
	offset := pc.getIntQuery(c, "offset", 0)

	projects, err := pc.projectService.GetUserProjects(userID, uint(targetUserID), limit, offset)
	if err != nil {
		if err.Error() == "active subscription required to view projects" || 
		   err.Error() == "can only view your own projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Access denied", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get user projects", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "User projects retrieved successfully", projects))
}

// UpdateProject godoc
// @Summary Update a project
// @Description Update a project. Users can only update their own projects (except admin users).
// @Tags Projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Param project body services.UpdateProjectRequest true "Project update data"
// @Success 200 {object} models.Response{data=models.Project} "Project updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Access denied"
// @Failure 404 {object} models.Response "Project not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/{id} [put]
func (pc *ProjectController) UpdateProject(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	projectIDStr := c.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Invalid project ID", err.Error()))
		return
	}

	var req services.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	project, err := pc.projectService.UpdateProject(userID, uint(projectID), &req)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Project not found", err.Error()))
			return
		}
		if err.Error() == "can only update your own projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Access denied", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update project", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Project updated successfully", project))
}

// DeleteProject godoc
// @Summary Delete a project
// @Description Delete a project. Users can only delete their own projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} models.Response "Project deleted successfully"
// @Failure 400 {object} models.Response "Invalid project ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Access denied"
// @Failure 404 {object} models.Response "Project not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/{id} [delete]
func (pc *ProjectController) DeleteProject(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	projectIDStr := c.Param("id")
	projectID, err := strconv.ParseUint(projectIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Invalid project ID", err.Error()))
		return
	}

	err = pc.projectService.DeleteProject(userID, uint(projectID))
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Project not found", err.Error()))
			return
		}
		if err.Error() == "can only delete your own projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Access denied", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete project", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Project deleted successfully", nil))
}

// SearchProjects godoc
// @Summary Search projects
// @Description Search projects by title and description. Users need active subscription to search projects (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Param q query string true "Search query"
// @Param limit query int false "Limit number of results (default: 20)"
// @Param offset query int false "Offset for pagination (default: 0)"
// @Success 200 {object} models.Response{data=[]models.Project} "Projects found successfully"
// @Failure 400 {object} models.Response "Search query required"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/search [get]
func (pc *ProjectController) SearchProjects(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse( "Search query required", "q parameter is required"))
		return
	}

	limit := pc.getIntQuery(c, "limit", 20)
	offset := pc.getIntQuery(c, "offset", 0)

	projects, err := pc.projectService.SearchProjects(userID, query, limit, offset)
	if err != nil {
		if err.Error() == "active subscription required to search projects" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to search projects", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse( "Projects found successfully", projects))
}

// GetProjectStats godoc
// @Summary Get project statistics
// @Description Get project statistics. Users need active subscription to view statistics (except admin users).
// @Tags Projects
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response{data=map[string]interface{}} "Project statistics retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 403 {object} models.Response "Subscription required"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /projects/stats [get]
func (pc *ProjectController) GetProjectStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	stats, err := pc.projectService.GetProjectStats(userID)
	if err != nil {
		if err.Error() == "active subscription required to view project statistics" {
			c.JSON(http.StatusForbidden, views.CreateErrorResponse("Subscription required", err.Error()))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get project statistics", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Project statistics retrieved successfully", stats))
}

// getIntQuery gets an integer query parameter with a default value
func (pc *ProjectController) getIntQuery(c *gin.Context, key string, defaultValue int) int {
	if value := c.Query(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// parseFormDataProject parses form-data request and populates the project request struct
func (pc *ProjectController) parseFormDataProject(c *gin.Context, req *services.CreateProjectRequest) error {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		return err
	}
	
	form := c.Request.MultipartForm
	
	// Parse basic fields
	req.Title = c.PostForm("title")
	req.Description = c.PostForm("description")
	req.ProjectType = models.ProjectType(c.PostForm("project_type"))
	req.Status = models.ProjectStatus(c.PostForm("status"))
	req.State = c.PostForm("state")
	req.City = c.PostForm("city")
	req.Address = c.PostForm("address")
	req.Pincode = c.PostForm("pincode")
	
	// Parse numeric fields
	if estimatedDurationStr := c.PostForm("estimated_duration_days"); estimatedDurationStr != "" {
		if estimatedDuration, err := strconv.Atoi(estimatedDurationStr); err == nil {
			req.EstimatedDuration = estimatedDuration
		}
	}
	
	// Parse contact_info JSON
	if contactInfoStr := c.PostForm("contact_info"); contactInfoStr != "" {
		var contactInfo models.JSONB
		if err := json.Unmarshal([]byte(contactInfoStr), &contactInfo); err == nil {
			req.ContactInfo = contactInfo
		}
	}
	
	// Handle file uploads
	if form.File != nil && len(form.File["images"]) > 0 {
		logrus.Infof("ProjectController.parseFormDataProject uploading %d images", len(form.File["images"]))
		
		// Upload images to Cloudinary
		imageURLs, err := pc.projectService.UploadProjectImages(form.File["images"])
		if err != nil {
			logrus.Errorf("ProjectController.parseFormDataProject image upload error: %v", err)
			return fmt.Errorf("failed to upload images: %v", err)
		}
		
		req.Images = models.JSONStringArray(imageURLs)
		logrus.Infof("ProjectController.parseFormDataProject successfully uploaded %d images", len(imageURLs))
	} else if imagesStr := c.PostForm("images"); imagesStr != "" {
		// Handle images passed as JSON string
		var imageURLs models.JSONStringArray
		if err := json.Unmarshal([]byte(imagesStr), &imageURLs); err == nil {
			req.Images = imageURLs
		}
	}
	
	return nil
}
