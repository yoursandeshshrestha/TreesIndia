package services

import (
	"errors"
	"time"
	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type RoleApplicationService struct {
	applicationRepo     *repositories.RoleApplicationRepository
	userRepo           *repositories.UserRepository
	subscriptionRepo   *repositories.UserSubscriptionRepository
	notificationService *InAppNotificationService
	db                 *gorm.DB
}

func NewRoleApplicationService(
	applicationRepo *repositories.RoleApplicationRepository,
	userRepo *repositories.UserRepository,
	notificationService *InAppNotificationService,
) *RoleApplicationService {
	return &RoleApplicationService{
		applicationRepo: applicationRepo,
		userRepo:        userRepo,
		subscriptionRepo: repositories.NewUserSubscriptionRepository(),
		notificationService: notificationService,
		db:              database.GetDB(),
	}
}

// hasActiveSubscription checks if a user has an active subscription
func (s *RoleApplicationService) hasActiveSubscription(userID uint) (bool, error) {
	hasActive, err := s.subscriptionRepo.HasActiveSubscription(userID)
	if err != nil {
		logrus.Errorf("Failed to check active subscription for user %d: %v", userID, err)
		return false, err
	}
	return hasActive, nil
}

// SubmitWorkerApplication submits a worker application for a user
func (s *RoleApplicationService) SubmitWorkerApplication(userID uint, workerData *models.Worker, userUpdates *models.User) (*models.RoleApplication, error) {
	var application *models.RoleApplication
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already has an application
		existingApplication, err := s.getUserApplicationWithTx(tx, userID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Errorf("Failed to check existing application: %v", err)
			return err
		}

		// Update user profile if provided
		if userUpdates != nil {
			updates := make(map[string]interface{})
			if userUpdates.Name != "" {
				updates["name"] = userUpdates.Name
			}
			if userUpdates.Email != nil && *userUpdates.Email != "" {
				// Check email uniqueness
				var existingUser models.User
				if err := tx.Where("email = ? AND id != ?", *userUpdates.Email, userID).First(&existingUser).Error; err == nil {
					return errors.New("email already exists")
				}
				updates["email"] = userUpdates.Email
			}
			if userUpdates.Avatar != "" {
				updates["avatar"] = userUpdates.Avatar
			}
			
			if len(updates) > 0 {
				err = tx.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
				if err != nil {
					logrus.Errorf("Failed to update user profile: %v", err)
					return err
				}
			}
		}

		now := time.Now()

		if existingApplication != nil {
			// Update existing application
			application = existingApplication
			application.Status = models.ApplicationStatusPending
			application.SubmittedAt = now

			err = tx.Save(application).Error
			if err != nil {
				logrus.Errorf("Failed to update application: %v", err)
				return err
			}

			// Update existing worker record
			var existingWorker models.Worker
			err = tx.Where("user_id = ?", userID).First(&existingWorker).Error
			if err != nil {
				logrus.Errorf("Failed to find existing worker record: %v", err)
				return err
			}

			// Update worker data
			existingWorker.Skills = workerData.Skills
			existingWorker.Experience = workerData.Experience
			existingWorker.BankingInfo = workerData.BankingInfo
			existingWorker.Documents = workerData.Documents
			existingWorker.RoleApplicationID = &application.ID

			err = tx.Save(&existingWorker).Error
			if err != nil {
				logrus.Errorf("Failed to update worker record: %v", err)
				return err
			}
		} else {
			// Create new application
			application = &models.RoleApplication{
				UserID:        userID,
				RequestedRole: "worker",
				Status:        models.ApplicationStatusPending,
				SubmittedAt:   now,
			}

			err = tx.Create(application).Error
			if err != nil {
				logrus.Errorf("Failed to create application: %v", err)
				return err
			}

			// Create worker record
			workerData.UserID = userID
			workerData.RoleApplicationID = &application.ID
			workerData.IsAvailable = false
			workerData.IsActive = false
			workerData.WorkerType = models.WorkerTypeNormal

			err = tx.Create(workerData).Error
			if err != nil {
				logrus.Errorf("Failed to create worker record: %v", err)
				return err
			}
		}

		// Check if user has active subscription for auto-approval
		hasActiveSubscription, err := s.hasActiveSubscription(userID)
		if err != nil {
			logrus.Errorf("Failed to check subscription status for auto-approval: %v", err)
			// Continue with normal flow if subscription check fails
		} else if hasActiveSubscription {
			// Auto-approve the application
			logrus.Infof("Auto-approving worker application for user %d due to active subscription", userID)
			application.Status = models.ApplicationStatusApproved
			application.ReviewedAt = &now
			// Note: ReviewedBy is left nil for auto-approval
			
			err = tx.Save(application).Error
			if err != nil {
				logrus.Errorf("Failed to save auto-approved application: %v", err)
				return err
			}
			
			// Activate the worker immediately
			updates := map[string]interface{}{
				"is_available": true,
				"is_active":    true,
			}
			err = tx.Model(&models.Worker{}).
				Where("role_application_id = ?", application.ID).
				Updates(updates).Error
			if err != nil {
				logrus.Errorf("Failed to activate worker record for auto-approval: %v", err)
				return err
			}
			
			// Update user's role and application status
			err = tx.Model(&models.User{}).
				Where("id = ?", userID).
				Updates(map[string]interface{}{
					"user_type": models.UserTypeWorker,
					"role_application_status": "approved",
					"approval_date": &now,
				}).Error
			if err != nil {
				logrus.Errorf("Failed to update user for auto-approval: %v", err)
				return err
			}
		}

		// Update user's application status
		err = s.updateUserApplicationStatusWithTx(tx, userID, &now)
		if err != nil {
			logrus.Errorf("Failed to update user application status: %v", err)
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Send notification to admins about new worker application
	var user models.User
	if err := s.db.First(&user, userID).Error; err == nil {
		go NotifyWorkerApplication(&user, application)
	}

	return application, nil
}

// SubmitBrokerApplication submits a broker application for a user
func (s *RoleApplicationService) SubmitBrokerApplication(userID uint, brokerData *models.Broker, userUpdates *models.User) (*models.RoleApplication, error) {
	var application *models.RoleApplication
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already has an application
		existingApplication, err := s.getUserApplicationWithTx(tx, userID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			logrus.Errorf("Failed to check existing application: %v", err)
			return err
		}

		// Update user profile if provided
		if userUpdates != nil {
			updates := make(map[string]interface{})
			if userUpdates.Name != "" {
				updates["name"] = userUpdates.Name
			}
			if userUpdates.Email != nil && *userUpdates.Email != "" {
				// Check email uniqueness
				var existingUser models.User
				if err := tx.Where("email = ? AND id != ?", *userUpdates.Email, userID).First(&existingUser).Error; err == nil {
					return errors.New("email already exists")
				}
				updates["email"] = userUpdates.Email
			}
			if userUpdates.Avatar != "" {
				updates["avatar"] = userUpdates.Avatar
			}
			
			if len(updates) > 0 {
				err = tx.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
				if err != nil {
					logrus.Errorf("Failed to update user profile: %v", err)
					return err
				}
			}
		}

		now := time.Now()

		if existingApplication != nil {
			// Update existing application
			application = existingApplication
			application.Status = models.ApplicationStatusPending
			application.SubmittedAt = now

			err = tx.Save(application).Error
			if err != nil {
				logrus.Errorf("Failed to update application: %v", err)
				return err
			}

			// Update existing broker record
			var existingBroker models.Broker
			err = tx.Where("user_id = ?", userID).First(&existingBroker).Error
			if err != nil {
				logrus.Errorf("Failed to find existing broker record: %v", err)
				return err
			}

			// Update broker data
			existingBroker.License = brokerData.License
			existingBroker.Agency = brokerData.Agency
			existingBroker.ContactInfo = brokerData.ContactInfo
			existingBroker.Address = brokerData.Address
			existingBroker.Documents = brokerData.Documents
			existingBroker.RoleApplicationID = &application.ID

			err = tx.Save(&existingBroker).Error
			if err != nil {
				logrus.Errorf("Failed to update broker record: %v", err)
				return err
			}
		} else {
			// Create new application
			application = &models.RoleApplication{
				UserID:        userID,
				RequestedRole: "broker",
				Status:        models.ApplicationStatusPending,
				SubmittedAt:   now,
			}

			err = tx.Create(application).Error
			if err != nil {
				logrus.Errorf("Failed to create application: %v", err)
				return err
			}

			// Create broker record
			brokerData.UserID = userID
			brokerData.RoleApplicationID = &application.ID
			brokerData.IsActive = false

			err = tx.Create(brokerData).Error
			if err != nil {
				logrus.Errorf("Failed to create broker record: %v", err)
				return err
			}
		}

		// Check if user has active subscription for auto-approval
		hasActiveSubscription, err := s.hasActiveSubscription(userID)
		if err != nil {
			logrus.Errorf("Failed to check subscription status for auto-approval: %v", err)
			// Continue with normal flow if subscription check fails
		} else if hasActiveSubscription {
			// Auto-approve the application
			logrus.Infof("Auto-approving broker application for user %d due to active subscription", userID)
			application.Status = models.ApplicationStatusApproved
			application.ReviewedAt = &now
			// Note: ReviewedBy is left nil for auto-approval
			
			err = tx.Save(application).Error
			if err != nil {
				logrus.Errorf("Failed to save auto-approved application: %v", err)
				return err
			}
			
			// Activate the broker immediately
			err = tx.Model(&models.Broker{}).
				Where("role_application_id = ?", application.ID).
				Updates(map[string]interface{}{
					"is_active": true,
				}).Error
			if err != nil {
				logrus.Errorf("Failed to activate broker record for auto-approval: %v", err)
				return err
			}
			
			// Update user's role and application status
			err = tx.Model(&models.User{}).
				Where("id = ?", userID).
				Updates(map[string]interface{}{
					"user_type": models.UserTypeBroker,
					"role_application_status": "approved",
					"approval_date": &now,
				}).Error
			if err != nil {
				logrus.Errorf("Failed to update user for auto-approval: %v", err)
				return err
			}
		}

		// Update user's application status
		err = s.updateUserApplicationStatusWithTx(tx, userID, &now)
		if err != nil {
			logrus.Errorf("Failed to update user application status: %v", err)
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Send notification to admins about new broker application
	var user models.User
	if err := s.db.First(&user, userID).Error; err == nil {
		go NotifyBrokerApplication(&user, application)
	}

	return application, nil
}

// checkUserHasApplicationWithTx checks if user has application within transaction
func (s *RoleApplicationService) checkUserHasApplicationWithTx(tx *gorm.DB, userID uint) (bool, error) {
	var count int64
	err := tx.Model(&models.RoleApplication{}).
		Where("user_id = ?", userID).
		Count(&count).Error
	return count > 0, err
}

// getUserApplicationWithTx gets user application within transaction
func (s *RoleApplicationService) getUserApplicationWithTx(tx *gorm.DB, userID uint) (*models.RoleApplication, error) {
	var application models.RoleApplication
	err := tx.Where("user_id = ?", userID).First(&application).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

// updateUserApplicationStatusWithTx updates user application status within transaction
func (s *RoleApplicationService) updateUserApplicationStatusWithTx(tx *gorm.DB, userID uint, now *time.Time) error {
	return tx.Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"role_application_status": "pending",
			"application_date":        now,
		}).Error
}

// GetUserApplication gets the role application for a user
func (s *RoleApplicationService) GetUserApplication(userID uint) (*models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationByUserID(userID)
}

// GetApplication gets a role application by ID
func (s *RoleApplicationService) GetApplication(id uint) (*models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationByID(id)
}

// UpdateApplication updates a role application (admin only)
func (s *RoleApplicationService) UpdateApplication(id uint, adminID uint, status models.ApplicationStatus, workerType *models.WorkerType) (*models.RoleApplication, error) {
	application, err := s.applicationRepo.GetApplicationByID(id)
	if err != nil {
		return nil, err
	}

	application.Status = status
	
	now := time.Now()
	application.ReviewedBy = &adminID
	application.ReviewedAt = &now

	err = s.applicationRepo.UpdateApplication(application)
	if err != nil {
		logrus.Errorf("Failed to update application: %v", err)
		return nil, err
	}

	// Handle approval/rejection in a transaction
	err = s.db.Transaction(func(tx *gorm.DB) error {
		if status == models.ApplicationStatusApproved {
			user := &models.User{}
			err = s.userRepo.FindByID(user, application.UserID)
			if err != nil {
				logrus.Errorf("Failed to get user: %v", err)
				return err
			}

			// Update user's application status and user type
			user.RoleApplicationStatus = "approved"
			user.ApprovalDate = &now
			if application.RequestedRole == "worker" {
				user.UserType = models.UserTypeWorker
				// Activate worker record with worker type
				updates := map[string]interface{}{
					"is_available": true,
					"is_active":    true,
				}
				// Set worker type if provided, otherwise keep existing
				if workerType != nil {
					updates["worker_type"] = *workerType
				}
				err = tx.Model(&models.Worker{}).
					Where("role_application_id = ?", application.ID).
					Updates(updates).Error
			} else if application.RequestedRole == "broker" {
				user.UserType = models.UserTypeBroker
				// Activate broker record
				err = tx.Model(&models.Broker{}).
					Where("role_application_id = ?", application.ID).
					Updates(map[string]interface{}{
						"is_active": true,
					}).Error
			}
			
			if err != nil {
				logrus.Errorf("Failed to activate worker/broker record: %v", err)
				return err
			}
			
			err = s.userRepo.Update(user)
			if err != nil {
				logrus.Errorf("Failed to update user application status: %v", err)
				return err
			}
		} else if status == models.ApplicationStatusRejected {
			// Update user's application status to rejected
			user := &models.User{}
			err = s.userRepo.FindByID(user, application.UserID)
			if err != nil {
				logrus.Errorf("Failed to get user: %v", err)
				return err
			}

			user.RoleApplicationStatus = "rejected"
			user.UserType = models.UserTypeNormal // Reset user type back to normal if rejected
			err = s.userRepo.Update(user)
			if err != nil {
				logrus.Errorf("Failed to update user application status: %v", err)
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Send in-app notification to user about application status
	if s.notificationService != nil {
		go s.sendApplicationStatusNotification(application, status)
	}

	return application, nil
}

// GetPendingApplications gets all pending applications
func (s *RoleApplicationService) GetPendingApplications() ([]models.RoleApplication, error) {
	return s.applicationRepo.GetPendingApplications()
}

// GetAllApplications gets all applications
func (s *RoleApplicationService) GetAllApplications() ([]models.RoleApplication, error) {
	return s.applicationRepo.GetAllApplications()
}

// GetApplicationsByStatus gets applications by status
func (s *RoleApplicationService) GetApplicationsByStatus(status models.ApplicationStatus) ([]models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationsByStatus(status)
}

// GetApplicationsByStatusAndRole gets applications by status and optional role type filter
func (s *RoleApplicationService) GetApplicationsByStatusAndRole(status models.ApplicationStatus, roleType string) ([]models.RoleApplication, error) {
	applications, err := s.applicationRepo.GetApplicationsByStatus(status)
	if err != nil {
		return nil, err
	}

	// If no role type filter, return all applications
	if roleType == "" {
		return applications, nil
	}

	// Filter applications by role type
	var filteredApplications []models.RoleApplication
	for _, app := range applications {
		switch roleType {
		case "worker":
			if app.RequestedRole == "worker" {
				filteredApplications = append(filteredApplications, app)
			}
		case "broker":
			if app.RequestedRole == "broker" {
				filteredApplications = append(filteredApplications, app)
			}
		}
	}

	return filteredApplications, nil
}

// GetApplicationsWithFilters gets applications with pagination and filters
func (s *RoleApplicationService) GetApplicationsWithFilters(page, limit int, search, status, roleType, dateFrom, dateTo string) ([]models.RoleApplication, int64, error) {
	return s.applicationRepo.GetApplicationsWithFilters(page, limit, search, status, roleType, dateFrom, dateTo)
}

// DeleteApplication deletes a role application
func (s *RoleApplicationService) DeleteApplication(id uint) error {
	return s.applicationRepo.DeleteApplication(id)
}

// Enhanced methods for better frontend consumption

// GetEnhancedApplicationsWithFilters gets applications with pagination and filters, returning enhanced data
func (s *RoleApplicationService) GetEnhancedApplicationsWithFilters(page, limit int, search, status, roleType, dateFrom, dateTo string) ([]models.EnhancedRoleApplication, int64, error) {
	applications, total, err := s.applicationRepo.GetApplicationsWithFilters(page, limit, search, status, roleType, dateFrom, dateTo)
	if err != nil {
		return nil, 0, err
	}

	// Convert to enhanced applications
	var enhancedApplications []models.EnhancedRoleApplication
	for _, app := range applications {
		enhanced := app.ConvertToEnhanced()
		enhancedApplications = append(enhancedApplications, *enhanced)
	}

	return enhancedApplications, total, nil
}

// GetEnhancedApplicationByID gets a single enhanced application by ID
func (s *RoleApplicationService) GetEnhancedApplicationByID(id uint) (*models.EnhancedRoleApplication, error) {
	application, err := s.applicationRepo.GetApplicationByID(id)
	if err != nil {
		return nil, err
	}

	enhanced := application.ConvertToEnhanced()
	return enhanced, nil
}

// GetEnhancedUserApplication gets the enhanced role application for a user
func (s *RoleApplicationService) GetEnhancedUserApplication(userID uint) (*models.EnhancedRoleApplication, error) {
	application, err := s.applicationRepo.GetApplicationByUserID(userID)
	if err != nil {
		return nil, err
	}

	// We need to preload the relationships for the user application
	// Let's get it with full preloads
	applicationWithPreloads, err := s.applicationRepo.GetApplicationByID(application.ID)
	if err != nil {
		return nil, err
	}

	enhanced := applicationWithPreloads.ConvertToEnhanced()
	return enhanced, nil
}

// GetEnhancedPendingApplications gets all pending applications with enhanced data
func (s *RoleApplicationService) GetEnhancedPendingApplications() ([]models.EnhancedRoleApplication, error) {
	applications, err := s.applicationRepo.GetPendingApplications()
	if err != nil {
		return nil, err
	}

	var enhancedApplications []models.EnhancedRoleApplication
	for _, app := range applications {
		enhanced := app.ConvertToEnhanced()
		enhancedApplications = append(enhancedApplications, *enhanced)
	}

	return enhancedApplications, nil
}

// GetEnhancedApplicationsByStatus gets applications by status with enhanced data
func (s *RoleApplicationService) GetEnhancedApplicationsByStatus(status models.ApplicationStatus) ([]models.EnhancedRoleApplication, error) {
	applications, err := s.applicationRepo.GetApplicationsByStatus(status)
	if err != nil {
		return nil, err
	}

	var enhancedApplications []models.EnhancedRoleApplication
	for _, app := range applications {
		enhanced := app.ConvertToEnhanced()
		enhancedApplications = append(enhancedApplications, *enhanced)
	}

	return enhancedApplications, nil
}

// sendApplicationStatusNotification sends in-app notification to user about application status
func (s *RoleApplicationService) sendApplicationStatusNotification(application *models.RoleApplication, status models.ApplicationStatus) {
	var notificationType models.InAppNotificationType
	var title, message string

	if status == models.ApplicationStatusApproved {
		if application.RequestedRole == "worker" {
			notificationType = models.InAppNotificationTypeApplicationAccepted
			title = "Worker Application Approved!"
			message = "Congratulations! Your worker application has been approved."
		} else if application.RequestedRole == "broker" {
			notificationType = models.InAppNotificationTypeBrokerApplicationStatus
			title = "Broker Application Approved!"
			message = "Congratulations! Your broker application has been approved. You can now list properties and manage real estate transactions."
		}
	} else if status == models.ApplicationStatusRejected {
		if application.RequestedRole == "worker" {
			notificationType = models.InAppNotificationTypeApplicationRejected
			title = "Worker Application Update"
			message = "Your worker application has been reviewed but unfortunately was not approved at this time. You can reapply after addressing any concerns."
		} else if application.RequestedRole == "broker" {
			notificationType = models.InAppNotificationTypeBrokerApplicationStatus
			title = "Broker Application Update"
			message = "Your broker application has been reviewed but unfortunately was not approved at this time. You can reapply after addressing any concerns."
		}
	}

	if notificationType != "" {
		data := map[string]interface{}{
			"application_id": application.ID,
			"requested_role": application.RequestedRole,
			"status":         string(status),
			"reviewed_at":    application.ReviewedAt,
		}

		err := s.notificationService.CreateNotificationForUser(
			application.UserID,
			notificationType,
			title,
			message,
			data,
		)

		if err != nil {
			logrus.Errorf("Failed to send application status notification to user %d: %v", application.UserID, err)
		} else {
			logrus.Infof("Sent application status notification to user %d for application %d", application.UserID, application.ID)
		}
	}
}
