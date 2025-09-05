"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary" | "success";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  const getConfirmButtonClasses = () => {
    const baseClasses =
      "flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer font-medium";

    switch (confirmVariant) {
      case "danger":
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400`;
      case "success":
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400`;
      case "primary":
      default:
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400`;
    }
  };

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
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
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
            <motion.div
              className="bg-white rounded-2xl p-6 w-96 max-w-sm shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>

              <p className="text-gray-600 mb-6">{message}</p>

              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={getConfirmButtonClasses()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {confirmText}
                    </div>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
