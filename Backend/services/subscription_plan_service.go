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
	
	durationType, ok := planData["duration_type"].(string)
	if !ok || durationType == "" {
		return nil, errors.New("plan duration_type is required")
	}
	
	// Validate duration type
	var durationDays int
	switch durationType {
	case models.DurationMonthly:
		durationDays = models.DurationDaysMonthly
	case models.DurationYearly:
		durationDays = models.DurationDaysYearly
	default:
		return nil, errors.New("invalid duration_type. Must be monthly or yearly")
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
		Name:         name,
		DurationType: durationType,
		DurationDays: durationDays,
		Price:        price,
		Description:  description,
		IsActive:     isActive,
		Features:     features,
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
	
	if durationType, ok := planData["duration_type"].(string); ok && durationType != "" {
		// Validate and convert duration type
		var durationDays int
		switch durationType {
		case models.DurationMonthly:
			durationDays = models.DurationDaysMonthly
		case models.DurationYearly:
			durationDays = models.DurationDaysYearly
		default:
			return nil, errors.New("invalid duration_type. Must be monthly or yearly")
		}
		plan.DurationType = durationType
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

// GroupedPlan represents a plan with both monthly and yearly options
type GroupedPlan struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Features    models.JSONB           `json:"features"`
	IsActive    bool                   `json:"is_active"`
	Monthly     *models.SubscriptionPlan `json:"monthly,omitempty"`
	Yearly      *models.SubscriptionPlan `json:"yearly,omitempty"`
}

// GetGroupedPlans retrieves plans grouped by name with monthly and yearly options
func (sps *SubscriptionPlanService) GetGroupedPlans() (*GroupedPlan, error) {
	plans, err := sps.planRepo.GetActive()
	if err != nil {
		return nil, err
	}

	grouped := &GroupedPlan{}
	
	for _, plan := range plans {
		if plan.DurationType == models.DurationMonthly {
			grouped.Monthly = &plan
			grouped.Name = plan.Name
			grouped.Description = plan.Description
			grouped.Features = plan.Features
			grouped.IsActive = plan.IsActive
		} else if plan.DurationType == models.DurationYearly {
			grouped.Yearly = &plan
			if grouped.Name == "" {
				grouped.Name = plan.Name
				grouped.Description = plan.Description
				grouped.Features = plan.Features
				grouped.IsActive = plan.IsActive
			}
		}
	}

	return grouped, nil
}

// CreatePlanWithBothDurations creates both monthly and yearly plans
func (sps *SubscriptionPlanService) CreatePlanWithBothDurations(planData map[string]interface{}) ([]models.SubscriptionPlan, error) {
	// Validate required fields
	name, ok := planData["name"].(string)
	if !ok || name == "" {
		return nil, errors.New("plan name is required")
	}
	
	monthlyPrice, ok := planData["monthly_price"].(float64)
	if !ok || monthlyPrice <= 0 {
		return nil, errors.New("monthly price must be greater than 0")
	}
	
	yearlyPrice, ok := planData["yearly_price"].(float64)
	if !ok || yearlyPrice <= 0 {
		return nil, errors.New("yearly price must be greater than 0")
	}
	
	description, _ := planData["description"].(string)
	
	// Handle features - convert array to JSONB
	var features models.JSONB
	if featuresArray, ok := planData["features"].([]interface{}); ok && len(featuresArray) > 0 {
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
	
	// Create monthly plan
	monthlyPlan := &models.SubscriptionPlan{
		Name:         name,
		DurationType: models.DurationMonthly,
		DurationDays: models.DurationDaysMonthly,
		Price:        monthlyPrice,
		Description:  description,
		IsActive:     true,
		Features:     features,
	}
	
	// Create yearly plan
	yearlyPlan := &models.SubscriptionPlan{
		Name:         name,
		DurationType: models.DurationYearly,
		DurationDays: models.DurationDaysYearly,
		Price:        yearlyPrice,
		Description:  description,
		IsActive:     true,
		Features:     features,
	}
	
	// Save both plans
	if err := sps.planRepo.Create(monthlyPlan); err != nil {
		return nil, err
	}
	
	if err := sps.planRepo.Create(yearlyPlan); err != nil {
		return nil, err
	}
	
	return []models.SubscriptionPlan{*monthlyPlan, *yearlyPlan}, nil
}
