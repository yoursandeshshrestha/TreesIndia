package controllers

import (
	"net/http"
	"strings"
	"treesindia/database"
	"treesindia/models"
	"treesindia/services"
	"treesindia/utils"
	"treesindia/views"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserController handles user-related operations
type UserController struct {
	db               *gorm.DB
	validationHelper *utils.ValidationHelper
	cloudinaryService *services.CloudinaryService
}

// NewUserController creates a new user controller
func NewUserController() *UserController {
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but continue - Cloudinary is optional for basic functionality
		cloudinaryService = nil
	}

	return &UserController{
		db:               database.GetDB(),
		validationHelper: utils.NewValidationHelper(),
		cloudinaryService: cloudinaryService,
	}
}

// ProfileUpdateRequest represents the request for updating user profile
type ProfileUpdateRequest struct {
	Name   string  `json:"name" binding:"required,min=2,max=100"`
	Email  *string `json:"email" binding:"omitempty,email"`
	Gender string  `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
}

// NotificationSettingsRequest represents the request for updating notification settings
type NotificationSettingsRequest struct {
	EmailNotifications bool `json:"email_notifications"`
	SMSNotifications    bool `json:"sms_notifications"`
	PushNotifications   bool `json:"push_notifications"`
	MarketingEmails     bool `json:"marketing_emails"`
	BookingReminders    bool `json:"booking_reminders"`
	ServiceUpdates      bool `json:"service_updates"`
}

// GetUserProfile godoc
// @Summary Get user profile
// @Description Get detailed user profile information including wallet, subscription, and role application status
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "User profile retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 404 {object} models.Response "User not found"
// @Router /users/profile [get]
func (uc *UserController) GetUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	// Get user with all related data
	var user models.User
	if err := uc.db.Preload("UserNotificationSettings").
		Preload("Subscription").
		Preload("UserSubscriptions").
		Preload("SubscriptionWarnings").
		First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Prepare comprehensive response data
	responseData := gin.H{
		// Basic Information
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"phone":      user.Phone,
		"user_type":  user.UserType,
		"avatar":     user.Avatar,
		"gender":     user.Gender,
		"is_active":  user.IsActive,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"last_login_at": user.LastLoginAt,
		
		// Wallet Information
		"wallet": gin.H{
			"balance": user.WalletBalance,
		},
		
		// Subscription Information
		"subscription": gin.H{
			"has_active_subscription": user.HasActiveSubscription,
			"subscription_id":         user.SubscriptionID,
			"expiry_date":             user.SubscriptionExpiryDate,
			"current_plan":            user.Subscription,
		},
		
		// Role Application Information
		"role_application": gin.H{
			"status":          user.RoleApplicationStatus,
			"application_date": user.ApplicationDate,
			"approval_date":    user.ApprovalDate,
		},
	}

	// Add notification settings if they exist
	if user.UserNotificationSettings != nil && user.UserNotificationSettings.ID != 0 {
		responseData["notification_settings"] = gin.H{
			"email_notifications": user.UserNotificationSettings.EmailNotifications,
			"sms_notifications":   user.UserNotificationSettings.SMSNotifications,
			"push_notifications":  user.UserNotificationSettings.PushNotifications,
			"marketing_emails":    user.UserNotificationSettings.MarketingEmails,
			"booking_reminders":   user.UserNotificationSettings.BookingReminders,
			"service_updates":     user.UserNotificationSettings.ServiceUpdates,
		}
	}

	// Add subscription history (last 5 subscriptions)
	if len(user.UserSubscriptions) > 0 {
		// Sort by created_at descending and take last 5
		subscriptionHistory := make([]gin.H, 0)
		for i := len(user.UserSubscriptions) - 1; i >= 0 && len(subscriptionHistory) < 5; i-- {
			sub := user.UserSubscriptions[i]
			subscriptionHistory = append(subscriptionHistory, gin.H{
				"id":            sub.ID,
				"plan_id":       sub.PlanID,
				"start_date":    sub.StartDate,
				"end_date":      sub.EndDate,
				"status":        sub.Status,
				"amount":        sub.Amount,
				"payment_method": sub.PaymentMethod,
				"created_at":    sub.CreatedAt,
			})
		}
		responseData["subscription_history"] = subscriptionHistory
	}

	// Add active subscription warnings
	if len(user.SubscriptionWarnings) > 0 {
		activeWarnings := make([]gin.H, 0)
		for _, warning := range user.SubscriptionWarnings {
			activeWarnings = append(activeWarnings, gin.H{
				"id":           warning.ID,
				"days_left":    warning.DaysLeft,
				"warning_date": warning.WarningDate,
				"sent_via":     warning.SentVia,
				"created_at":   warning.CreatedAt,
			})
		}
		if len(activeWarnings) > 0 {
			responseData["subscription_warnings"] = activeWarnings
		}
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("User profile retrieved successfully", responseData))
}

// UpdateUserProfile godoc
// @Summary Update user profile
// @Description Update user profile information
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body ProfileUpdateRequest true "Profile update request"
// @Success 200 {object} models.Response "Profile updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 409 {object} models.Response "Email already exists"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/profile [put]
func (uc *UserController) UpdateUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req ProfileUpdateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	// Get current user
	var user models.User
	if err := uc.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Check email uniqueness if email is being updated
	if req.Email != nil && *req.Email != "" {
		if user.Email == nil || *user.Email != *req.Email {
			var existingUser models.User
			if err := uc.db.Where("email = ? AND id != ?", *req.Email, userID).First(&existingUser).Error; err == nil {
				c.JSON(http.StatusConflict, views.CreateErrorResponse("Email already exists", "This email is already registered"))
				return
			}
		}
	}

	// Update user fields
	updates := make(map[string]interface{})
	updates["name"] = req.Name
	updates["gender"] = req.Gender
	
	if req.Email != nil {
		updates["email"] = req.Email
	}

	// Update user
	if err := uc.db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update profile", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Profile updated successfully", gin.H{
		"name":   user.Name,
		"email":  user.Email,
		"gender": user.Gender,
	}))
}

// UploadAvatar godoc
// @Summary Upload user avatar
// @Description Upload or update user profile picture
// @Tags Users
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param avatar formData file true "Profile picture (max 5MB)"
// @Success 200 {object} models.Response "Avatar uploaded successfully"
// @Failure 400 {object} models.Response "Invalid file or request"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Upload failed"
// @Router /users/upload-avatar [post]
func (uc *UserController) UploadAvatar(c *gin.Context) {
	userID := c.GetUint("user_id")

	// Check if Cloudinary service is available
	if uc.cloudinaryService == nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("File upload service unavailable", "Avatar upload is currently disabled"))
		return
	}

	// Get uploaded file
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("No file uploaded", "Please select an image file"))
		return
	}

	// Validate file size (5MB limit)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("File too large", "File size must be less than 5MB"))
		return
	}

	// Validate file type
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid file type", "Please upload an image file"))
		return
	}

	// Get current user
	var user models.User
	if err := uc.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Upload to Cloudinary
	avatarURL, err := uc.cloudinaryService.UploadImage(file, "avatars")
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Upload failed", "Failed to upload image"))
		return
	}

	// Update user avatar
	if err := uc.db.Model(&user).Update("avatar", avatarURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update avatar", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Avatar uploaded successfully", gin.H{
		"avatar_url": avatarURL,
	}))
}

// GetNotificationSettings godoc
// @Summary Get user notification settings
// @Description Get user notification preferences
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response "Notification settings retrieved successfully"
// @Failure 401 {object} models.Response "Unauthorized"
// @Router /users/notifications [get]
func (uc *UserController) GetNotificationSettings(c *gin.Context) {
	userID := c.GetUint("user_id")

	var settings models.UserNotificationSettings
	if err := uc.db.Where("user_id = ?", userID).First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default settings if they don't exist
			settings = models.UserNotificationSettings{
				UserID:              userID,
				EmailNotifications:  true,
				SMSNotifications:    true,
				PushNotifications:   true,
				MarketingEmails:     false,
				BookingReminders:    true,
				ServiceUpdates:      true,
			}
			if err := uc.db.Create(&settings).Error; err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create notification settings", err.Error()))
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
			return
		}
	}

	// Return clean notification settings data
	settingsData := gin.H{
		"email_notifications": settings.EmailNotifications,
		"sms_notifications":   settings.SMSNotifications,
		"push_notifications":  settings.PushNotifications,
		"marketing_emails":    settings.MarketingEmails,
		"booking_reminders":   settings.BookingReminders,
		"service_updates":     settings.ServiceUpdates,
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Notification settings retrieved successfully", settingsData))
}

// UpdateNotificationSettings godoc
// @Summary Update user notification settings
// @Description Update user notification preferences
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body NotificationSettingsRequest true "Notification settings request"
// @Success 200 {object} models.Response "Notification settings updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Update failed"
// @Router /users/notifications [put]
func (uc *UserController) UpdateNotificationSettings(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req NotificationSettingsRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	var settings models.UserNotificationSettings
	if err := uc.db.Where("user_id = ?", userID).First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new settings
			settings = models.UserNotificationSettings{
				UserID:              userID,
				EmailNotifications:  req.EmailNotifications,
				SMSNotifications:    req.SMSNotifications,
				PushNotifications:   req.PushNotifications,
				MarketingEmails:     req.MarketingEmails,
				BookingReminders:    req.BookingReminders,
				ServiceUpdates:      req.ServiceUpdates,
			}
			if err := uc.db.Create(&settings).Error; err != nil {
				c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create notification settings", err.Error()))
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
			return
		}
	} else {
		// Update existing settings
		updates := map[string]interface{}{
			"email_notifications": req.EmailNotifications,
			"sms_notifications":   req.SMSNotifications,
			"push_notifications":  req.PushNotifications,
			"marketing_emails":    req.MarketingEmails,
			"booking_reminders":   req.BookingReminders,
			"service_updates":     req.ServiceUpdates,
		}
		
		if err := uc.db.Model(&settings).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update notification settings", err.Error()))
			return
		}
	}

	// Return clean notification settings data
	settingsData := gin.H{
		"email_notifications": settings.EmailNotifications,
		"sms_notifications":   settings.SMSNotifications,
		"push_notifications":  settings.PushNotifications,
		"marketing_emails":    settings.MarketingEmails,
		"booking_reminders":   settings.BookingReminders,
		"service_updates":     settings.ServiceUpdates,
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("Notification settings updated successfully", settingsData))
}
