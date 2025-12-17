package services

import (
	"encoding/json"
	"fmt"
	"strings"
	"treesindia/models"

	"github.com/sirupsen/logrus"
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
	message := fmt.Sprintf("Worker %s has been assigned to your booking", worker.Name)
	
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

// NotifyWorkerAssignedToWork notifies worker about new assignment
func (nis *NotificationIntegrationService) NotifyWorkerAssignedToWork(booking *models.Booking, worker *models.User, service *models.Service) error {
	// Parse and format address
	addressStr := "Unknown address"
	var addressObj models.BookingAddress
	if booking.Address != nil && *booking.Address != "" {
		// Try to parse the address JSON
		err := json.Unmarshal([]byte(*booking.Address), &addressObj)
		if err == nil {
			// Format address nicely
			addressParts := []string{}
			if addressObj.HouseNumber != "" {
				addressParts = append(addressParts, addressObj.HouseNumber)
			}
			if addressObj.Address != "" {
				addressParts = append(addressParts, addressObj.Address)
			}
			if addressObj.Landmark != "" {
				addressParts = append(addressParts, addressObj.Landmark)
			}
			if addressObj.City != "" {
				addressParts = append(addressParts, addressObj.City)
			}
			if addressObj.State != "" {
				addressParts = append(addressParts, addressObj.State)
			}
			if addressObj.PostalCode != "" {
				addressParts = append(addressParts, addressObj.PostalCode)
			}
			
			if len(addressParts) > 0 {
				addressStr = strings.Join(addressParts, ", ")
			} else if addressObj.Name != "" {
				addressStr = addressObj.Name
			}
		} else {
			// If parsing fails, use the raw string
			addressStr = *booking.Address
		}
	}
	
	scheduledInfo := ""
	if booking.ScheduledDate != nil {
		scheduledInfo = fmt.Sprintf(" on %s", booking.ScheduledDate.Format("Jan 2, 2006"))
		if booking.ScheduledTime != nil {
			scheduledInfo += fmt.Sprintf(" at %s", booking.ScheduledTime.Format("3:04 PM"))
		}
	}
	
	message := fmt.Sprintf("You have been assigned to a new %s booking%s at %s", service.Name, scheduledInfo, addressStr)
	
	data := map[string]interface{}{
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"address":      addressStr,
		"user_id":      booking.UserID,
	}
	
	// Include parsed address object in data for frontend use
	if booking.Address != nil && *booking.Address != "" {
		var addressObj models.BookingAddress
		if err := json.Unmarshal([]byte(*booking.Address), &addressObj); err == nil {
			data["address_object"] = addressObj
		}
	}
	
	if booking.ScheduledDate != nil {
		data["scheduled_date"] = booking.ScheduledDate
	}
	if booking.ScheduledTime != nil {
		data["scheduled_time"] = booking.ScheduledTime
	}

	return nis.notificationService.CreateNotificationForUser(
		worker.ID,
		models.InAppNotificationTypeNewAssignment,
		"New Assignment",
		message,
		data,
	)
}

// NotifyWorkerStarted notifies user and admin about work start
func (nis *NotificationIntegrationService) NotifyWorkerStarted(booking *models.Booking, worker *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Worker %s has started your %s service", worker.Name, service.Name)
	userData := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	err := nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerStarted,
		"Worker Started",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Worker %s started %s work", worker.Name, service.Name)
	adminData := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerStarted,
		"Worker Started",
		adminMessage,
		adminData,
	)
}

// NotifyWorkerCompleted notifies user and admin about work completion
func (nis *NotificationIntegrationService) NotifyWorkerCompleted(booking *models.Booking, worker *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Worker %s has completed your %s service", worker.Name, service.Name)
	userData := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	err := nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerCompleted,
		"Worker Completed",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Worker %s completed %s work for booking reference #%s", worker.Name, service.Name, booking.BookingReference)
	adminData := map[string]interface{}{
		"booking_id":   booking.ID,
		"worker_id":    worker.ID,
		"worker_name":  worker.Name,
		"service_name": service.Name,
		"booking_ref":  booking.BookingReference,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerCompleted,
		"Worker Completed",
		adminMessage,
		adminData,
	)
}

