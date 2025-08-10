package main

import (
	"log"
	"treesindia/config"
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/routes"

	"github.com/gin-gonic/gin"
	
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

func main() {
	// Initialize configuration
	config.InitConfig()

	// Initialize database
	config.InitDatabase()
	
	// Run database migrations
	if err := config.RunMigrations(config.GetDB()); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	
	// Seed initial data
	if err := config.SeedInitialData(config.GetDB()); err != nil {
		log.Fatal("Failed to seed initial data:", err)
	}

	// Set Gin mode
	if config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

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
	port := config.GetPort()
	log.Printf("Server starting on port %s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
