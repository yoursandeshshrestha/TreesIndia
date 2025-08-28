"use client";

import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
} from "lucide-react";

export function SubscriptionSection() {
  // Mock subscription data - replace with actual API call
  const subscription = {
    id: 1,
    planName: "Premium Plan",
    status: "active",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    price: 999,
    billingCycle: "monthly",
    features: [
      "Unlimited service bookings",
      "Priority customer support",
      "20% discount on all services",
      "Free cancellation",
      "Premium worker allocation",
    ],
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <h3 className="text-lg font-medium">{subscription.planName}</h3>
            </div>
            <p className="text-3xl font-bold">₹{subscription.price}</p>
            <p className="text-purple-100">per {subscription.billingCycle}</p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                subscription.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {subscription.status === "active" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-purple-200">Start Date</p>
            <p className="font-medium">{formatDate(subscription.startDate)}</p>
          </div>
          <div>
            <p className="text-purple-200">End Date</p>
            <p className="font-medium">{formatDate(subscription.endDate)}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">{getDaysRemaining()} days</span>{" "}
            remaining in your subscription
          </p>
        </div>
      </div>

      {/* Subscription Features */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Plan Features
        </h3>
        <div className="space-y-3">
          {subscription.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Billing History
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">January 2024</p>
                <p className="text-sm text-gray-600">Premium Plan - Monthly</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹999</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">December 2023</p>
                <p className="text-sm text-gray-600">Premium Plan - Monthly</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹999</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CreditCard className="w-5 h-5" />
          <span>Upgrade Plan</span>
        </button>

        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <XCircle className="w-5 h-5" />
          <span>Cancel Subscription</span>
        </button>
      </div>
    </div>
  );
}

