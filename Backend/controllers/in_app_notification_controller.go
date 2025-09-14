package controllers

import (
	"net/http"
	"strconv"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// InAppNotificationController handles in-app notification HTTP requests
type InAppNotificationController struct {
	BaseController
	notificationService *services.InAppNotificationService
}

// NewInAppNotificationController creates a new in-app notification controller
func NewInAppNotificationController(notificationService *services.InAppNotificationService) *InAppNotificationController {
	return &InAppNotificationController{
		BaseController:      *NewBaseController(),
		notificationService: notificationService,
	}
}

// GetNotifications retrieves notifications for the authenticated user
// @Summary Get user notifications
// @Description Get paginated list of notifications for the authenticated user
// @Tags notifications
// @Accept json
// @Produce json
// @Param limit query int false "Number of notifications to return (default: 20, max: 100)"
// @Param offset query int false "Number of notifications to skip (default: 0)"
// @Param type query string false "Filter by notification type"
// @Param is_read query bool false "Filter by read status"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications [get]
func (nc *InAppNotificationController) GetNotifications(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Cap limit to prevent abuse
	if limit > 100 {
		limit = 100
	}

	// Get notifications
	notifications, err := nc.notificationService.GetUserNotifications(userID, limit, offset)
	if err != nil {
		logrus.Errorf("Failed to get notifications for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get notifications",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notifications,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(notifications),
		},
	})
}

// GetUnreadCount returns the unread notification count for the authenticated user
// @Summary Get unread notification count
// @Description Get the number of unread notifications for the authenticated user
// @Tags notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/unread-count [get]
func (nc *InAppNotificationController) GetUnreadCount(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	count, err := nc.notificationService.GetUnreadCount(userID)
	if err != nil {
		logrus.Errorf("Failed to get unread count for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get unread count",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"unread_count": count,
	})
}

// MarkAllAsRead marks all notifications as read for the authenticated user
// @Summary Mark all notifications as read
// @Description Mark all notifications as read for the authenticated user
// @Tags notifications
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/read-all [patch]
func (nc *InAppNotificationController) MarkAllAsRead(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	err := nc.notificationService.MarkAllNotificationsAsRead(userID)
	if err != nil {
		logrus.Errorf("Failed to mark all notifications as read for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to mark all notifications as read",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All notifications marked as read",
	})
}

// GetNotificationStats returns notification statistics for the authenticated user
// @Summary Get notification statistics
// @Description Get notification statistics for the authenticated user
// @Tags notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/stats [get]
func (nc *InAppNotificationController) GetNotificationStats(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	stats, err := nc.notificationService.GetNotificationStats(userID)
	if err != nil {
		logrus.Errorf("Failed to get notification stats for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get notification statistics",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// AdminGetNotifications retrieves notifications for admin users
// @Summary Get admin notifications
// @Description Get paginated list of notifications for admin users
// @Tags admin notifications
// @Accept json
// @Produce json
// @Param limit query int false "Number of notifications to return (default: 20, max: 100)"
// @Param offset query int false "Number of notifications to skip (default: 0)"
// @Param type query string false "Filter by notification type"
// @Param is_read query bool false "Filter by read status"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /admin/notifications [get]
func (nc *InAppNotificationController) AdminGetNotifications(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	// Check if user is admin
	userType := nc.GetUserType(c)
	if userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Admin access required",
		})
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Cap limit to prevent abuse
	if limit > 100 {
		limit = 100
	}

	// Get notifications
	notifications, err := nc.notificationService.GetUserNotifications(userID, limit, offset)
	if err != nil {
		logrus.Errorf("Failed to get admin notifications for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get notifications",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notifications,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(notifications),
		},
	})
}

// AdminGetUnreadCount returns the unread notification count for admin users
// @Summary Get admin unread notification count
// @Description Get the number of unread notifications for admin users
// @Tags admin notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /admin/notifications/unread-count [get]
func (nc *InAppNotificationController) AdminGetUnreadCount(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	// Check if user is admin
	userType := nc.GetUserType(c)
	if userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Admin access required",
		})
		return
	}

	count, err := nc.notificationService.GetUnreadCount(userID)
	if err != nil {
		logrus.Errorf("Failed to get admin unread count for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get unread count",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"unread_count": count,
	})
}

// AdminMarkAllAsRead marks all notifications as read for admin users
// @Summary Mark all admin notifications as read
// @Description Mark all notifications as read for admin users
// @Tags admin notifications
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /admin/notifications/read-all [patch]
func (nc *InAppNotificationController) AdminMarkAllAsRead(c *gin.Context) {
	userID := nc.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	// Check if user is admin
	userType := nc.GetUserType(c)
	if userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Admin access required",
		})
		return
	}

	err := nc.notificationService.MarkAllNotificationsAsRead(userID)
	if err != nil {
		logrus.Errorf("Failed to mark all admin notifications as read for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to mark all notifications as read",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All notifications marked as read",
	})
}

// GetUserType returns the user type from context
func (nc *InAppNotificationController) GetUserType(c *gin.Context) string {
	userType, exists := c.Get("user_type")
	if !exists {
		return ""
	}
	return userType.(string)
}
