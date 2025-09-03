"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CreditCard } from "lucide-react";
import { formatAmount } from "@/utils/formatters";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (method: "wallet" | "razorpay") => void;
  service?: {
    id: number;
    name: string;
    description: string;
    price: number | null;
    price_type: "fixed" | "inquiry";
    duration: string | null;
    images: string[] | null;
  };
  totalAmount: number;
  isWalletDisabled: boolean;
  walletBalance: number;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  service,
  totalAmount,
  isWalletDisabled,
  walletBalance,
}: PaymentMethodModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
          onClick={handleBackdropClick}
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
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl p-6 w-96 max-w-sm shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose Payment Method
                </h3>
                <p className="text-sm text-gray-500">
                  Total Amount: {formatAmount(totalAmount)}
                </p>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {/* Wallet Payment Option */}
                <button
                  onClick={() => onPaymentMethodSelect("wallet")}
                  disabled={isWalletDisabled}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isWalletDisabled
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-gray-200 bg-white cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Pay with Wallet
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {formatAmount(walletBalance)}
                        {isWalletDisabled && (
                          <span className="text-red-600 ml-2">
                            (Insufficient balance)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Razorpay Payment Option */}
                <button
                  onClick={() => onPaymentMethodSelect("razorpay")}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Pay with Razorpay
                      </p>
                      <p className="text-xs text-gray-500">
                        Credit/Debit Card, UPI, Net Banking
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
