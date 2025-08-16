import React from "react";
import { cn } from "../../../utils/cn";
import type { SpinnerProps } from "./Spinner.types";

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    primary: "border-primary-600",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

export default Spinner;
