package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type UserDocumentService struct {
	documentRepo *repositories.UserDocumentRepository
	cloudinaryService *CloudinaryService
}

func NewUserDocumentService(documentRepo *repositories.UserDocumentRepository, cloudinaryService *CloudinaryService) *UserDocumentService {
	return &UserDocumentService{
		documentRepo: documentRepo,
		cloudinaryService: cloudinaryService,
	}
}

// UploadDocument uploads a document for a user
func (s *UserDocumentService) UploadDocument(userID uint, req *models.CreateUserDocumentRequest) (*models.UserDocument, error) {
	// Check if document of this type already exists for the user
	existingDoc, err := s.documentRepo.GetDocumentByUserAndType(userID, req.DocumentType)
	if err == nil && existingDoc != nil {
		return nil, errors.New("document of this type already exists for the user")
	}

	document := &models.UserDocument{
		UserID:       userID,
		DocumentType: req.DocumentType,
		FileURL:      req.FileURL,
		FileName:     req.FileName,
		FileSize:     req.FileSize,
	}

	err = s.documentRepo.CreateDocument(document)
	if err != nil {
		logrus.Errorf("Failed to create document: %v", err)
		return nil, err
	}

	return document, nil
}

// GetUserDocuments gets all documents for a user
func (s *UserDocumentService) GetUserDocuments(userID uint) ([]models.UserDocument, error) {
	return s.documentRepo.GetDocumentsByUserID(userID)
}

// GetDocument gets a document by ID
func (s *UserDocumentService) GetDocument(id uint) (*models.UserDocument, error) {
	return s.documentRepo.GetDocumentByID(id)
}

// UpdateDocument updates a document
func (s *UserDocumentService) UpdateDocument(id uint, req *models.UpdateUserDocumentRequest) (*models.UserDocument, error) {
	document, err := s.documentRepo.GetDocumentByID(id)
	if err != nil {
		return nil, err
	}

	document.FileURL = req.FileURL
	document.FileName = req.FileName
	document.FileSize = req.FileSize

	err = s.documentRepo.UpdateDocument(document)
	if err != nil {
		logrus.Errorf("Failed to update document: %v", err)
		return nil, err
	}

	return document, nil
}

// DeleteDocument deletes a document
func (s *UserDocumentService) DeleteDocument(id uint) error {
	return s.documentRepo.DeleteDocument(id)
}

// CheckRequiredDocuments checks if user has all required documents
func (s *UserDocumentService) CheckRequiredDocuments(userID uint) (bool, error) {
	return s.documentRepo.CheckRequiredDocuments(userID)
}

// DeleteUserDocuments deletes all documents for a user
func (s *UserDocumentService) DeleteUserDocuments(userID uint) error {
	return s.documentRepo.DeleteDocumentsByUserID(userID)
}
