package models

import (
	"time"
	"treesindia/database"
)

// Migration represents a database migration record
type Migration struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Version   string    `json:"version" gorm:"uniqueIndex;not null"`
	Name      string    `json:"name" gorm:"not null"`
	AppliedAt time.Time `json:"applied_at" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for Migration
func (Migration) TableName() string {
	return "migrations"
}

// RunMigrations runs all database migrations
func RunMigrations() error {
	db := database.GetDB()

	// List of models to migrate
	models := []interface{}{
		&User{},
		&Category{},
		&Subcategory{},
		&Service{},
		&Location{},
		&RoleApplication{},
		&UserDocument{},
		&UserSkill{},
		&UserNotificationSettings{},
		// UserRole removed - using UserType enum instead
		&SubscriptionPlan{},
		&UserSubscription{},
		&SubscriptionWarning{},
	}

	// Run migrations for each model
	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			return err
		}
	}

	return nil
}

// CreateIndexes creates database indexes for better performance
func CreateIndexes() error {
	db := database.GetDB()

	// User indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)").Error; err != nil {
		return err
	}

	// Category indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subcategories_parent_id ON subcategories(parent_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subcategories_name ON subcategories(name)").Error; err != nil {
		return err
	}

	// Service indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active)").Error; err != nil {
		return err
	}

	// Location indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_locations_latitude_longitude ON locations(latitude, longitude)").Error; err != nil {
		return err
	}

	// Subscription indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subscription_plans_duration ON subscription_plans(duration)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date)").Error; err != nil {
		return err
	}

	return nil
}
