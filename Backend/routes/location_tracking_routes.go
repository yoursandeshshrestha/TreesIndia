package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"
	"treesindia/services"

	"github.com/gin-gonic/gin"
)

// SetupLocationTrackingRoutes sets up location tracking-related routes
func SetupLocationTrackingRoutes(router *gin.RouterGroup, locationTrackingService *services.LocationTrackingService) {
	locationTrackingController := controllers.NewLocationTrackingController(locationTrackingService)

	// Worker location tracking routes (authenticated workers only)
	workerLocationTracking := router.Group("/worker/assignments")
	workerLocationTracking.Use(middleware.AuthMiddleware(), middleware.WorkerMiddleware())
	{
		// POST /api/v1/worker/assignments/:id/start-tracking - Start location tracking
		workerLocationTracking.POST("/:id/start-tracking", locationTrackingController.StartTracking)
		
		// POST /api/v1/worker/assignments/:id/update-location - Update worker location
		workerLocationTracking.POST("/:id/update-location", locationTrackingController.UpdateLocation)
		
		// POST /api/v1/worker/assignments/:id/stop-tracking - Stop location tracking
		workerLocationTracking.POST("/:id/stop-tracking", locationTrackingController.StopTracking)
		
		// GET /api/v1/worker/assignments/:id/customer-location - Get customer location
		workerLocationTracking.GET("/:id/customer-location", locationTrackingController.GetCustomerLocation)
		
		
	}

	// Health check route (no authentication required)
	router.GET("/location-tracking/health", locationTrackingController.HealthCheck)

	// Customer location viewing routes (authenticated users only)
	customerLocationTracking := router.Group("/assignments")
	customerLocationTracking.Use(middleware.AuthMiddleware())
	{
		// GET /api/v1/assignments/:id/worker-location - Get worker location for assignment
		customerLocationTracking.GET("/:id/worker-location", locationTrackingController.GetWorkerLocation)
		
		// GET /api/v1/assignments/:id/tracking-status - Get tracking status for assignment
		customerLocationTracking.GET("/:id/tracking-status", locationTrackingController.GetTrackingStatus)
	}

	// Booking-based location routes (authenticated users only)
	bookingLocationTracking := router.Group("/bookings")
	bookingLocationTracking.Use(middleware.AuthMiddleware())
	{
		// GET /api/v1/bookings/:id/worker-location - Get worker location for booking
		bookingLocationTracking.GET("/:id/worker-location", locationTrackingController.GetWorkerLocationByBooking)
	}
}
