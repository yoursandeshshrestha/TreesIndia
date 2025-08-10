package main

import (
	"log"
	"treesindia/config"
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize configuration
	config.InitConfig()

	// Initialize database
	config.InitDatabase()

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
