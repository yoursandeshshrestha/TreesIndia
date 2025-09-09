"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

// Components
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { SubscriptionCards } from "./components/SubscriptionCards";
import { SubscriptionModal } from "./components/SubscriptionModal";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

// Hooks and types
import { useSubscriptions } from "./hooks/useSubscriptions";
import {
  SubscriptionPlan,
  CreateSubscriptionWithBothDurationsRequest,
  UpdateSubscriptionRequest,
} from "./types";

function SubscriptionManagementPage() {
  // State management
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionPlan | null>(null);

  const {
    subscriptions: apiSubscriptions,
    createSubscriptionWithBothDurations,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    isLoading,
    error,
    fetchSubscriptions,
  } = useSubscriptions();

  const handleCreateSubscription = async (
    data: CreateSubscriptionWithBothDurationsRequest
  ) => {
    try {
      setIsCreating(true);
      await createSubscriptionWithBothDurations(data);
      toast.success("Subscription plans created successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create subscription plans"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubscription = async (data: UpdateSubscriptionRequest) => {
    if (!selectedSubscription) return;

    try {
      setIsUpdating(true);
      await updateSubscription(selectedSubscription.ID, data);
      toast.success("Subscription plan updated successfully");
      setIsModalOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription plan"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await deleteSubscription(selectedSubscription.ID);
      toast.success("Subscription plan deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete subscription plan"
      );
    }
  };

  const handleToggleStatus = async (id: number) => {
    if (togglingItems.has(id)) return;

    // Find the subscription to toggle
    const subscription = apiSubscriptions.find((s) => s.ID === id);
    if (!subscription) return;

    try {
      setTogglingItems((prev) => new Set(prev).add(id));
      await toggleSubscriptionStatus(id);
      toast.success(
        `Subscription "${subscription.name}" ${
          !subscription.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription status"
      );
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditSubscription = (subscription: SubscriptionPlan) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (subscription: SubscriptionPlan) => {
    setSelectedSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Error loading subscriptions: {error}
        </p>
        <button
          onClick={fetchSubscriptions}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SubscriptionHeader onCreateClick={() => setIsModalOpen(true)} />

      {/* Cards */}
      <SubscriptionCards
        subscriptions={apiSubscriptions}
        onEdit={handleEditSubscription}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        isLoading={isUpdating}
        togglingItems={togglingItems}
      />

      {/* Create/Edit Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        subscription={selectedSubscription}
        onSubmit={
          selectedSubscription
            ? (
                data:
                  | CreateSubscriptionWithBothDurationsRequest
                  | UpdateSubscriptionRequest
              ) => handleUpdateSubscription(data as UpdateSubscriptionRequest)
            : (
                data:
                  | CreateSubscriptionWithBothDurationsRequest
                  | UpdateSubscriptionRequest
              ) =>
                handleCreateSubscription(
                  data as CreateSubscriptionWithBothDurationsRequest
                )
        }
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSubscription}
        title="Delete Subscription Plan"
        message={`Are you sure you want to delete "${selectedSubscription?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default SubscriptionManagementPage;
