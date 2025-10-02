"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAddresses } from "@/hooks/useAddresses";
import { Address } from "@/types/booking";
import { AddressFormData } from "./AddressModal.types";
import AddressForm from "./AddressForm";

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null;
  onAddressUpdated?: () => void;
  isConfirming?: boolean;
  onAddressConfirmed?: (address: Address) => void;
}

export default function EditAddressModal({
  isOpen,
  onClose,
  address,
  onAddressUpdated,
  isConfirming = false,
  onAddressConfirmed,
}: EditAddressModalProps) {
  const { updateAddressAsync, isUpdatingAddress } = useAddresses();

  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    customName: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    landmark: "",
    house_number: "",
    latitude: 0,
    longitude: 0,
    is_default: false,
  });

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (isOpen && address) {
      // Determine if the address name is a custom name (not "Home" or "Work")
      const isCustomName = address.name !== "Home" && address.name !== "Work";

      setFormData({
        name: isCustomName ? "Other" : address.name,
        customName: isCustomName ? address.name : "",
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        postal_code: address.postal_code,
        landmark: address.landmark || "",
        house_number: address.house_number || "",
        latitude: address.latitude,
        longitude: address.longitude,
        is_default: address.is_default,
      });
    }
  }, [isOpen, address]);

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) return;

    if (isConfirming) {
      // In confirmation mode, first save the address changes to database, then confirm
      try {
        // Determine the name to send
        const nameToSend =
          formData.name === "Other"
            ? formData.customName.trim() || "Other"
            : formData.name;

        await updateAddressAsync({
          addressId: address.id,
          addressData: {
            name: nameToSend,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code,
            landmark: formData.landmark,
            house_number: formData.house_number,
            latitude: formData.latitude,
            longitude: formData.longitude,
            is_default: formData.is_default,
          },
        });

        // After saving, confirm the address with updated form data
        const confirmedAddress = {
          ...address,
          name: nameToSend,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
          landmark: formData.landmark,
          house_number: formData.house_number,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };

        toast.success("Address updated and confirmed!");
        onAddressConfirmed?.(confirmedAddress);
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update address. Please try again.");
      }
      return;
    }

    // In edit mode, update the address in the database
    try {
      // Determine the name to send
      const nameToSend =
        formData.name === "Other"
          ? formData.customName.trim() || "Other"
          : formData.name;

      await updateAddressAsync({
        addressId: address.id,
        addressData: {
          name: nameToSend,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
          landmark: formData.landmark,
          house_number: formData.house_number,
          latitude: formData.latitude,
          longitude: formData.longitude,
          is_default: formData.is_default,
        },
      });

      toast.success("Address updated successfully!");
      onAddressUpdated?.();
      onClose();
    } catch (error) {
      console.error(error);
      // Display the specific error message from the API
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update address. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!address) return null;

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
                        {isConfirming
                          ? "Confirm Address Details"
                          : "Edit Address"}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {isConfirming
                        ? "Review and edit your address details. City and State cannot be changed."
                        : "Update your address details"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 overflow-y-auto max-h-[60vh] py-2">
                <AddressForm
                  formData={formData}
                  isCreating={false}
                  isUpdating={isUpdatingAddress}
                  isConfirming={isConfirming}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
