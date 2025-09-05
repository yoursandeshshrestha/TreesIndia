"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TextField } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateBookingForm } from "@/store/slices/bookingSlice";
import { useAuth } from "@/hooks/useAuth";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ContactInfoModal({
  isOpen,
  onClose,
  onSubmit,
}: ContactInfoModalProps) {
  const dispatch = useDispatch();
  const { bookingForm } = useSelector((state: RootState) => state.booking);
  const { user, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState<{
    contact_person?: string;
    contact_phone?: string;
  }>({});

  // Prefill user data when modal opens and user is authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      // Only prefill if the fields are empty
      if (!bookingForm.contact_person && user.name) {
        dispatch(updateBookingForm({ contact_person: user.name }));
      }
      if (!bookingForm.contact_phone && user.phone) {
        // Keep the full phone number including +91 prefix
        dispatch(updateBookingForm({ contact_phone: user.phone }));
      }
    }
  }, [
    isOpen,
    isAuthenticated,
    user,
    bookingForm.contact_person,
    bookingForm.contact_phone,
    dispatch,
  ]);

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateBookingForm({ [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!bookingForm.contact_person?.trim()) {
      newErrors.contact_person = "Contact person name is required";
    }

    if (!bookingForm.contact_phone?.trim()) {
      newErrors.contact_phone = "Contact phone number is required";
    } else {
      const phoneNumber = bookingForm.contact_phone.trim();
      const cleanPhoneNumber = phoneNumber.replace(/^\+91/, "");
      if (cleanPhoneNumber.length !== 10) {
        newErrors.contact_phone = "Please enter a valid 10-digit phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    const phoneNumber = bookingForm.contact_person?.trim() || "";
    const contactPhone = bookingForm.contact_phone?.trim() || "";
    // Remove +91 prefix and count only digits
    const cleanPhoneNumber = contactPhone.replace(/^\+91/, "");

    return phoneNumber && contactPhone && cleanPhoneNumber.length === 10;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4"
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
              className="bg-white rounded-2xl min-w-lg max-w-[500px] w-full max-h-[90vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Contact Information
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Enter your contact details for the inquiry
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 overflow-y-auto max-h-[60vh] py-2">
                <div className="space-y-6 flex flex-col gap-4">
                  <TextField
                    fullWidth
                    label="Contact Person Name *"
                    value={bookingForm.contact_person || ""}
                    onChange={(e) =>
                      handleInputChange("contact_person", e.target.value)
                    }
                    placeholder="Enter contact person name"
                    required
                    variant="outlined"
                    size="medium"
                    error={!!errors.contact_person}
                    helperText={errors.contact_person}
                  />

                  <TextField
                    fullWidth
                    label="Contact Phone Number *"
                    value={bookingForm.contact_phone || ""}
                    onChange={(e) =>
                      handleInputChange("contact_phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                    required
                    variant="outlined"
                    size="medium"
                    inputProps={{ maxLength: 13 }}
                    error={!!errors.contact_phone}
                    helperText={errors.contact_phone}
                  />

                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={bookingForm.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your requirements"
                    variant="outlined"
                    size="medium"
                    multiline
                    rows={3}
                  />

                  <TextField
                    fullWidth
                    label="Special Instructions (Optional)"
                    value={bookingForm.special_instructions || ""}
                    onChange={(e) =>
                      handleInputChange("special_instructions", e.target.value)
                    }
                    placeholder="Any special instructions"
                    variant="outlined"
                    size="medium"
                    multiline
                    rows={3}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className="flex-1 px-4 py-3 bg-[#00a871] text-white rounded-lg hover:bg-[#009a65] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
