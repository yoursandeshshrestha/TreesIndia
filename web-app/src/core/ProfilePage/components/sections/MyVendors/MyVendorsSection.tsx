"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { useUserVendors } from "@/hooks/useVendors";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { ConfirmModal } from "@/commonComponents/ConfirmModal";
import { deleteVendor } from "@/lib/vendorApi";
import { useRouter } from "next/navigation";
import MyVendorCard from "./MyVendorCard";

export function MyVendorsSection() {
  const router = useRouter();
  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useUserVendors();

  const vendors = response?.data || [];

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My Vendor Profile
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your vendor listings and business profiles
          </p>
        </div>
        <button
          onClick={handleCreateVendor}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor Profile
        </button>
      </div>

      {/* Empty State */}
      {!isLoading && !isError && vendors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Vendor Profile Listed
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You haven&apos;t created any vendor profile yet. Start by creating
              your first vendor profile.
            </p>
          </div>
          <button
            onClick={handleCreateVendor}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Vendor Profile
          </button>
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
