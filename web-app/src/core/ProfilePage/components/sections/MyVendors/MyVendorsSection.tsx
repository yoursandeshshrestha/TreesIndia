"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { useUserVendors, useVendorStats } from "@/hooks/useVendors";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { ConfirmModal } from "@/commonComponents/ConfirmModal";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";
import { deleteVendor } from "@/lib/vendorApi";
import { useRouter } from "next/navigation";
import { isSubscriptionRequiredError } from "@/utils/subscriptionUtils";
import MyVendorCard from "./MyVendorCard";

export function MyVendorsSection() {
  const router = useRouter();
  const { userProfile, isLoadingProfile } = useProfile();
  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useUserVendors();

  // Fetch vendor stats for subscription required UI
  const { data: statsResponse } = useVendorStats(true);

  const vendors = response?.data || [];

  // Check if the error is a subscription required error
  const isSubscriptionError = isSubscriptionRequiredError(error);

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    vendorId: number | null;
    vendorName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    vendorId: null,
    vendorName: "",
    isLoading: false,
  });

  const handleCreateVendor = () => {
    router.push("/marketplace/vendors/create");
  };

  const handleViewVendor = (vendorId: number) => {
    router.push(`/marketplace/vendors/${vendorId}`);
  };

  const handleDeleteVendor = (vendorId: number) => {
    const vendor = vendors.find((v) => v.ID === vendorId);
    if (vendor) {
      setDeleteModal({
        isOpen: true,
        vendorId,
        vendorName: vendor.vendor_name,
        isLoading: false,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.vendorId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await deleteVendor(deleteModal.vendorId);
      await refetch();
      setDeleteModal({
        isOpen: false,
        vendorId: null,
        vendorName: "",
        isLoading: false,
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleteModal.isLoading) return;
    setDeleteModal({
      isOpen: false,
      vendorId: null,
      vendorName: "",
      isLoading: false,
    });
  };

  // Show loading state while checking profile
  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner  />
      </div>
    );
  }

  // Show subscription required UI if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionRequired
        title="Subscription Required to View My Vendors"
        description="You need an active subscription to view and manage your vendor profiles."
        features={[
          "View all your vendor profiles",
          "Manage vendor information",
          "Update business details and gallery",
          "Monitor vendor performance",
          "Priority customer support",
        ]}
        vendorStats={statsResponse?.data}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner  />
      </div>
    );
  }

  // Show subscription required UI if the error is subscription related
  if (isError && isSubscriptionError) {
    return (
      <SubscriptionRequired
        title="Subscription Required to View My Vendors"
        description="You need an active subscription to view and manage your vendor profiles."
        features={[
          "View all your vendor profiles",
          "Manage vendor information",
          "Update business details and gallery",
          "Monitor vendor performance",
          "Priority customer support",
        ]}
        vendorStats={statsResponse?.data}
      />
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <Building2 className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Vendors
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error?.message ||
              "Failed to load your vendor listings. Please try again."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          My Vendor Profile
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your vendor listings and business profiles
        </p>
      </div>

      {/* Add Vendor Profile Button */}
      <div className="py-6 border-t border-b border-gray-200">
        <button
          onClick={handleCreateVendor}
          className="flex items-center gap-2 py-2 text-green-600 hover:text-green-700 cursor-pointer rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vendor Profile
        </button>
      </div>

      {/* Empty State */}
      {!isLoading && !isError && vendors.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No saved vendor profiles</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click the + button to add your first vendor profile
          </p>
        </div>
      )}

      {/* Vendors List */}
      {!isLoading && !isError && vendors.length > 0 && (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <MyVendorCard
              key={vendor.ID}
              vendor={vendor}
              onView={handleViewVendor}
              onDelete={handleDeleteVendor}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${deleteModal.vendorName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}
