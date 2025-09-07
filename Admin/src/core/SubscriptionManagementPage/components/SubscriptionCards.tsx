"use client";

import { useState } from "react";
import { Edit, Trash2, Calendar, Clock, CreditCard, Edit2 } from "lucide-react";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import { SubscriptionPlan } from "../types";

interface SubscriptionCardsProps {
  subscriptions: SubscriptionPlan[];
  onEdit: (subscription: SubscriptionPlan) => void;
  onDelete: (subscription: SubscriptionPlan) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
  togglingItems?: Set<number>;
}

export function SubscriptionCards({
  subscriptions,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  togglingItems = new Set(),
}: SubscriptionCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDurationLabel = (durationDays: number) => {
    if (durationDays <= 30) return "Monthly";
    if (durationDays <= 365) return "Yearly";
    return "One-time";
  };

  const getDurationIcon = (durationDays: number) => {
    if (durationDays <= 30) return <Calendar className="h-4 w-4" />;
    if (durationDays <= 365) return <Clock className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <ToggleRight className="h-4 w-4 text-gray-600" />
    ) : (
      <ToggleLeft className="h-4 w-4 text-gray-400" />
    );
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No subscription plans
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new subscription plan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => {
        const isActive = subscription.is_active;

        return (
          <div
            key={subscription.ID}
            className="bg-white rounded-lg border border-gray-200 flex flex-col h-full"
          >
            {/* Card Content */}
            <div className="p-6 flex-1">
              {/* Top Row: Duration Badge and Toggle */}
              <div className="flex items-center justify-between mb-4">
                {/* Duration Badge */}
                <span
                  className={`text-lg font-bold tracking-wide bg-gradient-to-r bg-clip-text text-transparent ${
                    subscription.duration_days === 30
                      ? "from-blue-500 to-blue-700"
                      : subscription.duration_days === 365
                      ? "from-green-500 to-green-700"
                      : "from-purple-500 to-purple-700"
                  }`}
                >
                  {getDurationLabel(subscription.duration_days).toUpperCase()}
                </span>

                {/* Status Toggle */}
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Toggle
                    checked={isActive}
                    onChange={() => onToggleStatus(subscription.ID)}
                    disabled={isLoading || togglingItems.has(subscription.ID)}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {subscription.name}
              </h3>

              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(subscription.price)}
                </span>
              </div>

              {/* Description */}
              {subscription.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {subscription.description}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Features */}
              {subscription.features && subscription.features.description && (
                <div className="space-y-2 mb-4">
                  {subscription.features.description
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
                        <span className="text-base text-gray-900 font-medium">
                          {feature.trim()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Always at Bottom */}
            <div className="p-6 pt-0">
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(subscription);
                  }}
                  disabled={isLoading}
                  leftIcon={<Edit2 className="h-4 w-4" />}
                  variant="primary"
                  size="sm"
                  className="flex-1 !bg-blue-600 !hover:bg-blue-700 active:bg-blue-800"
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(subscription);
                  }}
                  disabled={isLoading}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
