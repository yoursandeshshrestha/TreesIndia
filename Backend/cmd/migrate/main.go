package main

import (
	"flag"
	"log"
	"treesindia/config"
	"treesindia/database"
	"treesindia/services"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load application configuration
	appConfig := config.LoadConfig()

	// Initialize database
	var db *gorm.DB
	var err error
	dsn := appConfig.GetDatabaseURL()
	
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logrus.Fatal("Failed to connect to database:", err)
	}

	// Set the database instance
	database.SetDB(db)
	
	// Parse command line flags
	dryRun := flag.Bool("dry-run", false, "Show what migrations would be run without executing them")
	flag.Parse()

	migrationService := services.NewMigrationService()

	if *dryRun {
		log.Println("=== DRY RUN MODE ===")
		log.Println("This would run the following migrations:")
		
		// Get all available migrations
		availableMigrations := migrationService.GetMigrations()
		
		// Get applied migrations
		appliedMigrations, err := migrationService.GetAppliedMigrations()
		if err != nil {
			log.Fatal("Failed to get applied migrations:", err)
		}

		// Find pending migrations
		pendingMigrations := migrationService.GetPendingMigrations(availableMigrations, appliedMigrations)

		if len(pendingMigrations) == 0 {
			log.Println("No pending migrations found")
			return
		}

		for _, migration := range pendingMigrations {
			log.Printf("  - %s: %s", migration.Version, migration.Name)
		}
	} else {
		log.Println("Running database migrations...")
		if err := migrationService.RunMigrations(); err != nil {
			log.Fatal("Failed to run migrations:", err)
		}
		log.Println("Migrations completed successfully!")
	}
}
