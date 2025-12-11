package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
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

// AdminCreateUserRequest represents the request for creating a user from admin panel
type AdminCreateUserRequest struct {
	Name                  string                    `json:"name" binding:"required,min=2,max=100"`
	Email                 *string                   `json:"email" binding:"omitempty,email"`
	Phone                 string                    `json:"phone" binding:"required"`
	UserType              string                    `json:"user_type" binding:"required,oneof=normal worker broker admin"`
	Gender                string                    `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
	IsActive              bool                      `json:"is_active"`
	WalletBalance         float64                   `json:"wallet_balance"`
	HasActiveSubscription bool                      `json:"has_active_subscription"`
	AdminRoles            []string                  `json:"admin_roles"` // only used when user_type=admin, slice of role codes
}

// CreateUser godoc
// @Summary Create user
// @Description Create a new user from admin panel (optionally as admin with roles)
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user body AdminCreateUserRequest true "User data"
// @Success 201 {object} models.Response "User created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 409 {object} models.Response "User already exists"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/users [post]
func (ac *AdminController) CreateUser(c *gin.Context) {
	var req AdminCreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Check if email already exists (if provided)
	if req.Email != nil && *req.Email != "" {
		var existingUser models.User
		if err := ac.db.Where("email = ?", *req.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Email already exists", "This email is already registered by another user"))
			return
		}
	}

	// Check if phone already exists
	{
		var existingUser models.User
		if err := ac.db.Where("phone = ?", req.Phone).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, views.CreateErrorResponse("Phone already exists", "This phone number is already registered by another user"))
			return
		}
	}

	// Create user
	user := models.User{
		Name:                 req.Name,
		Email:                req.Email,
		Phone:                req.Phone,
		UserType:             models.UserType(req.UserType),
		Gender:               req.Gender,
		IsActive:             req.IsActive,
		WalletBalance:        req.WalletBalance,
		HasActiveSubscription: req.HasActiveSubscription,
	}

	if err := ac.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create user", err.Error()))
		return
	}

	// Attach admin roles if user is admin and roles provided
	if user.UserType == models.UserTypeAdmin && len(req.AdminRoles) > 0 {
		var roles []models.AdminRole
		if err := ac.db.Where("code IN ?", req.AdminRoles).Find(&roles).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch admin roles", err.Error()))
			return
		}

		if len(roles) > 0 {
			if err := ac.db.Model(&user).Association("AdminRoles").Append(&roles); err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to assign admin roles", err.Error()))
				return
			}
		}
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("User created successfully", gin.H{
		"user": user,
	}))
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
	hasWorkerJoin := false
	
	// Apply filters
	if userType := c.Query("user_type"); userType != "" {
		query = query.Where("users.user_type = ?", userType)
		
		// If querying for workers and availability parameters are present (for booking assignment),
		// filter to only show Trees India workers
		if userType == "worker" {
			scheduledTime := c.Query("scheduled_time")
			serviceDuration := c.Query("service_duration")
			serviceID := c.Query("service_id")
			
			// If any availability parameter is present, filter for Trees India workers only
			if scheduledTime != "" || serviceDuration != "" || serviceID != "" {
				query = query.Joins("JOIN workers ON users.id = workers.user_id").
					Where("workers.worker_type = ?", models.WorkerTypeTreesIndia)
				hasWorkerJoin = true
			}
		}
	}
	
	if isActive := c.Query("is_active"); isActive != "" {
		if isActive == "true" {
			// Qualify column name to avoid ambiguity when workers table is joined
			if hasWorkerJoin {
				query = query.Where("users.is_active = ?", true)
			} else {
				query = query.Where("is_active = ?", true)
			}
		} else if isActive == "false" {
			if hasWorkerJoin {
				query = query.Where("users.is_active = ?", false)
			} else {
				query = query.Where("is_active = ?", false)
			}
		}
	}
	
	if roleStatus := c.Query("role_application_status"); roleStatus != "" {
		// Qualify column name to avoid ambiguity when workers table is joined
		if hasWorkerJoin {
			query = query.Where("users.role_application_status = ?", roleStatus)
		} else {
			query = query.Where("role_application_status = ?", roleStatus)
		}
	}
	
	if hasSubscription := c.Query("has_active_subscription"); hasSubscription != "" {
		// Qualify column name to avoid ambiguity when workers table is joined
		if hasSubscription == "true" {
			if hasWorkerJoin {
				query = query.Where("users.has_active_subscription = ?", true)
			} else {
				query = query.Where("has_active_subscription = ?", true)
			}
		} else if hasSubscription == "false" {
			if hasWorkerJoin {
				query = query.Where("users.has_active_subscription = ?", false)
			} else {
				query = query.Where("has_active_subscription = ?", false)
			}
		}
	}
	
	if search := c.Query("search"); search != "" {
		searchTerm := "%" + search + "%"
		// Qualify column names to avoid ambiguity when workers table is joined
		if hasWorkerJoin {
			query = query.Where("users.name ILIKE ? OR users.email ILIKE ? OR users.phone ILIKE ?", searchTerm, searchTerm, searchTerm)
		} else {
			query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", searchTerm, searchTerm, searchTerm)
		}
	}
	
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		if hasWorkerJoin {
			query = query.Where("users.created_at >= ?", dateFrom)
		} else {
			query = query.Where("created_at >= ?", dateFrom)
		}
	}
	
	if dateTo := c.Query("date_to"); dateTo != "" {
		if hasWorkerJoin {
			query = query.Where("users.created_at <= ?", dateTo)
		} else {
			query = query.Where("created_at <= ?", dateTo)
		}
	}

	// Get total count with filters
	// When workers table is joined, count distinct user IDs
	var countResult struct {
		Count int64
	}
	if hasWorkerJoin {
		// Use subquery to count distinct users when joined
		err := query.Select("COUNT(DISTINCT users.id) as count").Scan(&countResult).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to count users", err.Error()))
			return
		}
		total = countResult.Count
	} else {
		query.Count(&total)
	}

	// Get users with pagination and filters
	// When workers table is joined, use subquery to get distinct user IDs first
	if hasWorkerJoin {
		// First, get distinct user IDs with created_at for ordering
		// Must include created_at in SELECT when using DISTINCT with ORDER BY
		type UserIDWithDate struct {
			ID        uint
			CreatedAt time.Time
		}
		var userData []UserIDWithDate
		subQuery := query.Select("DISTINCT users.id, users.created_at").Order("users.created_at DESC").Offset(offset).Limit(limit)
		if err := subQuery.Scan(&userData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch users", err.Error()))
			return
		}
		
		// Extract user IDs
		userIDs := make([]uint, len(userData))
		for i, ud := range userData {
			userIDs[i] = ud.ID
		}
		
		// Then fetch full user data for those IDs, maintaining the order
		if len(userIDs) > 0 {
			if err := ac.db.Where("id IN ?", userIDs).
				Preload("UserNotificationSettings").Preload("Subscription").Preload("Worker").Preload("Broker").
				Find(&users).Error; err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch users", err.Error()))
				return
			}
			
			// Reorder users to match the subquery order (by created_at DESC)
			orderedUsers := make([]models.User, 0, len(userIDs))
			for _, ud := range userData {
				for i := range users {
					if users[i].ID == ud.ID {
						orderedUsers = append(orderedUsers, users[i])
						break
					}
				}
			}
			users = orderedUsers
		}
	} else {
		if err := query.Preload("UserNotificationSettings").Preload("Subscription").Preload("Worker").Preload("Broker").Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to fetch users", err.Error()))
			return
		}
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

// safeDelete safely deletes records, handling cases where the table doesn't exist
// It uses savepoints to handle errors gracefully without aborting the entire transaction
func (ac *AdminController) safeDelete(tx *gorm.DB, model interface{}, condition string, args ...interface{}) error {
	// Generate a unique savepoint name using a simple counter or timestamp
	// Using a simple approach: create savepoint, attempt delete, handle errors
	savepointName := fmt.Sprintf("sp_%d", time.Now().UnixNano())
	
	// Create a savepoint before attempting the delete
	if err := tx.Exec("SAVEPOINT " + savepointName).Error; err != nil {
		return err
	}

	// Attempt the delete
	var result *gorm.DB
	if condition != "" {
		result = tx.Unscoped().Where(condition, args...).Delete(model)
	} else {
		result = tx.Unscoped().Delete(model)
	}

	if result.Error != nil {
		errMsg := result.Error.Error()
		// If table doesn't exist or transaction is aborted, rollback to savepoint and continue
		if strings.Contains(errMsg, "does not exist") || 
		   strings.Contains(errMsg, "SQLSTATE 42P01") ||
		   strings.Contains(errMsg, "transaction is aborted") ||
		   strings.Contains(errMsg, "SQLSTATE 25P02") {
			// Rollback to savepoint to recover from the error
			tx.Exec("ROLLBACK TO SAVEPOINT " + savepointName)
			// Release the savepoint
			tx.Exec("RELEASE SAVEPOINT " + savepointName)
			return nil // Table doesn't exist or transaction recovered, this is OK
		}
		// For other errors, rollback to savepoint and return the error
		tx.Exec("ROLLBACK TO SAVEPOINT " + savepointName)
		tx.Exec("RELEASE SAVEPOINT " + savepointName)
		return result.Error
	}

	// Release the savepoint on success
	tx.Exec("RELEASE SAVEPOINT " + savepointName)
	return nil
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

	// Start a transaction to ensure all deletions are atomic
	tx := ac.db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to start transaction", tx.Error.Error()))
		return
	}

	// Delete all related data in the correct order to avoid foreign key constraint violations

	// 1. Delete chat messages where user is the sender
	if err := ac.safeDelete(tx, &models.ChatMessage{}, "sender_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat messages", err.Error()))
		return
	}

	// 1a. Get all conversation IDs where user is a participant
	var conversationIDs []uint
	if err := tx.Model(&models.SimpleConversation{}).Where("user_1 = ? OR user_2 = ?", userID, userID).Pluck("id", &conversationIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get user conversations", err.Error()))
		return
	}

	// 1b. Set last_message_id to NULL in simple_conversations to break circular foreign key
	if len(conversationIDs) > 0 {
		if err := tx.Model(&models.SimpleConversation{}).Where("id IN ?", conversationIDs).Update("last_message_id", nil).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update simple conversations", err.Error()))
			return
		}

		// 1c. Delete ALL messages in conversations where user is a participant (not just messages sent by user)
		if err := tx.Unscoped().Where("conversation_id IN ?", conversationIDs).Delete(&models.SimpleConversationMessage{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete simple conversation messages", err.Error()))
			return
		}

		// 1d. Delete simple conversations where user is a participant
		if err := tx.Unscoped().Where("id IN ?", conversationIDs).Delete(&models.SimpleConversation{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete simple conversations", err.Error()))
			return
		}
	}

	// 2. Delete chat rooms associated with user's bookings, properties, or worker inquiries
	// First, get all bookings, properties, and worker inquiries for this user
	var bookingIDs []uint
	if err := tx.Model(&models.Booking{}).Where("user_id = ?", userID).Pluck("id", &bookingIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get user bookings", err.Error()))
		return
	}

	var propertyIDs []uint
	if err := tx.Model(&models.Property{}).Where("user_id = ?", userID).Pluck("id", &propertyIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get user properties", err.Error()))
		return
	}

	var workerInquiryIDs []uint
	if err := tx.Model(&models.WorkerInquiry{}).Where("user_id = ?", userID).Pluck("id", &workerInquiryIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to get user worker inquiries", err.Error()))
		return
	}

	// Delete chat rooms associated with these entities
	if len(bookingIDs) > 0 {
		if err := ac.safeDelete(tx, &models.ChatRoom{}, "booking_id IN ?", bookingIDs); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for bookings", err.Error()))
			return
		}
	}

	if len(propertyIDs) > 0 {
		if err := ac.safeDelete(tx, &models.ChatRoom{}, "property_id IN ?", propertyIDs); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for properties", err.Error()))
			return
		}
	}

	if len(workerInquiryIDs) > 0 {
		if err := ac.safeDelete(tx, &models.ChatRoom{}, "worker_inquiry_id IN ?", workerInquiryIDs); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for worker inquiries", err.Error()))
			return
		}
	}

	// 3. Delete payments (skip if table doesn't exist)
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Payment{}).Error; err != nil {
		// Check if error is "relation does not exist" - if so, skip this deletion
		if !strings.Contains(err.Error(), "does not exist") {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete payments", err.Error()))
			return
		}
		// Table doesn't exist, continue with other deletions
	}

	// 4. Delete bookings (skip if table doesn't exist)
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Booking{}).Error; err != nil {
		// Check if error is "relation does not exist" - if so, skip this deletion
		if !strings.Contains(err.Error(), "does not exist") {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete bookings", err.Error()))
			return
		}
		// Table doesn't exist, continue with other deletions
	}

	// 5. Delete worker inquiries (skip if table doesn't exist)
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.WorkerInquiry{}).Error; err != nil {
		// Check if error is "relation does not exist" - if so, skip this deletion
		if !strings.Contains(err.Error(), "does not exist") {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete worker inquiries", err.Error()))
			return
		}
		// Table doesn't exist, continue with other deletions
	}

	// 6. Delete properties
	if err := ac.safeDelete(tx, &models.Property{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete properties", err.Error()))
		return
	}

	// 7. Delete addresses
	if err := ac.safeDelete(tx, &models.Address{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete addresses", err.Error()))
		return
	}

	// 8. Delete user documents
	if err := ac.safeDelete(tx, &models.UserDocument{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user documents", err.Error()))
		return
	}

	// 9. Delete user skills
	if err := ac.safeDelete(tx, &models.UserSkill{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user skills", err.Error()))
		return
	}

	// 10. Delete subscription warnings
	if err := ac.safeDelete(tx, &models.SubscriptionWarning{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete subscription warnings", err.Error()))
		return
	}

	// 11. Delete user subscriptions
	if err := ac.safeDelete(tx, &models.UserSubscription{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user subscriptions", err.Error()))
		return
	}

	// 12. Delete user notification settings
	if err := ac.safeDelete(tx, &models.UserNotificationSettings{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete notification settings", err.Error()))
		return
	}

	// 13. Delete locations
	if err := ac.safeDelete(tx, &models.Location{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete locations", err.Error()))
		return
	}

	// 14. Delete worker record if exists (must be before role_applications)
	if err := ac.safeDelete(tx, &models.Worker{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete worker record", err.Error()))
		return
	}

	// 15. Delete broker record if exists (must be before role_applications)
	if err := ac.safeDelete(tx, &models.Broker{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete broker record", err.Error()))
		return
	}

	// 16. Delete role applications (after workers and brokers due to foreign key)
	if err := ac.safeDelete(tx, &models.RoleApplication{}, "user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete role applications", err.Error()))
		return
	}

	// 17. Delete chat room participants (using raw SQL as no model exists)
	if err := tx.Exec("DELETE FROM chat_room_participants WHERE user_id = ?", userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat room participants", err.Error()))
		return
	}

	// 18. Delete wallet transactions (using raw SQL as no model exists)
	if err := tx.Exec("DELETE FROM wallet_transactions WHERE user_id = ?", userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete wallet transactions", err.Error()))
		return
	}

	// 19. Handle reference columns - set to NULL where user is referenced but not the owner
	// Update properties where user is the approver
	if err := tx.Model(&models.Property{}).Where("approved_by = ?", userID).Update("approved_by", nil).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update property approvals", err.Error()))
		return
	}

	// Update role applications where user is the reviewer
	if err := tx.Model(&models.RoleApplication{}).Where("reviewed_by = ?", userID).Update("reviewed_by", nil).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update role application reviews", err.Error()))
		return
	}

	// Update worker inquiries where user responded
	if err := tx.Model(&models.WorkerInquiry{}).Where("responded_by = ?", userID).Update("responded_by", nil).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update worker inquiry responses", err.Error()))
		return
	}

	// Finally, delete the user account
	if err := tx.Unscoped().Delete(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user", err.Error()))
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to commit transaction", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User deleted successfully", gin.H{
		"message": "User and all associated data have been permanently deleted",
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
