import { forwardRef, useState } from "react";
import type { CustomInputProps } from "./Input.types";

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      error,
      fullWidth = true,
      className = "",
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      visibleIcon,
      hiddenIcon,
      onRightIconClick,
      rightIconClassName = "",
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const baseInputClasses =
      "px-3 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
    const widthClasses = fullWidth ? "w-full" : "";
    const hasLeftIcon = leftIcon ? "pl-10 sm:pl-11" : "";
    const hasRightIcon =
      rightIcon || showPasswordToggle ? "pr-10 sm:pr-11" : "";

    // Determine the actual input type
    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    // Handle right icon logic
    const getRightIcon = () => {
      if (showPasswordToggle) {
        return showPassword ? visibleIcon : hiddenIcon;
      }
      return rightIcon;
    };

    const handleRightIconClick = () => {
      if (showPasswordToggle) {
        setShowPassword(!showPassword);
      } else if (onRightIconClick) {
        onRightIconClick();
      }
    };

    const rightIconElement = getRightIcon();
    const isRightIconClickable = showPasswordToggle || onRightIconClick;

    return (
      <div className={`${fullWidth ? "w-full" : ""} relative`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center w-5 h-5">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`${baseInputClasses} ${errorClasses} ${widthClasses} ${hasLeftIcon} ${hasRightIcon} ${className}`}
            {...props}
          />

          {rightIconElement && (
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center ${
                isRightIconClickable
                  ? `cursor-pointer hover:text-gray-600 ${rightIconClassName}`
                  : "pointer-events-none"
              }`}
              onClick={isRightIconClickable ? handleRightIconClick : undefined}
            >
              {rightIconElement}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
