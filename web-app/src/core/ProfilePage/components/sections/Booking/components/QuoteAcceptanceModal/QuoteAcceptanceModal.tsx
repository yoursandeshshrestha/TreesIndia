"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Booking } from "@/lib/bookingApi";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";
import { useQuoteAcceptanceRedux } from "@/hooks/useQuoteAcceptanceRedux";
import { QuoteAcceptanceHeader } from "./components/QuoteAcceptanceHeader";
import { QuoteAcceptanceContent } from "./components/QuoteAcceptanceContent";
import { QuoteAcceptanceFooter } from "./components/QuoteAcceptanceFooter";
import { QuoteAcceptanceError } from "./components/QuoteAcceptanceError";
import { QuoteAcceptanceSuccess } from "./components/QuoteAcceptanceSuccess";

interface QuoteAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export default function QuoteAcceptanceModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: QuoteAcceptanceModalProps) {
  const {
    isOpen: isModalOpen,
    booking: modalBooking,
    error,
    showSuccess,
    successMessage,
    handleClearError,
    handleOpenModal,
    handleCloseModal,
    handleRazorpaySuccess,
    handleRazorpayFailure,
    handleRazorpayClose,
    paymentOrder,
    showRazorpayCheckout,
  } = useQuoteAcceptanceRedux(onSuccess, onClose);

  // Sync external state with Redux state
  useEffect(() => {
    if (isOpen && booking && !isModalOpen) {
      handleOpenModal(booking);
    } else if (!isOpen && isModalOpen) {
      handleCloseModal();
    }
  }, [isOpen, booking, isModalOpen, handleOpenModal, handleCloseModal]);

  // Handle success callback
  useEffect(() => {
    if (!isModalOpen && modalBooking) {
      // Modal was closed, check if it was a successful completion
      // This is a simplified approach - in a real app you might want more sophisticated state tracking
      onSuccess();
    }
  }, [isModalOpen, modalBooking, onSuccess]);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      handleClearError();
    }
  }, [isOpen, handleClearError]);

  if (!isOpen || !booking) return null;

  return (
    <>
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
                className="bg-white rounded-2xl w-full min-w-[300px] max-w-none h-[80vh] overflow-hidden flex flex-col"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <QuoteAcceptanceHeader booking={booking} />

                <QuoteAcceptanceError error={error} />

                {showSuccess ? (
                  <div className="flex-1 overflow-y-auto">
                    <QuoteAcceptanceSuccess message={successMessage || ""} />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto">
                      <QuoteAcceptanceContent />
                    </div>

                    <QuoteAcceptanceFooter onClose={onClose} />
                  </>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && paymentOrder && booking && (
        <RazorpayCheckout
          order={paymentOrder}
          description={`Quote Payment - ${booking.service?.name}`}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={handleRazorpayClose}
        />
      )}
    </>
  );
}
