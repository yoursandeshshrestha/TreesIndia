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
func (s *RoleApplicationService) SubmitBrokerApplication(userID uint, req *models.CreateBrokerApplicationRequest) (*models.RoleApplicationDetail, error) {
	// Use database transaction for atomicity and performance
	application, err := s.submitBrokerApplicationWithTransaction(userID, req)
	if err != nil {
		return nil, err
	}

	// Return detailed application information
	return s.buildApplicationDetail(application)
}

// SubmitWorkerApplication submits a worker application for a user
func (s *RoleApplicationService) SubmitWorkerApplication(userID uint, req *models.CreateWorkerApplicationRequest) (*models.RoleApplicationDetail, error) {
	// Use database transaction for atomicity and performance
	application, err := s.submitWorkerApplicationWithTransaction(userID, req)
	if err != nil {
		return nil, err
	}

	// Return detailed application information
	return s.buildApplicationDetail(application)
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

		// Validate and update user profile with broker information
		err = s.validateAndUpdateBrokerProfileWithTx(tx, userID, req)
		if err != nil {
			logrus.Errorf("Failed to validate/update user broker profile: %v", err)
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

	// Send email notification to user
	go s.sendBrokerApplicationEmailAsync(userID, application)

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

		// Validate and update user profile with worker information
		err = s.validateAndUpdateWorkerProfileWithTx(tx, userID, req)
		if err != nil {
			logrus.Errorf("Failed to validate/update user worker profile: %v", err)
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

	// Send email notification to user
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
				Latitude:   locationReq.Latitude,
				Longitude:  locationReq.Longitude,
				Address:    locationReq.Address,
				City:       locationReq.City,
				State:      locationReq.State,
				PostalCode: locationReq.PostalCode,
				Source:     locationReq.Source,
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

	// Check if user has location
	var location models.Location
	hasLocation := tx.Where("user_id = ?", userID).First(&location).Error == nil

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

	// Check location
	if !hasLocation {
		missingFields = append(missingFields, "location")
	}

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

// validateAndUpdateBrokerProfileWithTx validates and updates user profile with broker information
func (s *RoleApplicationService) validateAndUpdateBrokerProfileWithTx(tx *gorm.DB, userID uint, req *models.CreateBrokerApplicationRequest) error {
	// Get current user profile
	user := &models.User{}
	err := tx.Where("id = ?", userID).First(user).Error
	if err != nil {
		return err
	}

	// Check if user has required profile information
	if user.Email == nil || *user.Email == "" {
		if req.Email == nil || *req.Email == "" {
			return errors.New("email is required - please provide email in application or update your profile")
		}
	}

	if user.Name == "" {
		if req.Name == nil || *req.Name == "" {
			return errors.New("name is required - please provide name in application or update your profile")
		}
	}

	// Prepare updates map
	updates := map[string]interface{}{
		"broker_license": req.BrokerLicense,
		"broker_agency":  req.BrokerAgency,
	}

	// Only update email if provided and user doesn't have one
	if (user.Email == nil || *user.Email == "") && req.Email != nil && *req.Email != "" {
		updates["email"] = *req.Email
	}

	// Only update name if provided and user doesn't have one
	if user.Name == "" && req.Name != nil && *req.Name != "" {
		updates["name"] = *req.Name
	}

	return tx.Model(&models.User{}).
		Where("id = ?", userID).
		Updates(updates).Error
}

// validateAndUpdateWorkerProfileWithTx validates and updates user profile with worker information
func (s *RoleApplicationService) validateAndUpdateWorkerProfileWithTx(tx *gorm.DB, userID uint, req *models.CreateWorkerApplicationRequest) error {
	// Get current user profile
	user := &models.User{}
	err := tx.Where("id = ?", userID).First(user).Error
	if err != nil {
		return err
	}

	// Check if user has required profile information
	if user.Email == nil || *user.Email == "" {
		if req.Email == nil || *req.Email == "" {
			return errors.New("email is required - please provide email in application or update your profile")
		}
	}

	// Prepare updates map - only update email if provided and user doesn't have one
	updates := map[string]interface{}{}

	// Only update email if provided and user doesn't have one
	if (user.Email == nil || *user.Email == "") && req.Email != nil && *req.Email != "" {
		updates["email"] = *req.Email
	}

	// Only update gender if provided
	if req.Gender != "" {
		updates["gender"] = req.Gender
	}

	// Only update avatar if provided
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	// Update user profile if there are changes
	if len(updates) > 0 {
		return tx.Model(&models.User{}).
			Where("id = ?", userID).
			Updates(updates).Error
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
	s.createDocumentsAsync(userID, req)

	// Create skills for the user (handle duplicates)
	s.createSkillsAsync(userID, req.Skills)

	// Send email notification to user
	s.sendApplicationEmailAsync(userID, application)
}

// createDocumentsAsync creates documents asynchronously using batch processing
func (s *RoleApplicationService) createDocumentsAsync(userID uint, req *models.CreateRoleApplicationRequest) {
	// Prepare documents for batch creation
	documents := []models.UserDocument{
		{
			DocumentType: models.DocumentTypeAadhaarCard,
			FileURL:      req.AadhaarCardFront,
			FileName:     "aadhaar_card_front",
			FileSize:     0,
		},
		{
			DocumentType: models.DocumentTypeAadhaarCard,
			FileURL:      req.AadhaarCardBack,
			FileName:     "aadhaar_card_back",
			FileSize:     0,
		},
		{
			DocumentType: models.DocumentTypePANCard,
			FileURL:      req.PanCardFront,
			FileName:     "pan_card_front",
			FileSize:     0,
		},
		{
			DocumentType: models.DocumentTypePANCard,
			FileURL:      req.PanCardBack,
			FileName:     "pan_card_back",
			FileSize:     0,
		},
	}

	// Add avatar as profile photo document if provided
	if req.Avatar != "" {
		documents = append(documents, models.UserDocument{
			DocumentType: models.DocumentTypeProfilePhoto,
			FileURL:      req.Avatar,
			FileName:     "avatar",
			FileSize:     0,
		})
	}

	// Use batch processing service for better performance
	batchProcessor := NewParallelBatchProcessor()
	
	// Process documents in batch
	if err := batchProcessor.batchService.BatchCreateDocuments(userID, documents); err != nil {
		logrus.Errorf("Failed to create documents in batch: %v", err)
		// Fallback to individual creation if batch fails
		s.createDocumentsIndividually(userID, req)
	}
}

// createDocumentsIndividually creates documents one by one (fallback method)
func (s *RoleApplicationService) createDocumentsIndividually(userID uint, req *models.CreateRoleApplicationRequest) {
	documents := []struct {
		docType models.DocumentType
		fileURL string
	}{
		{models.DocumentTypeAadhaarCard, req.AadhaarCardFront},
		{models.DocumentTypeAadhaarCard, req.AadhaarCardBack},
		{models.DocumentTypePANCard, req.PanCardFront},
		{models.DocumentTypePANCard, req.PanCardBack},
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

// createSkillsAsync creates skills asynchronously using batch processing
func (s *RoleApplicationService) createSkillsAsync(userID uint, skills []string) {
	// Prepare skills for batch creation
	userSkills := make([]models.UserSkill, len(skills))
	for i, skillName := range skills {
		userSkills[i] = models.UserSkill{
			Skill: skillName,
			Level: models.SkillLevelBeginner, // Default level
		}
	}

	// Use batch processing service for better performance
	batchProcessor := NewParallelBatchProcessor()
	
	// Process skills in batch
	if err := batchProcessor.batchService.BatchCreateSkills(userID, userSkills); err != nil {
		logrus.Errorf("Failed to create skills in batch: %v", err)
		// Fallback to individual creation if batch fails
		s.createSkillsIndividually(userID, skills)
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
func (s *RoleApplicationService) GetUserApplicationWithDetails(userID uint) (*models.RoleApplicationDetail, error) {
	application, err := s.applicationRepo.GetApplicationByUserID(userID)
	if err != nil {
		return nil, err
	}

	return s.buildApplicationDetail(application)
}

// GetApplicationWithDetails gets a role application by ID with detailed information
func (s *RoleApplicationService) GetApplicationWithDetails(id uint) (*models.RoleApplicationDetail, error) {
	application, err := s.applicationRepo.GetApplicationByID(id)
	if err != nil {
		return nil, err
	}

	return s.buildApplicationDetail(application)
}

// buildApplicationDetail builds a detailed application response
func (s *RoleApplicationService) buildApplicationDetail(app *models.RoleApplication) (*models.RoleApplicationDetail, error) {
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
		IsVerified:            user.IsVerified,
		KYCStatus:             user.KYCStatus,
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

	// Update user's role if approved
	if req.Status == models.ApplicationStatusApproved {
		user := &models.User{}
		err = s.userRepo.FindByID(user, application.UserID)
		if err != nil {
			logrus.Errorf("Failed to get user: %v", err)
			return nil, err
		}

		user.UserType = application.RequestedRole
		user.RoleApplicationStatus = "approved"
		user.ApprovalDate = &now
		err = s.userRepo.Update(user)
		if err != nil {
			logrus.Errorf("Failed to update user role: %v", err)
			return nil, err
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
			return nil, err
		}

		user.RoleApplicationStatus = "rejected"
		err = s.userRepo.Update(user)
		if err != nil {
			logrus.Errorf("Failed to update user application status: %v", err)
			return nil, err
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

	return application, nil
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
func (s *RoleApplicationService) GetApplicationsByStatusWithDetails(status models.ApplicationStatus) ([]*models.RoleApplicationDetail, error) {
	applications, err := s.applicationRepo.GetApplicationsByStatus(status)
	if err != nil {
		return nil, err
	}

	var detailedApplications []*models.RoleApplicationDetail

	for _, app := range applications {
		detail, err := s.buildApplicationDetail(&app)
		if err != nil {
			logrus.Errorf("Failed to build application detail for application %d: %v", app.ID, err)
			continue
		}
		detailedApplications = append(detailedApplications, detail)
	}

	return detailedApplications, nil
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
			IsVerified:            user.IsVerified,
			KYCStatus:             user.KYCStatus,
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
