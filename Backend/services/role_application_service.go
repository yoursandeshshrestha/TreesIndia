package services

import (
	"errors"
	"strings"
	"sync"
	"time"
	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type RoleApplicationService struct {
	applicationRepo *repositories.RoleApplicationRepository
	documentService *UserDocumentService
	skillService    *UserSkillService
	userRepo        *repositories.UserRepository
	locationRepo    *repositories.LocationRepository
	emailService    *EmailService
	db              *gorm.DB
}

func NewRoleApplicationService(
	applicationRepo *repositories.RoleApplicationRepository,
	documentService *UserDocumentService,
	skillService *UserSkillService,
	userRepo *repositories.UserRepository,
) *RoleApplicationService {
	return &RoleApplicationService{
		applicationRepo: applicationRepo,
		documentService: documentService,
		skillService:    skillService,
		userRepo:        userRepo,
		locationRepo:    repositories.NewLocationRepository(),
		emailService:    NewEmailService(),
		db:              database.GetDB(),
	}
}

// FileUploadResult represents the result of a file upload
type FileUploadResult struct {
	Key string
	URL string
	Err error
}

// SubmitApplication submits a comprehensive role application for a user with optimized performance
func (s *RoleApplicationService) SubmitApplication(userID uint, req *models.CreateRoleApplicationRequest) (*models.RoleApplicationDetail, error) {
	// Use database transaction for atomicity and performance
	application, err := s.submitApplicationWithTransaction(userID, req)
	if err != nil {
		return nil, err
	}

	// Return detailed application information
	return s.buildApplicationDetail(application)
}

// SubmitBrokerApplication submits a simplified broker application for a user
func (s *RoleApplicationService) SubmitBrokerApplication(userID uint, req *models.CreateBrokerApplicationRequest) (*models.SimpleApplicationResponse, error) {
	// Use database transaction for atomicity and performance
	application, err := s.submitBrokerApplicationWithTransaction(userID, req)
	if err != nil {
		return nil, err
	}

	// Return simple application information
	return &models.SimpleApplicationResponse{
		ID:            application.ID,
		UserID:        application.UserID,
		RequestedRole: application.RequestedRole,
		Status:        application.Status,
		SubmittedAt:   application.SubmittedAt,
	}, nil
}

// SubmitWorkerApplication submits a worker application for a user
func (s *RoleApplicationService) SubmitWorkerApplication(userID uint, req *models.CreateWorkerApplicationRequest) (*models.SimpleApplicationResponse, error) {
	// Use database transaction for atomicity and performance
	application, err := s.submitWorkerApplicationWithTransaction(userID, req)
	if err != nil {
		return nil, err
	}

	// Return simple application information
	return &models.SimpleApplicationResponse{
		ID:            application.ID,
		UserID:        application.UserID,
		RequestedRole: application.RequestedRole,
		Status:        application.Status,
		SubmittedAt:   application.SubmittedAt,
	}, nil
}

// submitApplicationWithTransaction handles the application submission within a database transaction
func (s *RoleApplicationService) submitApplicationWithTransaction(userID uint, req *models.CreateRoleApplicationRequest) (*models.RoleApplication, error) {
	var application *models.RoleApplication
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already has an application
		hasApplication, err := s.checkUserHasApplicationWithTx(tx, userID)
		if err != nil {
			logrus.Errorf("Failed to check existing application: %v", err)
			return err
		}
		if hasApplication {
			return errors.New("user already has a pending application")
		}

		// Convert account_type to UserType
		var requestedRole models.UserType
		if req.AccountType == "worker" {
			requestedRole = models.UserTypeWorker
		} else if req.AccountType == "broker" {
			requestedRole = models.UserTypeBroker
		} else {
			return errors.New("invalid account type")
		}

		// Validate and update user profile with required information
		err = s.validateAndUpdateUserProfileWithTx(tx, userID, req.Email, req.Gender, req.Avatar)
		if err != nil {
			logrus.Errorf("Failed to validate/update user profile: %v", err)
			return err
		}

		// Create location for the user if provided and user doesn't have one
		if req.Location != nil {
			err = s.handleLocationWithTx(tx, userID, *req.Location)
			if err != nil {
				logrus.Errorf("Failed to handle location: %v", err)
				return err
			}
		}

		// Create the role application
		now := time.Now()
		application = &models.RoleApplication{
			UserID:        userID,
			RequestedRole: requestedRole,
			Status:        models.ApplicationStatusPending,
			SubmittedAt:   now,
		}

		err = tx.Create(application).Error
		if err != nil {
			logrus.Errorf("Failed to create application: %v", err)
			return err
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

	// Start async processing for non-critical operations
	go s.processApplicationAsync(userID, req, application)

	return application, nil
}

// submitBrokerApplicationWithTransaction handles the broker application submission within a database transaction
func (s *RoleApplicationService) submitBrokerApplicationWithTransaction(userID uint, req *models.CreateBrokerApplicationRequest) (*models.RoleApplication, error) {
	var application *models.RoleApplication
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already has an application
		hasApplication, err := s.checkUserHasApplicationWithTx(tx, userID)
		if err != nil {
			logrus.Errorf("Failed to check existing application: %v", err)
			return err
		}
		if hasApplication {
			return errors.New("user already has a pending application")
		}

		// Validate and update user profile with basic information
		err = s.validateAndUpdateUserProfileWithTx(tx, userID, req.Email, "", "")
		if err != nil {
			logrus.Errorf("Failed to validate/update user profile: %v", err)
			return err
		}

		// Create the role application
		now := time.Now()
		application = &models.RoleApplication{
			UserID:        userID,
			RequestedRole: models.UserTypeBroker,
			Status:        models.ApplicationStatusPending,
			SubmittedAt:   now,
		}

		err = tx.Create(application).Error
		if err != nil {
			logrus.Errorf("Failed to create application: %v", err)
			return err
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

	// Start async processing for non-critical operations
	go s.processBrokerApplicationAsync(userID, req, application)

	return application, nil
}

// submitWorkerApplicationWithTransaction handles the worker application submission within a database transaction
func (s *RoleApplicationService) submitWorkerApplicationWithTransaction(userID uint, req *models.CreateWorkerApplicationRequest) (*models.RoleApplication, error) {
	var application *models.RoleApplication
	
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already has an application
		hasApplication, err := s.checkUserHasApplicationWithTx(tx, userID)
		if err != nil {
			logrus.Errorf("Failed to check existing application: %v", err)
			return err
		}
		if hasApplication {
			return errors.New("user already has a pending application")
		}

		// Validate and update user profile with basic information
		err = s.validateAndUpdateUserProfileWithTx(tx, userID, req.Email, req.Gender, req.Avatar)
		if err != nil {
			logrus.Errorf("Failed to validate/update user profile: %v", err)
			return err
		}

		// Create the role application
		now := time.Now()
		application = &models.RoleApplication{
			UserID:        userID,
			RequestedRole: models.UserTypeWorker,
			Status:        models.ApplicationStatusPending,
			SubmittedAt:   now,
		}

		err = tx.Create(application).Error
		if err != nil {
			logrus.Errorf("Failed to create application: %v", err)
			return err
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

	// Create documents and skills synchronously to ensure they're saved
	s.createWorkerDocumentsIndividually(userID, req)
	
	// Create skills for the user (handle duplicates)
	if len(req.Skills) > 0 {
		s.createSkillsIndividually(userID, req.Skills)
	}

	// Start async processing for non-critical operations (email only)
	go s.sendWorkerApplicationEmailAsync(userID, application)

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

// handleLocationWithTx handles location creation within transaction (only creates if user doesn't have location)
func (s *RoleApplicationService) handleLocationWithTx(tx *gorm.DB, userID uint, locationReq models.CreateLocationRequest) error {
	// Check if user already has a location
	var existingLocation models.Location
	err := tx.Where("user_id = ?", userID).First(&existingLocation).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// No existing location, create new one
			location := &models.Location{
				UserID:     userID,
				City:       locationReq.City,
				State:      locationReq.State,
				Country:    locationReq.Country,
				Address:    locationReq.Address,
				PostalCode: locationReq.PostalCode,
				Latitude:   locationReq.Latitude,
				Longitude:  locationReq.Longitude,
				IsActive:   true,
			}
			return tx.Create(location).Error
		}
		return err
	}

	// User already has a location, use existing one (no update needed)
	logrus.Infof("User %d already has location, using existing location", userID)
	return nil
}

// validateAndUpdateUserProfileWithTx validates and updates user profile with required information
func (s *RoleApplicationService) validateAndUpdateUserProfileWithTx(tx *gorm.DB, userID uint, email *string, gender string, avatar string) error {
	// Get current user
	var user models.User
	if err := tx.First(&user, userID).Error; err != nil {
		return err
	}

	// Validate required profile information
	var missingFields []string

	// Check email
	if user.Email == nil || *user.Email == "" {
		if email == nil || *email == "" {
			missingFields = append(missingFields, "email")
		}
	}

	// Check gender
	if user.Gender == "" {
		if gender == "" {
			missingFields = append(missingFields, "gender")
		}
	}

	// Check avatar
	if user.Avatar == "" {
		if avatar == "" {
			missingFields = append(missingFields, "avatar")
		}
	}

	// Note: Location validation is handled separately in the application submission process
	// We don't validate location here because it can be provided in the request

	// If any required fields are missing, return error
	if len(missingFields) > 0 {
		errorMsg := "Missing required profile information: " + strings.Join(missingFields, ", ")
		return errors.New(errorMsg)
	}

	// Prepare updates
	updates := make(map[string]interface{})

	// Update email if provided and different from current
	if email != nil && *email != "" {
		// Check if email is already taken by another user
		var existingUser models.User
		if err := tx.Where("email = ? AND id != ?", *email, userID).First(&existingUser).Error; err == nil {
			return errors.New("email already exists")
		}
		updates["email"] = email
	}

	// Update gender if provided and different from current
	if gender != "" && user.Gender != gender {
		updates["gender"] = gender
	}

	// Update avatar if provided and user doesn't have one
	if avatar != "" && user.Avatar == "" {
		updates["avatar"] = avatar
	}

	// Only update if there are changes
	if len(updates) > 0 {
		return tx.Model(&user).Updates(updates).Error
	}

	return nil
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

// processApplicationAsync handles non-critical operations asynchronously
func (s *RoleApplicationService) processApplicationAsync(userID uint, req *models.CreateRoleApplicationRequest, application *models.RoleApplication) {
	// Create documents for the user (handle duplicates)
	s.createDocumentsIndividually(userID, req)

	// Create skills for the user (handle duplicates)
	if len(req.Skills) > 0 {
		s.createSkillsIndividually(userID, req.Skills)
	}

	// Send email notification to user
	s.sendApplicationEmailAsync(userID, application)
}

// createDocumentsIndividually creates documents one by one (fallback method)
func (s *RoleApplicationService) createDocumentsIndividually(userID uint, req *models.CreateRoleApplicationRequest) {
	documents := []struct {
		docType models.DocumentType
		fileURL string
	}{
		{models.DocumentTypeAadhaarCardFront, req.AadhaarCardFront},
		{models.DocumentTypeAadhaarCardBack, req.AadhaarCardBack},
		{models.DocumentTypePANCardFront, req.PanCardFront},
		{models.DocumentTypePANCardBack, req.PanCardBack},
	}

	// Add avatar as profile photo document if provided
	if req.Avatar != "" {
		documents = append(documents, struct {
			docType models.DocumentType
			fileURL string
		}{models.DocumentTypeProfilePhoto, req.Avatar})
	}

	// Use goroutines for parallel document creation
	var wg sync.WaitGroup
	for _, doc := range documents {
		wg.Add(1)
		go func(docType models.DocumentType, fileURL string) {
			defer wg.Done()
			
			docReq := &models.CreateUserDocumentRequest{
				DocumentType: docType,
				FileURL:      fileURL,
				FileName:     "uploaded_document",
				FileSize:     0,
			}
			_, err := s.documentService.UploadDocument(userID, docReq)
			if err != nil {
				// If document already exists, continue (don't fail the application)
				if strings.Contains(err.Error(), "already exists") {
					logrus.Infof("Document of type %s already exists for user %d, skipping", docType, userID)
					return
				}
				logrus.Errorf("Failed to create document: %v", err)
			}
		}(doc.docType, doc.fileURL)
	}
	wg.Wait()
}

// createWorkerDocumentsIndividually creates documents for worker applications one by one
func (s *RoleApplicationService) createWorkerDocumentsIndividually(userID uint, req *models.CreateWorkerApplicationRequest) {
	documents := []struct {
		docType models.DocumentType
		fileURL string
	}{
		{models.DocumentTypeAadhaarCardFront, req.AadhaarCardFront},
		{models.DocumentTypeAadhaarCardBack, req.AadhaarCardBack},
		{models.DocumentTypePANCardFront, req.PanCardFront},
		{models.DocumentTypePANCardBack, req.PanCardBack},
	}

	// Add avatar as profile photo document if provided
	if req.Avatar != "" {
		documents = append(documents, struct {
			docType models.DocumentType
			fileURL string
		}{models.DocumentTypeProfilePhoto, req.Avatar})
	}

	// Create documents sequentially to ensure all are saved
	for _, doc := range documents {
		if doc.fileURL == "" {
			logrus.Warnf("Empty file URL for document type %s, skipping", doc.docType)
			continue
		}
		
		docReq := &models.CreateUserDocumentRequest{
			DocumentType: doc.docType,
			FileURL:      doc.fileURL,
			FileName:     "uploaded_document",
			FileSize:     0,
		}
		
		_, err := s.documentService.UploadDocument(userID, docReq)
		if err != nil {
			// If document already exists, continue (don't fail the application)
			if strings.Contains(err.Error(), "already exists") {
				logrus.Infof("Document of type %s already exists for user %d, skipping", doc.docType, userID)
				continue
			}
			logrus.Errorf("Failed to create document of type %s for user %d: %v", doc.docType, userID, err)
			// Continue with other documents even if one fails
		} else {
			logrus.Infof("Successfully created document of type %s for user %d", doc.docType, userID)
		}
	}
	
	// Log summary of documents created
	allDocs, err := s.documentService.GetUserDocuments(userID)
	if err != nil {
		logrus.Errorf("Failed to get user documents for summary: %v", err)
	} else {
		logrus.Infof("User %d now has %d total documents", userID, len(allDocs))
		for _, doc := range allDocs {
			logrus.Infof("  - Document ID %d: Type %s, URL: %s", doc.ID, doc.DocumentType, doc.FileURL)
		}
	}
}

// createSkillsIndividually creates skills one by one (fallback method)
func (s *RoleApplicationService) createSkillsIndividually(userID uint, skills []string) {
	// Use goroutines for parallel skill creation
	var wg sync.WaitGroup
	for _, skillName := range skills {
		wg.Add(1)
		go func(skill string) {
			defer wg.Done()
			
			skillReq := &models.CreateUserSkillRequest{
				Skill: skill,
				Level: models.SkillLevelBeginner, // Default level
			}
			_, err := s.skillService.AddSkill(userID, skillReq)
			if err != nil {
				// If skill already exists, continue (don't fail the application)
				if strings.Contains(err.Error(), "already exists") {
					logrus.Infof("Skill %s already exists for user %d, skipping", skill, userID)
					return
				}
				logrus.Errorf("Failed to create skill: %v", err)
			}
		}(skillName)
	}
	wg.Wait()
}

// sendApplicationEmailAsync sends application email asynchronously
func (s *RoleApplicationService) sendApplicationEmailAsync(userID uint, application *models.RoleApplication) {
	user := &models.User{}
	err := s.userRepo.FindByID(user, userID)
	if err != nil {
		logrus.Errorf("Failed to get user for email: %v", err)
		return
	}

	if user.Email != nil {
		if err := s.emailService.SendApplicationSubmittedEmail(user, application); err != nil {
			logrus.Errorf("Failed to send application submitted email: %v", err)
		}
	}
}

// sendBrokerApplicationEmailAsync sends broker application email asynchronously
func (s *RoleApplicationService) sendBrokerApplicationEmailAsync(userID uint, application *models.RoleApplication) {
	user := &models.User{}
	err := s.userRepo.FindByID(user, userID)
	if err != nil {
		logrus.Errorf("Failed to get user for email: %v", err)
		return
	}

	if user.Email != nil {
		if err := s.emailService.SendBrokerApplicationSubmittedEmail(user, application); err != nil {
			logrus.Errorf("Failed to send broker application submitted email: %v", err)
		}
	}
}

// sendWorkerApplicationEmailAsync sends worker application email asynchronously
func (s *RoleApplicationService) sendWorkerApplicationEmailAsync(userID uint, application *models.RoleApplication) {
	user := &models.User{}
	err := s.userRepo.FindByID(user, userID)
	if err != nil {
		logrus.Errorf("Failed to get user for email: %v", err)
		return
	}

	if user.Email != nil {
		if err := s.emailService.SendWorkerApplicationSubmittedEmail(user, application); err != nil {
			logrus.Errorf("Failed to send worker application submitted email: %v", err)
		}
	}
}

// GetUserApplication gets the role application for a user
func (s *RoleApplicationService) GetUserApplication(userID uint) (*models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationByUserID(userID)
}

// GetUserApplicationWithDetails gets the role application for a user with detailed information
func (s *RoleApplicationService) GetUserApplicationWithDetails(userID uint) (interface{}, error) {
	application, err := s.applicationRepo.GetApplicationByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Return role-specific detailed information
	switch application.RequestedRole {
	case models.UserTypeWorker:
		return s.buildWorkerApplicationDetail(application)
	case models.UserTypeBroker:
		return s.buildBrokerApplicationDetail(application)
	default:
		return s.buildDetailedApplicationDetail(application)
	}
}

// GetApplicationWithDetails gets a role application by ID with detailed information
func (s *RoleApplicationService) GetApplicationWithDetails(id uint) (interface{}, error) {
	application, err := s.applicationRepo.GetApplicationByID(id)
	if err != nil {
		return nil, err
	}

	// Return role-specific detailed information
	switch application.RequestedRole {
	case models.UserTypeWorker:
		return s.buildWorkerApplicationDetail(application)
	case models.UserTypeBroker:
		return s.buildBrokerApplicationDetail(application)
	default:
		return s.buildDetailedApplicationDetail(application)
	}
}

// buildApplicationDetail builds a simple application response for submission
func (s *RoleApplicationService) buildApplicationDetail(app *models.RoleApplication) (*models.RoleApplicationDetail, error) {
	detail := &models.RoleApplicationDetail{
		RoleApplication: app,
	}

	return detail, nil
}

// buildDetailedApplicationDetail builds a detailed application response with user, location, documents, and skills
func (s *RoleApplicationService) buildDetailedApplicationDetail(app *models.RoleApplication) (*models.RoleApplicationDetail, error) {
	detail := &models.RoleApplicationDetail{
		RoleApplication: app,
	}

	// Get user details
	user := &models.User{}
	err := s.userRepo.FindByID(user, app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get user details for application %d: %v", app.ID, err)
		return nil, err
	}

	detail.User = &models.UserDetail{
		ID:                    user.ID,
		Name:                  user.Name,
		Email:                 user.Email,
		Phone:                 user.Phone,
		UserType:              user.UserType,
		Avatar:                user.Avatar,
		IsActive:              user.IsActive,
		RoleApplicationStatus: user.RoleApplicationStatus,
		ApplicationDate:       user.ApplicationDate,
		ApprovalDate:          user.ApprovalDate,
		CreatedAt:             user.CreatedAt,
	}

	// Get location
	location := &models.Location{}
	err = s.locationRepo.FindByUserID(location, app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get location for application %d: %v", app.ID, err)
	} else {
		detail.Location = location
	}

	// Get documents
	documents, err := s.documentService.GetUserDocuments(app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get documents for application %d: %v", app.ID, err)
	} else {
		detail.Documents = documents
		
		// Check if user has profile photo document and update avatar if missing
		if user.Avatar == "" {
			for _, doc := range documents {
				if doc.DocumentType == models.DocumentTypeProfilePhoto {
					// Update user avatar in database
					if err := s.db.Model(&models.User{}).Where("id = ?", user.ID).Update("avatar", doc.FileURL).Error; err != nil {
						logrus.Errorf("Failed to update user avatar: %v", err)
					} else {
						// Update the user object for this response
						user.Avatar = doc.FileURL
						detail.User.Avatar = doc.FileURL
					}
					break
				}
			}
		}
	}

	// Get skills
	skills, err := s.skillService.GetUserSkills(app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get skills for application %d: %v", app.ID, err)
	} else {
		detail.Skills = skills
	}

	return detail, nil
}

// buildWorkerApplicationDetail builds a detailed worker application response
func (s *RoleApplicationService) buildWorkerApplicationDetail(app *models.RoleApplication) (*models.WorkerApplicationDetail, error) {
	detail := &models.WorkerApplicationDetail{
		RoleApplication: app,
	}

	// Get user details
	user := &models.User{}
	err := s.userRepo.FindByID(user, app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get user details for application %d: %v", app.ID, err)
		return nil, err
	}

	detail.User = &models.UserDetail{
		ID:                    user.ID,
		Name:                  user.Name,
		Email:                 user.Email,
		Phone:                 user.Phone,
		UserType:              user.UserType,
		Avatar:                user.Avatar,
		IsActive:              user.IsActive,
		RoleApplicationStatus: user.RoleApplicationStatus,
		ApplicationDate:       user.ApplicationDate,
		ApprovalDate:          user.ApprovalDate,
		CreatedAt:             user.CreatedAt,
	}

	// Get location
	location := &models.Location{}
	err = s.locationRepo.FindByUserID(location, app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get location for application %d: %v", app.ID, err)
	} else {
		detail.Location = location
	}

	// Get documents
	documents, err := s.documentService.GetUserDocuments(app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get documents for application %d: %v", app.ID, err)
	} else {
		detail.Documents = documents
	}

	// Get skills
	skills, err := s.skillService.GetUserSkills(app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get skills for application %d: %v", app.ID, err)
	} else {
		detail.Skills = skills
	}

	return detail, nil
}

// buildBrokerApplicationDetail builds a detailed broker application response
func (s *RoleApplicationService) buildBrokerApplicationDetail(app *models.RoleApplication) (*models.BrokerApplicationDetail, error) {
	detail := &models.BrokerApplicationDetail{
		RoleApplication: app,
	}

	// Get user details
	user := &models.User{}
	err := s.userRepo.FindByID(user, app.UserID)
	if err != nil {
		logrus.Errorf("Failed to get user details for application %d: %v", app.ID, err)
		return nil, err
	}

	detail.User = &models.UserDetail{
		ID:                    user.ID,
		Name:                  user.Name,
		Email:                 user.Email,
		Phone:                 user.Phone,
		UserType:              user.UserType,
		Avatar:                user.Avatar,
		IsActive:              user.IsActive,
		RoleApplicationStatus: user.RoleApplicationStatus,
		ApplicationDate:       user.ApplicationDate,
		ApprovalDate:          user.ApprovalDate,
		CreatedAt:             user.CreatedAt,
	}

	// Get broker details
	broker := &models.Broker{}
	err = s.db.Where("id IN (SELECT role_id FROM user_roles WHERE user_id = ? AND role_type = 'broker')", app.UserID).First(broker).Error
	if err != nil {
		logrus.Errorf("Failed to get broker details for application %d: %v", app.ID, err)
	} else {
		detail.Broker = broker
	}

	return detail, nil
}

// GetApplication gets a role application by ID
func (s *RoleApplicationService) GetApplication(id uint) (*models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationByID(id)
}

// UpdateApplication updates a role application (admin only)
func (s *RoleApplicationService) UpdateApplication(id uint, adminID uint, req *models.UpdateRoleApplicationRequest) (*models.RoleApplication, error) {
	application, err := s.applicationRepo.GetApplicationByID(id)
	if err != nil {
		return nil, err
	}

	application.Status = req.Status
	application.AdminNotes = req.AdminNotes
	application.ReviewedBy = &adminID
	now := time.Now()
	application.ReviewedAt = &now

	err = s.applicationRepo.UpdateApplication(application)
	if err != nil {
		logrus.Errorf("Failed to update application: %v", err)
		return nil, err
	}

	// Handle approval/rejection in a transaction
	err = s.db.Transaction(func(tx *gorm.DB) error {
		if req.Status == models.ApplicationStatusApproved {
			user := &models.User{}
			err = s.userRepo.FindByID(user, application.UserID)
			if err != nil {
				logrus.Errorf("Failed to get user: %v", err)
				return err
			}

			// Update user's application status and user type
			user.RoleApplicationStatus = "approved"
			user.ApprovalDate = &now
			user.UserType = application.RequestedRole // Change user type to the approved role
			err = s.userRepo.Update(user)
			if err != nil {
				logrus.Errorf("Failed to update user application status: %v", err)
				return err
			}

			// Create role-specific entry based on the requested role
			err = s.createRoleEntry(tx, application.UserID, application.RequestedRole)
			if err != nil {
				logrus.Errorf("Failed to create role entry: %v", err)
				return err
			}

			// Send approval email notification
			if user.Email != nil {
				go func() {
					if err := s.emailService.SendApplicationApprovedEmail(user, application); err != nil {
						logrus.Errorf("Failed to send application approved email: %v", err)
					}
				}()
			}
		} else if req.Status == models.ApplicationStatusRejected {
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

			// Send rejection email notification
			if user.Email != nil {
				go func() {
					if err := s.emailService.SendApplicationRejectedEmail(user, application); err != nil {
						logrus.Errorf("Failed to send application rejected email: %v", err)
					}
				}()
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return application, nil
}

// createRoleEntry creates a role-specific entry in the appropriate table and links it via UserRole
func (s *RoleApplicationService) createRoleEntry(tx *gorm.DB, userID uint, roleType models.UserType) error {
	// Deactivate any existing user roles for this user
	err := tx.Model(&models.UserRole{}).Where("user_id = ?", userID).Update("is_active", false).Error
	if err != nil {
		logrus.Errorf("Failed to deactivate existing user roles for user %d: %v", userID, err)
		return err
	}
	switch roleType {
	case models.UserTypeWorker:
		// Create worker entry
		worker := &models.Worker{}
		if err := tx.Create(worker).Error; err != nil {
			return err
		}

		// Create UserRole entry
		userRole := &models.UserRole{
			UserID:   userID,
			RoleType: "worker",
			RoleID:   worker.ID,
			IsActive: true,
		}
		return tx.Create(userRole).Error

	case models.UserTypeBroker:
		// Create broker entry
		broker := &models.Broker{}
		if err := tx.Create(broker).Error; err != nil {
			return err
		}

		// Create UserRole entry
		userRole := &models.UserRole{
			UserID:   userID,
			RoleType: "broker",
			RoleID:   broker.ID,
			IsActive: true,
		}
		return tx.Create(userRole).Error

	default:
		return errors.New("unsupported role type")
	}
}

// GetPendingApplications gets all pending applications
func (s *RoleApplicationService) GetPendingApplications() ([]models.RoleApplication, error) {
	return s.applicationRepo.GetPendingApplications()
}

// GetApplicationsByStatus gets applications by status
func (s *RoleApplicationService) GetApplicationsByStatus(status models.ApplicationStatus) ([]models.RoleApplication, error) {
	return s.applicationRepo.GetApplicationsByStatus(status)
}

// GetApplicationsByStatusWithDetails gets applications by status with detailed information
func (s *RoleApplicationService) GetApplicationsByStatusWithDetails(status models.ApplicationStatus) ([]models.RoleApplication, error) {
	applications, err := s.applicationRepo.GetApplicationsByStatus(status)
	if err != nil {
		return nil, err
	}

	return applications, nil
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
			if app.RequestedRole == models.UserTypeWorker {
				filteredApplications = append(filteredApplications, app)
			}
		case "broker":
			if app.RequestedRole == models.UserTypeBroker {
				filteredApplications = append(filteredApplications, app)
			}
		}
	}

	return filteredApplications, nil
}

// GetAllApplicationsWithDetails gets all applications with detailed information
func (s *RoleApplicationService) GetAllApplicationsWithDetails() ([]*models.RoleApplicationDetail, error) {
	// Get all applications
	applications, err := s.applicationRepo.GetAllApplications()
	if err != nil {
		return nil, err
	}

	var detailedApplications []*models.RoleApplicationDetail

	for _, app := range applications {
		detail := &models.RoleApplicationDetail{
			RoleApplication: &app,
		}

		// Get user details
		user := &models.User{}
		err = s.userRepo.FindByID(user, app.UserID)
		if err != nil {
			logrus.Errorf("Failed to get user details for application %d: %v", app.ID, err)
			continue
		}

		detail.User = &models.UserDetail{
			ID:                    user.ID,
			Name:                  user.Name,
			Email:                 user.Email,
			Phone:                 user.Phone,
			UserType:              user.UserType,
			Avatar:                user.Avatar,
			IsActive:              user.IsActive,
			
			RoleApplicationStatus: user.RoleApplicationStatus,
			ApplicationDate:       user.ApplicationDate,
			ApprovalDate:          user.ApprovalDate,
			CreatedAt:             user.CreatedAt,
		}

		// Get location
		location := &models.Location{}
		err = s.locationRepo.FindByUserID(location, app.UserID)
		if err != nil {
			logrus.Errorf("Failed to get location for application %d: %v", app.ID, err)
		} else {
			detail.Location = location
		}

		// Get documents
		documents, err := s.documentService.GetUserDocuments(app.UserID)
		if err != nil {
			logrus.Errorf("Failed to get documents for application %d: %v", app.ID, err)
		} else {
			detail.Documents = documents
		}

		// Get skills
		skills, err := s.skillService.GetUserSkills(app.UserID)
		if err != nil {
			logrus.Errorf("Failed to get skills for application %d: %v", app.ID, err)
		} else {
			detail.Skills = skills
		}

		detailedApplications = append(detailedApplications, detail)
	}

	return detailedApplications, nil
}

// DeleteApplication deletes a role application
func (s *RoleApplicationService) DeleteApplication(id uint) error {
	return s.applicationRepo.DeleteApplication(id)
}

// processBrokerApplicationAsync handles non-critical operations for broker applications asynchronously
func (s *RoleApplicationService) processBrokerApplicationAsync(userID uint, req *models.CreateBrokerApplicationRequest, application *models.RoleApplication) {
	// Create broker record with license and agency information
	s.createBrokerRecord(userID, req)
	
	// Send email notification to user
	s.sendBrokerApplicationEmailAsync(userID, application)
}

// createBrokerRecord creates a broker record with license and agency information
func (s *RoleApplicationService) createBrokerRecord(userID uint, req *models.CreateBrokerApplicationRequest) {
	broker := &models.Broker{
		License: req.BrokerLicense,
		Agency:  req.BrokerAgency,
	}
	
	err := s.db.Create(broker).Error
	if err != nil {
		logrus.Errorf("Failed to create broker record for user %d: %v", userID, err)
		return
	}
	
	// Create UserRole entry to link user with broker
	userRole := &models.UserRole{
		UserID:   userID,
		RoleType: "broker",
		RoleID:   broker.ID,
		IsActive: true,
	}
	
	err = s.db.Create(userRole).Error
	if err != nil {
		logrus.Errorf("Failed to create user role for broker user %d: %v", userID, err)
		return
	}
	
	logrus.Infof("Successfully created broker record for user %d with license %s and agency %s", userID, req.BrokerLicense, req.BrokerAgency)
}
