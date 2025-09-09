import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-10 h-5",
    md: "w-12 h-7",
    lg: "w-16 h-8",
  };

  const thumbSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${checked ? "bg-green-600" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <span
        className={`
          inline-block transition-all duration-200 ease-in-out bg-white rounded-full shadow-sm
          ${thumbSizeClasses[size]}
          ${checked ? "ml-[21px]" : "ml-0.5"}
        `}
      />
    </button>
  );
};

export default Toggle;
