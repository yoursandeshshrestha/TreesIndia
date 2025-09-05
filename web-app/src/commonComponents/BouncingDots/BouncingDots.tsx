"use client";

import { motion, Variants } from "framer-motion";

interface BouncingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export default function BouncingDots({
  className = "",
  size = "md",
  color = "text-gray-400",
}: BouncingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants: Variants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className={`flex items-center space-x-1 ${className}`}
      variants={containerVariants}
      animate="animate"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} bg-current rounded-full ${color}`}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
}
