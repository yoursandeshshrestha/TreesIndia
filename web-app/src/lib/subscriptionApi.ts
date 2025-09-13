import { authenticatedFetch } from "./auth-api";
import {
  SubscriptionPlan,
  GroupedSubscriptionPlan,
  GroupedSubscriptionPlans,
  UserSubscription,
  PurchaseSubscriptionRequest,
  SubscriptionResponse,
  SubscriptionPlansResponse,
  GroupedSubscriptionPlansResponse,
  MultipleGroupedSubscriptionPlansResponse,
  SubscriptionHistoryResponse,
} from "@/types/subscription";
import { Payment, PaymentOrder } from "@/types/payment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to convert individual plans to grouped format
const convertToGroupedPlans = (
  plans: SubscriptionPlan[]
): GroupedSubscriptionPlans => {
  const groupedMap = new Map<string, GroupedSubscriptionPlan>();

  plans.forEach((plan) => {
    if (!groupedMap.has(plan.name)) {
      groupedMap.set(plan.name, {
        name: plan.name,
        description: plan.description || "",
        is_active: plan.is_active,
        features: plan.features,
        monthly: undefined,
        yearly: undefined,
      });
    }

    const grouped = groupedMap.get(plan.name)!;

    // Handle new pricing array structure
    if (plan.pricing && plan.pricing.length > 0) {
      plan.pricing.forEach((pricing) => {
        if (pricing.duration_type === "monthly") {
          // Create a plan object for monthly pricing
          grouped.monthly = {
            ...plan,
            duration_type: "monthly",
            duration_days: pricing.duration_days,
            price: pricing.price,
            // Remove the pricing array for individual plan display
            pricing: [pricing],
          };
        } else if (pricing.duration_type === "yearly") {
          // Create a plan object for yearly pricing
          grouped.yearly = {
            ...plan,
            duration_type: "yearly",
            duration_days: pricing.duration_days,
            price: pricing.price,
            // Remove the pricing array for individual plan display
            pricing: [pricing],
          };
        }
      });
    } else {
      // Fallback to legacy fields for backward compatibility
      if (plan.duration_type === "monthly") {
        grouped.monthly = plan;
      } else if (plan.duration_type === "yearly") {
        grouped.yearly = plan;
      }
    }
  });

  return Array.from(groupedMap.values());
};

// Get all available subscription plans
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await fetch(`${API_BASE_URL}/subscription-plans`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error ||
      errorData.message ||
      "Failed to fetch subscription plans";
    throw new Error(errorMessage);
  }

  const data: SubscriptionPlansResponse = await response.json();
  return data.data;
};

// Get grouped subscription plans (monthly and yearly options) - single plan
export const getGroupedSubscriptionPlans =
  async (): Promise<GroupedSubscriptionPlan> => {
    // Use the main subscription-plans endpoint and convert to grouped format
    const plans = await getSubscriptionPlans();
    const groupedPlans = convertToGroupedPlans(plans);

    // Return the first grouped plan (assuming single plan with multiple pricing options)
    if (groupedPlans.length > 0) {
      return groupedPlans[0];
    }

    // Return empty grouped plan if no plans found
    return {
      name: "",
      description: "",
      is_active: false,
      features: {},
      monthly: undefined,
      yearly: undefined,
    };
  };

// Get all subscription plans as grouped format (multiple plan types)
export const getAllGroupedSubscriptionPlans =
  async (): Promise<GroupedSubscriptionPlans> => {
    try {
      // Get individual plans and convert them to grouped format
      const plans = await getSubscriptionPlans();
      return convertToGroupedPlans(plans);
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
      throw new Error("Failed to fetch subscription plans");
    }
  };

// Get user's current subscription
export const getUserSubscription =
  async (): Promise<UserSubscription | null> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/subscriptions/my-subscription`
    );

    if (response.status === 404) {
      return null; // No active subscription
    }

    if (!response.ok) {
      throw new Error("Failed to fetch user subscription");
    }

    const data: SubscriptionResponse = await response.json();
    return data.data;
  };

// Get user's subscription history
export const getUserSubscriptionHistory = async (): Promise<
  UserSubscription[]
> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/subscriptions/history`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subscription history");
  }

  const data: SubscriptionHistoryResponse = await response.json();
  return data.data;
};

// Create subscription payment order
export const createSubscriptionPaymentOrder = async (
  planId: number,
  durationType: "monthly" | "yearly"
): Promise<{
  payment: Payment;
  order: PaymentOrder;
  key_id: string;
}> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/subscriptions/create-payment-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        duration_type: durationType,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    // Extract the specific error message from the API response
    const errorMessage =
      errorData.error || errorData.message || "Failed to create payment order";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Complete subscription purchase
export const completeSubscriptionPurchase = async (
  paymentId: number,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<UserSubscription> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/subscriptions/complete-purchase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData.error ||
      errorData.message ||
      "Failed to complete subscription purchase";
    throw new Error(errorMessage);
  }

  const data: SubscriptionResponse = await response.json();
  return data.data;
};

// Purchase a subscription (wallet only)
export const purchaseSubscription = async (
  request: PurchaseSubscriptionRequest
): Promise<UserSubscription> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/subscriptions/purchase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData.error || errorData.message || "Failed to purchase subscription";
    throw new Error(errorMessage);
  }

  const data: SubscriptionResponse = await response.json();
  return data.data;
};
