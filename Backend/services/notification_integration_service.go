package services

import (
	"fmt"
	"treesindia/models"
)

// NotificationIntegrationService provides helper methods to integrate notifications with existing services
type NotificationIntegrationService struct {
	notificationService *InAppNotificationService
}

// NewNotificationIntegrationService creates a new notification integration service
func NewNotificationIntegrationService(notificationService *InAppNotificationService) *NotificationIntegrationService {
	return &NotificationIntegrationService{
		notificationService: notificationService,
	}
}

// NotifyUserRegistration notifies admins about new user registration
func (nis *NotificationIntegrationService) NotifyUserRegistration(user *models.User) error {
	message := fmt.Sprintf("New user registered with phone number %s", user.Phone)
	
	data := map[string]interface{}{
		"user_id":   user.ID,
		"user_name": user.Name,
		"phone":     user.Phone,
		"user_type": string(user.UserType),
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeUserRegistered,
		"New User Registered",
		message,
		data,
	)
}

// NotifyBookingCreated notifies admins about new booking
func (nis *NotificationIntegrationService) NotifyBookingCreated(booking *models.Booking, user *models.User, service *models.Service) error {
	message := fmt.Sprintf("User %s booked %s service - %s", user.Phone, booking.BookingType, service.Name)
	
	data := map[string]interface{}{
		"booking_id":    booking.ID,
		"user_phone":    user.Phone,
		"user_name":     user.Name,
		"service_name":  service.Name,
		"booking_type":  string(booking.BookingType),
		"booking_ref":   booking.BookingReference,
	}
	
	// Add amount if available from service
	if service.Price != nil {
		data["amount"] = *service.Price
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeBookingCreated,
		"New Booking Created",
		message,
		data,
	)
}

// NotifyWorkerAssigned notifies user about worker assignment
func (nis *NotificationIntegrationService) NotifyWorkerAssigned(booking *models.Booking, worker *models.User, service *models.Service) error {
	message := fmt.Sprintf("Admin assigned worker %s to your booking", worker.Name)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	return nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerAssigned,
		"Worker Assigned",
		message,
		data,
	)
}

// NotifyWorkerStarted notifies user about work start
func (nis *NotificationIntegrationService) NotifyWorkerStarted(booking *models.Booking, worker *models.User, service *models.Service) error {
	message := fmt.Sprintf("Worker %s has started the work for booking - %s", worker.Name, service.Name)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	return nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerStarted,
		"Work Started",
		message,
		data,
	)
}

// NotifyWorkerCompleted notifies user about work completion
func (nis *NotificationIntegrationService) NotifyWorkerCompleted(booking *models.Booking, worker *models.User, service *models.Service) error {
	message := fmt.Sprintf("Worker %s has completed your booking", worker.Name)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	return nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerCompleted,
		"Work Completed",
		message,
		data,
	)
}

// NotifyPaymentReceived notifies admins about payment
func (nis *NotificationIntegrationService) NotifyPaymentReceived(payment *models.Payment, user *models.User) error {
	message := fmt.Sprintf("Payment received from user %s - ₹%.2f", user.Phone, payment.Amount)
	
	data := map[string]interface{}{
		"payment_id": payment.ID,
		"user_phone": user.Phone,
		"user_name":  user.Name,
		"amount":     payment.Amount,
		"type":       string(payment.Type),
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePaymentReceived,
		"Payment Received",
		message,
		data,
	)
}

// NotifyPaymentConfirmation notifies user about payment confirmation
func (nis *NotificationIntegrationService) NotifyPaymentConfirmation(payment *models.Payment, user *models.User) error {
	message := fmt.Sprintf("Payment of ₹%.2f received for your booking", payment.Amount)
	
	data := map[string]interface{}{
		"payment_id": payment.ID,
		"amount":     payment.Amount,
		"type":       string(payment.Type),
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePaymentConfirmation,
		"Payment Confirmed",
		message,
		data,
	)
}

