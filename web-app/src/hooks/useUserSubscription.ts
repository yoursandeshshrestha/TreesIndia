import { useState, useEffect } from "react";
import { UserSubscription } from "@/types/subscription";
import {
  getUserSubscription,
  getUserSubscriptionHistory,
} from "@/lib/subscriptionApi";

export const useUserSubscription = () => {
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    UserSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current subscription
  const fetchCurrentSubscription = async () => {
    try {
      setError(null);
      const data = await getUserSubscription();
      setCurrentSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscription"
      );
    }
  };

  // Fetch subscription history
  const fetchSubscriptionHistory = async () => {
    try {
      setError(null);
      const data = await getUserSubscriptionHistory();
      setSubscriptionHistory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription history"
      );
    }
  };

  // Initialize user subscription data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCurrentSubscription(),
          fetchSubscriptionHistory(),
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize user subscription data"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    currentSubscription,
    subscriptionHistory,
    loading,
    error,
    fetchCurrentSubscription,
    fetchSubscriptionHistory,
  };
};
