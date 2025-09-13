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
	}

	// User subscription routes (authenticated)
	userSubscriptionController := controllers.NewUserSubscriptionController()
	subscriptionRoutes := router.Group("/subscriptions")
	subscriptionRoutes.Use(middleware.AuthMiddleware())
	{
		subscriptionRoutes.POST("/purchase", userSubscriptionController.PurchaseSubscription)
		subscriptionRoutes.POST("/create-payment-order", userSubscriptionController.CreateSubscriptionPaymentOrder)
		subscriptionRoutes.POST("/complete-purchase", userSubscriptionController.CompleteSubscriptionPurchase)
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
		adminPlanRoutes.PATCH("/:id/toggle", subscriptionPlanController.TogglePlanStatus)
	}

}
