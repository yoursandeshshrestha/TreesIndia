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
	"treesindia/repositories"
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

	// Seed only admin users, admin configurations, and subscription plans (if SKIP_SEED is not set)
	// These are seeded only if they don't exist (idempotent)
	if os.Getenv("SKIP_SEED") == "" {
		logrus.Info("🌱 Auto-seeding admin users, admin configurations, and subscription plans (if they don't exist)...")
		seedManager := seed.NewSeedManager()
		if err := seedManager.SeedIndividualComponents("admin_user", "admin_configurations", "subscription_plans"); err != nil {
			log.Fatal("Failed to seed initial data:", err)
		}
	} else {
		logrus.Info("⏭️  Skipping seeding (SKIP_SEED is set)")
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

	// Initialize WebSocket service
	wsService := services.NewWebSocketService()
	wsController := controllers.NewWebSocketController(wsService)

	// Initialize Simple Conversation WebSocket service
	simpleConversationWsService := services.NewSimpleConversationWebSocketService()

	// Initialize services with WebSocket service
	chatService := services.NewChatService(wsService)
	workerAssignmentService := services.NewWorkerAssignmentService(chatService)

	// Initialize Simple Conversation services
	simpleConversationRepo := repositories.NewSimpleConversationRepository(db)
	simpleConversationMessageRepo := repositories.NewSimpleConversationMessageRepository(db)
	userRepo := repositories.NewUserRepository()
	// Initialize Cloudinary service for file uploads
	cloudinaryService, err := services.NewCloudinaryService()
	if err != nil {
		logrus.Errorf("Failed to initialize CloudinaryService: %v", err)
		// Don't panic, create a nil cloudinary service
		cloudinaryService = nil
	} else {
		logrus.Info("CloudinaryService initialized successfully")
	}

	simpleConversationService := services.NewSimpleConversationService(
		simpleConversationRepo,
		simpleConversationMessageRepo,
		userRepo,
		simpleConversationWsService,
		cloudinaryService,
	)

	// Initialize notification services
	deviceManagementService := services.NewDeviceManagementService(fcmService)
	enhancedNotificationService := services.NewEnhancedNotificationService(fcmService, deviceManagementService, nil) // Pass nil for email service for now

	// Start cleanup service
	cleanupService := services.NewCleanupService()
	cleanupService.StartPeriodicCleanup()

	// Start token cleanup service
	tokenCleanupService := services.NewTokenCleanupService(deviceManagementService)
	tokenCleanupService.Start()

	// Start Simple Conversation WebSocket service
	go simpleConversationWsService.Start()

	// Setup WebSocket routes (outside of /api/v1 prefix)
	routes.SetupWebSocketRoutes(r, wsController)

	// Setup chat routes with WebSocket service
	routes.SetupChatRoutes(r.Group("/api/v1"), chatService)

	// Setup simple conversation routes
	routes.SetupSimpleConversationRoutes(r.Group("/api/v1"), simpleConversationService)
	routes.SetupSimpleConversationWebSocketRoutes(r.Group("/api/v1"), simpleConversationWsService)

	// Setup worker assignment routes with chat service
	bookingMiddleware := middleware.NewDynamicConfigMiddleware()
	bookingGroup := r.Group("/api/v1")
	bookingGroup.Use(bookingMiddleware.BookingSystem())
	routes.SetupWorkerAssignmentRoutes(bookingGroup, workerAssignmentService, enhancedNotificationService, db)

	// Setup notification routes (existing push notifications)
	notificationController := controllers.NewNotificationController(enhancedNotificationService, deviceManagementService)
	routes.SetupNotificationRoutes(r.Group("/api/v1"), notificationController)

	// Setup admin notification routes
	routes.SetupAdminNotificationRoutesWithController(r.Group("/api/v1/admin"), notificationController)

	// Setup call masking routes
	routes.SetupCallMaskingRoutes(r.Group("/api/v1"))

	// Setup test routes (for development)
	routes.SetupTestRoutes(r.Group("/api/v1"))

	// Start server
	if err := r.Run(appConfig.ServerHost + ":" + appConfig.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
