package models

import (
	"time"

	"gorm.io/gorm"
)

// SkillLevel represents the level of a skill
type SkillLevel string

const (
	SkillLevelBeginner     SkillLevel = "beginner"
	SkillLevelIntermediate SkillLevel = "intermediate"
	SkillLevelExpert       SkillLevel = "expert"
)

// UserSkill represents a user's skill
type UserSkill struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	User      User           `json:"-" gorm:"foreignKey:UserID"`
	Skill     string         `json:"skill" gorm:"not null"`
	Level     SkillLevel     `json:"level" gorm:"not null;default:'beginner'"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// TableName returns the table name for UserSkill
func (UserSkill) TableName() string {
	return "user_skills"
}

// CreateUserSkillRequest represents the request structure for creating a skill
type CreateUserSkillRequest struct {
	Skill string     `json:"skill" binding:"required,min=1,max=100"`
	Level SkillLevel `json:"level" binding:"required,oneof=beginner intermediate expert"`
}

// UpdateUserSkillRequest represents the request structure for updating a skill
type UpdateUserSkillRequest struct {
	Skill string     `json:"skill" binding:"required,min=1,max=100"`
	Level SkillLevel `json:"level" binding:"required,oneof=beginner intermediate expert"`
}
