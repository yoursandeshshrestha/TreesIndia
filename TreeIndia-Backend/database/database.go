package database

import (
	"sync"

	"gorm.io/gorm"
)

var (
	db   *gorm.DB
	once sync.Once
)

// SetDB sets the database instance
func SetDB(database *gorm.DB) {
	once.Do(func() {
		db = database
	})
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return db
}
