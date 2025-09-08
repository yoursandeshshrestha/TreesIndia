"use client";

import { useState } from "react";
import { Plus, Home } from "lucide-react";
import { useUserProperties } from "@/hooks/useProperties";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { ConfirmModal } from "@/commonComponents/ConfirmModal";
import { deleteProperty } from "@/lib/propertyApi";
import { useRouter } from "next/navigation";
import MyPropertyCard from "./MyPropertyCard";

export function MyPropertiesSection() {
  const router = useRouter();
  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useUserProperties();

  const properties = response?.data || [];

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    propertyId: number | null;
    propertyTitle: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    propertyId: null,
    propertyTitle: "",
    isLoading: false,
  });

  const handleCreateProperty = () => {
    router.push("/marketplace/properties/create");
  };

  const handleViewProperty = (propertyId: number) => {
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const handleDeleteProperty = (propertyId: number) => {
    const property = properties.find((p) => p.ID === propertyId);
    if (property) {
      setDeleteModal({
        isOpen: true,
        propertyId,
        propertyTitle: property.title,
        isLoading: false,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.propertyId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await deleteProperty(deleteModal.propertyId);

      // Close modal and refresh data
      setDeleteModal({
        isOpen: false,
        propertyId: null,
        propertyTitle: "",
        isLoading: false,
      });

      // Refresh the properties list
      refetch();
    } catch (error) {
      console.error("Error deleting property:", error);
      // You could add a toast notification here for error handling
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({
        isOpen: false,
        propertyId: null,
        propertyTitle: "",
        isLoading: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            My Properties
          </h2>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <button
          onClick={handleCreateProperty}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          List New Property
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Home className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Error Loading Properties</h3>
            <p className="text-sm text-gray-600 mt-1">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && properties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Home className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Listed
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You haven&apos;t listed any properties yet. Start by creating your
              first property listing.
            </p>
          </div>
          <button
            onClick={handleCreateProperty}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            List Your First Property
          </button>
        </div>
      )}

      {/* Properties List */}
      {!isLoading && !isError && properties.length > 0 && (
        <div className="space-y-4">
          {properties.map((property) => (
            <MyPropertyCard
              key={property.ID}
              property={property}
              onView={handleViewProperty}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteModal.propertyTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}
