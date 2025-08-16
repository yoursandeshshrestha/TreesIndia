package services

import (
	"errors"
	"time"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type WorkerInquiryService struct {
	inquiryRepo *repositories.WorkerInquiryRepository
	workerRepo  *repositories.UserRepository
	userRepo    *repositories.UserRepository
}

func NewWorkerInquiryService() *WorkerInquiryService {
	return &WorkerInquiryService{
		inquiryRepo: repositories.NewWorkerInquiryRepository(),
		workerRepo:  repositories.NewUserRepository(),
		userRepo:    repositories.NewUserRepository(),
	}
}

// CreateInquiry creates a new inquiry from user to worker
func (wis *WorkerInquiryService) CreateInquiry(userID uint, workerID uint, req *models.CreateInquiryRequest) (*models.WorkerInquiry, error) {
	// Check if worker exists and is active
	worker := &models.User{}
	err := wis.workerRepo.FindByID(worker, workerID)
	if err != nil {
		return nil, errors.New("worker not found")
	}

	if !worker.IsActive {
		return nil, errors.New("worker is not active")
	}

	// Check if user exists and is active
	user := &models.User{}
	err = wis.userRepo.FindByID(user, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("user is not active")
	}

	// Create inquiry
	inquiry := &models.WorkerInquiry{
		UserID:        userID,
		WorkerID:      workerID,
		ProjectName:   req.ProjectName,
		CompanyName:   req.CompanyName,
		Location:      req.Location,
		ContactPerson: req.ContactPerson,
		ContactPhone:  req.ContactPhone,
		ContactEmail:  req.ContactEmail,
		Status:        models.InquiryStatusPending,
		IsApproved:    false,
	}

	err = wis.inquiryRepo.Create(inquiry)
	if err != nil {
		logrus.Errorf("Failed to create inquiry: %v", err)
		return nil, errors.New("failed to create inquiry")
	}

	return inquiry, nil
}

// GetUserInquiries gets inquiries sent by a user
func (wis *WorkerInquiryService) GetUserInquiries(userID uint, filters *repositories.WorkerInquiryFilters) ([]models.WorkerInquiry, *repositories.Pagination, error) {
	return wis.inquiryRepo.GetUserInquiries(userID, filters)
}

// GetWorkerInquiries gets inquiries received by a worker
func (wis *WorkerInquiryService) GetWorkerInquiries(workerID uint, filters *repositories.WorkerInquiryFilters) ([]models.WorkerInquiry, *repositories.Pagination, error) {
	return wis.inquiryRepo.GetWorkerInquiries(workerID, filters)
}

// GetAllInquiries gets all inquiries with admin filters
func (wis *WorkerInquiryService) GetAllInquiries(filters *repositories.AdminInquiryFilters) ([]models.WorkerInquiry, *repositories.Pagination, error) {
	return wis.inquiryRepo.GetAllInquiries(filters)
}

// ApproveInquiry approves an inquiry (admin only)
func (wis *WorkerInquiryService) ApproveInquiry(inquiryID uint, adminID uint, notes string) (*models.WorkerInquiry, error) {
	inquiry, err := wis.inquiryRepo.GetByID(inquiryID)
	if err != nil {
		return nil, errors.New("inquiry not found")
	}

	if inquiry.Status != models.InquiryStatusPending {
		return nil, errors.New("inquiry is not pending")
	}

	now := time.Now()
	inquiry.Status = models.InquiryStatusApproved
	inquiry.IsApproved = true
	inquiry.ApprovedBy = &adminID
	inquiry.ApprovedAt = &now
	inquiry.AdminNotes = notes

	err = wis.inquiryRepo.Update(inquiry)
	if err != nil {
		logrus.Errorf("Failed to approve inquiry: %v", err)
		return nil, errors.New("failed to approve inquiry")
	}

	return inquiry, nil
}

// RejectInquiry rejects an inquiry (admin only)
func (wis *WorkerInquiryService) RejectInquiry(inquiryID uint, adminID uint, notes string) (*models.WorkerInquiry, error) {
	inquiry, err := wis.inquiryRepo.GetByID(inquiryID)
	if err != nil {
		return nil, errors.New("inquiry not found")
	}

	if inquiry.Status != models.InquiryStatusPending {
		return nil, errors.New("inquiry is not pending")
	}

	now := time.Now()
	inquiry.Status = models.InquiryStatusRejected
	inquiry.IsApproved = false
	inquiry.ApprovedBy = &adminID
	inquiry.ApprovedAt = &now
	inquiry.AdminNotes = notes

	err = wis.inquiryRepo.Update(inquiry)
	if err != nil {
		logrus.Errorf("Failed to reject inquiry: %v", err)
		return nil, errors.New("failed to reject inquiry")
	}

	return inquiry, nil
}

// UpdateWorkerResponse updates worker response to inquiry
func (wis *WorkerInquiryService) UpdateWorkerResponse(inquiryID uint, workerID uint, response string) (*models.WorkerInquiry, error) {
	inquiry, err := wis.inquiryRepo.GetByID(inquiryID)
	if err != nil {
		return nil, errors.New("inquiry not found")
	}

	if inquiry.WorkerID != workerID {
		return nil, errors.New("unauthorized access")
	}

	if inquiry.Status != models.InquiryStatusApproved {
		return nil, errors.New("inquiry is not approved")
	}

	now := time.Now()
	inquiry.WorkerResponse = response
	inquiry.WorkerContacted = true
	inquiry.ContactedAt = &now
	inquiry.Status = models.InquiryStatusCompleted

	err = wis.inquiryRepo.Update(inquiry)
	if err != nil {
		logrus.Errorf("Failed to update worker response: %v", err)
		return nil, errors.New("failed to update worker response")
	}

	return inquiry, nil
}

// GetInquiryByID gets inquiry by ID
func (wis *WorkerInquiryService) GetInquiryByID(inquiryID uint) (*models.WorkerInquiry, error) {
	return wis.inquiryRepo.GetByID(inquiryID)
}
