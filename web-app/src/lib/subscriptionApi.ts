import { authenticatedFetch } from "./auth-api";
import {
  SubscriptionPlan,
  GroupedSubscriptionPlan,
  UserSubscription,
  PurchaseSubscriptionRequest,
  SubscriptionResponse,
  SubscriptionPlansResponse,
  GroupedSubscriptionPlansResponse,
  SubscriptionHistoryResponse,
} from "@/types/subscription";
import { Payment, PaymentOrder } from "@/types/payment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Get all available subscription plans
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await fetch(`${API_BASE_URL}/subscription-plans/active`);

  if (!response.ok) {
    throw new Error("Failed to fetch subscription plans");
  }

  const data: SubscriptionPlansResponse = await response.json();
  return data.data;
};

// Get grouped subscription plans (monthly and yearly options)
export const getGroupedSubscriptionPlans =
  async (): Promise<GroupedSubscriptionPlan> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/subscription-plans/grouped`
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.error ||
        errorData.message ||
        "Failed to fetch grouped subscription plans";
      throw new Error(errorMessage);
    }

    const data: GroupedSubscriptionPlansResponse = await response.json();
    return data.data;
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
  planId: number
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
      body: JSON.stringify({ plan_id: planId }),
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
