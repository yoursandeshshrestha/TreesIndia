package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"treesindia/models"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// NotificationController handles notification-related HTTP requests
type NotificationController struct {
	enhancedNotificationService *services.EnhancedNotificationService
	deviceManagementService     *services.DeviceManagementService
}

// NewNotificationController creates a new notification controller
func NewNotificationController(enhancedNotificationService *services.EnhancedNotificationService, deviceManagementService *services.DeviceManagementService) *NotificationController {
	return &NotificationController{
		enhancedNotificationService: enhancedNotificationService,
		deviceManagementService:     deviceManagementService,
	}
}

// RegisterDevice registers a new device token for push notifications
// @Summary Register device for push notifications
// @Description Register a new device token for a user to receive push notifications
// @Tags notifications
// @Accept json
// @Produce json
// @Param request body services.DeviceRegistrationRequest true "Device registration request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/register-device [post]
func (nc *NotificationController) RegisterDevice(c *gin.Context) {
	var req services.DeviceRegistrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context (assuming it's set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	// Override user ID from request with authenticated user ID
	req.UserID = userID.(uint)

	if err := nc.deviceManagementService.RegisterDevice(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to register device",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Device registered successfully",
	})
}

// UnregisterDevice removes a device token
// @Summary Unregister device
// @Description Remove a device token for a user
// @Tags notifications
// @Accept json
// @Produce json
// @Param token query string true "Device token to unregister"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/unregister-device [delete]
func (nc *NotificationController) UnregisterDevice(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Device token is required",
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	if err := nc.deviceManagementService.UnregisterDevice(userID.(uint), token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to unregister device",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Device unregistered successfully",
	})
}

// GetUserDevices returns all active devices for a user
// @Summary Get user devices
// @Description Get all active devices registered for a user
// @Tags notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/devices [get]
func (nc *NotificationController) GetUserDevices(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	devices, err := nc.deviceManagementService.GetUserDevices(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get user devices",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    devices,
	})
}

// SendNotification sends a notification to a specific user
// @Summary Send notification
// @Description Send a notification to a specific user
// @Tags notifications
// @Accept json
// @Produce json
// @Param request body services.NotificationRequest true "Notification request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/send [post]
func (nc *NotificationController) SendNotification(c *gin.Context) {
	var req services.NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context if not provided in request
	if req.UserID == 0 {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "User not authenticated",
			})
			return
		}
		req.UserID = userID.(uint)
	}

	result, err := nc.enhancedNotificationService.SendNotification(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to send notification",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Notification sent successfully",
		"data":    result,
	})
}

// GetNotificationHistory returns notification history for a user
// @Summary Get notification history
// @Description Get notification history for the authenticated user
// @Tags notifications
// @Produce json
// @Param limit query int false "Number of notifications to return (default: 20)"
// @Param offset query int false "Number of notifications to skip (default: 0)"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/history [get]
func (nc *NotificationController) GetNotificationHistory(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
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

	notifications, err := nc.enhancedNotificationService.GetNotificationHistory(userID.(uint), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get notification history",
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

// MarkNotificationAsDelivered marks a notification as delivered
// @Summary Mark notification as delivered
// @Description Mark a notification as delivered
// @Tags notifications
// @Accept json
// @Produce json
// @Param notification_id path int true "Notification ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/{notification_id}/delivered [patch]
func (nc *NotificationController) MarkNotificationAsDelivered(c *gin.Context) {
	notificationIDStr := c.Param("notification_id")
	notificationID, err := strconv.ParseUint(notificationIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid notification ID",
		})
		return
	}

	if err := nc.enhancedNotificationService.MarkNotificationAsDelivered(uint(notificationID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to mark notification as delivered",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Notification marked as delivered",
	})
}

// GetNotificationStats returns notification statistics for a user
// @Summary Get notification statistics
// @Description Get notification statistics for the authenticated user
// @Tags notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/stats [get]
func (nc *NotificationController) GetNotificationStats(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	stats, err := nc.enhancedNotificationService.GetNotificationStats(userID.(uint))
	if err != nil {
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

// GetDeviceStats returns device statistics (admin only)
// @Summary Get device statistics
// @Description Get overall device statistics (admin only)
// @Tags notifications
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /notifications/device-stats [get]
func (nc *NotificationController) GetDeviceStats(c *gin.Context) {
	// Check if user is admin (you'll need to implement this based on your auth system)
	userType, exists := c.Get("user_type")
	if !exists || userType != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Admin access required",
		})
		return
	}

	stats, err := nc.deviceManagementService.GetDeviceStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get device statistics",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// SendNotificationToUser sends an FCM notification to a specific user (admin only)
// @Summary Send FCM notification to user
// @Description Send an FCM push notification to a specific user by user ID (admin only)
// @Tags notifications
// @Accept json
// @Produce json
// @Param request body services.NotificationRequest true "Notification request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /admin/notifications/send [post]
func (nc *NotificationController) SendNotificationToUser(c *gin.Context) {
	var req services.NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	// Validate that user_id is provided
	if req.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id is required",
		})
		return
	}

	// Send notification
	result, err := nc.enhancedNotificationService.SendNotification(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to send notification",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Notification sent successfully",
		"data":    result,
	})
}

// SendNotificationToMultipleUsers sends FCM notifications to multiple users (admin only)
// @Summary Send FCM notifications to multiple users
// @Description Send FCM push notifications to multiple users by their user IDs (admin only)
// @Tags notifications
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "Request body with user_ids array and notification details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /admin/notifications/send-bulk [post]
func (nc *NotificationController) SendNotificationToMultipleUsers(c *gin.Context) {
	var req struct {
		UserIDs     []uint                  `json:"user_ids" binding:"required"`
		Type        models.NotificationType `json:"type" binding:"required"`
		Title       string                  `json:"title" binding:"required"`
		Body        string                  `json:"body" binding:"required"`
		Data        map[string]string       `json:"data,omitempty"`
		ImageURL    string                  `json:"image_url,omitempty"`
		ClickAction string                  `json:"click_action,omitempty"`
		Priority    string                  `json:"priority,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	if len(req.UserIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "At least one user_id is required",
		})
		return
	}

	// Create notification request
	notificationReq := &services.NotificationRequest{
		Type:        req.Type,
		Title:       req.Title,
		Body:        req.Body,
		Data:        req.Data,
		ImageURL:    req.ImageURL,
		ClickAction: req.ClickAction,
		Priority:    req.Priority,
	}

	// Send to multiple users
	results, err := nc.enhancedNotificationService.SendNotificationToMultipleUsers(req.UserIDs, notificationReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to send notifications",
			"error":   err.Error(),
		})
		return
	}

	// Calculate summary
	successCount := 0
	failureCount := 0
	for _, result := range results {
		if result.PushSuccess {
			successCount++
		} else {
			failureCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Notifications sent: %d successful, %d failed", successCount, failureCount),
		"data": gin.H{
			"results":       results,
			"success_count": successCount,
			"failure_count": failureCount,
			"total":         len(results),
		},
	})
}
