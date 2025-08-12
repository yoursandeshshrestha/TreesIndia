package repositories

import (
	"errors"
	"treesindia/database"

	"gorm.io/gorm"
)

// BaseRepository provides common database operations
type BaseRepository struct {
	db *gorm.DB
}

// NewBaseRepository creates a new base repository
func NewBaseRepository() *BaseRepository {
	return &BaseRepository{
		db: database.GetDB(),
	}
}

// Create creates a new record
func (br *BaseRepository) Create(model interface{}) error {
	return br.db.Create(model).Error
}

// FindByID finds a record by ID
func (br *BaseRepository) FindByID(model interface{}, id uint) error {
	result := br.db.First(model, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return result.Error
	}
	return nil
}

// FindByField finds a record by a specific field
func (br *BaseRepository) FindByField(model interface{}, field string, value interface{}) error {
	result := br.db.Where(field+" = ?", value).First(model)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return result.Error
	}
	return nil
}

// FindAll finds all records
func (br *BaseRepository) FindAll(models interface{}) error {
	return br.db.Find(models).Error
}

// Update updates a record
func (br *BaseRepository) Update(model interface{}) error {
	return br.db.Save(model).Error
}

// Delete deletes a record
func (br *BaseRepository) Delete(model interface{}) error {
	return br.db.Delete(model).Error
}

// DeleteByID deletes a record by ID
func (br *BaseRepository) DeleteByID(model interface{}, id uint) error {
	return br.db.Delete(model, id).Error
}

// Exists checks if a record exists
func (br *BaseRepository) Exists(model interface{}, field string, value interface{}) (bool, error) {
	var count int64
	err := br.db.Model(model).Where(field+" = ?", value).Count(&count).Error
	return count > 0, err
}

// Count counts records
func (br *BaseRepository) Count(model interface{}, conditions ...interface{}) (int64, error) {
	var count int64
	query := br.db.Model(model)
	if len(conditions) > 0 {
		query = query.Where(conditions[0], conditions[1:]...)
	}
	err := query.Count(&count).Error
	return count, err
}

// GetDB returns the database instance
func (br *BaseRepository) GetDB() *gorm.DB {
	return br.db
}