// NotifyBookingConfirmed notifies user about booking confirmation
func (nis *NotificationIntegrationService) NotifyBookingConfirmed(booking *models.Booking, user *models.User, service *models.Service) error {
	message := fmt.Sprintf("Your booking for %s has been confirmed for %s at %s", 
		service.Name, 
		booking.ScheduledDate.Format("Jan 2, 2006"),
		booking.ScheduledTime.Format("3:04 PM"))
	
	data := map[string]interface{}{
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"scheduled_date": booking.ScheduledDate,
		"scheduled_time": booking.ScheduledTime,
	}

	return nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeBookingConfirmed,
		"Booking Confirmed",
		message,
		data,
	)
}

// NotifyBookingCancelled notifies user and admin about booking cancellation
func (nis *NotificationIntegrationService) NotifyBookingCancelled(booking *models.Booking, user *models.User, service *models.Service, reason string) error {
	// Notify user
	userMessage := fmt.Sprintf("Your %s booking has been cancelled. Reason: %s", service.Name, reason)
	userData := map[string]interface{}{
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"reason":       reason,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeBookingCancelled,
		"Booking Cancelled",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Booking cancelled: %s by %s", service.Name, user.Phone)
	adminData := map[string]interface{}{
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"reason":       reason,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeBookingCancelled,
		"Booking Cancelled",
		adminMessage,
		adminData,
	)
}

// NotifyQuoteProvided notifies user and admin about quote provided
func (nis *NotificationIntegrationService) NotifyQuoteProvided(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Quote provided for your %s booking: ₹%.2f", service.Name, quote.Amount)
	userData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       quote.Amount,
		"valid_until":  quote.ValidUntil,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeQuoteProvided,
		"Quote Provided",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Quote provided: %s by %s for ₹%.2f", service.Name, user.Phone, quote.Amount)
	adminData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       quote.Amount,
		"valid_until":  quote.ValidUntil,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeQuoteProvided,
		"Quote Provided",
		adminMessage,
		adminData,
	)
}

// NotifyQuoteAccepted notifies user and admin about quote acceptance
func (nis *NotificationIntegrationService) NotifyQuoteAccepted(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Quote accepted for your %s booking. Payment required.", service.Name)
	userData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       quote.Amount,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeQuoteAccepted,
		"Quote Accepted",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Quote accepted: %s by %s for ₹%.2f", service.Name, user.Phone, quote.Amount)
	adminData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       quote.Amount,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeQuoteAccepted,
		"Quote Accepted",
		adminMessage,
		adminData,
	)
}

// NotifyQuoteRejected notifies user and admin about quote rejection
func (nis *NotificationIntegrationService) NotifyQuoteRejected(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Quote rejected for your %s booking", service.Name)
	userData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       quote.Amount,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeQuoteRejected,
		"Quote Rejected",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Quote rejected: %s by %s", service.Name, user.Phone)
	adminData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       quote.Amount,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeQuoteRejected,
		"Quote Rejected",
		adminMessage,
		adminData,
	)
}

// NotifyQuoteExpired notifies user and admin about quote expiration
func (nis *NotificationIntegrationService) NotifyQuoteExpired(quote *models.Quote, booking *models.Booking, user *models.User, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Quote expired for your %s booking", service.Name)
	userData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       quote.Amount,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeQuoteExpired,
		"Quote Expired",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Quote expired: %s by %s", service.Name, user.Phone)
	adminData := map[string]interface{}{
		"quote_id":     quote.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       quote.Amount,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeQuoteExpired,
		"Quote Expired",
		adminMessage,
		adminData,
	)
}

// NotifyAssignmentAccepted notifies admin and customer about assignment acceptance
// Note: Worker is NOT notified since they performed the action themselves
func (nis *NotificationIntegrationService) NotifyAssignmentAccepted(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) error {
	// Notify customer that worker accepted the assignment
	customerMessage := fmt.Sprintf("Worker %s has accepted your %s booking assignment", worker.Name, service.Name)
	customerData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"worker_name":   worker.Name,
		"worker_id":     worker.ID,
	}

	err := nis.notificationService.CreateNotificationForUser(
		booking.UserID,
		models.InAppNotificationTypeWorkerAssigned,
		"Worker Accepted Assignment",
		customerMessage,
		customerData,
	)
	if err != nil {
		logrus.Errorf("Failed to send assignment accepted notification to customer: %v", err)
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Worker %s accepted %s assignment", worker.Name, service.Name)
	adminData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"worker_name":   worker.Name,
		"worker_id":     worker.ID,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerAssigned,
		"Assignment Accepted",
		adminMessage,
		adminData,
	)
}

