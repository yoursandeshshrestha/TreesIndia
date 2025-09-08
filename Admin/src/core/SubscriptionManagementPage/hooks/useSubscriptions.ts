import { useState, useEffect } from "react";
import {
  SubscriptionPlan,
  CreateSubscriptionRequest,
  CreateSubscriptionWithBothDurationsRequest,
  UpdateSubscriptionRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
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

      setSubscriptions(
        Array.isArray(subscriptionsData) ? subscriptionsData : []
      );
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

  const createSubscriptionWithBothDurations = async (
    data: CreateSubscriptionWithBothDurationsRequest
  ): Promise<SubscriptionPlan[]> => {
    try {
      const response = await apiClient.post(
        "/admin/subscription-plans/both",
        data
      );
      const newSubscriptions = response.data.data;
      setSubscriptions((prev) => [...prev, ...newSubscriptions]);
      return newSubscriptions;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create subscription plans"
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

      const updatedData = { is_active: !subscription.is_active };
      const response = await apiClient.put(
        `/admin/subscription-plans/${id}`,
        updatedData
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
  }, []);

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    createSubscription,
    createSubscriptionWithBothDurations,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    getSubscriptionById,
    getActiveSubscriptions,
    getSubscriptionsByDuration,
  };
}
