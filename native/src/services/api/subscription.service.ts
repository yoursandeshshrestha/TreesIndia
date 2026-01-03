import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface PricingOption {
  duration_type: 'monthly' | 'yearly';
  duration_days: number;
  price: number;
}

export interface SubscriptionPlan {
  id: number;
  ID?: number; // Backend may return capital ID
  name: string;
  description?: string;
  pricing: PricingOption[]; // Array of pricing options
  features?: string[] | Record<string, unknown>;
  is_active: boolean;
  isActive?: boolean; // Backend may return camelCase
  created_at?: string;
  updated_at?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  // Legacy fields for backward compatibility
  price?: number;
  duration?: string;
  duration_days?: number;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  amount: number;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionHistory {
  id: number;
  user_id: number;
  plan_id: number;
  plan?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  amount: number;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

class SubscriptionService {
  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscription-plans`);
    const data = await handleResponse<any>(response);

    let plans: SubscriptionPlan[] = [];

    if (Array.isArray(data)) {
      plans = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.plans)) {
        plans = data.plans;
      } else if (Array.isArray(data.data)) {
        plans = data.data;
      } else if (data.data === null) {
        plans = [];
      } else {
        console.warn('Unexpected subscription plans response format:', data);
        plans = [];
      }
    }

    // Normalize the plans - handle both ID formats and ensure pricing is an array
    return plans.map((plan) => ({
      ...plan,
      id: plan.id || plan.ID || 0,
      is_active: plan.is_active ?? plan.isActive ?? true,
      pricing: Array.isArray(plan.pricing) ? plan.pricing : [],
      features: (() => {
        if (Array.isArray(plan.features)) {
          return plan.features;
        }
        if (typeof plan.features === 'object' && plan.features !== null) {
          // Backend stores features as {"description": "feature1\nfeature2\nfeature3"}
          if ('description' in plan.features && typeof plan.features.description === 'string') {
            // Split by newline and filter out empty strings
            return plan.features.description.split('\n').filter((f: string) => f.trim() !== '');
          }
          // Fallback: try to extract string values from object
          return Object.values(plan.features).filter((f): f is string => typeof f === 'string');
        }
        return [];
      })(),
    }));
  }

  /**
   * Get user's current active subscription
   */
  async getMySubscription(): Promise<UserSubscription | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/my-subscription`);
      const data = await handleResponse<any>(response);

      if (!data || data === null) {
        return null;
      }

      // Handle different response formats
      const subscription = data.subscription || data.data || data;

      if (!subscription || typeof subscription !== 'object') {
        return null;
      }

      return subscription as UserSubscription;
    } catch (error: any) {
      // If 404 or no subscription found, return null
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user's subscription history
   */
  async getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/history`);
      const data = await handleResponse<any>(response);

      let history: SubscriptionHistory[] = [];

      if (Array.isArray(data)) {
        history = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.history)) {
          history = data.history;
        } else if (Array.isArray(data.data)) {
          history = data.data;
        } else if (data.data === null) {
          history = [];
        } else {
          console.warn('Unexpected subscription history response format:', data);
          history = [];
        }
      }

      return history;
    } catch (error: any) {
      // If 404 or no history found, return empty array
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Purchase a subscription (for wallet payment)
   */
  async purchaseSubscription(
    planId: number,
    paymentMethod: 'wallet' | 'razorpay',
    durationType: 'monthly' | 'yearly'
  ): Promise<UserSubscription> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        payment_method: paymentMethod,
        duration_type: durationType,
      }),
    });

    const data = await handleResponse<any>(response);
    return (data.subscription || data.data || data) as UserSubscription;
  }

  /**
   * Create payment order for Razorpay
   */
  async createPaymentOrder(planId: number, durationType?: 'monthly' | 'yearly'): Promise<{
    payment: {
      ID: number;
      id?: number;
      payment_reference: string;
      amount: number;
      status: string;
      type: string;
      method: string;
      razorpay_order_id?: string;
    };
    payment_order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      key_id?: string;
    };
  }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/create-payment-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        ...(durationType && { duration_type: durationType }),
      }),
    });

    const data = await handleResponse<any>(response);
    return data;
  }

  /**
   * Complete subscription purchase after Razorpay payment
   */
  async completePurchase(
    paymentId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<UserSubscription> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/complete-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });

    const data = await handleResponse<any>(response);
    return (data.subscription || data.data || data) as UserSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/cancel`, {
      method: 'PUT',
    });

    await handleResponse(response);
  }

  /**
   * Renew subscription
   */
  async renewSubscription(paymentMethod: 'wallet' | 'razorpay'): Promise<UserSubscription> {
    const response = await authenticatedFetch(`${API_BASE_URL}/subscriptions/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_method: paymentMethod,
      }),
    });

    const data = await handleResponse<any>(response);
    return (data.subscription || data.data || data) as UserSubscription;
  }
}

export const subscriptionService = new SubscriptionService();

