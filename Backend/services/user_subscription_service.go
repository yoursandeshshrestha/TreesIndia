package services

import (
	"errors"
	"fmt"
	"time"
	"treesindia/database"
	"treesindia/models"
	"treesindia/repositories"
	"treesindia/utils"

	"gorm.io/gorm"
)

// UserSubscriptionService handles user subscription business logic
type UserSubscriptionService struct {
	subscriptionRepo    *repositories.UserSubscriptionRepository
	userRepo           *repositories.UserRepository
	subscriptionCache  *utils.SubscriptionCache
	notificationService *NotificationService
}

// NewUserSubscriptionService creates a new user subscription service
func NewUserSubscriptionService() *UserSubscriptionService {
	return &UserSubscriptionService{
		subscriptionRepo:    repositories.NewUserSubscriptionRepository(),
		userRepo:           repositories.NewUserRepository(),
		subscriptionCache:  utils.NewSubscriptionCache(),
		notificationService: NewNotificationService(),
	}
}

// CheckAndUpdateSubscriptionStatus checks and updates user subscription status with cache
func (uss *UserSubscriptionService) CheckAndUpdateSubscriptionStatus(userID uint) (*models.User, error) {
	// Check cache first
	if cachedStatus, exists := uss.subscriptionCache.Get(userID); exists {
		// Return cached user with subscription status
		user := &models.User{}
		err := uss.userRepo.FindByID(user, userID)
		if err != nil {
			return nil, err
		}
		
		user.HasActiveSubscription = cachedStatus.HasActiveSubscription
		user.SubscriptionExpiryDate = cachedStatus.ExpiryDate
		return user, nil
	}
	
	// Cache miss, check database
	user := &models.User{}
	err := uss.userRepo.FindByID(user, userID)
	if err != nil {
		return nil, err
	}
	
	// Check if subscription has expired
	if user.HasActiveSubscription && user.SubscriptionExpiryDate != nil {
		if user.SubscriptionExpiryDate.Before(time.Now()) {
			// Subscription expired, update user status
			user.HasActiveSubscription = false
			user.SubscriptionExpiryDate = nil
			user.SubscriptionID = nil
			
			if err := uss.userRepo.Update(user); err != nil {
				return nil, err
			}
			
			// Invalidate cache
			uss.subscriptionCache.Invalidate(userID)
			
			// Send expiry notification
			go uss.notificationService.SendSubscriptionExpiredNotification(user)
		}
	}
	
	// Cache the result
	status := &utils.SubscriptionStatus{
		UserID: userID,
		HasActiveSubscription: user.HasActiveSubscription,
		ExpiryDate: user.SubscriptionExpiryDate,
	}
	uss.subscriptionCache.Set(userID, status)
	
	return user, nil
}

// CreateSubscriptionPaymentOrder creates a payment order for subscription purchase
func (uss *UserSubscriptionService) CreateSubscriptionPaymentOrder(userID uint, planID uint, durationType string) (*models.Payment, map[string]interface{}, error) {
	// Check current subscription status before purchasing
	user, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return nil, nil, err
	}
	
	// Check if user already has active subscription
	if user.HasActiveSubscription {
		return nil, nil, errors.New("user already has active subscription")
	}
	
	// Get subscription plan
	planService := NewSubscriptionPlanService()
	plan, err := planService.GetPlanByID(planID)
	if err != nil {
		return nil, nil, err
	}
	
	if !plan.IsActive {
		return nil, nil, errors.New("subscription plan is not active")
	}
	
	// Find the pricing option for the requested duration
	var selectedPricing *models.PricingOption
	for _, pricing := range plan.Pricing {
		if pricing.DurationType == durationType {
			selectedPricing = &pricing
			break
		}
	}
	
	if selectedPricing == nil {
		return nil, nil, errors.New("invalid duration type for this plan")
	}
	
	// Create payment request
	paymentService := NewPaymentService()
	paymentReq := &models.CreatePaymentRequest{
		UserID:           userID,
		Amount:           selectedPricing.Price,
		Currency:         "INR",
		Type:             models.PaymentTypeSubscription,
		Method:           models.PaymentMethodRazorpay,
		RelatedEntityType: "subscription",
		RelatedEntityID:   planID,
		Description:      fmt.Sprintf("Subscription purchase: %s", plan.Name),
		Notes:            fmt.Sprintf("Subscription plan: %s (Duration: %d days)", plan.Name, selectedPricing.DurationDays),
		Metadata: &models.JSONMap{
			"duration_type": durationType,
			"duration_days": selectedPricing.DurationDays,
		},
	}
	
	// Create Razorpay order
	payment, razorpayOrder, err := paymentService.CreateRazorpayOrder(paymentReq)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create payment order: %v", err)
	}
	
	return payment, razorpayOrder, nil
}

