package models

import (
	"gorm.io/gorm"
)

// Broker represents the broker model
type Broker struct {
	gorm.Model
	License string `json:"license" gorm:"uniqueIndex"`
	Agency  string `json:"agency"`
}

// TableName returns the table name for Broker
func (Broker) TableName() string {
	return "brokers"
}
