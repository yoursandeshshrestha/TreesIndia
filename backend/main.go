package main

import (
	"fmt"
	"log"
	"strings"
	"treesindia/config"
	"treesindia/controllers"
	"treesindia/database"
	"treesindia/middleware"
	"treesindia/routes"
	"treesindia/seed"
	"treesindia/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	// Import generated docs for Swagger
	_ "treesindia/docs"
)

// @title           TREESINDIA API
// @version         1.0
// @description     Unified digital platform for home services and real estate marketplace
// @termsOfService  http://swagger.io/terms/

// @contact.name   TREESINDIA Support
// @contact.url    http://www.treesindia.com/support
// @contact.email  support@treesindia.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

var db *gorm.DB

// initDatabase initializes the database connection
func initDatabase(appConfig *config.AppConfig) {
	var err error
	dsn := appConfig.GetDatabaseURL()
	
	// Debug: Print the database URL (remove sensitive info)
	logrus.Infof("Connecting to database with URL: %s", maskPassword(dsn))
	
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logrus.Fatal("Failed to connect to database:", err)
	}

	// Set the database instance in the database package
	database.SetDB(db)

	logrus.Info("Database connected successfully")
}

// maskPassword masks the password in the database URL for logging
func maskPassword(dsn string) string {
	if strings.Contains(dsn, "@") {
		parts := strings.Split(dsn, "@")
		if len(parts) >= 2 {
			userPass := strings.Split(parts[0], "://")
			if len(userPass) >= 2 {
				userPassParts := strings.Split(userPass[1], ":")
				if len(userPassParts) >= 2 {
					return fmt.Sprintf("%s://%s:***@%s", userPass[0], userPassParts[0], parts[1])
				}
			}
		}
	}
	return dsn
}

// runMigrations runs database migrations with versioning
func runMigrations() error {
	migrationService := services.NewMigrationService()
	
	if err := migrationService.RunMigrations(); err != nil {
		return err
	}
	
	logrus.Info("Database migrations completed successfully")
	return nil
}



func main() {
	// Load application configuration
	appConfig := config.LoadConfig()

	// Initialize database with new config
	initDatabase(appConfig)
	
	// Run database migrations only in development
	if appConfig.IsDevelopment() {
		log.Println("Running database migrations...")
		if err := runMigrations(); err != nil {
			log.Fatal("Failed to run migrations:", err)
		}
		
		// Seed admin user
		if err := seed.SeedAdminUser(database.GetDB()); err != nil {
			log.Fatal("Failed to seed admin user:", err)
		}
	} else {
		log.Println("Skipping database migrations in production")
	}

	// Set Gin mode based on environment
	if appConfig.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// Configure multipart memory limit for file uploads (32MB)
	r.MaxMultipartMemory = 32 << 20

	// Add middleware
	r.Use(middleware.ResponseMiddleware())

	// Root route for app info
	r.GET("/", controllers.AppInfo)

	// Setup routes with /api/v1 prefix
	routes.SetupRoutes(r)

	// Handle 404 errors
	r.NoRoute(middleware.NotFoundHandler())

	// Handle method not allowed
	r.NoMethod(middleware.MethodNotAllowedHandler())

	// Start server
	log.Printf("Server starting on %s:%s", appConfig.ServerHost, appConfig.ServerPort)
	if err := r.Run(appConfig.ServerHost + ":" + appConfig.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
