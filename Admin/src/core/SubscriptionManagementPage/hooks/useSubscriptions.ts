import { useState, useEffect, useCallback } from "react";
import {
  SubscriptionPlan,
  GroupedSubscriptionPlan,
  CreateSubscriptionPlanRequest,
  CreateSubscriptionRequest,
  CreateSubscriptionWithBothDurationsRequest,
  UpdateSubscriptionRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [groupedSubscriptions, setGroupedSubscriptions] = useState<
    GroupedSubscriptionPlan[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/subscription-plans");
      console.log("Subscription API response:", response.data);

      // Handle different response structures
      let subscriptionsData = [];
      if (response.data && response.data.data) {
        // Standard structure: { data: [...] }
        subscriptionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array
        subscriptionsData = response.data;
      }

      const plans = Array.isArray(subscriptionsData) ? subscriptionsData : [];
      setSubscriptions(plans);

      // Convert individual plans to grouped format
      const grouped = convertToGroupedPlans(plans);
      setGroupedSubscriptions(grouped);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription plans"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to convert individual plans to grouped format - DEPRECATED
  // With the new single plan structure, we no longer need this function
  const convertToGroupedPlans = (
    plans: SubscriptionPlan[]
  ): GroupedSubscriptionPlan[] => {
    // Convert single plans to grouped format for backward compatibility
    return plans.map((plan) => ({
      name: plan.name,
      description: plan.description || "",
      is_active: plan.is_active,
      features: plan.features,
      monthly:
        plan.pricing && plan.pricing.find((p) => p.duration_type === "monthly")
          ? plan
          : undefined,
      yearly:
        plan.pricing && plan.pricing.find((p) => p.duration_type === "yearly")
          ? plan
          : undefined,
    }));
  };

  const createSubscription = async (
    data: CreateSubscriptionRequest
  ): Promise<SubscriptionPlan> => {
    try {
      const response = await apiClient.post("/admin/subscription-plans", data);
      const newSubscription = response.data.data;
      setSubscriptions((prev) => [...prev, newSubscription]);
      return newSubscription;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create subscription plan"
      );
    }
  };

  // New method for creating subscription plans with the new structure
  const createSubscriptionPlan = async (
    data: CreateSubscriptionPlanRequest
  ): Promise<SubscriptionPlan[]> => {
    try {
      // Create both monthly and yearly plans using the existing endpoint
      const planData = {
        name: data.name,
        monthly_price:
          data.pricing.find((p) => p.duration_type === "monthly")?.price || 0,
        yearly_price:
          data.pricing.find((p) => p.duration_type === "yearly")?.price || 0,
        description: data.description,
        features: data.features,
      };

      const response = await apiClient.post(
        "/admin/subscription-plans/both",
        planData
      );
      const newSubscriptions = response.data.data;
      setSubscriptions((prev) => [...prev, ...newSubscriptions]);

      // Refresh grouped subscriptions
      const allPlans = [...subscriptions, ...newSubscriptions];
      const grouped = convertToGroupedPlans(allPlans);
      setGroupedSubscriptions(grouped);

      return newSubscriptions;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create subscription plans"
      );
    }
  };

  const createSubscriptionWithBothDurations = async (
    data: CreateSubscriptionWithBothDurationsRequest
  ): Promise<SubscriptionPlan> => {
    try {
      const response = await apiClient.post("/admin/subscription-plans", data);
      const newSubscription = response.data.data;
      setSubscriptions((prev) => [...prev, newSubscription]);

      // Refresh grouped subscriptions
      const allPlans = [...subscriptions, newSubscription];
      const grouped = convertToGroupedPlans(allPlans);
      setGroupedSubscriptions(grouped);

      return newSubscription;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create subscription plan"
      );
    }
  };

  const updateSubscription = async (
    id: number,
    data: UpdateSubscriptionRequest
  ): Promise<SubscriptionPlan> => {
    try {
      const response = await apiClient.put(
        `/admin/subscription-plans/${id}`,
        data
      );
      const updatedSubscription = response.data.data;
      setSubscriptions((prev) =>
        prev.map((subscription) =>
          subscription.ID === id ? updatedSubscription : subscription
        )
      );
      return updatedSubscription;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to update subscription plan"
      );
    }
  };

  const deleteSubscription = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/subscription-plans/${id}`);
      setSubscriptions((prev) =>
        prev.filter((subscription) => subscription.ID !== id)
      );
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to delete subscription plan"
      );
    }
  };

  const toggleSubscriptionStatus = async (id: number): Promise<void> => {
    try {
      const subscription = subscriptions.find((s) => s.ID === id);
      if (!subscription) throw new Error("Subscription not found");

      // Optimistic update - update UI immediately
      const updatedSubscriptions = subscriptions.map((s) =>
        s.ID === id ? { ...s, is_active: !s.is_active } : s
      );
      setSubscriptions(updatedSubscriptions);

      const response = await apiClient.patch(
        `/admin/subscription-plans/${id}/toggle`
      );
      const updatedSubscription = response.data.data;

      // Update with server response to ensure consistency
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.ID === id ? updatedSubscription : sub))
      );
    } catch (err) {
      // Revert optimistic update on error
      const subscription = subscriptions.find((s) => s.ID === id);
      if (subscription) {
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.ID === id ? subscription : sub))
        );
      }
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to toggle subscription status"
      );
    }
  };

  const getSubscriptionById = async (id: number): Promise<SubscriptionPlan> => {
    try {
      const response = await apiClient.get(`/subscription-plans/${id}`);
      return response.data.data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch subscription plan"
      );
    }
  };

  const getActiveSubscriptions = async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await apiClient.get("/subscription-plans/active");
      return response.data.data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to fetch active subscription plans"
      );
    }
  };

  const getSubscriptionsByDuration = async (
    duration: string
  ): Promise<SubscriptionPlan[]> => {
    try {
      const response = await apiClient.get(
        `/subscription-plans/duration/${duration}`
      );
      return response.data.data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription plans by duration"
      );
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    groupedSubscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    createSubscription,
    createSubscriptionPlan,
    createSubscriptionWithBothDurations,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    getSubscriptionById,
    getActiveSubscriptions,
    getSubscriptionsByDuration,
  };
}
