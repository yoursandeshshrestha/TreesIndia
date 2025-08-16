package routes

import (
	"treesindia/controllers"
	"treesindia/middleware"

	"github.com/gin-gonic/gin"
)

// SetupSubscriptionRoutes sets up subscription-related routes
func SetupSubscriptionRoutes(router *gin.RouterGroup) {
	// Subscription plan routes (public)
	subscriptionPlanController := controllers.NewSubscriptionPlanController()
	planRoutes := router.Group("/subscription-plans")
	{
		planRoutes.GET("", subscriptionPlanController.GetAllPlans)
		planRoutes.GET("/active", subscriptionPlanController.GetActivePlans)
		planRoutes.GET("/duration/:duration", subscriptionPlanController.GetPlansByDuration)
		planRoutes.GET("/:id", subscriptionPlanController.GetPlanByID)
	}

	// User subscription routes (authenticated)
	userSubscriptionController := controllers.NewUserSubscriptionController()
	subscriptionRoutes := router.Group("/subscriptions")
	subscriptionRoutes.Use(middleware.AuthMiddleware())
	{
		subscriptionRoutes.POST("/purchase", userSubscriptionController.PurchaseSubscription)
		subscriptionRoutes.GET("/my-subscription", userSubscriptionController.GetUserSubscription)
		subscriptionRoutes.GET("/history", userSubscriptionController.GetUserSubscriptionHistory)
	}
}

// SetupAdminSubscriptionRoutes sets up admin subscription routes
func SetupAdminSubscriptionRoutes(router *gin.RouterGroup) {
	// Admin subscription plan routes
	subscriptionPlanController := controllers.NewSubscriptionPlanController()
	adminPlanRoutes := router.Group("/subscription-plans")
	adminPlanRoutes.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminPlanRoutes.POST("", subscriptionPlanController.CreatePlan)
		adminPlanRoutes.PUT("/:id", subscriptionPlanController.UpdatePlan)
		adminPlanRoutes.DELETE("/:id", subscriptionPlanController.DeletePlan)
	}

	// Admin user subscription routes
	userSubscriptionController := controllers.NewUserSubscriptionController()
	adminSubscriptionRoutes := router.Group("/subscriptions")
	adminSubscriptionRoutes.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		adminSubscriptionRoutes.GET("", userSubscriptionController.GetAllSubscriptions)
		adminSubscriptionRoutes.GET("/expiring", userSubscriptionController.GetExpiringSubscriptions)
		adminSubscriptionRoutes.PUT("/users/:user_id/extend", userSubscriptionController.ExtendSubscription)
		adminSubscriptionRoutes.PUT("/users/:user_id/refresh-status", userSubscriptionController.RefreshUserSubscriptionStatus)
	}
}