// NotifySubscriptionPurchase notifies admins about subscription purchase
func (nis *NotificationIntegrationService) NotifySubscriptionPurchase(user *models.User, subscription *models.UserSubscription) error {
	message := fmt.Sprintf("User %s purchased %s subscription", user.Phone, subscription.Plan.Name)
	
	data := map[string]interface{}{
		"user_phone":     user.Phone,
		"user_name":      user.Name,
		"subscription_id": subscription.ID,
		"plan_name":      subscription.Plan.Name,
		"amount":         subscription.Amount,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeSubscriptionPurchase,
		"Subscription Purchased",
		message,
		data,
	)
}

// NotifyWorkerApplication notifies admins about worker application
func (nis *NotificationIntegrationService) NotifyWorkerApplication(user *models.User) error {
	message := fmt.Sprintf("New worker application from %s", user.Name)
	
	data := map[string]interface{}{
		"user_id":   user.ID,
		"user_name": user.Name,
		"phone":     user.Phone,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerApplication,
		"New Worker Application",
		message,
		data,
	)
}

// NotifyBrokerApplication notifies admins about broker application
func (nis *NotificationIntegrationService) NotifyBrokerApplication(user *models.User) error {
	message := fmt.Sprintf("New broker application from %s", user.Name)
	
	data := map[string]interface{}{
		"user_id":   user.ID,
		"user_name": user.Name,
		"phone":     user.Phone,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeBrokerApplication,
		"New Broker Application",
		message,
		data,
	)
}

// NotifyApplicationAccepted notifies worker about application acceptance
func (nis *NotificationIntegrationService) NotifyApplicationAccepted(user *models.User, applicationType string) error {
	message := fmt.Sprintf("Your %s application has been accepted", applicationType)
	
	data := map[string]interface{}{
		"user_id":          user.ID,
		"application_type": applicationType,
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeApplicationAccepted,
		"Application Accepted",
		message,
		data,
	)
}

// NotifyApplicationRejected notifies worker about application rejection
func (nis *NotificationIntegrationService) NotifyApplicationRejected(user *models.User, applicationType string) error {
	message := fmt.Sprintf("Your %s application has been rejected", applicationType)
	
	data := map[string]interface{}{
		"user_id":          user.ID,
		"application_type": applicationType,
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeApplicationRejected,
		"Application Rejected",
		message,
		data,
	)
}

// NotifyNewAssignment notifies worker about new assignment
func (nis *NotificationIntegrationService) NotifyNewAssignment(worker *models.User, booking *models.Booking, service *models.Service) error {
	message := fmt.Sprintf("You have been assigned to booking #%s", booking.BookingReference)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"customer_id":  booking.UserID,
	}

	return nis.notificationService.CreateNotificationForUser(
		worker.ID,
		models.InAppNotificationTypeNewAssignment,
		"New Assignment",
		message,
		data,
	)
}

// NotifyPropertyCreated notifies admins about new property
func (nis *NotificationIntegrationService) NotifyPropertyCreated(property *models.Property, user *models.User) error {
	message := fmt.Sprintf("New property listed by %s", user.Name)
	
	data := map[string]interface{}{
		"property_id": property.ID,
		"user_name":   user.Name,
		"user_phone":  user.Phone,
		"property_type": string(property.PropertyType),
		"location":    fmt.Sprintf("%s, %s", property.City, property.State),
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePropertyCreated,
		"New Property Listed",
		message,
		data,
	)
}

// NotifyProjectCreated notifies admins about new project
func (nis *NotificationIntegrationService) NotifyProjectCreated(project *models.Project, user *models.User) error {
	message := fmt.Sprintf("New project created by user %s", user.Phone)
	
	data := map[string]interface{}{
		"project_id": project.ID,
		"user_name":  user.Name,
		"user_phone": user.Phone,
		"project_name": project.Title,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeProjectCreated,
		"New Project Created",
		message,
		data,
	)
}

// NotifyServiceAdded notifies all users about new service
func (nis *NotificationIntegrationService) NotifyServiceAdded(service *models.Service) error {
	message := fmt.Sprintf("New service '%s' is now available", service.Name)
	
	data := map[string]interface{}{
		"service_id":   service.ID,
		"service_name": service.Name,
		"category":     service.Category.Name,
	}

	// Get all users to notify them about new service
	// Note: In a real implementation, you might want to batch this or use a queue
	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeServiceAdded,
		"New Service Added",
		message,
		data,
	)
}

