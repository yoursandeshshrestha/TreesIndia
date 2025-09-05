"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

interface QuoteAcceptanceSuccessProps {
  message: string;
}

export function QuoteAcceptanceSuccess({
  message,
}: QuoteAcceptanceSuccessProps) {
  const [successAnimation, setSuccessAnimation] = useState(null);

  // Load success animation
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch("/images/auth/success.json");
        const animation = await response.json();
        setSuccessAnimation(animation);
      } catch (error) {
        console.error("Error loading success animation:", error);
      }
    };
    loadAnimation();
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="w-32 h-32 mx-auto"
        >
          {successAnimation && (
            <Lottie
              animationData={successAnimation}
              loop={false}
              autoplay={true}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
