package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"treesindia/database"
	"treesindia/models"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminController handles admin operations
type AdminController struct {
	*BaseController
	db *gorm.DB
}

// NewAdminController creates a new admin controller
func NewAdminController() *AdminController {
	return &AdminController{
		BaseController: NewBaseController(),
		db:             database.GetDB(),
	}
}

// AdminSeed represents admin user seed data
type AdminSeed struct {
	Email     string `json:"email" binding:"required,email"`
	Name      string `json:"name" binding:"required"`
	Role      string `json:"role" binding:"required,oneof=super_admin admin moderator"`
	IsActive  bool   `json:"is_active"`
}

// SeedAdminUsers godoc
// @Summary Seed admin users
// @Description Create default admin users in the database
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 201 {object} models.Response "Admin users seeded successfully"
// @Failure 409 {object} models.Response "Admin users already exist"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/seed [post]
func (ac *AdminController) SeedAdminUsers(c *gin.Context) {
	// Check if admin user already exists
	var adminCount int64
	ac.db.Model(&models.User{}).Where("phone = ?", "+918597831351").Count(&adminCount)
	
	if adminCount > 0 {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("Admin user already exists", "Admin user has already been seeded"))
		return
	}

	// Create admin user
	adminEmail := "admin@treesindia.com"
	adminUser := models.User{
		Name:        "Admin",
		Email:       &adminEmail,
		Phone:       "+918597831351",
		UserType:    models.UserTypeAdmin,
		IsActive:    true,
	}

	if err := ac.db.Create(&adminUser).Error; err != nil {
		// Check if it's a duplicate key error (race condition)
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Admin user already exists", "Admin user has already been seeded"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create admin user", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Admin user seeded successfully", gin.H{
		"message": "Admin user created successfully",
		"user":    adminUser,
	}))
}





// GetAllUsers godoc
// @Summary Get all users
// @Description Get all users with pagination and advanced filtering support
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
	// @Param user_type query string false "Filter by user type (normal, worker, broker, admin)"
// @Param is_active query string false "Filter by active status (true, false)"
// @Param role_application_status query string false "Filter by role application status (none, pending, approved, rejected)"
// @Param has_active_subscription query string false "Filter by subscription status (true, false)"
// @Param search query string false "Search by name, email, or phone"
// @Param date_from query string false "Filter by registration date from (YYYY-MM-DD)"
// @Param date_to query string false "Filter by registration date to (YYYY-MM-DD)"
// @Success 200 {object} models.Response "Users retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users [get]
func (ac *AdminController) GetAllUsers(c *gin.Context) {
	page := 1
	limit := 10

	// Parse query parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	offset := (page - 1) * limit

	var users []models.User
	var total int64

	// Get total count
	ac.db.Model(&models.User{}).Count(&total)

	// Build query with filters
	query := ac.db.Model(&models.User{})
	
	// Apply filters
	if userType := c.Query("user_type"); userType != "" {
		query = query.Where("user_type = ?", userType)
	}
	
	if isActive := c.Query("is_active"); isActive != "" {
		if isActive == "true" {
			query = query.Where("is_active = ?", true)
		} else if isActive == "false" {
			query = query.Where("is_active = ?", false)
		}
	}
	
	if roleStatus := c.Query("role_application_status"); roleStatus != "" {
		query = query.Where("role_application_status = ?", roleStatus)
	}
	
	if hasSubscription := c.Query("has_active_subscription"); hasSubscription != "" {
		if hasSubscription == "true" {
			query = query.Where("has_active_subscription = ?", true)
		} else if hasSubscription == "false" {
			query = query.Where("has_active_subscription = ?", false)
		}
	}
	
	if search := c.Query("search"); search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", searchTerm, searchTerm, searchTerm)
	}
	
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		query = query.Where("created_at >= ?", dateFrom)
	}
	
	if dateTo := c.Query("date_to"); dateTo != "" {
		query = query.Where("created_at <= ?", dateTo)
	}

	// Get total count with filters
	query.Count(&total)

	// Get users with pagination and filters
	if err := query.Preload("UserNotificationSettings").Preload("Subscription").Preload("Worker").Preload("Broker").Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch users", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Users retrieved successfully", gin.H{
		"users": users,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
			"has_next":    int64(page*limit) < total,
			"has_prev":    page > 1,
		},
	}))
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get detailed information about a specific user
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} models.Response "User retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users/{id} [get]
func (ac *AdminController) GetUserByID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid user ID", "User ID must be a valid number"))
		return
	}

	var user models.User
	if err := ac.db.Preload("UserNotificationSettings").Preload("Subscription").Preload("Worker").Preload("Broker").First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User retrieved successfully", gin.H{
		"user": user,
	}))
}

// SearchUsers godoc
// @Summary Search users
// @Description Search users by name, email, or phone (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param q query string true "Search query"
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} models.Response "Search results retrieved successfully"
// @Failure 400 {object} models.Response "Invalid search query"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users/search [get]
func (ac *AdminController) SearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid search query", "Search query is required"))
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 50 {
		limit = 10
	}

	searchTerm := "%" + query + "%"
	var users []models.User

	if err := ac.db.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", searchTerm, searchTerm, searchTerm).
		Limit(limit).
		Order("created_at DESC").
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Search results retrieved successfully", gin.H{
		"users": users,
		"query": query,
		"limit": limit,
	}))
}

