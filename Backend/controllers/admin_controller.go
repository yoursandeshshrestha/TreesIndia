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
		IsVerified:  true, // Admin users are pre-verified
		KYCStatus:   models.KYCStatusNotNeeded,
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
// @Description Get all users with pagination support
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10, max: 100)"
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

	// Get users with pagination
	if err := ac.db.Preload("KYC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
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


