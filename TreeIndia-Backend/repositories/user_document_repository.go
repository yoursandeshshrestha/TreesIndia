package repositories

import (
	"treesindia/models"
)

type UserDocumentRepository struct {
	*BaseRepository
}

func NewUserDocumentRepository() *UserDocumentRepository {
	return &UserDocumentRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateDocument creates a new user document
func (r *UserDocumentRepository) CreateDocument(document *models.UserDocument) error {
	return r.Create(document)
}

// GetDocumentsByUserID gets all documents for a user
func (r *UserDocumentRepository) GetDocumentsByUserID(userID uint) ([]models.UserDocument, error) {
	var documents []models.UserDocument
	err := r.db.Where("user_id = ?", userID).Find(&documents).Error
	return documents, err
}

// GetDocumentByID gets a document by ID
func (r *UserDocumentRepository) GetDocumentByID(id uint) (*models.UserDocument, error) {
	var document models.UserDocument
	err := r.FindByID(&document, id)
	if err != nil {
		return nil, err
	}
	return &document, nil
}

// GetDocumentByUserAndType gets a document by user ID and document type
func (r *UserDocumentRepository) GetDocumentByUserAndType(userID uint, documentType models.DocumentType) (*models.UserDocument, error) {
	var document models.UserDocument
	err := r.db.Where("user_id = ? AND document_type = ?", userID, documentType).First(&document).Error
	if err != nil {
		return nil, err
	}
	return &document, nil
}

// UpdateDocument updates a document
func (r *UserDocumentRepository) UpdateDocument(document *models.UserDocument) error {
	return r.Update(document)
}

// DeleteDocument deletes a document
func (r *UserDocumentRepository) DeleteDocument(id uint) error {
	return r.DeleteByID(&models.UserDocument{}, id)
}

// DeleteDocumentsByUserID deletes all documents for a user
func (r *UserDocumentRepository) DeleteDocumentsByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.UserDocument{}).Error
}

// CheckRequiredDocuments checks if user has all required documents for role application
func (r *UserDocumentRepository) CheckRequiredDocuments(userID uint) (bool, error) {
	var count int64
	requiredTypes := []models.DocumentType{
		models.DocumentTypePANCard,
		models.DocumentTypeAadhaarCard,
		models.DocumentTypeProfilePhoto,
	}
	
	err := r.db.Model(&models.UserDocument{}).
		Where("user_id = ? AND document_type IN ?", userID, requiredTypes).
		Count(&count).Error
	
	return count == int64(len(requiredTypes)), err
}
