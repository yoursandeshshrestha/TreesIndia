package controllers

import (
	"net/http"
	"strconv"
	"treesindia/services"
	"treesindia/views"

	"github.com/gin-gonic/gin"
)

// SubscriptionPlanController handles subscription plan requests
type SubscriptionPlanController struct {
	*BaseController
	planService *services.SubscriptionPlanService
}

// NewSubscriptionPlanController creates a new subscription plan controller
func NewSubscriptionPlanController() *SubscriptionPlanController {
	return &SubscriptionPlanController{
		BaseController: NewBaseController(),
		planService:    services.NewSubscriptionPlanService(),
	}
}

// CreatePlan godoc
// @Summary Create subscription plan with multiple pricing options
// @Description Create a new subscription plan with multiple pricing options (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param plan body map[string]interface{} true "Plan data with pricing array"
// @Success 201 {object} models.Response "Plan created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscription-plans [post]
func (spc *SubscriptionPlanController) CreatePlan(c *gin.Context) {
	var planData map[string]interface{}
	if err := c.ShouldBindJSON(&planData); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	plan, err := spc.planService.CreatePlanWithPricing(planData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create plan", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Subscription plan created successfully", plan))
}

// TogglePlanStatus godoc
// @Summary Toggle subscription plan status
// @Description Toggle the active status of a subscription plan (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param id path int true "Plan ID"
// @Success 200 {object} models.Response "Plan status toggled successfully"
// @Failure 400 {object} models.Response "Invalid plan ID"
// @Failure 404 {object} models.Response "Plan not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscription-plans/{id}/toggle [patch]
func (spc *SubscriptionPlanController) TogglePlanStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid plan ID", err.Error()))
		return
	}

	plan, err := spc.planService.TogglePlanStatus(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to toggle plan status", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plan status toggled successfully", plan))
}

// GetPlanByID godoc
// @Summary Get subscription plan by ID
// @Description Get a subscription plan by ID
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param id path int true "Plan ID"
// @Success 200 {object} models.Response "Plan retrieved successfully"
// @Failure 404 {object} models.Response "Plan not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscription-plans/{id} [get]

// GetAllPlans godoc
// @Summary Get all subscription plans
// @Description Get all subscription plans
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Plans retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscription-plans [get]
func (spc *SubscriptionPlanController) GetAllPlans(c *gin.Context) {
	plans, err := spc.planService.GetAllPlans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve plans", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plans retrieved successfully", plans))
}



// UpdatePlan godoc
// @Summary Update subscription plan
// @Description Update a subscription plan (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param id path int true "Plan ID"
// @Param plan body map[string]interface{} true "Plan update data"
// @Success 200 {object} models.Response "Plan updated successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 404 {object} models.Response "Plan not found"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscription-plans/{id} [put]
func (spc *SubscriptionPlanController) UpdatePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid plan ID", err.Error()))
		return
	}

	var planData map[string]interface{}
	if err := c.ShouldBindJSON(&planData); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	plan, err := spc.planService.UpdatePlan(uint(id), planData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to update plan", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plan updated successfully", plan))
}

// DeletePlan godoc
// @Summary Delete subscription plan
// @Description Delete a subscription plan (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param id path int true "Plan ID"
// @Success 200 {object} models.Response "Plan deleted successfully"
// @Failure 400 {object} models.Response "Invalid plan ID"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscription-plans/{id} [delete]
func (spc *SubscriptionPlanController) DeletePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid plan ID", err.Error()))
		return
	}

	err = spc.planService.DeletePlan(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to delete plan", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plan deleted successfully", nil))
}

