package services

import (
	"sync"
	"treesindia/models"
)

// Global notification integration service instance
var (
	globalNotificationIntegrationService *NotificationIntegrationService
	globalNotificationMutex              sync.RWMutex
)

// SetGlobalNotificationIntegrationService sets the global notification integration service
func SetGlobalNotificationIntegrationService(service *NotificationIntegrationService) {
	globalNotificationMutex.Lock()
	defer globalNotificationMutex.Unlock()
	globalNotificationIntegrationService = service
}

// GetGlobalNotificationIntegrationService returns the global notification integration service
func GetGlobalNotificationIntegrationService() *NotificationIntegrationService {
	globalNotificationMutex.RLock()
	defer globalNotificationMutex.RUnlock()
	return globalNotificationIntegrationService
}

// NotifyUserRegistration is a global helper function to notify about user registration
func NotifyUserRegistration(user *models.User) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyUserRegistration(user)
}

// NotifyBookingCreated is a global helper function to notify about booking creation
func NotifyBookingCreated(booking, user, service interface{}) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	// You can implement type assertions here based on your models
	// For now, this is a placeholder
}

// NotifyWorkerAssigned is a global helper function to notify about worker assignment
func NotifyWorkerAssigned(booking, worker, service interface{}) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	// You can implement type assertions here based on your models
	// For now, this is a placeholder
}

// NotifyPaymentReceived is a global helper function to notify about payment
func NotifyPaymentReceived(payment, user interface{}) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	// You can implement type assertions here based on your models
	// For now, this is a placeholder
}

// NotifyOTPRequested is a global helper function to notify about OTP request
func NotifyOTPRequested(user *models.User, phone string) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyOTPRequested(user, phone)
}

// NotifyOTPVerified is a global helper function to notify about OTP verification
func NotifyOTPVerified(user *models.User, phone string) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyOTPVerified(user, phone)
}

// NotifyLoginSuccess is a global helper function to notify about successful login
func NotifyLoginSuccess(user *models.User, loginMethod string) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyLoginSuccess(user, loginMethod)
}

// NotifyLoginFailed is a global helper function to notify about failed login
func NotifyLoginFailed(user *models.User, phone string, reason string) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyLoginFailed(user, phone, reason)
}

// NotifyVendorProfileCreated notifies admins about new vendor profile
func NotifyVendorProfileCreated(vendor *models.Vendor, user *models.User) {
	service := GetGlobalNotificationIntegrationService()
	if service == nil {
		return
	}
	
	service.NotifyVendorProfileCreated(vendor, user)
}

// NotifyWorkerAssignedToWork notifies worker about work assignment
func NotifyWorkerAssignedToWork(worker *models.User, booking *models.Booking, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerAssignedToWork(worker, booking, service)
}

// NotifyPropertyCreated notifies admins about new property
func NotifyPropertyCreated(property *models.Property, user *models.User) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPropertyCreated(property, user)
}

// NotifyProjectCreated notifies admins about new project
func NotifyProjectCreated(project *models.Project, user *models.User) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyProjectCreated(project, user)
}

// NotifyServiceAdded notifies admins about new service
func NotifyServiceAdded(service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyServiceAdded(service)
}

// NotifyWorkerApplication notifies admins about new worker application
func NotifyWorkerApplication(user *models.User) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerApplication(user)
}

// NotifyBrokerApplication notifies admins about new broker application
func NotifyBrokerApplication(user *models.User) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyBrokerApplication(user)
}

// NotifyConversationStarted notifies user about conversation start
func NotifyConversationStarted(userID uint, otherUserName string, bookingID uint) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyConversationStarted(userID, otherUserName, bookingID)
}