// NotifyQuoteProvided notifies user about quote
func (nis *NotificationIntegrationService) NotifyQuoteProvided(user *models.User, booking *models.Booking, quoteAmount float64) error {
	message := fmt.Sprintf("Admin provided a quote for your booking #%s - ₹%.2f", booking.BookingReference, quoteAmount)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"quote_amount": quoteAmount,
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeQuoteProvided,
		"Quote Provided",
		message,
		data,
	)
}

// NotifyConversationStarted notifies user about conversation start
func (nis *NotificationIntegrationService) NotifyConversationStarted(userID uint, otherUserName string, bookingID uint) error {
	message := fmt.Sprintf("Conversation started with %s", otherUserName)
	
	data := map[string]interface{}{
		"booking_id":      bookingID,
		"other_user_name": otherUserName,
	}

	return nis.notificationService.CreateNotificationForUser(
		userID,
		models.InAppNotificationTypeConversationStarted,
		"Conversation Started",
		message,
		data,
	)
}

// NotifyOTPRequested notifies user about OTP request
func (nis *NotificationIntegrationService) NotifyOTPRequested(user *models.User, phone string) error {
	message := fmt.Sprintf("OTP sent to your phone number %s", phone)
	
	data := map[string]interface{}{
		"user_id": user.ID,
		"phone":   phone,
		"action":  "otp_requested",
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeOTPRequested,
		"OTP Sent",
		message,
		data,
	)
}

// NotifyOTPVerified notifies user about successful OTP verification
func (nis *NotificationIntegrationService) NotifyOTPVerified(user *models.User, phone string) error {
	message := fmt.Sprintf("Phone number %s verified successfully", phone)
	
	data := map[string]interface{}{
		"user_id": user.ID,
		"phone":   phone,
		"action":  "otp_verified",
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeOTPVerified,
		"Phone Verified",
		message,
		data,
	)
}

// NotifyLoginSuccess notifies user about successful login
func (nis *NotificationIntegrationService) NotifyLoginSuccess(user *models.User, loginMethod string) error {
	message := fmt.Sprintf("Successfully logged in via %s", loginMethod)
	
	data := map[string]interface{}{
		"user_id":      user.ID,
		"login_method": loginMethod,
		"action":       "login_success",
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeLoginSuccess,
		"Login Successful",
		message,
		data,
	)
}

// NotifyLoginFailed notifies user about failed login attempt
func (nis *NotificationIntegrationService) NotifyLoginFailed(user *models.User, phone string, reason string) error {
	message := fmt.Sprintf("Failed login attempt for phone number %s. Reason: %s", phone, reason)
	
	data := map[string]interface{}{
		"user_id": user.ID,
		"phone":   phone,
		"reason":  reason,
		"action":  "login_failed",
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeLoginFailed,
		"Login Failed",
		message,
		data,
	)
}

// NotifyOTPRequestedToAdmin notifies admin about OTP request (for monitoring)
func (nis *NotificationIntegrationService) NotifyOTPRequestedToAdmin(user *models.User, phone string) error {
	message := fmt.Sprintf("OTP requested for phone number %s by user %s", phone, user.Name)
	
	data := map[string]interface{}{
		"user_id": user.ID,
		"user_name": user.Name,
		"phone":   phone,
		"action":  "otp_requested",
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeOTPRequested,
		"OTP Requested",
		message,
		data,
	)
}

// NotifyOTPVerifiedToAdmin notifies admin about OTP verification (for monitoring)
func (nis *NotificationIntegrationService) NotifyOTPVerifiedToAdmin(user *models.User, phone string) error {
	message := fmt.Sprintf("Phone number %s verified by user %s", phone, user.Name)
	
	data := map[string]interface{}{
		"user_id": user.ID,
		"user_name": user.Name,
		"phone":   phone,
		"action":  "otp_verified",
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeOTPVerified,
		"Phone Verified",
		message,
		data,
	)
}
