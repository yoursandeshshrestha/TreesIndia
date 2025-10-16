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
	db                *gorm.DB
	validationHelper  *utils.ValidationHelper
	cloudinaryService *services.CloudinaryService
	otpService       *services.OTPService
}

// NewUserController creates a new user controller
func NewUserController() *UserController {
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		// Log error but continue - Cloudinary is optional for basic functionality
		cloudinaryService = nil
	}

	return &UserController{
		db:                database.GetDB(),
		validationHelper:  utils.NewValidationHelper(),
		cloudinaryService: cloudinaryService,
		otpService:       services.NewOTPService(),
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
	SMSNotifications   bool `json:"sms_notifications"`
	PushNotifications  bool `json:"push_notifications"`
	MarketingEmails    bool `json:"marketing_emails"`
	BookingReminders   bool `json:"booking_reminders"`
	ServiceUpdates     bool `json:"service_updates"`
}

// RequestDeleteOTPRequest represents OTP request for account deletion
type RequestDeleteOTPRequest struct {
	OTP string `json:"otp" binding:"required,len=6"`
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

	// Get user with only necessary related data
	var user models.User
	if err := uc.db.Preload("UserNotificationSettings").
		Preload("Subscription").
		First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, views.CreateErrorResponse("User not found", "User does not exist"))
			return
		}
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Database error", err.Error()))
		return
	}

	// Prepare optimized response data
	responseData := gin.H{
		// Basic Information
		"id":            user.ID,
		"name":          user.Name,
		"email":         user.Email,
		"phone":         user.Phone,
		"user_type":     user.UserType,
		"avatar":        user.Avatar,
		"gender":        user.Gender,
		"is_active":     user.IsActive,
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
		"last_login_at": user.LastLoginAt,

		// Wallet Information
		"wallet": gin.H{
			"balance": user.WalletBalance,
		},

		// Role Application Information
		"role_application": gin.H{
			"status":           user.RoleApplicationStatus,
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

	// Add simplified subscription information
	if user.Subscription != nil {
		responseData["subscription"] = gin.H{
			"start_date": user.Subscription.StartDate,
			"end_date":   user.Subscription.EndDate,
			"status":     user.Subscription.Status,
		}
	} else {
		responseData["subscription"] = gin.H{
			"start_date": nil,
			"end_date":   nil,
			"status":     "inactive",
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
				UserID:             userID,
				EmailNotifications: true,
				SMSNotifications:   true,
				PushNotifications:  true,
				MarketingEmails:    false,
				BookingReminders:   true,
				ServiceUpdates:     true,
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
				UserID:             userID,
				EmailNotifications: req.EmailNotifications,
				SMSNotifications:   req.SMSNotifications,
				PushNotifications:  req.PushNotifications,
				MarketingEmails:    req.MarketingEmails,
				BookingReminders:   req.BookingReminders,
				ServiceUpdates:     req.ServiceUpdates,
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

// RequestDeleteOTP godoc
// @Summary Request OTP for account deletion
// @Description Send OTP to user's phone for account deletion verification
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body RequestDeleteOTPRequest true "OTP request"
// @Success 200 {object} models.Response "OTP sent successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/request-delete-otp [post]
func (uc *UserController) RequestDeleteOTP(c *gin.Context) {
	userID := c.GetUint("user_id")

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

	// Generate and send OTP via 2Factor API
	_, err := uc.otpService.SendOTP(user.Phone, "account_deletion")
	if err != nil {
		// Log the error but don't expose internal details to client
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to send OTP", "Please try again later"))
		return
	}
	
	c.JSON(http.StatusOK, views.CreateSuccessResponse("OTP sent successfully", gin.H{
		"message": "OTP has been sent to your registered phone number",
		"phone":   user.Phone, // Return masked phone number for user confirmation
		"expires_in": 300, // 5 minutes (300 seconds)
	}))
}

// DeleteAccount godoc
// @Summary Delete user account
// @Description Permanently delete the authenticated user's account after OTP verification
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body RequestDeleteOTPRequest true "OTP verification request"
// @Success 200 {object} models.Response "Account deleted successfully"
// @Failure 400 {object} models.Response "Invalid OTP or request data"
// @Failure 401 {object} models.Response "Unauthorized"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /users/account [delete]
func (uc *UserController) DeleteAccount(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req RequestDeleteOTPRequest

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

	// Verify OTP using OTP service
	valid, err := uc.otpService.VerifyOTP(user.Phone, req.OTP, "account_deletion")
	if err != nil || !valid {
		errorMessage := "OTP is incorrect"
		if err != nil {
			// Provide more specific error messages
			if strings.Contains(err.Error(), "expired") {
				errorMessage = "OTP has expired. Please request a new one"
			} else if strings.Contains(err.Error(), "not found") {
				errorMessage = "No valid OTP found. Please request a new one"
			} else if strings.Contains(err.Error(), "too many") {
				errorMessage = "Too many failed attempts. Please request a new OTP"
			}
		}
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid OTP", errorMessage))
		return
	}

	// Start a transaction to ensure all deletions are atomic
	tx := uc.db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to start transaction", tx.Error.Error()))
		return
	}

	// Delete all related data in the correct order to avoid foreign key constraint violations

	// 1. Delete chat messages where user is the sender
	if err := tx.Unscoped().Where("sender_id = ?", userID).Delete(&models.ChatMessage{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat messages", err.Error()))
		return
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
		if err := tx.Unscoped().Where("booking_id IN ?", bookingIDs).Delete(&models.ChatRoom{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for bookings", err.Error()))
			return
		}
	}

	if len(propertyIDs) > 0 {
		if err := tx.Unscoped().Where("property_id IN ?", propertyIDs).Delete(&models.ChatRoom{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for properties", err.Error()))
			return
		}
	}

	if len(workerInquiryIDs) > 0 {
		if err := tx.Unscoped().Where("worker_inquiry_id IN ?", workerInquiryIDs).Delete(&models.ChatRoom{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete chat rooms for worker inquiries", err.Error()))
			return
		}
	}

	// 3. Delete payments
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Payment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete payments", err.Error()))
		return
	}

	// 4. Delete bookings
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Booking{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete bookings", err.Error()))
		return
	}

	// 5. Delete worker inquiries
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.WorkerInquiry{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete worker inquiries", err.Error()))
		return
	}

	// 6. Delete properties
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Property{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete properties", err.Error()))
		return
	}

	// 7. Delete addresses
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Address{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete addresses", err.Error()))
		return
	}

	// 8. Delete user documents
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.UserDocument{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user documents", err.Error()))
		return
	}

	// 9. Delete user skills
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.UserSkill{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user skills", err.Error()))
		return
	}

	// 10. Delete subscription warnings
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.SubscriptionWarning{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete subscription warnings", err.Error()))
		return
	}

	// 11. Delete user subscriptions
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.UserSubscription{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete user subscriptions", err.Error()))
		return
	}

	// 12. Delete user notification settings
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.UserNotificationSettings{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete notification settings", err.Error()))
		return
	}

	// 13. Delete role applications
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.RoleApplication{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete role applications", err.Error()))
		return
	}

	// 14. Delete locations
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Location{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete locations", err.Error()))
		return
	}

	// 15. Delete worker record if exists
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.Worker{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete worker record", err.Error()))
		return
	}

	// Finally, delete the user account
	if err := tx.Unscoped().Delete(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete account", err.Error()))
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to commit transaction", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Account deleted successfully", gin.H{
		"message": "Your account and all associated data have been permanently deleted",
	}))
}
