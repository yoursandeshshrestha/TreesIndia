package repositories

import (
	"treesindia/models"
)

type UserSkillRepository struct {
	*BaseRepository
}

func NewUserSkillRepository() *UserSkillRepository {
	return &UserSkillRepository{
		BaseRepository: NewBaseRepository(),
	}
}

// CreateSkill creates a new user skill
func (r *UserSkillRepository) CreateSkill(skill *models.UserSkill) error {
	return r.Create(skill)
}

// GetSkillsByUserID gets all skills for a user
func (r *UserSkillRepository) GetSkillsByUserID(userID uint) ([]models.UserSkill, error) {
	var skills []models.UserSkill
	err := r.db.Where("user_id = ?", userID).Find(&skills).Error
	return skills, err
}

// GetSkillByID gets a skill by ID
func (r *UserSkillRepository) GetSkillByID(id uint) (*models.UserSkill, error) {
	var skill models.UserSkill
	err := r.FindByID(&skill, id)
	if err != nil {
		return nil, err
	}
	return &skill, nil
}

// UpdateSkill updates a skill
func (r *UserSkillRepository) UpdateSkill(skill *models.UserSkill) error {
	return r.Update(skill)
}

// DeleteSkill deletes a skill
func (r *UserSkillRepository) DeleteSkill(id uint) error {
	return r.DeleteByID(&models.UserSkill{}, id)
}

// DeleteSkillsByUserID deletes all skills for a user
func (r *UserSkillRepository) DeleteSkillsByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.UserSkill{}).Error
}

// CheckSkillExists checks if a skill already exists for a user
func (r *UserSkillRepository) CheckSkillExists(userID uint, skillName string) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserSkill{}).
		Where("user_id = ? AND skill = ?", userID, skillName).
		Count(&count).Error
	return count > 0, err
}
