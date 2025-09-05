"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import BouncingDots from "@/commonComponents/BouncingDots/BouncingDots";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLoadingScreenProps {
  children: React.ReactNode;
}

export default function AuthLoadingScreen({
  children,
}: AuthLoadingScreenProps) {
  const { isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // Show loading screen only during initial auth check
  if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-white flex flex-col items-center justify-center"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-[#00a871] mb-2">
              TreesIndia
            </h1>
            <p className="text-gray-600 text-sm">One Platform, All Solutions</p>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <BouncingDots size="lg" color="text-[#00a871]" />
            <p className="text-gray-600 text-sm font-medium">
              Checking authentication...
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 w-64 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-[#00a871] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return <>{children}</>;
}
