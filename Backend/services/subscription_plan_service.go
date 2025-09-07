package services

import (
	"errors"
	"strings"
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
	
	// Convert duration string to days
	var durationDays int
	switch duration {
	case models.DurationMonthly:
		durationDays = 30
	case models.DurationYearly:
		durationDays = 365
	case models.DurationOneTime:
		durationDays = 3650 // 10 years for one-time
	default:
		return nil, errors.New("invalid duration. Must be monthly, yearly, or one_time")
	}
	
	price, ok := planData["price"].(float64)
	if !ok || price <= 0 {
		return nil, errors.New("plan price must be greater than 0")
	}
	
	description, _ := planData["description"].(string)
	isActive := true // Default to active for new plans
	
	// Handle features - convert array to JSONB
	var features models.JSONB
	if featuresArray, ok := planData["features"].([]interface{}); ok && len(featuresArray) > 0 {
		// Convert features array to bullet points string
		var featuresList []string
		for _, feature := range featuresArray {
			if featureStr, ok := feature.(string); ok && featureStr != "" {
				featuresList = append(featuresList, featureStr)
			}
		}
		if len(featuresList) > 0 {
			features = models.JSONB{
				"description": strings.Join(featuresList, "\n"),
			}
		}
	}
	
	plan := &models.SubscriptionPlan{
		Name:        name,
		DurationDays: durationDays,
		Price:       price,
		Description: description,
		IsActive:    isActive,
		Features:    features,
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
		// Convert duration string to days
		var durationDays int
		switch duration {
		case models.DurationMonthly:
			durationDays = 30
		case models.DurationYearly:
			durationDays = 365
		case models.DurationOneTime:
			durationDays = 3650 // 10 years for one-time
		default:
			return nil, errors.New("invalid duration. Must be monthly, yearly, or one_time")
		}
		plan.DurationDays = durationDays
	}
	
	if price, ok := planData["price"].(float64); ok && price > 0 {
		plan.Price = price
	}
	
	if description, ok := planData["description"].(string); ok {
		plan.Description = description
	}
	
	// Only update is_active if explicitly provided
	if isActive, ok := planData["is_active"].(bool); ok {
		plan.IsActive = isActive
	}
	
	// Handle features - convert array to JSONB
	if featuresArray, ok := planData["features"].([]interface{}); ok {
		if len(featuresArray) > 0 {
			// Convert features array to bullet points string
			var featuresList []string
			for _, feature := range featuresArray {
				if featureStr, ok := feature.(string); ok && featureStr != "" {
					featuresList = append(featuresList, featureStr)
				}
			}
			if len(featuresList) > 0 {
				plan.Features = models.JSONB{
					"description": strings.Join(featuresList, "\n"),
				}
			} else {
				plan.Features = nil
			}
		} else {
			// Empty array means clear features
			plan.Features = nil
		}
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
