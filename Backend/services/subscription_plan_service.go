package services

import (
	"errors"
	"treesindia/models"
	"treesindia/repositories"
)

// SubscriptionPlanService handles subscription plan business logic
type SubscriptionPlanService struct {
	planRepo *repositories.SubscriptionPlanRepository
}

// NewSubscriptionPlanService creates a new subscription plan service
func NewSubscriptionPlanService() *SubscriptionPlanService {
	return &SubscriptionPlanService{
		planRepo: repositories.NewSubscriptionPlanRepository(),
	}
}

// CreatePlan creates a new subscription plan
func (sps *SubscriptionPlanService) CreatePlan(planData map[string]interface{}) (*models.SubscriptionPlan, error) {
	// Validate required fields
	name, ok := planData["name"].(string)
	if !ok || name == "" {
		return nil, errors.New("plan name is required")
	}
	
	duration, ok := planData["duration"].(string)
	if !ok || duration == "" {
		return nil, errors.New("plan duration is required")
	}
	
	// Validate duration
	if duration != models.DurationMonthly && duration != models.DurationYearly && duration != models.DurationOneTime {
		return nil, errors.New("invalid duration. Must be monthly, yearly, or one_time")
	}
	
	price, ok := planData["price"].(float64)
	if !ok || price <= 0 {
		return nil, errors.New("plan price must be greater than 0")
	}
	
	description, _ := planData["description"].(string)
	isActive, _ := planData["is_active"].(bool)
	
	plan := &models.SubscriptionPlan{
		Name:        name,
		Duration:    duration,
		Price:       price,
		Description: description,
		IsActive:    isActive,
	}
	
	if err := sps.planRepo.Create(plan); err != nil {
		return nil, err
	}
	
	return plan, nil
}

// GetPlanByID retrieves a subscription plan by ID
func (sps *SubscriptionPlanService) GetPlanByID(id uint) (*models.SubscriptionPlan, error) {
	return sps.planRepo.GetByID(id)
}

// GetAllPlans retrieves all subscription plans
func (sps *SubscriptionPlanService) GetAllPlans() ([]models.SubscriptionPlan, error) {
	return sps.planRepo.GetAll()
}

// GetActivePlans retrieves all active subscription plans
func (sps *SubscriptionPlanService) GetActivePlans() ([]models.SubscriptionPlan, error) {
	return sps.planRepo.GetActive()
}

// UpdatePlan updates a subscription plan
func (sps *SubscriptionPlanService) UpdatePlan(id uint, planData map[string]interface{}) (*models.SubscriptionPlan, error) {
	plan, err := sps.planRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	// Update fields if provided
	if name, ok := planData["name"].(string); ok && name != "" {
		plan.Name = name
	}
	
	if duration, ok := planData["duration"].(string); ok && duration != "" {
		// Validate duration
		if duration != models.DurationMonthly && duration != models.DurationYearly && duration != models.DurationOneTime {
			return nil, errors.New("invalid duration. Must be monthly, yearly, or one_time")
		}
		plan.Duration = duration
	}
	
	if price, ok := planData["price"].(float64); ok && price > 0 {
		plan.Price = price
	}
	
	if description, ok := planData["description"].(string); ok {
		plan.Description = description
	}
	
	if isActive, ok := planData["is_active"].(bool); ok {
		plan.IsActive = isActive
	}
	
	if err := sps.planRepo.Update(plan); err != nil {
		return nil, err
	}
	
	return plan, nil
}

// DeletePlan deletes a subscription plan
func (sps *SubscriptionPlanService) DeletePlan(id uint) error {
	// Check if plan has active subscriptions
	// TODO: Add check for active subscriptions before deletion
	return sps.planRepo.Delete(id)
}

// GetPlansByDuration retrieves subscription plans by duration
func (sps *SubscriptionPlanService) GetPlansByDuration(duration string) ([]models.SubscriptionPlan, error) {
	return sps.planRepo.GetByDuration(duration)
}