// NotifyAssignmentRejected notifies worker and admin about assignment rejection
func (nis *NotificationIntegrationService) NotifyAssignmentRejected(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) error {
	// Notify worker
	address := "Unknown address"
	if booking.Address != nil {
		address = *booking.Address
	}
	workerMessage := fmt.Sprintf("You rejected the assignment: %s at %s", service.Name, address)
	workerData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"address":       address,
	}

	err := nis.notificationService.CreateNotificationForUser(
		worker.ID,
		models.InAppNotificationTypeWorkerAssigned,
		"Assignment Rejected",
		workerMessage,
		workerData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Worker %s rejected %s assignment", worker.Name, service.Name)
	adminData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"worker_name":   worker.Name,
		"worker_id":     worker.ID,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerAssigned,
		"Assignment Rejected",
		adminMessage,
		adminData,
	)
}

// NotifyAssignmentCancelled notifies worker and admin about assignment cancellation
func (nis *NotificationIntegrationService) NotifyAssignmentCancelled(assignment *models.WorkerAssignment, booking *models.Booking, worker *models.User, service *models.Service) error {
	// Notify worker
	workerMessage := fmt.Sprintf("Assignment cancelled: %s booking has been cancelled", service.Name)
	workerData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
	}

	err := nis.notificationService.CreateNotificationForUser(
		worker.ID,
		models.InAppNotificationTypeWorkerAssigned,
		"Assignment Cancelled",
		workerMessage,
		workerData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Assignment cancelled: %s booking", service.Name)
	adminData := map[string]interface{}{
		"assignment_id": assignment.ID,
		"booking_id":    booking.ID,
		"booking_ref":   booking.BookingReference,
		"service_name":  service.Name,
		"worker_name":   worker.Name,
		"worker_id":     worker.ID,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerAssigned,
		"Assignment Cancelled",
		adminMessage,
		adminData,
	)
}

