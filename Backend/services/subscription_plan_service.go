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

// CreatePlanWithPricing creates a single subscription plan with multiple pricing options
func (sps *SubscriptionPlanService) CreatePlanWithPricing(planData map[string]interface{}) (*models.SubscriptionPlan, error) {
	// Validate required fields
	name, ok := planData["name"].(string)
	if !ok || name == "" {
		return nil, errors.New("plan name is required")
	}
	
	description, _ := planData["description"].(string)
	isActive := true // Default to active for new plans
	
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
	
	// Validate pricing array
	pricingArray, ok := planData["pricing"].([]interface{})
	if !ok || len(pricingArray) == 0 {
		return nil, errors.New("pricing array is required and must not be empty")
	}
	
	var pricingOptions models.PricingOptionsJSONB
	
	// Process each pricing option
	for _, pricingItem := range pricingArray {
		pricing, ok := pricingItem.(map[string]interface{})
		if !ok {
			return nil, errors.New("invalid pricing item format")
		}
		
		durationType, ok := pricing["duration_type"].(string)
		if !ok || durationType == "" {
			return nil, errors.New("duration_type is required in pricing")
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
		
		price, ok := pricing["price"].(float64)
		if !ok || price <= 0 {
			return nil, errors.New("price must be greater than 0")
		}
		
		pricingOptions = append(pricingOptions, models.PricingOption{
			DurationType: durationType,
			DurationDays: durationDays,
			Price:        price,
		})
	}
	
	plan := &models.SubscriptionPlan{
		Name:        name,
		Description: description,
		IsActive:    isActive,
		Features:    features,
		Pricing:     pricingOptions,
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
	
	// Handle pricing - update the entire pricing array
	if pricingArray, ok := planData["pricing"].([]interface{}); ok && len(pricingArray) > 0 {
		var pricingOptions models.PricingOptionsJSONB
		
		// Process each pricing option
		for _, pricingItem := range pricingArray {
			pricing, ok := pricingItem.(map[string]interface{})
			if !ok {
				return nil, errors.New("invalid pricing item format")
			}
			
			durationType, ok := pricing["duration_type"].(string)
			if !ok || durationType == "" {
				return nil, errors.New("duration_type is required in pricing")
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
			
			price, ok := pricing["price"].(float64)
			if !ok || price <= 0 {
				return nil, errors.New("price must be greater than 0")
			}
			
			pricingOptions = append(pricingOptions, models.PricingOption{
				DurationType: durationType,
				DurationDays: durationDays,
				Price:        price,
			})
		}
		
		plan.Pricing = pricingOptions
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

// TogglePlanStatus toggles the active status of a subscription plan
func (sps *SubscriptionPlanService) TogglePlanStatus(id uint) (*models.SubscriptionPlan, error) {
	plan, err := sps.planRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	// Toggle the status
	plan.IsActive = !plan.IsActive
	
	if err := sps.planRepo.Update(plan); err != nil {
		return nil, err
	}
	
	return plan, nil
}

// GetPlansByDuration retrieves subscription plans that have a specific duration option
func (sps *SubscriptionPlanService) GetPlansByDuration(duration string) ([]models.SubscriptionPlan, error) {
	plans, err := sps.planRepo.GetAll()
	if err != nil {
		return nil, err
	}
	
	var filteredPlans []models.SubscriptionPlan
	for _, plan := range plans {
		for _, pricing := range plan.Pricing {
			if pricing.DurationType == duration {
				filteredPlans = append(filteredPlans, plan)
				break
			}
		}
	}
	
	return filteredPlans, nil
}