// CompleteSubscriptionPurchase completes subscription purchase with verified payment
func (uss *UserSubscriptionService) CompleteSubscriptionPurchase(userID uint, paymentID uint, razorpayPaymentID, razorpaySignature string) (*models.UserSubscription, error) {
	// Verify payment first
	paymentService := NewPaymentService()
	payment, err := paymentService.VerifyAndCompletePayment(paymentID, razorpayPaymentID, razorpaySignature)
	if err != nil {
		return nil, fmt.Errorf("payment verification failed: %v", err)
	}
	
	// Check if this is a subscription payment
	if payment.Type != models.PaymentTypeSubscription {
		return nil, errors.New("invalid payment type for subscription")
	}
	
	// Get subscription plan
	planService := NewSubscriptionPlanService()
	plan, err := planService.GetPlanByID(payment.RelatedEntityID)
	if err != nil {
		return nil, err
	}
	
	// Check current subscription status
	user, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return nil, err
	}
	
	// Check if user already has active subscription
	if user.HasActiveSubscription {
		return nil, errors.New("user already has active subscription")
	}
	
	// Find the pricing option for the payment's related entity
	var selectedPricing *models.PricingOption
	
	// Get duration type from payment metadata
	var durationType string
	if payment.Metadata != nil {
		if dt, exists := (*payment.Metadata)["duration_type"]; exists {
			if dtStr, ok := dt.(string); ok {
				durationType = dtStr
			}
		}
	}
	
	// If duration type is found in metadata, use it; otherwise fall back to first option
	if durationType != "" {
		for _, pricing := range plan.Pricing {
			if pricing.DurationType == durationType {
				selectedPricing = &pricing
				break
			}
		}
	}
	
	// Fallback to first pricing option if duration type not found or doesn't match
	if selectedPricing == nil {
		if len(plan.Pricing) > 0 {
			selectedPricing = &plan.Pricing[0]
		}
	}
	
	if selectedPricing == nil {
		return nil, errors.New("no pricing options found for this plan")
	}
	
	// Calculate subscription dates
	startDate := time.Now()
	endDate := startDate.AddDate(0, 0, selectedPricing.DurationDays)
	
	// Create subscription
	subscription := &models.UserSubscription{
		UserID:        userID,
		PlanID:        plan.ID,
		StartDate:     startDate,
		EndDate:       endDate,
		Status:        models.SubscriptionStatusActive,
		PaymentMethod: models.PaymentMethodRazorpay,
		PaymentID:     razorpayPaymentID,
		Amount:        selectedPricing.Price,
	}
	
	// Save subscription and update user in transaction
	err = database.GetDB().Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(subscription).Error; err != nil {
			return err
		}
		
		// Update user subscription status
		user.HasActiveSubscription = true
		user.SubscriptionExpiryDate = &endDate
		user.SubscriptionID = &subscription.ID
		
		if err := tx.Save(user).Error; err != nil {
			return err
		}
		
		return nil
	})
	
	if err != nil {
		return nil, err
	}
	
	// Invalidate cache
	uss.subscriptionCache.Invalidate(userID)
	
	// Send confirmation notification
	go uss.notificationService.SendSubscriptionConfirmationNotification(user, subscription)
	
	return subscription, nil
}