// NotifyPaymentFailed notifies user and admin about payment failure
func (nis *NotificationIntegrationService) NotifyPaymentFailed(payment *models.Payment, user *models.User, booking *models.Booking, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Payment failed for your %s booking. Please try again.", service.Name)
	userData := map[string]interface{}{
		"payment_id":   payment.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       payment.Amount,
		"reason":       "Payment failed",
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePaymentConfirmation,
		"Payment Failed",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Payment failed: ₹%.2f for %s booking", payment.Amount, service.Name)
	adminData := map[string]interface{}{
		"payment_id":   payment.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       payment.Amount,
		"reason":       "Payment failed",
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePaymentReceived,
		"Payment Failed",
		adminMessage,
		adminData,
	)
}

// NotifyPaymentRefunded notifies user and admin about payment refund
func (nis *NotificationIntegrationService) NotifyPaymentRefunded(payment *models.Payment, user *models.User, booking *models.Booking, service *models.Service) error {
	// Notify user
	userMessage := fmt.Sprintf("Payment refunded: ₹%.2f for your %s booking", payment.Amount, service.Name)
	userData := map[string]interface{}{
		"payment_id":   payment.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"amount":       payment.Amount,
		"refund_id":    payment.ID, // Using payment ID as refund ID
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePaymentConfirmation,
		"Payment Refunded",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Payment refunded: ₹%.2f for %s booking", payment.Amount, service.Name)
	adminData := map[string]interface{}{
		"payment_id":   payment.ID,
		"booking_id":   booking.ID,
		"booking_ref":  booking.BookingReference,
		"service_name": service.Name,
		"user_phone":   user.Phone,
		"user_name":    user.Name,
		"amount":       payment.Amount,
		"refund_id":    payment.ID,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePaymentReceived,
		"Payment Refunded",
		adminMessage,
		adminData,
	)
}

// NotifySubscriptionExpired notifies user and admin about subscription expiration
func (nis *NotificationIntegrationService) NotifySubscriptionExpired(user *models.User, subscription *models.UserSubscription) error {
	// Notify user
	userMessage := fmt.Sprintf("Your subscription has expired. Renew to continue using premium features.")
	userData := map[string]interface{}{
		"subscription_id": subscription.ID,
		"plan_id":        subscription.PlanID,
		"end_date":       subscription.EndDate,
		"status":         subscription.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeSubscriptionExpired,
		"Subscription Expired",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Subscription expired: User %s", user.Phone)
	adminData := map[string]interface{}{
		"subscription_id": subscription.ID,
		"user_id":        user.ID,
		"user_name":      user.Name,
		"user_phone":     user.Phone,
		"plan_id":        subscription.PlanID,
		"end_date":       subscription.EndDate,
		"status":         subscription.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeSubscriptionExpired,
		"Subscription Expired",
		adminMessage,
		adminData,
	)
}

// NotifySubscriptionExpiryWarning notifies user and admin about subscription expiry warning
func (nis *NotificationIntegrationService) NotifySubscriptionExpiryWarning(user *models.User, subscription *models.UserSubscription, daysLeft int) error {
	// Notify user
	userMessage := fmt.Sprintf("Your subscription expires in %d days. Renew now to avoid service interruption.", daysLeft)
	userData := map[string]interface{}{
		"subscription_id": subscription.ID,
		"plan_id":        subscription.PlanID,
		"end_date":       subscription.EndDate,
		"days_left":      daysLeft,
		"status":         subscription.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeSubscriptionExpiryWarning,
		"Subscription Expiry Warning",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Subscription expiry warning: User %s expires in %d days", user.Phone, daysLeft)
	adminData := map[string]interface{}{
		"subscription_id": subscription.ID,
		"user_id":        user.ID,
		"user_name":      user.Name,
		"user_phone":     user.Phone,
		"plan_id":        subscription.PlanID,
		"end_date":       subscription.EndDate,
		"days_left":      daysLeft,
		"status":         subscription.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeSubscriptionExpiryWarning,
		"Subscription Expiry Warning",
		adminMessage,
		adminData,
	)
}

// NotifyWorkerApplication notifies user and admin about worker application submission
func (nis *NotificationIntegrationService) NotifyWorkerApplication(user *models.User, application *models.RoleApplication) error {
	// Notify user
	userMessage := fmt.Sprintf("Your worker application has been submitted successfully")
	userData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeWorkerApplication,
		"Application Submitted",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("New worker application from %s", user.Name)
	adminData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"user_name":     user.Name,
		"user_phone":    user.Phone,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerApplication,
		"New Worker Application",
		adminMessage,
		adminData,
	)
}

// NotifyBrokerApplication notifies user and admin about broker application submission
func (nis *NotificationIntegrationService) NotifyBrokerApplication(user *models.User, application *models.RoleApplication) error {
	// Notify user
	userMessage := fmt.Sprintf("Your broker application has been submitted successfully")
	userData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeBrokerApplication,
		"Application Submitted",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("New broker application from %s", user.Name)
	adminData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"user_name":     user.Name,
		"user_phone":    user.Phone,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeBrokerApplication,
		"New Broker Application",
		adminMessage,
		adminData,
	)
}

// NotifyApplicationAccepted notifies user and admin about application acceptance
func (nis *NotificationIntegrationService) NotifyApplicationAccepted(user *models.User, application *models.RoleApplication) error {
	// Notify user
	userMessage := fmt.Sprintf("Your %s application has been accepted", application.RequestedRole)
	userData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeWorkerApplication,
		"Application Accepted",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("%s application accepted: %s", application.RequestedRole, user.Name)
	adminData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"user_name":     user.Name,
		"user_phone":    user.Phone,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerApplication,
		"Application Accepted",
		adminMessage,
		adminData,
	)
}

// NotifyApplicationRejected notifies user and admin about application rejection
func (nis *NotificationIntegrationService) NotifyApplicationRejected(user *models.User, application *models.RoleApplication) error {
	// Notify user
	userMessage := fmt.Sprintf("Your %s application has been rejected", application.RequestedRole)
	userData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
		"rejection_reason": "Application rejected",
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypeWorkerApplication,
		"Application Rejected",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("%s application rejected: %s", application.RequestedRole, user.Name)
	adminData := map[string]interface{}{
		"application_id": application.ID,
		"user_id":       user.ID,
		"user_name":     user.Name,
		"user_phone":    user.Phone,
		"role_type":     application.RequestedRole,
		"status":        application.Status,
		"rejection_reason": "Application rejected",
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeWorkerApplication,
		"Application Rejected",
		adminMessage,
		adminData,
	)
}

// NotifyPropertyCreated notifies user and admin about property creation
func (nis *NotificationIntegrationService) NotifyPropertyCreated(user *models.User, property *models.Property) error {
	// Notify user
	userMessage := fmt.Sprintf("Your property has been listed successfully")
	userData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"address":    property.Address,
		"status":     property.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePropertyCreated,
		"Property Listed",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("New property listed by %s", user.Name)
	adminData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"user_name":  user.Name,
		"user_phone": user.Phone,
		"address":    property.Address,
		"status":     property.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePropertyCreated,
		"New Property Listed",
		adminMessage,
		adminData,
	)
}

