package services

import (
	"fmt"
	"sort"
	"strings"
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
			Name:    "complete_system_setup",
			Up:      ms.migration001CompleteSystemSetup,
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

// migration001CompleteSystemSetup - Comprehensive migration that sets up the entire system
func (ms *MigrationService) migration001CompleteSystemSetup(db *gorm.DB) error {
	logrus.Info("Running complete system setup migration")
	
	// ========================================
	// STEP 1: Create all base tables in correct order
	// ========================================
	logrus.Info("Step 1: Creating all base tables in correct order")
	
	// Fast migration: Create all tables at once with constraints disabled
	logrus.Info("Creating all tables with fast migration...")
	
	// Disable foreign key constraints for fast migration
	if err := db.Exec("SET session_replication_role = replica").Error; err != nil {
		logrus.Warnf("Could not disable foreign key constraints: %v", err)
	}
	
	// Create all tables in one go
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Subcategory{},
		&models.Service{},
		&models.SubscriptionPlan{},
		&models.AdminConfig{},
		&models.Location{},
		&models.UserDocument{},
		&models.UserSkill{},
		&models.RoleApplication{},
		&models.UserNotificationSettings{},
		// UserRole removed - using UserType enum instead
		&models.UserSubscription{},
		&models.SubscriptionWarning{},
		&models.Property{},
		&models.Worker{},
		&models.Broker{},

		&models.Booking{},
		&models.WorkerAssignment{},
		&models.BufferRequest{},
	); err != nil {
		logrus.Errorf("Failed to create tables: %v", err)
		return err
	}
	
	// Re-enable foreign key constraints
	if err := db.Exec("SET session_replication_role = DEFAULT").Error; err != nil {
		logrus.Warnf("Could not re-enable foreign key constraints: %v", err)
	}
	
	// Add foreign key constraints in batches for better performance
	logrus.Info("Adding foreign key constraints in batches...")
	if err := ms.addForeignKeysOptimized(db); err != nil {
		logrus.Errorf("Failed to add foreign key constraints: %v", err)
		return err
	}
	
	logrus.Info("Base tables created successfully")
	
	// ========================================
	// STEP 2: Remove credit system remnants
	// ========================================
	logrus.Info("Step 2: Removing credit system remnants")
	
	// Remove credits_remaining column from users table if it exists
	if err := db.Exec("ALTER TABLE users DROP COLUMN IF EXISTS credits_remaining").Error; err != nil {
		logrus.Warnf("Could not drop credits_remaining column: %v", err)
	}
	
	// Remove old credit-related configs
	if err := db.Exec("DELETE FROM admin_configs WHERE key IN ('default_user_credits', 'credit_purchase_price', 'credits_expire_days')").Error; err != nil {
		logrus.Warnf("Could not remove old credit configs: %v", err)
	}
	
	logrus.Info("Credit system remnants removed")
	
	// ========================================
	// STEP 3: Setup business model configuration
	// ========================================
	logrus.Info("Step 3: Setting up business model configuration")
	
	// NOTE: Admin configurations are now handled by configuration_seed.go
	// This prevents conflicts between migration service and seed files
	logrus.Info("Admin configurations are handled by seed files - skipping migration service configs")
	
	
	
	logrus.Info("Business model configuration setup completed")
	
	// ========================================
	// STEP 4: Setup property system enhancements
	// ========================================
	logrus.Info("Step 4: Setting up property system enhancements")
	
	// Drop existing view if it exists (to avoid conflicts with column type changes)
	if err := db.Exec("DROP VIEW IF EXISTS property_listing_view").Error; err != nil {
		logrus.Warnf("Could not drop property_listing_view: %v", err)
	}
	
	// Add priority_score column to properties table for broker priority
	if err := db.Exec("ALTER TABLE properties ADD COLUMN IF NOT EXISTS priority_score BIGINT DEFAULT 0").Error; err != nil {
		logrus.Warnf("Could not add priority_score column: %v", err)
	}
	
	// Add subscription_required column to properties table
	if err := db.Exec("ALTER TABLE properties ADD COLUMN IF NOT EXISTS subscription_required BOOLEAN DEFAULT false").Error; err != nil {
		logrus.Warnf("Could not add subscription_required column: %v", err)
	}
	
	// Update existing properties with priority scores
	// Broker properties get high priority (100)
	if err := db.Exec("UPDATE properties SET priority_score = 100 WHERE broker_id IS NOT NULL").Error; err != nil {
		logrus.Warnf("Could not update broker property priorities: %v", err)
	}
	
	// Admin uploaded properties get medium priority (50)
	if err := db.Exec("UPDATE properties SET priority_score = 50 WHERE uploaded_by_admin = true AND broker_id IS NULL").Error; err != nil {
		logrus.Warnf("Could not update admin property priorities: %v", err)
	}
	
	// Update broker properties to mark subscription requirement
	if err := db.Exec(`
		UPDATE properties 
		SET subscription_required = true 
		WHERE broker_id IS NOT NULL 
		AND broker_id IN (
			SELECT DISTINCT user_id 
			FROM user_subscriptions 
			WHERE status = 'active' 
			AND end_date > NOW()
		)
	`).Error; err != nil {
		logrus.Warnf("Could not update subscription_required for broker properties: %v", err)
	}
	
	// Create index on priority_score for better performance
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_properties_priority_score ON properties(priority_score DESC)").Error; err != nil {
		logrus.Warnf("Could not create priority_score index: %v", err)
	}
	
	// Create a view for property listing with priority
	viewSQL := `
		CREATE OR REPLACE VIEW property_listing_view AS
		SELECT 
			p.*,
			u.name as user_name,
			u.user_type,
			b.name as broker_name,
			CASE 
				WHEN p.broker_id IS NOT NULL THEN 100
				WHEN p.uploaded_by_admin = true THEN 50
				ELSE 0
			END as calculated_priority_score
		FROM properties p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN users b ON p.broker_id = b.id
		WHERE p.is_approved = true 
		AND p.status = 'available'
		AND (p.expires_at IS NULL OR p.expires_at > NOW())
		ORDER BY calculated_priority_score DESC, p.created_at DESC
	`

	if err := db.Exec(viewSQL).Error; err != nil {
		logrus.Warnf("Could not create property listing view: %v", err)
	}
	
	logrus.Info("Property system enhancements setup completed")
	
	// ========================================
	// STEP 5: Setup booking system
	// ========================================
	logrus.Info("Step 5: Setting up booking system")
	
	// Create indexes for better performance
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id)",
		"CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)",
		"CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date)",
		"CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status)",
		"CREATE INDEX IF NOT EXISTS idx_worker_assignments_worker_id ON worker_assignments(worker_id)",
		"CREATE INDEX IF NOT EXISTS idx_worker_assignments_status ON worker_assignments(status)",
		"CREATE INDEX IF NOT EXISTS idx_buffer_requests_status ON buffer_requests(status)",
		"CREATE INDEX IF NOT EXISTS idx_time_slots_service_date ON time_slots(service_id, date)",
		"CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(available_workers) WHERE available_workers > 0",
	}

	for _, indexSQL := range indexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			logrus.Warnf("Could not create index: %v", err)
		}
	}
	

	
	logrus.Info("Booking system setup completed")
	
	// ========================================
	// STEP 6: Final system setup
	// ========================================
	logrus.Info("Step 6: Final system setup")
	
	// Ensure all foreign key constraints are properly set (PostgreSQL)
	if err := db.Exec("SET session_replication_role = DEFAULT").Error; err != nil {
		logrus.Warnf("Could not reset session replication role: %v", err)
	}
	
	logrus.Info("Complete system setup migration completed successfully")
	return nil
}