// PurchaseSubscription purchases a subscription for a user (wallet only)
func (uss *UserSubscriptionService) PurchaseSubscription(userID uint, planID uint, paymentMethod string, durationType string) (*models.UserSubscription, error) {
	// Check current subscription status before purchasing
	user, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return nil, err
	}
	
	// Check if user already has active subscription
	if user.HasActiveSubscription {
		return nil, errors.New("user already has active subscription")
	}
	
	// Get subscription plan
	planService := NewSubscriptionPlanService()
	plan, err := planService.GetPlanByID(planID)
	if err != nil {
		return nil, err
	}
	
	if !plan.IsActive {
		return nil, errors.New("subscription plan is not active")
	}
	
	// Find the pricing option for the requested duration
	var selectedPricing *models.PricingOption
	for _, pricing := range plan.Pricing {
		if pricing.DurationType == durationType {
			selectedPricing = &pricing
			break
		}
	}
	
	if selectedPricing == nil {
		return nil, errors.New("invalid duration type for this plan")
	}
	
	// Calculate subscription dates
	startDate := time.Now()
	
	// Calculate end date based on duration_days
	endDate := startDate.AddDate(0, 0, selectedPricing.DurationDays)
	
	// Process payment based on method
	var paymentID string
	if paymentMethod == models.PaymentMethodWallet {
		// Check wallet balance
		if user.WalletBalance < selectedPricing.Price {
			return nil, errors.New("insufficient wallet balance")
		}
		
		// Deduct from wallet
		user.WalletBalance -= selectedPricing.Price
		if err := uss.userRepo.Update(user); err != nil {
			return nil, err
		}
	} else if paymentMethod == models.PaymentMethodRazorpay {
		// For Razorpay, we need to create a payment order first
		// This method should only be called after payment verification
		return nil, errors.New("razorpay payment must be processed through payment verification flow")
	} else {
		return nil, errors.New("invalid payment method")
	}
	
	// Create subscription
	subscription := &models.UserSubscription{
		UserID:        userID,
		PlanID:        planID,
		StartDate:     startDate,
		EndDate:       endDate,
		Status:        models.SubscriptionStatusActive,
		PaymentMethod: paymentMethod,
		PaymentID:     paymentID,
		Amount:        selectedPricing.Price,
	}
	
	// Save subscription and update user in transaction
	err = database.GetDB().Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(subscription).Error; err != nil {
			return err
		}
		
		// Update user subscription status
		user.HasActiveSubscription = true
		user.SubscriptionExpiryDate = &endDate
		user.SubscriptionID = &subscription.ID
		
		if err := tx.Save(user).Error; err != nil {
			return err
		}
		
		return nil
	})
	
	if err != nil {
		return nil, err
	}
	
	// Invalidate cache
	uss.subscriptionCache.Invalidate(userID)
	
	// Send confirmation notification
	go uss.notificationService.SendSubscriptionConfirmationNotification(user, subscription)
	
	return subscription, nil
}

// GetUserSubscription retrieves current user subscription
func (uss *UserSubscriptionService) GetUserSubscription(userID uint) (*models.UserSubscription, error) {
	// Check subscription status first
	user, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return nil, err
	}
	
	if !user.HasActiveSubscription {
		return nil, errors.New("no active subscription")
	}
	
	if user.SubscriptionID == nil {
		return nil, errors.New("subscription ID is nil")
	}
	
	return uss.subscriptionRepo.GetByID(*user.SubscriptionID)
}

// GetUserSubscriptionHistory retrieves user subscription history
func (uss *UserSubscriptionService) GetUserSubscriptionHistory(userID uint) ([]models.UserSubscription, error) {
	// Check current subscription status
	_, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return nil, err
	}
	
	return uss.subscriptionRepo.GetAllByUserID(userID)
}

// ExtendSubscription extends user subscription (admin function)
func (uss *UserSubscriptionService) ExtendSubscription(userID uint, days int) error {
	user, err := uss.CheckAndUpdateSubscriptionStatus(userID)
	if err != nil {
		return err
	}
	
	if !user.HasActiveSubscription {
		return errors.New("user has no active subscription to extend")
	}
	
	// Extend expiry date
	newExpiryDate := user.SubscriptionExpiryDate.AddDate(0, 0, days)
	user.SubscriptionExpiryDate = &newExpiryDate
	
	if err := uss.userRepo.Update(user); err != nil {
		return err
	}
	
	// Update subscription record
	if user.SubscriptionID == nil {
		return errors.New("subscription ID is nil")
	}
	
	subscription, err := uss.subscriptionRepo.GetByID(*user.SubscriptionID)
	if err != nil {
		return err
	}
	
	subscription.EndDate = newExpiryDate
	if err := uss.subscriptionRepo.Update(subscription); err != nil {
		return err
	}
	
	// Invalidate cache
	uss.subscriptionCache.Invalidate(userID)
	
	// Send extension notification
	go uss.notificationService.SendSubscriptionExtendedNotification(user, days)
	
	return nil
}

// GetExpiringSubscriptions retrieves subscriptions expiring within specified days
func (uss *UserSubscriptionService) GetExpiringSubscriptions(days int) ([]models.UserSubscription, error) {
	expiryDate := time.Now().AddDate(0, 0, days)
	return uss.subscriptionRepo.GetExpiringSubscriptions(expiryDate)
}

// GetAllSubscriptions retrieves all subscriptions with pagination
func (uss *UserSubscriptionService) GetAllSubscriptions(page, pageSize int) ([]models.UserSubscription, int64, error) {
	return uss.subscriptionRepo.GetAll(page, pageSize)
}
