"use client";

import React from "react";
import { Crown, Plus, AlertCircle, CreditCard } from "lucide-react";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useRouter } from "next/navigation";

export function SubscriptionSection() {
  const router = useRouter();
  const { currentSubscription, subscriptionHistory, loading, error } =
    useUserSubscription();

  const handleBuySubscription = () => {
    router.push("/subscription-plans");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My Subscription
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your subscription plan and billing
          </p>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My Subscription
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your subscription plan and billing
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">
                Error Loading Subscription
              </h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          My Subscription
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Subscription Card or No Subscription */}
      {currentSubscription ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentSubscription.plan?.name || "Premium Plan"}
                </h3>
                <p className="text-sm text-gray-500">Active subscription</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentSubscription.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentSubscription.status.charAt(0).toUpperCase() +
                currentSubscription.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{currentSubscription.amount}
              </p>
              <p className="text-sm text-gray-500">One-time payment</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Expires</p>
              <p className="font-medium text-gray-900">
                {formatDate(currentSubscription.end_date)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Days remaining</span>
              <span className="text-lg font-semibold text-gray-900">
                {getDaysRemaining(currentSubscription.end_date)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Get a subscription to unlock premium features and auto-approval
              for property listings
            </p>
            <button
              onClick={handleBuySubscription}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Get Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Billing History */}
      {subscriptionHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Billing History
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {subscriptionHistory.map((subscription) => (
                <div
                  key={subscription.ID}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(subscription.start_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {subscription.plan?.name || "Subscription Plan"} -{" "}
                      {subscription.payment_method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{subscription.amount}
                    </p>
                    <p
                      className={`text-sm ${
                        subscription.status === "active"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
