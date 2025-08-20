import React from "react";
import type { FloatingActionButtonProps } from "./FloatingActionButton.types";



const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  size = "md",
  variant = "primary",
  position = "bottom-right",
  icon,
  tooltip,
  fixed = true,
  zIndex = 50,
  className = "",
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  // Variant classes - clean admin style
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
    secondary: "bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white",
    success:
      "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white",
  };

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const baseClasses = [
    "flex items-center justify-center rounded-full shadow-md",
    "transition-all transform hover:scale-105 active:scale-95",
    "",
    sizeClasses[size],
    variantClasses[variant],
    fixed ? `fixed ${positionClasses[position]}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative group" style={{ zIndex: zIndex }}>
      <button
        className={baseClasses}
        type="button"
        aria-label={tooltip || "Floating action button"}
        {...rest}
      >
        {icon}
      </button>

      {tooltip && (
        <div
          className="absolute px-3 py-1 text-xs text-white bg-gray-800 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{
            bottom: position.includes("bottom") ? "100%" : "auto",
            top: position.includes("top") ? "100%" : "auto",
            left: position.includes("left") ? "0" : "auto",
            right: position.includes("right") ? "0" : "auto",
            marginBottom: position.includes("bottom") ? "0.5rem" : "auto",
            marginTop: position.includes("top") ? "0.5rem" : "auto",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
