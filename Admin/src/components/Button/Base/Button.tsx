import { forwardRef } from "react";
import type { ButtonProps } from "./Button.types";

const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      iconButton = false,
      className = "",
      children,
      noPadding = false,
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg font-normal";

    const sizeClasses = {
      xs: iconButton ? "p-1.5 text-xs" : "px-3 py-1.5 text-xs",
      sm: iconButton ? "p-2 text-sm" : "px-3.5 py-2 text-sm",
      md: iconButton ? "p-2.5 text-base" : "px-4 py-2.5 text-base",
      lg: iconButton ? "p-3 text-base" : "px-5 py-3 text-base",
      xl: iconButton ? "p-3.5 text-lg" : "px-6 py-3.5 text-lg",
    };

    const variantClasses = {
      primary:
        "bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white shadow-sm",
      secondary:
        "bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white shadow-sm",
      outline:
        "bg-white hover:bg-gray-50 active:bg-gray-100 text-slate-700 border border-slate-300 shadow-sm",
      ghost:
        "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-slate-700",
      link: "bg-transparent text-gray-600 hover:text-gray-900 hover:underline shadow-none p-0 font-medium text-sm",
      danger:
        "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm",
      success:
        "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm",
      warning:
        "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm",
      icon: "bg-transparent p-0 border-none shadow-none hover:bg-transparent active:bg-transparent text-inherit",
    };

    const stateClasses = {
      disabled: "opacity-60 cursor-not-allowed pointer-events-none",
      fullWidth: "w-full",
    };

    // If iconButton and noPadding, override padding to 0
    const getSizeClass = () => {
      if (iconButton && noPadding) return "p-0";
      return variant !== "link" ? sizeClasses[size] : "";
    };

    const buttonClasses = [
      baseClasses,
      getSizeClass(),
      variantClasses[variant],
      disabled || loading ? stateClasses.disabled : "",
      fullWidth ? stateClasses.fullWidth : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}

        {!iconButton && children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className="ml-2 -mr-1">{rightIcon}</span>
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
