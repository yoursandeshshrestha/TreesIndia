import { useState, useEffect, useCallback } from "react";
import {
  SubscriptionPlan,
  GroupedSubscriptionPlan,
  GroupedSubscriptionPlans,
  UserSubscription,
  PurchaseSubscriptionRequest,
} from "@/types/subscription";
import {
  getSubscriptionPlans,
  getGroupedSubscriptionPlans,
  getAllGroupedSubscriptionPlans,
  getUserSubscription,
  getUserSubscriptionHistory,
  purchaseSubscription,
  createSubscriptionPaymentOrder,
  completeSubscriptionPurchase,
} from "@/lib/subscriptionApi";

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [groupedPlan, setGroupedPlan] =
    useState<GroupedSubscriptionPlan | null>(null);
  const [groupedPlans, setGroupedPlans] = useState<GroupedSubscriptionPlans>(
    []
  );
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    UserSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setError(null);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
    }
  }, []);

  // Fetch grouped subscription plans (single plan - legacy)
  const fetchGroupedPlans = useCallback(async () => {
    try {
      setError(null);
      const data = await getGroupedSubscriptionPlans();
      setGroupedPlan(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch grouped plans"
      );
    }
  }, []);

  // Fetch all grouped subscription plans (multiple plan types)
  const fetchAllGroupedPlans = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllGroupedSubscriptionPlans();
      setGroupedPlans(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch grouped plans"
      );
    }
  }, []);

  // Fetch current subscription
  const fetchCurrentSubscription = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserSubscription();
      setCurrentSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscription"
      );
    }
  }, []);

  // Fetch subscription history
  const fetchSubscriptionHistory = useCallback(async () => {
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
  }, []);

  // Create subscription payment order
  const createPaymentOrder = useCallback(
    async (planId: number, durationType: "monthly" | "yearly") => {
      try {
        setError(null);
        const data = await createSubscriptionPaymentOrder(planId, durationType);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create payment order";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Complete subscription purchase
  const completePurchase = useCallback(
    async (
      paymentId: number,
      razorpayPaymentId: string,
      razorpaySignature: string
    ): Promise<UserSubscription> => {
      try {
        setError(null);
        const data = await completeSubscriptionPurchase(
          paymentId,
          razorpayPaymentId,
          razorpaySignature
        );

        // Refresh current subscription after purchase
        await fetchCurrentSubscription();
        await fetchSubscriptionHistory();

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to complete subscription purchase";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchCurrentSubscription, fetchSubscriptionHistory]
  );

  // Purchase subscription (wallet only)
  const purchase = useCallback(
    async (request: PurchaseSubscriptionRequest): Promise<UserSubscription> => {
      try {
        setError(null);
        const data = await purchaseSubscription(request);

        // Refresh current subscription after purchase
        await fetchCurrentSubscription();
        await fetchSubscriptionHistory();

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to purchase subscription";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchCurrentSubscription, fetchSubscriptionHistory]
  );

  // Initialize data - only fetch plans, not user-specific data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchGroupedPlans();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize subscription data"
        );
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    plans,
    groupedPlan,
    groupedPlans,
    currentSubscription,
    subscriptionHistory,
    loading,
    error,
    fetchPlans,
    fetchGroupedPlans,
    fetchAllGroupedPlans,
    fetchCurrentSubscription,
    fetchSubscriptionHistory,
    purchase,
    createPaymentOrder,
    completePurchase,
  };
};
