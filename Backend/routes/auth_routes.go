package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes sets up authentication routes
func SetupAuthRoutes(r *gin.RouterGroup) {
	authController := controllers.NewAuthController()

	// Public routes (no authentication required)
	auth := r.Group("/auth")
	{
		auth.POST("/request-otp", authController.RequestOTP)
		auth.POST("/verify-otp", authController.VerifyOTP)
		auth.POST("/refresh-token", authController.RefreshToken)
	}

	// Protected routes (authentication required)
	protected := r.Group("/auth")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", authController.GetCurrentUser)
		protected.POST("/logout", authController.Logout)
		protected.POST("/register-device", authController.RegisterDeviceAfterLogin)
	}
}