// NotifyPropertyApproved notifies user and admin about property approval
func (nis *NotificationIntegrationService) NotifyPropertyApproved(user *models.User, property *models.Property) error {
	// Notify user
	userMessage := fmt.Sprintf("Your property listing has been approved")
	userData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"address":    property.Address,
		"status":     property.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePropertyCreated,
		"Property Approved",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Property approved: %s by %s", property.Address, user.Name)
	adminData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"user_name":  user.Name,
		"user_phone": user.Phone,
		"address":    property.Address,
		"status":     property.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePropertyCreated,
		"Property Approved",
		adminMessage,
		adminData,
	)
}

// NotifyPropertyExpiryWarning notifies user and admin about property expiry warning
func (nis *NotificationIntegrationService) NotifyPropertyExpiryWarning(user *models.User, property *models.Property, daysLeft int) error {
	// Notify user
	userMessage := fmt.Sprintf("Your property listing expires in %d days", daysLeft)
	userData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"address":    property.Address,
		"days_left":  daysLeft,
		"status":     property.Status,
	}

	err := nis.notificationService.CreateNotificationForUser(
		user.ID,
		models.InAppNotificationTypePropertyCreated,
		"Property Expiry Warning",
		userMessage,
		userData,
	)
	if err != nil {
		return err
	}

	// Notify admin
	adminMessage := fmt.Sprintf("Property expiry warning: %s by %s expires in %d days", property.Address, user.Name, daysLeft)
	adminData := map[string]interface{}{
		"property_id": property.ID,
		"user_id":    user.ID,
		"user_name":  user.Name,
		"user_phone": user.Phone,
		"address":    property.Address,
		"days_left":  daysLeft,
		"status":     property.Status,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypePropertyCreated,
		"Property Expiry Warning",
		adminMessage,
		adminData,
	)
}

// NotifyServiceAdded notifies user and admin about new service addition
func (nis *NotificationIntegrationService) NotifyServiceAdded(service *models.Service) error {
	// For service added, we notify all users (broadcast notification)
	// This would typically be handled by a different method that broadcasts to all users
	// For now, we'll just notify admins
	adminMessage := fmt.Sprintf("New service added: %s", service.Name)
	adminData := map[string]interface{}{
		"service_id":   service.ID,
		"service_name": service.Name,
		"category":     service.Category,
		"is_active":    service.IsActive,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeServiceAdded,
		"New Service Added",
		adminMessage,
		adminData,
	)
}

// NotifyServiceUpdated notifies user and admin about service update
func (nis *NotificationIntegrationService) NotifyServiceUpdated(service *models.Service) error {
	// For service updated, we notify all users (broadcast notification)
	// This would typically be handled by a different method that broadcasts to all users
	// For now, we'll just notify admins
	adminMessage := fmt.Sprintf("Service updated: %s", service.Name)
	adminData := map[string]interface{}{
		"service_id":   service.ID,
		"service_name": service.Name,
		"category":     service.Category,
		"is_active":    service.IsActive,
	}

	return nis.notificationService.CreateNotificationForAdmins(
		models.InAppNotificationTypeServiceUpdated,
		"Service Updated",
		adminMessage,
		adminData,
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