"use client";

import React from "react";
import { X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkerLocationMap from "@/components/LocationTracking/WorkerLocationMap";
import { useLocationTracking } from "@/hooks/useLocationTracking";

interface WorkerLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  workerName?: string;
  workerPhone?: string;
}

export function WorkerLocationModal({
  isOpen,
  onClose,
  assignmentId,
  workerName,
  workerPhone,
}: WorkerLocationModalProps) {
  console.log("🚀 WorkerLocationModal opened:", {
    isOpen,
    assignmentId,
    workerName,
    workerPhone,
    assignmentIdType: typeof assignmentId,
    assignmentIdValid: assignmentId && assignmentId > 0,
  });

  const { currentLocation, isLoading, error, lastUpdate } = useLocationTracking(
    assignmentId,
    true,
    false // This is for customers viewing worker location, not workers themselves
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4 "
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
            {/* Close Button - Positioned on top of the modal */}
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
              className="bg-white rounded-2xl shadow-xl w-full min-w-[600px] max-w-[95vw] h-[80vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Map Content - Full Width and Height */}
              <div className="w-full h-full">
                <WorkerLocationMap
                  workerLocation={currentLocation}
                  isLoading={isLoading}
                  error={error}
                  lastUpdate={lastUpdate}
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
