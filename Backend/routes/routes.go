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
	r.Use(middleware.ValidationMiddleware())
	
	// Swagger documentation route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	
	// API v1 routes group
	v1 := r.Group(APIVersion)
	{
		// Health check route (always available)
		setupHealthRoutes(v1)
		
		// Authentication routes (always available)
		SetupAuthRoutes(v1)
		
		// All routes
		SetupAdminRoutes(v1)
		SetupAdminConfigRoutes(v1)
		SetupAdminInquiryRoutes(v1)
		SetupDashboardRoutes(v1)
		SetupAddressRoutes(v1)
		SetupUserSearchHistoryRoutes(v1)
		SetupCategoryRoutes(v1)
		SetupSubcategoryRoutes(v1)
		SetupServiceRoutes(v1)
		SetupServiceAreaRoutes(v1)
		SetupLocationRoutes(v1)
		SetupGeoapifyRoutes(v1)
		SetupRoleApplicationRoutes(v1)
		SetupUserRoutes(v1)
		SetupPropertyRoutes(v1)
		SetupProjectRoutes(v1)
		SetupSubscriptionRoutes(v1)
		SetupWalletRoutes(v1)
		SetupRazorpayRoutes(v1)
		// Chat routes will be set up in main.go with WebSocket service
		// Simple conversation routes will be set up in main.go with WebSocket service
		SetupPromotionBannerRoutes(v1)
		SetupHeroRoutes(v1)
		SetupBannerRoutes(v1)
		SetupHomepageCategoryIconRoutes(v1)
		SetupVendorRoutes(v1)
		SetupWorkerRoutes(v1)
		SetupChatbotRoutes(v1)
		
		// Booking routes with booking system middleware
		bookingMiddleware := middleware.NewDynamicConfigMiddleware()
		bookingGroup := v1.Group("")
		bookingGroup.Use(bookingMiddleware.BookingSystem())
		SetupBookingRoutes(bookingGroup)
		SetupWorkerInquiryRoutes(bookingGroup)
		// Worker assignment routes will be set up in main.go with chat service
		
		// Payment routes
		SetupPaymentRoutes(v1)
		SetupPaymentSegmentRoutes(v1)
		SetupAdminPaymentRoutes(v1)
		
		// Ledger routes
		SetupLedgerRoutes(v1)
	}
}

// setupHealthRoutes sets up health-related routes
func setupHealthRoutes(group *gin.RouterGroup) {
	group.GET(HealthPath, controllers.HealthCheck)
	
	// Test email route (development only)
	group.POST("/test-email", controllers.TestEmail)
}
