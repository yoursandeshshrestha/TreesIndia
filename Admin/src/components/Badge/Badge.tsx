import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className = "",
}) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "secondary":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "danger":
        return "bg-red-100 text-red-800 border-red-300";
      case "info":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "outline":
        return "bg-transparent text-gray-700 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
