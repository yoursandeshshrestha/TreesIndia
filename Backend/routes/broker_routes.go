package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupBrokerRoutes sets up broker-related routes
func SetupBrokerRoutes(router *gin.RouterGroup) {
	brokerController := controllers.NewBrokerController()

	// Broker profile management (requires broker role)
	brokerProfileGroup := router.Group("/brokers/profile")
	brokerProfileGroup.Use(middleware.AuthMiddleware(), middleware.BrokerMiddleware())
	{
		// GET /api/v1/brokers/profile - Get own broker profile
		brokerProfileGroup.GET("", brokerController.GetBrokerProfile)
		// PUT /api/v1/brokers/profile - Update own broker profile
		brokerProfileGroup.PUT("", brokerController.UpdateBrokerProfile)
	}
}
