"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { SubscriptionPlan } from "../types";

interface SubscriptionTableProps {
  subscriptions: SubscriptionPlan[];
  onEdit: (subscription: SubscriptionPlan) => void;
  onDelete: (subscription: SubscriptionPlan) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
}

export function SubscriptionTable({
  subscriptions,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: SubscriptionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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
    switch (durationDays) {
      case 30:
        return "Monthly";
      case 365:
        return "Yearly";
      case 3650:
        return "One Time";
      default:
        return `${durationDays} days`;
    }
  };

  const getDurationIcon = (durationDays: number) => {
    switch (durationDays) {
      case 30:
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 365:
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 3650:
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No subscription plans found
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first subscription plan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <>
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.name}
                        </div>
                        {subscription.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {subscription.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getDurationIcon(subscription.duration_days)}
                      <span className="text-sm text-gray-900">
                        {getDurationLabel(subscription.duration_days)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(subscription.price)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {subscription.features &&
                      subscription.features.description ? (
                        <div className="max-w-xs">
                          <div className="text-gray-600 text-xs line-clamp-2">
                            {subscription.features.description
                              .split("\n")
                              .slice(0, 2)
                              .join(" • ")}
                          </div>
                          {subscription.features.description.split("\n")
                            .length > 2 && (
                            <div className="text-xs text-gray-500 mt-1">
                              +
                              {subscription.features.description.split("\n")
                                .length - 2}{" "}
                              more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          No features
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(subscription.id)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        subscription.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {subscription.is_active ? (
                        <ToggleRight className="h-3 w-3" />
                      ) : (
                        <ToggleLeft className="h-3 w-3" />
                      )}
                      {subscription.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscription.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(subscription)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Edit subscription"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(subscription)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(subscription.id) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Plan ID:
                            </span>
                            <span className="ml-2 text-gray-600">
                              #{subscription.id}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Last Updated:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {formatDate(subscription.updated_at)}
                            </span>
                          </div>
                        </div>
                        {subscription.features &&
                          subscription.features.description && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Features:
                              </span>
                              <div className="mt-2">
                                <div className="text-gray-600 text-sm whitespace-pre-line">
                                  {subscription.features.description}
                                </div>
                              </div>
                            </div>
                          )}
                        {subscription.user_subscriptions &&
                          subscription.user_subscriptions.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Active Subscriptions:
                              </span>
                              <span className="ml-2 text-gray-600">
                                {subscription.user_subscriptions.length} users
                              </span>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
