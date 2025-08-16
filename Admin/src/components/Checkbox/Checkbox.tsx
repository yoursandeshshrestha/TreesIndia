import { forwardRef } from "react";
import type { CustomCheckboxProps } from "./Checkbox.types";

const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ label, error, className = "", labelClassName = "", ...props }, ref) => {
    const baseCheckboxClasses =
      "w-4 h-4 text-gray-600 border-gray-300 rounded transition-colors";

    const baseLabelClasses = "flex items-center cursor-pointer";
    const textClasses = "ml-2 text-sm text-gray-600 select-none";

    return (
      <div>
        <label className={`${baseLabelClasses} ${labelClassName}`}>
          <input
            ref={ref}
            type="checkbox"
            className={`${baseCheckboxClasses} ${className}`}
            {...props}
          />
          {label && <span className={textClasses}>{label}</span>}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export default CustomCheckbox;
