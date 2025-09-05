"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAddresses } from "@/hooks/useAddresses";
import { ConfirmModal } from "@/commonComponents/ConfirmModal";
import { Address } from "@/types/booking";
import AddAddressModal from "./Components/AddressModal/AddAddressModal";
import EditAddressModal from "./Components/AddressModal/EditAddressModal";
import { AddressSectionSkeleton } from "./AddressSectionSkeleton";

export function AddressSection() {
  const {
    addresses,
    isLoadingAddresses,
    isDeletingAddress,
    deleteAddressAsync,
    refetchAddresses,
    addressesError,
  } = useAddresses();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddressAsync(addressToDelete.id);
      toast.success("Address deleted successfully");
      setShowDeleteModal(false);
      setAddressToDelete(null);
      refetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      // Display the specific error message from the API
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete address";
      toast.error(errorMessage);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  // Show skeleton if addresses are loading
  if (isLoadingAddresses) {
    return <AddressSectionSkeleton />;
  }

  if (addressesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Addresses
            </h2>
            <p className="text-gray-600 mt-1">
              Add and manage your delivery addresses
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <p className="font-medium">Unable to load addresses</p>
            <p className="text-sm text-gray-600 mt-1">
              There was an error loading your addresses. Please try again.
            </p>
          </div>
          <button
            onClick={() => refetchAddresses()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Manage Addresses
          </h2>
          <p className="text-gray-600 mt-1">
            Add and manage your delivery addresses
          </p>
        </div>
      </div>

      <div className="py-6 border-t border-b border-gray-200">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2  py-2 text-green-600 hover:text-green-700 cursor-pointer rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No saved addresses</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click the + button to add your first address
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-lg text-gray-900">
                      {address.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="break-words">
                      {address.house_number && `${address.house_number}, `}
                      {address.address}
                      {address.landmark && `, Near ${address.landmark}`}
                      {", "}
                      {address.city}, {address.state}
                      {address.postal_code && ` ${address.postal_code}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingAddress(address);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit address"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(address)}
                    disabled={address.is_default}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title={
                      address.is_default
                        ? "Cannot delete default address"
                        : "Delete address"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        message={`Are you sure you want to delete "${addressToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeletingAddress}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddressAdded={() => {
          setShowAddModal(false);
          refetchAddresses();
        }}
      />

      {/* Edit Address Modal */}
      <EditAddressModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
        onAddressUpdated={() => {
          setShowEditModal(false);
          setEditingAddress(null);
          refetchAddresses();
        }}
        isConfirming={false}
      />
    </div>
  );
}
