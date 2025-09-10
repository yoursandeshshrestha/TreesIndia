"use client";

import React from "react";
import { Check } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan | null;
  isSelected?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  onAuthRequired?: () => void;
  isPopular?: boolean;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onSelect,
  onAuthRequired,
  isPopular = false,
}) => {
  // Early return if plan is undefined, null, or has no name
  if (!plan || !plan.name || plan.name.trim() === "") {
    return (
      <div
        className="relative rounded-2xl p-8 text-white"
        style={{ backgroundColor: "#00a871" }}
      >
        <div className="text-center">
          <p className="text-white">No subscription plan available</p>
          <p className="text-green-100 text-sm mt-2">
            Please contact support for assistance
          </p>
        </div>
      </div>
    );
  }
  const getPlanPrice = () => {
    const basePrice = plan.price || 0;
    // For yearly plans, show the actual yearly price
    // For monthly plans, show monthly price
    // For one-time plans, show the one-time price
    return basePrice;
  };

  const getPlanDuration = () => {
    const duration = plan.duration_days || 30; // Default to 30 days if not specified
    if (duration === 30) return "month";
    if (duration === 365) return "year";
    if (duration === 3650) return "lifetime"; // One-time plan
    if (duration === 1) return "day";
    return `${duration} days`;
  };

  const getPlanFeatures = () => {
    // First, try to get features from backend data
    if (plan.features && typeof plan.features === "object") {
      // Check if features has a "description" field (from backend JSONB)
      if (
        "description" in plan.features &&
        typeof plan.features.description === "string"
      ) {
        const featuresString = plan.features.description;
        // Split by newlines and filter out empty strings
        return featuresString
          .split("\n")
          .filter((feature) => feature.trim() !== "");
      }

      // Check if features has a "list" field (alternative structure)
      if ("list" in plan.features && Array.isArray(plan.features.list)) {
        return (plan.features.list as string[]).filter(
          (feature) => feature.trim() !== ""
        );
      }
    }

    // Fallback to default features based on plan name
    const planIndex = plan.name.toLowerCase();

    if (planIndex.includes("starter") || planIndex.includes("basic")) {
      return [
        "Auto-approval for property listings",
        "Priority customer support",
        "Basic analytics",
        "Email support (48-hour response)",
      ];
    } else if (planIndex.includes("growth") || planIndex.includes("premium")) {
      return [
        "Auto-approval for property listings",
        "Priority customer support",
        "Advanced analytics",
        "Priority support (24-hour response)",
        "Premium features access",
      ];
    } else if (
      planIndex.includes("enterprise") ||
      planIndex.includes("pro") ||
      planIndex.includes("one-time")
    ) {
      return [
        "Auto-approval for property listings",
        "Priority customer support",
        "Advanced analytics",
        "24/7 support",
        "All premium features",
        "Lifetime access",
      ];
    }

    // Default features
    return [
      "Auto-approval for property listings",
      "Priority customer support",
      "Premium features access",
    ];
  };

  const getButtonText = () => {
    const planIndex = plan.name.toLowerCase();
    if (planIndex.includes("starter") || planIndex.includes("basic")) {
      return "Start with Starter";
    } else if (planIndex.includes("growth") || planIndex.includes("premium")) {
      return "Grow with Growth";
    } else if (planIndex.includes("enterprise") || planIndex.includes("pro")) {
      return "Contact Sales";
    } else if (
      planIndex.includes("one-time") ||
      planIndex.includes("lifetime")
    ) {
      return "Get Lifetime Access";
    }
    return "Select Plan";
  };

  const getPlanDescription = () => {
    // Use the description from backend if available and not empty
    if (plan.description && plan.description.trim() !== "") {
      return plan.description;
    }

    // Fallback to default descriptions based on plan name
    const planIndex = plan.name.toLowerCase();
    if (planIndex.includes("starter") || planIndex.includes("basic")) {
      return "Perfect for creators and small businesses getting started.";
    } else if (planIndex.includes("growth") || planIndex.includes("premium")) {
      return "All-in-one tools for scaling brands and small teams.";
    } else if (planIndex.includes("enterprise") || planIndex.includes("pro")) {
      return "Custom solutions for enterprises scaling content marketing.";
    } else if (
      planIndex.includes("one-time") ||
      planIndex.includes("lifetime")
    ) {
      return "One-time payment for lifetime access to all features.";
    }
    return "Choose this plan for your property listing needs.";
  };

  const handlePlanSelect = () => {
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      onSelect(plan);
    }
  };

  return (
    <div
      className="relative rounded-2xl p-8 cursor-pointer transition-all text-white hover:shadow-lg"
      style={{ backgroundColor: "#00a871" }}
      onClick={handlePlanSelect}
    >
      {isPopular && (
        <div className="absolute -top-3 right-6">
          <div className="bg-purple-400 text-white text-xs px-3 py-1 rounded-full font-medium">
            Most popular
          </div>
        </div>
      )}

      <div className="text-left">
        <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>

        <p className="text-sm mb-6 text-green-100">{getPlanDescription()}</p>

        <div className="mb-6">
          <span className="text-4xl font-bold text-white">
            ₹{getPlanPrice()}
          </span>
          <span className="ml-1 text-green-100">/ {getPlanDuration()}</span>
        </div>

        <button
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-white text-green-600 hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            handlePlanSelect();
          }}
        >
          {getButtonText()}
        </button>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-white/20 text-left">
          <h4 className="font-semibold mb-4 text-white">
            What&apos;s included:
          </h4>
          <div className="space-y-3">
            {getPlanFeatures().map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-white">
                <Check className="w-4 h-4 mr-3 flex-shrink-0 text-white" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
