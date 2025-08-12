package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"

	"github.com/sirupsen/logrus"
)

type UserSkillService struct {
	skillRepo *repositories.UserSkillRepository
}

func NewUserSkillService(skillRepo *repositories.UserSkillRepository) *UserSkillService {
	return &UserSkillService{
		skillRepo: skillRepo,
	}
}

// AddSkill adds a skill for a user
func (s *UserSkillService) AddSkill(userID uint, req *models.CreateUserSkillRequest) (*models.UserSkill, error) {
	// Check if skill already exists for the user
	exists, err := s.skillRepo.CheckSkillExists(userID, req.Skill)
	if err != nil {
		logrus.Errorf("Failed to check skill existence: %v", err)
		return nil, err
	}
	if exists {
		return nil, errors.New("skill already exists for the user")
	}

	skill := &models.UserSkill{
		UserID: userID,
		Skill:  req.Skill,
		Level:  req.Level,
	}

	err = s.skillRepo.CreateSkill(skill)
	if err != nil {
		logrus.Errorf("Failed to create skill: %v", err)
		return nil, err
	}

	return skill, nil
}

// GetUserSkills gets all skills for a user
func (s *UserSkillService) GetUserSkills(userID uint) ([]models.UserSkill, error) {
	return s.skillRepo.GetSkillsByUserID(userID)
}

// GetSkill gets a skill by ID
func (s *UserSkillService) GetSkill(id uint) (*models.UserSkill, error) {
	return s.skillRepo.GetSkillByID(id)
}

// UpdateSkill updates a skill
func (s *UserSkillService) UpdateSkill(id uint, req *models.UpdateUserSkillRequest) (*models.UserSkill, error) {
	skill, err := s.skillRepo.GetSkillByID(id)
	if err != nil {
		return nil, err
	}

	skill.Skill = req.Skill
	skill.Level = req.Level

	err = s.skillRepo.UpdateSkill(skill)
	if err != nil {
		logrus.Errorf("Failed to update skill: %v", err)
		return nil, err
	}

	return skill, nil
}

// DeleteSkill deletes a skill
func (s *UserSkillService) DeleteSkill(id uint) error {
	return s.skillRepo.DeleteSkill(id)
}

// DeleteUserSkills deletes all skills for a user
func (s *UserSkillService) DeleteUserSkills(userID uint) error {
	return s.skillRepo.DeleteSkillsByUserID(userID)
}
