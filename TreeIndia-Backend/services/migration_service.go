package services

import (
	"fmt"
	"sort"
	"time"
	"treesindia/database"
	"treesindia/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// MigrationStep represents a single migration step
type MigrationStep struct {
	Version string
	Name    string
	Up      func(*gorm.DB) error
}

// MigrationService handles database migrations
type MigrationService struct {
	db *gorm.DB
}

// NewMigrationService creates a new migration service
func NewMigrationService() *MigrationService {
	return &MigrationService{
		db: database.GetDB(),
	}
}

// GetMigrations returns all available migrations in order
func (ms *MigrationService) GetMigrations() []MigrationStep {
	return []MigrationStep{
		{
			Version: "001",
			Name:    "complete_schema_setup",
			Up:      ms.migration001CompleteSchemaSetup,
		},
		{
			Version: "002",
			Name:    "add_role_application_tables",
			Up:      ms.migration002AddRoleApplicationTables,
		},
		{
			Version: "003",
			Name:    "add_user_notification_settings",
			Up:      ms.migration003AddUserNotificationSettings,
		},
	}
}

// RunMigrations runs all pending migrations
func (ms *MigrationService) RunMigrations() error {
	// First, ensure migrations table exists
	if err := ms.db.AutoMigrate(&models.Migration{}); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get all available migrations
	availableMigrations := ms.GetMigrations()
	
	// Get applied migrations
	appliedMigrations, err := ms.GetAppliedMigrations()
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Find pending migrations
	pendingMigrations := ms.GetPendingMigrations(availableMigrations, appliedMigrations)

	if len(pendingMigrations) == 0 {
		logrus.Info("No pending migrations found")
		return nil
	}

	logrus.Infof("Found %d pending migrations", len(pendingMigrations))

	// For development: if we have multiple migrations but want to start fresh,
	// clear the migrations table and run only the latest migration
	if len(appliedMigrations) > 0 && len(availableMigrations) == 1 {
		logrus.Info("Development mode: Clearing existing migrations and running fresh setup")
		if err := ms.db.Exec("DELETE FROM migrations").Error; err != nil {
			return fmt.Errorf("failed to clear migrations: %w", err)
		}
		// Run the single migration
		if err := ms.runMigration(availableMigrations[0]); err != nil {
			return fmt.Errorf("failed to run migration %s: %w", availableMigrations[0].Version, err)
		}
	} else {
		// Run pending migrations normally
		for _, migration := range pendingMigrations {
			if err := ms.runMigration(migration); err != nil {
				return fmt.Errorf("failed to run migration %s: %w", migration.Version, err)
			}
		}
	}

	logrus.Info("All migrations completed successfully")
	return nil
}

// GetAppliedMigrations gets all applied migrations from the database
func (ms *MigrationService) GetAppliedMigrations() (map[string]models.Migration, error) {
	var migrations []models.Migration
	if err := ms.db.Find(&migrations).Error; err != nil {
		return nil, err
	}

	applied := make(map[string]models.Migration)
	for _, migration := range migrations {
		applied[migration.Version] = migration
	}

	return applied, nil
}

// GetPendingMigrations finds migrations that haven't been applied yet
func (ms *MigrationService) GetPendingMigrations(available []MigrationStep, applied map[string]models.Migration) []MigrationStep {
	var pending []MigrationStep

	for _, migration := range available {
		if _, exists := applied[migration.Version]; !exists {
			pending = append(pending, migration)
		}
	}

	// Sort by version
	sort.Slice(pending, func(i, j int) bool {
		return pending[i].Version < pending[j].Version
	})

	return pending
}

// runMigration executes a single migration
func (ms *MigrationService) runMigration(migration MigrationStep) error {
	logrus.Infof("Running migration %s: %s", migration.Version, migration.Name)

	// Start transaction
	tx := ms.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Execute migration
	if err := migration.Up(tx); err != nil {
		tx.Rollback()
		return err
	}

	// Record migration
	migrationRecord := models.Migration{
		Version:   migration.Version,
		Name:      migration.Name,
		AppliedAt: time.Now(),
	}

	if err := tx.Create(&migrationRecord).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return err
	}

	logrus.Infof("Migration %s completed successfully", migration.Version)
	return nil
}

// Migration implementations
func (ms *MigrationService) migration001CompleteSchemaSetup(db *gorm.DB) error {
	logrus.Info("Running complete schema setup migration")
	
	// Create all tables with proper relationships in one go
	// This will handle foreign keys automatically through GORM
	// AutoMigrate will create tables if they don't exist or update them if they do
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Subcategory{},
		&models.Service{},
		&models.Location{},
	); err != nil {
		logrus.Errorf("Failed to create/update tables: %v", err)
		return err
	}
	
	logrus.Info("Complete schema setup completed successfully")
	return nil
}

// Migration implementations
func (ms *MigrationService) migration002AddRoleApplicationTables(db *gorm.DB) error {
	logrus.Info("Running role application tables migration")
	
	// Create the new tables for role application system
	if err := db.AutoMigrate(
		&models.UserDocument{},
		&models.UserSkill{},
		&models.RoleApplication{},
	); err != nil {
		logrus.Errorf("Failed to create role application tables: %v", err)
		return err
	}
	
	logrus.Info("Role application tables migration completed successfully")
	return nil
}

// Migration implementations
func (ms *MigrationService) migration003AddUserNotificationSettings(db *gorm.DB) error {
	logrus.Info("Running user notification settings migration")
	
	// Add gender field to users table and create notification settings table
	if err := db.AutoMigrate(
		&models.User{},
		&models.UserNotificationSettings{},
	); err != nil {
		logrus.Errorf("Failed to create user notification settings tables: %v", err)
		return err
	}
	
	logrus.Info("User notification settings migration completed successfully")
	return nil
}


