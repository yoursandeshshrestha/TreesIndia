"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  variant?: "default" | "compact" | "fullscreen";
}

export default function LoadingSpinner({
  message = "Loading...",
  className = "",
  variant = "default",
}: LoadingSpinnerProps) {
  const getContainerClasses = () => {
    switch (variant) {
      case "fullscreen":
        return "min-h-screen bg-white";
      case "compact":
        return "py-8";
      default:
        return "";
    }
  };

  const getProgressBarWidth = () => {
    switch (variant) {
      case "compact":
        return "w-48";
      default:
        return "w-64";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${getContainerClasses()} ${className}`}
    >
      {/* Progress Bar */}
      <div
        className={`${getProgressBarWidth()} h-1 bg-gray-200 rounded-full overflow-hidden`}
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
      </div>

      {/* Loading Message */}
      <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
    </div>
  );
}
