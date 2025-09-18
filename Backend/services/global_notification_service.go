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
	// User-facing OTP notifications removed as per requirements
	// Only admin notifications are sent
}

// NotifyOTPVerified is a global helper function to notify about OTP verification
func NotifyOTPVerified(user *models.User, phone string) {
	// User-facing OTP notifications removed as per requirements
	// Only admin notifications are sent
}

// NotifyLoginSuccess is a global helper function to notify about successful login
func NotifyLoginSuccess(user *models.User, loginMethod string) {
	// User-facing login notifications removed as per requirements
	// Only admin notifications are sent
}

// NotifyLoginFailed is a global helper function to notify about failed login
func NotifyLoginFailed(user *models.User, phone string, reason string) {
	// User-facing login notifications removed as per requirements
	// Only admin notifications are sent
}

// NotifyOTPRequestedToAdmin is a global helper function to notify admin about OTP request
func NotifyOTPRequestedToAdmin(user *models.User, phone string) {
	// OTP admin notifications not implemented
}

// NotifyOTPVerifiedToAdmin is a global helper function to notify admin about OTP verification
func NotifyOTPVerifiedToAdmin(user *models.User, phone string) {
	// OTP admin notifications not implemented
}

// NotifyLoginSuccessToAdmin is a global helper function to notify admin about successful login
func NotifyLoginSuccessToAdmin(user *models.User, loginMethod string) {
	// Login admin notifications not implemented
}

// NotifyWalletRechargeSuccess is a global helper function to notify user about successful wallet recharge
func NotifyWalletRechargeSuccess(user *models.User, amount float64, newBalance float64) {
	// Wallet recharge notifications not implemented
}

// NotifyWalletRechargeToAdmin is a global helper function to notify admin about wallet recharge
func NotifyWalletRechargeToAdmin(user *models.User, amount float64, newBalance float64) {
	// Wallet recharge admin notifications not implemented
}

// NotifyBookingConfirmed is a global helper function to notify user about booking confirmation
func NotifyBookingConfirmed(booking *models.Booking, user *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyBookingConfirmed(booking, user, service)
}

// NotifyBookingCancelled is a global helper function to notify user and admin about booking cancellation
func NotifyBookingCancelled(booking *models.Booking, user *models.User, service *models.Service, reason string) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyBookingCancelled(booking, user, service, reason)
}

// NotifyWorkerStarted is a global helper function to notify user and admin when worker starts work
func NotifyWorkerStarted(booking *models.Booking, worker *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerStarted(booking, worker, service)
}

// NotifyWorkerCompleted is a global helper function to notify user and admin when worker completes work
func NotifyWorkerCompleted(booking *models.Booking, worker *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerCompleted(booking, worker, service)
}

// NotifyQuoteProvided is a global helper function to notify user and admin about quote provided
func NotifyQuoteProvided(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyQuoteProvided(quote, booking, user, service)
}

// NotifyQuoteAccepted is a global helper function to notify user and admin about quote acceptance
func NotifyQuoteAccepted(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyQuoteAccepted(quote, booking, user, service)
}

// NotifyQuoteRejected is a global helper function to notify user and admin about quote rejection
func NotifyQuoteRejected(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyQuoteRejected(quote, booking, user, service)
}

// NotifyQuoteExpired is a global helper function to notify user and admin about quote expiration
func NotifyQuoteExpired(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyQuoteExpired(quote, booking, user, service)
}

// NotifyAssignmentAccepted is a global helper function to notify worker and admin about assignment acceptance
func NotifyAssignmentAccepted(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyAssignmentAccepted(assignment, booking, worker, service)
}

// NotifyAssignmentRejected is a global helper function to notify worker and admin about assignment rejection
func NotifyAssignmentRejected(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyAssignmentRejected(assignment, booking, worker, service)
}

// NotifyAssignmentCancelled is a global helper function to notify worker and admin about assignment cancellation
func NotifyAssignmentCancelled(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyAssignmentCancelled(assignment, booking, worker, service)
}

// NotifyPaymentFailed is a global helper function to notify user and admin about payment failure
func NotifyPaymentFailed(payment *models.Payment, user *models.User, booking *models.Booking, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPaymentFailed(payment, user, booking, service)
}

// NotifyPaymentRefunded is a global helper function to notify user and admin about payment refund
func NotifyPaymentRefunded(payment *models.Payment, user *models.User, booking *models.Booking, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPaymentRefunded(payment, user, booking, service)
}

// NotifySubscriptionExpired is a global helper function to notify user and admin about subscription expiration
func NotifySubscriptionExpired(user *models.User, subscription *models.UserSubscription) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifySubscriptionExpired(user, subscription)
}

// NotifySubscriptionExpiryWarning is a global helper function to notify user and admin about subscription expiry warning
func NotifySubscriptionExpiryWarning(user *models.User, subscription *models.UserSubscription, daysLeft int) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifySubscriptionExpiryWarning(user, subscription, daysLeft)
}

// NotifyWorkerApplication is a global helper function to notify user and admin about worker application submission
func NotifyWorkerApplication(user *models.User, application *models.RoleApplication) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerApplication(user, application)
}

// NotifyBrokerApplication is a global helper function to notify user and admin about broker application submission
func NotifyBrokerApplication(user *models.User, application *models.RoleApplication) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyBrokerApplication(user, application)
}

// NotifyApplicationAccepted is a global helper function to notify user and admin about application acceptance
func NotifyApplicationAccepted(user *models.User, application *models.RoleApplication) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyApplicationAccepted(user, application)
}

// NotifyApplicationRejected is a global helper function to notify user and admin about application rejection
func NotifyApplicationRejected(user *models.User, application *models.RoleApplication) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyApplicationRejected(user, application)
}

// NotifyPropertyCreated is a global helper function to notify user and admin about property creation
func NotifyPropertyCreated(user *models.User, property *models.Property) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPropertyCreated(user, property)
}

// NotifyPropertyApproved is a global helper function to notify user and admin about property approval
func NotifyPropertyApproved(user *models.User, property *models.Property) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPropertyApproved(user, property)
}

// NotifyPropertyExpiryWarning is a global helper function to notify user and admin about property expiry warning
func NotifyPropertyExpiryWarning(user *models.User, property *models.Property, daysLeft int) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyPropertyExpiryWarning(user, property, daysLeft)
}

// NotifyServiceAdded is a global helper function to notify user and admin about new service addition
func NotifyServiceAdded(service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyServiceAdded(service)
}

// NotifyServiceUpdated is a global helper function to notify user and admin about service update
func NotifyServiceUpdated(service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyServiceUpdated(service)
}

// NotifyVendorProfileCreated notifies admins about new vendor profile
func NotifyVendorProfileCreated(vendor *models.Vendor, user *models.User) {
	// Vendor profile notifications not implemented
}

// NotifyWorkerAssignedToWork notifies worker about work assignment
func NotifyWorkerAssignedToWork(worker *models.User, booking *models.Booking, service *models.Service) {
	notificationService := GetGlobalNotificationIntegrationService()
	if notificationService == nil {
		return
	}
	
	notificationService.NotifyWorkerAssigned(booking, worker, service)
}


// NotifyProjectCreated notifies admins about new project
func NotifyProjectCreated(project *models.Project, user *models.User) {
	// Project notifications not implemented
}



// NotifyConversationStarted notifies user about conversation start
func NotifyConversationStarted(userID uint, otherUserName string, bookingID uint) {
	// Conversation notifications not implemented
}
