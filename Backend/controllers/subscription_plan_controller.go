package controllers

import (
	"net/http"
	"strconv"
	"treesindia/models"
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
// @Summary Create subscription plan
// @Description Create a new subscription plan (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param plan body map[string]interface{} true "Plan data"
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

	plan, err := spc.planService.CreatePlan(planData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create plan", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Subscription plan created successfully", plan))
}

// CreatePlanWithBothDurations godoc
// @Summary Create subscription plan with both monthly and yearly pricing
// @Description Create a subscription plan with both monthly and yearly pricing options (Admin only)
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param plan body map[string]interface{} true "Plan data with monthly_price and yearly_price"
// @Success 201 {object} models.Response "Plans created successfully"
// @Failure 400 {object} models.Response "Invalid request data"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /admin/subscription-plans/both [post]
func (spc *SubscriptionPlanController) CreatePlanWithBothDurations(c *gin.Context) {
	var planData map[string]interface{}
	if err := c.ShouldBindJSON(&planData); err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid request data", err.Error()))
		return
	}

	plans, err := spc.planService.CreatePlanWithBothDurations(planData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to create plans", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, views.CreateSuccessResponse("Subscription plans created successfully", plans))
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
func (spc *SubscriptionPlanController) GetPlanByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid plan ID", err.Error()))
		return
	}

	plan, err := spc.planService.GetPlanByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, views.CreateErrorResponse("Plan not found", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plan retrieved successfully", plan))
}

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

// GetGroupedPlans godoc
// @Summary Get grouped subscription plans
// @Description Get subscription plans grouped with monthly and yearly options
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Grouped plans retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscription-plans/grouped [get]
func (spc *SubscriptionPlanController) GetGroupedPlans(c *gin.Context) {
	groupedPlan, err := spc.planService.GetGroupedPlans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve grouped plans", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Grouped plans retrieved successfully", groupedPlan))
}

// GetActivePlans godoc
// @Summary Get active subscription plans
// @Description Get all active subscription plans
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Success 200 {object} models.Response "Active plans retrieved successfully"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscription-plans/active [get]
func (spc *SubscriptionPlanController) GetActivePlans(c *gin.Context) {
	plans, err := spc.planService.GetActivePlans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve active plans", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Active plans retrieved successfully", plans))
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

// GetPlansByDuration godoc
// @Summary Get subscription plans by duration
// @Description Get subscription plans filtered by duration
// @Tags Subscription Plans
// @Accept json
// @Produce json
// @Param duration path string true "Duration (monthly, yearly)"
// @Success 200 {object} models.Response "Plans retrieved successfully"
// @Failure 400 {object} models.Response "Invalid duration"
// @Failure 500 {object} models.Response "Internal server error"
// @Router /subscription-plans/duration/{duration} [get]
func (spc *SubscriptionPlanController) GetPlansByDuration(c *gin.Context) {
	duration := c.Param("duration")
	
	// Validate duration
	if duration != models.DurationMonthly && duration != models.DurationYearly {
		c.JSON(http.StatusBadRequest, views.CreateErrorResponse("Invalid duration", "Duration must be monthly or yearly"))
		return
	}

	plans, err := spc.planService.GetPlansByDuration(duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, views.CreateErrorResponse("Failed to retrieve plans", err.Error()))
		return
	}

	c.JSON(http.StatusOK, views.CreateSuccessResponse("Plans retrieved successfully", plans))
}
