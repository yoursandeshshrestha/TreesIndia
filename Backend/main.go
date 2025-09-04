package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
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
	
	// Connect to database
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		// Prevent GORM from auto-creating tables
		DisableForeignKeyConstraintWhenMigrating: true,
		// Disable auto-migration
		SkipDefaultTransaction: true,
	})
	if err != nil {
		logrus.Fatal("Failed to connect to database:", err)
	}

	// Set the database instance in the database package
	database.SetDB(db)

	// Database connection established - migrations will be run separately using Goose

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

// runMigrations runs database migrations using Goose
func runMigrations(appConfig *config.AppConfig) error {
	// Use the same database URL as the main application
	dsn := appConfig.GetDatabaseURL()
	
	// Convert the connection string format for Goose if needed
	// Goose expects format: postgres://user:password@host:port/dbname?sslmode=disable
	if !strings.HasPrefix(dsn, "postgres://") && !strings.HasPrefix(dsn, "postgresql://") {
		// If it's in the format "host=... port=... user=... password=... dbname=... sslmode=..."
		// Convert it to the URL format
		dsn = convertToURLFormat(dsn)
	}
	
	// Run migrations using Goose
	cmd := exec.Command("goose", "-dir", "migrations", "postgres", dsn, "up")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	
	logrus.Info("Database migrations completed successfully")
	return nil
}

// convertToURLFormat converts a connection string to URL format for Goose
func convertToURLFormat(connStr string) string {
	// Parse the connection string format: "host=... port=... user=... password=... dbname=... sslmode=..."
	parts := strings.Fields(connStr)
	var host, port, user, password, dbname, sslmode string
	
	for _, part := range parts {
		if strings.HasPrefix(part, "host=") {
			host = strings.TrimPrefix(part, "host=")
		} else if strings.HasPrefix(part, "port=") {
			port = strings.TrimPrefix(part, "port=")
		} else if strings.HasPrefix(part, "user=") {
			user = strings.TrimPrefix(part, "user=")
		} else if strings.HasPrefix(part, "password=") {
			password = strings.TrimPrefix(part, "password=")
		} else if strings.HasPrefix(part, "dbname=") {
			dbname = strings.TrimPrefix(part, "dbname=")
		} else if strings.HasPrefix(part, "sslmode=") {
			sslmode = strings.TrimPrefix(part, "sslmode=")
		}
	}
	
	// Construct URL format
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslmode)
}



func main() {
	// Load application configuration
	appConfig := config.LoadConfig()

	// Initialize database with new config
	initDatabase(appConfig)
	
	// Always run database migrations (both development and production)
	// IMPORTANT: This must run BEFORE any GORM operations to ensure correct schema
	if err := runMigrations(appConfig); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	
	// Always seed initial data (both development and production)
	seedManager := seed.NewSeedManager()
	if err := seedManager.SeedAll(); err != nil {
		log.Fatal("Failed to seed initial data:", err)
	}

	// Set Gin mode based on environment
	if appConfig.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// Configure multipart memory limit for file uploads (32MB)
	r.MaxMultipartMemory = 32 << 20

	// Add CORS middleware
	if appConfig.IsProduction() {
		r.Use(middleware.SecureCORSMiddleware(appConfig))
	} else {
		r.Use(middleware.CORSMiddleware(appConfig))
	}

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

	// Initialize FCM service
	fcmService, err := services.NewFCMService(appConfig.FCMServiceAccountPath, appConfig.FCMProjectID)
	if err != nil {
		log.Fatal("Failed to initialize FCM service:", err)
	}

	// Initialize location tracking service first (without WebSocket service initially)
	locationTrackingService := services.NewLocationTrackingService(nil)
	
	// Initialize WebSocket service with location tracking service
	wsService := services.NewWebSocketService(locationTrackingService)
	wsController := controllers.NewWebSocketController(wsService)

	// Update location tracking service with WebSocket service
	locationTrackingService.SetWebSocketService(wsService)

	// Initialize services with WebSocket service
	chatService := services.NewChatService(wsService)
	workerAssignmentService := services.NewWorkerAssignmentService(chatService, locationTrackingService)

	// Initialize notification services
	deviceManagementService := services.NewDeviceManagementService(fcmService)
	enhancedNotificationService := services.NewEnhancedNotificationService(fcmService, deviceManagementService, nil) // Pass nil for email service for now

	// Start cleanup service
	cleanupService := services.NewCleanupService()
	cleanupService.StartPeriodicCleanup()

	// Start token cleanup service
	tokenCleanupService := services.NewTokenCleanupService(deviceManagementService)
	tokenCleanupService.Start()

	// Setup WebSocket routes (outside of /api/v1 prefix)
	fmt.Println("Setting up WebSocket routes...")
	routes.SetupWebSocketRoutes(r, wsController)
	fmt.Println("WebSocket routes setup completed")

	// Setup chat routes with WebSocket service
	routes.SetupChatRoutes(r.Group("/api/v1"), chatService)

	// Setup worker assignment routes with chat service
	bookingMiddleware := middleware.NewDynamicConfigMiddleware()
	bookingGroup := r.Group("/api/v1")
	bookingGroup.Use(bookingMiddleware.BookingSystem())
	routes.SetupWorkerAssignmentRoutes(bookingGroup, workerAssignmentService)

	// Setup location tracking routes
	routes.SetupLocationTrackingRoutes(r.Group("/api/v1"), locationTrackingService)

	// Setup notification routes
	notificationController := controllers.NewNotificationController(enhancedNotificationService, deviceManagementService)
	routes.SetupNotificationRoutes(r.Group("/api/v1"), notificationController)

	// Start server
	if err := r.Run(appConfig.ServerHost + ":" + appConfig.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