// addForeignKeysOptimized adds foreign key constraints in optimized batches
func (ms *MigrationService) addForeignKeysOptimized(db *gorm.DB) error {
	// Batch 1: User-related foreign keys
	userFKs := []string{
		"ALTER TABLE user_subscriptions ADD CONSTRAINT fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE user_subscriptions ADD CONSTRAINT fk_user_subscriptions_plan_id FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)",
		"ALTER TABLE locations ADD CONSTRAINT fk_locations_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE user_documents ADD CONSTRAINT fk_user_documents_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE user_skills ADD CONSTRAINT fk_user_skills_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE role_applications ADD CONSTRAINT fk_role_applications_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE user_notification_settings ADD CONSTRAINT fk_user_notification_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE subscription_warnings ADD CONSTRAINT fk_subscription_warnings_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
	}
	
	// Batch 2: Service-related foreign keys
	serviceFKs := []string{
		"ALTER TABLE service_configs ADD CONSTRAINT fk_service_configs_service_id FOREIGN KEY (service_id) REFERENCES services(id)",
		"ALTER TABLE time_slots ADD CONSTRAINT fk_time_slots_service_id FOREIGN KEY (service_id) REFERENCES services(id)",
		"ALTER TABLE subcategories ADD CONSTRAINT fk_subcategories_parent_id FOREIGN KEY (parent_id) REFERENCES categories(id)",
		"ALTER TABLE services ADD CONSTRAINT fk_services_category_id FOREIGN KEY (category_id) REFERENCES categories(id)",
		"ALTER TABLE services ADD CONSTRAINT fk_services_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)",
	}
	
	// Batch 3: Complex relationship foreign keys
	complexFKs := []string{
		"ALTER TABLE properties ADD CONSTRAINT fk_properties_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE properties ADD CONSTRAINT fk_properties_broker_id FOREIGN KEY (broker_id) REFERENCES users(id)",
		"ALTER TABLE properties ADD CONSTRAINT fk_properties_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)",
		"ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE bookings ADD CONSTRAINT fk_bookings_service_id FOREIGN KEY (service_id) REFERENCES services(id)",
		"ALTER TABLE bookings ADD CONSTRAINT fk_bookings_time_slot_id FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)",
		"ALTER TABLE worker_assignments ADD CONSTRAINT fk_worker_assignments_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id)",
		"ALTER TABLE worker_assignments ADD CONSTRAINT fk_worker_assignments_worker_id FOREIGN KEY (worker_id) REFERENCES users(id)",
		"ALTER TABLE worker_assignments ADD CONSTRAINT fk_worker_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)",
		"ALTER TABLE buffer_requests ADD CONSTRAINT fk_buffer_requests_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id)",
		"ALTER TABLE buffer_requests ADD CONSTRAINT fk_buffer_requests_worker_id FOREIGN KEY (worker_id) REFERENCES users(id)",
		"ALTER TABLE buffer_requests ADD CONSTRAINT fk_buffer_requests_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)",
		"ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id)",
		"ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_related_user_id FOREIGN KEY (related_user_id) REFERENCES users(id)",
		"ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_service_id FOREIGN KEY (service_id) REFERENCES services(id)",
		"ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_property_id FOREIGN KEY (property_id) REFERENCES properties(id)",
		"ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_subscription_id FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)",
		"ALTER TABLE role_applications ADD CONSTRAINT fk_role_applications_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)",
	}
	
	// Execute batches with error handling
	batches := [][]string{userFKs, serviceFKs, complexFKs}
	batchNames := []string{"User-related", "Service-related", "Complex relationships"}
	
	for i, batch := range batches {
		logrus.Infof("Adding %s foreign key constraints...", batchNames[i])
		for _, fkSQL := range batch {
			if err := db.Exec(fkSQL).Error; err != nil {
				// Check if constraint already exists
				if !strings.Contains(err.Error(), "already exists") {
					logrus.Warnf("Could not add foreign key constraint: %v", err)
				}
			}
		}
	}
	
	return nil
}
