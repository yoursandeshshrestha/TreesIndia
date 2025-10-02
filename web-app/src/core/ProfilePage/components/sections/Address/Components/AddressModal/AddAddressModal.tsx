"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocationRedux";
import { useAddresses } from "@/hooks/useAddresses";
import { AddressFormData } from "./AddressModal.types";
import { Address } from "@/types/booking";
import AddressForm from "./AddressForm";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressAdded?: (newAddress?: Address) => void;
}

export default function AddAddressModal({
  isOpen,
  onClose,
  onAddressAdded,
}: AddAddressModalProps) {
  const { detectLocation } = useLocation();
  const { createAddressAsync, isCreatingAddress } = useAddresses();

  // Local loading state for immediate UI feedback
  const [isLocalDetectingLocation, setIsLocalDetectingLocation] =
    useState(false);

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

    try {
      // Determine the name to send
      const nameToSend =
        formData.name === "Other"
          ? formData.customName.trim() || "Other"
          : formData.name;

      const newAddress = await createAddressAsync({
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
      });

      // Reset form
      setFormData({
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

      toast.success("Address added successfully!");
      onAddressAdded?.(newAddress.data);
      onClose();
    } catch (error) {
      console.error(error);
      // Display the specific error message from the API
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save address. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDetectLocation = async () => {
    // Set local loading state immediately
    setIsLocalDetectingLocation(true);

    try {
      const detectedLocation = await detectLocation();

      if (detectedLocation) {
        setFormData((prev) => ({
          ...prev,
          city: detectedLocation.city,
          state: detectedLocation.state,
          country: detectedLocation.country,
          postal_code: detectedLocation.postal_code || "",
          address: detectedLocation.address || "",
          latitude: detectedLocation.coordinates?.lat || 0,
          longitude: detectedLocation.coordinates?.lng || 0,
        }));
      }
    } catch {
      toast.error("Failed to detect location. Please enter address manually.");
    } finally {
      // Always reset local loading state
      setIsLocalDetectingLocation(false);
    }
  };

  const handleCancel = () => {
    setFormData({
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
    onClose();
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
                        Add New Address
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Enter your address details
                    </p>
                  </div>

                  <div className="flex items-center ml-4">
                    <button
                      onClick={handleDetectLocation}
                      disabled={isLocalDetectingLocation}
                      className={`w-10 h-10 text-gray-900 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 ${
                        isLocalDetectingLocation
                          ? "bg-blue-50 border-2 border-blue-200 cursor-not-allowed"
                          : "hover:bg-gray-100 hover:scale-105"
                      }`}
                      title={
                        isLocalDetectingLocation
                          ? "Detecting location..."
                          : "Detect my location"
                      }
                    >
                      {isLocalDetectingLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 overflow-y-auto max-h-[60vh] py-2">
                <AddressForm
                  formData={formData}
                  isCreating={isCreatingAddress}
                  isUpdating={false}
                  isConfirming={false}
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