// AdminUpdateUserRequest represents the request for admin updating user
type AdminUpdateUserRequest struct {
	Name                   string     `json:"name" binding:"required,min=2,max=100"`
	Email                  *string    `json:"email" binding:"omitempty,email"`
	Phone                  string     `json:"phone" binding:"required"`
	UserType               string     `json:"user_type" binding:"required,oneof=normal worker broker admin"`
	Gender                 string     `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
	IsActive               bool       `json:"is_active"`
	RoleApplicationStatus  string     `json:"role_application_status" binding:"omitempty,oneof=none pending approved rejected"`
	WalletBalance          float64    `json:"wallet_balance"`

	HasActiveSubscription  bool       `json:"has_active_subscription"`
}

// UpdateUserByID godoc
// @Summary Update user by ID
// @Description Update user information (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param user body AdminUpdateUserRequest true "User update data"
// @Success 200 {object} models.Response "User updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users/{id} [put]
func (ac *AdminController) UpdateUserByID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid user ID", "User ID must be a valid number"))
		return
	}

	var req AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	var user models.User
	if err := ac.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Check if email is already taken by another user
	if req.Email != nil && *req.Email != "" {
		var existingUser models.User
		if err := ac.db.Where("email = ? AND id != ?", *req.Email, userID).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Email already exists", "This email is already registered by another user"))
			return
		}
	}

	// Check if phone is already taken by another user
	var existingUser models.User
	if err := ac.db.Where("phone = ? AND id != ?", req.Phone, userID).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, views.CreateErrorResponse("Phone already exists", "This phone number is already registered by another user"))
		return
	}

	// Update user fields
	user.Name = req.Name
	user.Email = req.Email
	user.Phone = req.Phone
	user.UserType = models.UserType(req.UserType)
	user.Gender = req.Gender
	user.IsActive = req.IsActive
	user.RoleApplicationStatus = req.RoleApplicationStatus
	user.WalletBalance = req.WalletBalance

	user.HasActiveSubscription = req.HasActiveSubscription

	if err := ac.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User updated successfully", gin.H{
		"user": user,
	}))
}

// DeleteUserByID godoc
// @Summary Delete user by ID
// @Description Permanently delete a user (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} models.Response "User deleted successfully"
// @Failure 400 {object} models.Response "Invalid user ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users/{id} [delete]
func (ac *AdminController) DeleteUserByID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid user ID", "User ID must be a valid number"))
		return
	}

	var user models.User
	if err := ac.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Prevent admin from deleting themselves
	adminID := c.GetUint("user_id")
	if uint(userID) == adminID {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Cannot delete yourself", "You cannot delete your own account"))
		return
	}

	// Hard delete the user
	if err := ac.db.Unscoped().Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User deleted successfully", gin.H{
		"message": "User has been permanently deleted",
	}))
}

// ToggleUserActivation godoc
// @Summary Toggle user activation status
// @Description Activate or deactivate a user (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} models.Response "User activation status updated successfully"
// @Failure 400 {object} models.Response "Invalid user ID"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "User not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users/{id}/activate [post]
func (ac *AdminController) ToggleUserActivation(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid user ID", "User ID must be a valid number"))
		return
	}

	var user models.User
	if err := ac.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Prevent admin from deactivating themselves
	adminID := c.GetUint("user_id")
	if uint(userID) == adminID {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Cannot deactivate yourself", "You cannot deactivate your own account"))
		return
	}

	// Toggle activation status
	user.IsActive = !user.IsActive

	if err := ac.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update user activation status", err.Error()))
		return
	}

	status := "activated"
	if !user.IsActive {
		status = "deactivated"
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User activation status updated successfully", gin.H{
		"user": user,
		"message": "User has been " + status,
	}))
}

// ToggleWorkerType toggles worker type between normal and treesindia_worker
// @Summary Toggle worker type (admin)
// @Description Toggle worker type between normal and treesindia_worker
// @Tags Admin Management
// @Accept json
// @Produce json
// @Param worker_id path int true "Worker ID"
// @Param worker_type body map[string]string true "Worker type (normal or treesindia_worker)"
// @Success 200 {object} views.Response{data=models.Worker}
// @Failure 400 {object} views.Response
// @Failure 401 {object} views.Response
// @Failure 404 {object} views.Response
// @Router /admin/workers/{worker_id}/toggle-worker-type [put]
func (ac *AdminController) ToggleWorkerType(c *gin.Context) {
	// Get worker ID from path
	workerID, err := strconv.ParseUint(c.Param("worker_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid worker ID", "Worker ID must be a valid number"))
		return
	}

	// Parse request body
	var req map[string]string
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request", err.Error()))
		return
	}

	workerType, exists := req["worker_type"]
	if !exists {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Missing worker_type", "Worker type field is required"))
		return
	}

	if workerType != "normal" && workerType != "treesindia_worker" {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid worker type", "Worker type must be 'normal' or 'treesindia_worker'"))
		return
	}

	// Find the worker
	var worker models.Worker
	if err := ac.db.First(&worker, workerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("Worker not found", "Worker does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Toggle worker type
	worker.WorkerType = models.WorkerType(workerType)

	if err := ac.db.Save(&worker).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to toggle worker type", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Worker type toggled successfully", worker))
}
