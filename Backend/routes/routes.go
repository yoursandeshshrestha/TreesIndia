package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRoutes configures all the routes with /api/v1 prefix
func SetupRoutes(r *gin.Engine) {
	// Add global middleware
	r.Use(middleware.RequestIDMiddleware())
	
	// Swagger documentation route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	
	// API v1 routes group
	v1 := r.Group(APIVersion)
	{
		// Health check route
		setupHealthRoutes(v1)
		
		// Authentication routes
		SetupAuthRoutes(v1)
		
		// Admin routes
		SetupAdminRoutes(v1)
		
		// Category routes
		SetupCategoryRoutes(v1)
		
		// Subcategory routes
		SetupSubcategoryRoutes(v1)
		
		// Service routes
		SetupServiceRoutes(v1)
		
		// Location routes
		SetupLocationRoutes(v1)
		
		// Role application routes (comprehensive)
		SetupRoleApplicationRoutes(v1)
		
		// User routes
		SetupUserRoutes(v1)
		
		// Property routes
		SetupPropertyRoutes(v1)
		
		// Subscription routes
		SetupSubscriptionRoutes(v1)
		
		// Admin configuration routes
		SetupAdminConfigRoutes(v1)
		
		// Wallet routes
		SetupWalletRoutes(v1)
		
		// Razorpay routes
		SetupRazorpayRoutes(v1)
		
		// Booking routes
		SetupBookingRoutes(v1)
		
		// Worker inquiry routes
		SetupWorkerInquiryRoutes(v1)
		
		// Admin inquiry routes
		SetupAdminInquiryRoutes(v1)
		

	}
}

// setupHealthRoutes sets up health-related routes
func setupHealthRoutes(group *gin.RouterGroup) {
	group.GET(HealthPath, controllers.HealthCheck)
	
	// Test email route (development only)
	group.POST("/test-email", controllers.TestEmail)
}
