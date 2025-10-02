"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useAddresses } from "@/hooks/useAddresses";
import { Address } from "@/types/booking";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import AddressList from "./AddressList";
import AddressModalFooter from "./AddressModalFooter";

interface AddressListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelected: (address: Address) => void;
  onAddNew: () => void;
  onAddressDeleted?: () => void;
  onEditAddress?: (address: Address) => void;
}

export default function AddressListModal({
  isOpen,
  onClose,
  onAddressSelected,
  onAddNew,
  onAddressDeleted,
  onEditAddress,
}: AddressListModalProps) {
  const { selectedService } = useAppSelector((state) => state.booking);
  const {
    addresses,
    isLoadingAddresses,
    isDeletingAddress,
    deleteAddressAsync,
    refetchAddresses,
  } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(
    null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isConfirmingAddress, setIsConfirmingAddress] = useState(false);
  const [loadingAddressId, setLoadingAddressId] = useState<number | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      refetchAddresses();
      setSelectedAddressId(null);
      setIsServiceAvailable(null);
    } else {
      resetModalState();
    }
  }, [isOpen, refetchAddresses]);

  const resetModalState = () => {
    setSelectedAddressId(null);
    setIsServiceAvailable(null);
    setIsConfirmingAddress(false);
    setLoadingAddressId(null);
  };

  const handleDelete = async (addressId: number) => {
    try {
      setLoadingAddressId(addressId);

      await deleteAddressAsync(addressId);

      // Clear selection if the deleted address was selected
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setIsServiceAvailable(null);
      }

      // Force refetch to ensure the list is updated
      await refetchAddresses();

      // Notify parent component about the deletion
      onAddressDeleted?.();

      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error(error);
      // Display the specific error message from the API
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete address. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingAddressId(null);
    }
  };

  const handleAddressSelection = async (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsServiceAvailable(null);
    setLoadingAddressId(addressId);

    const selectedAddress = addresses.find((addr) => addr.id === addressId);

    if (!selectedAddress) {
      setIsServiceAvailable(false);
      return;
    }

    if (!selectedService) {
      setIsServiceAvailable(null);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const isAvailable = await bookingFlowApi.checkServiceAvailability(
        selectedService.id,
        selectedAddress.city,
        selectedAddress.state
      );

      setIsServiceAvailable(isAvailable.data);

      if (!isAvailable.data) {
        toast.error(
          `This service is not available in your selected location (${selectedAddress.city}, ${selectedAddress.state}). Please select another address.`
        );
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error(error);
      setIsServiceAvailable(false);
      toast.error("Failed to check service availability. Please try again.");
      setSelectedAddressId(null);
    } finally {
      setIsCheckingAvailability(false);
      setLoadingAddressId(null);
    }
  };

  const handleChooseAddress = () => {
    if (
      selectedAddressId &&
      (isServiceAvailable === true || isServiceAvailable === null)
    ) {
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      if (selectedAddress) {
        onAddressSelected(selectedAddress);
      }
    }
  };

  const handleEditAddress = (address: Address) => {
    onEditAddress?.(address);
  };

  const handleBack = () => {
    setIsConfirmingAddress(false);
    setSelectedAddressId(null);
    setIsServiceAvailable(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={onClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl w-full min-w-[320px] max-w-[500px] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[30vw] xl:max-w-[30vw] max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        Saved Addresses
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Choose from your saved addresses
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={onAddNew}
                      className="w-10 h-10 text-gray-900 cursor-pointer rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                      title="Add new address"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 overflow-y-auto max-h-[60vh] py-2">
                <AddressList
                  addresses={addresses}
                  isLoading={isLoadingAddresses}
                  selectedAddressId={selectedAddressId}
                  loadingAddressId={loadingAddressId}
                  isDeletingAddress={isDeletingAddress}
                  onAddressSelection={handleAddressSelection}
                  onDeleteAddress={handleDelete}
                  onEditAddress={handleEditAddress}
                />
              </div>

              {/* Footer */}
              <AddressModalFooter
                isAddingNew={false}
                isEditing={false}
                isConfirming={isConfirmingAddress}
                addressesLength={addresses.length}
                selectedAddressId={selectedAddressId}
                isServiceAvailable={isServiceAvailable}
                isCheckingAvailability={isCheckingAvailability}
                onChooseAddress={handleChooseAddress}
                onBack={handleBack}
                onConfirmAddress={() => {}} // Not used in list modal
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
