package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAddressRoutes sets up address-related routes
func SetupAddressRoutes(router *gin.RouterGroup) {
	addressController := controllers.NewAddressController()

	// Address routes (authentication required)
	addresses := router.Group("/addresses")
	addresses.Use(middleware.AuthMiddleware())
	{
		// POST /api/v1/addresses - Create a new address
		addresses.POST("", addressController.CreateAddress)
		
		// GET /api/v1/addresses - Get all user addresses
		addresses.GET("", addressController.GetAllAddresses)
		
		// GET /api/v1/addresses/default - Get user's default address
		addresses.GET("/default", addressController.GetDefaultAddress)
		
		// GET /api/v1/addresses/{id} - Get a specific address
		addresses.GET("/:id", addressController.GetAddressByID)
		
		// PUT /api/v1/addresses/{id} - Update an address
		addresses.PUT("/:id", addressController.UpdateAddress)
		
		// PATCH /api/v1/addresses/{id}/set-default - Set address as default
		addresses.PATCH("/:id/set-default", addressController.SetDefaultAddress)
		
		// DELETE /api/v1/addresses/{id} - Delete an address
		addresses.DELETE("/:id", addressController.DeleteAddress)
	}
}
