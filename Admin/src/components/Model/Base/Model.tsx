import { useEffect, useRef } from "react";
import type { ModelProps } from "./Model.types";

const Model = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = "",
  children,
  footer,
  header,
}: ModelProps) => {
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-7xl w-full h-[90vh]",
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center">
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleOverlayClick}
        />
      )}

      {/* Modal Content */}
      <div
        ref={modelRef}
        className={`relative bg-white rounded-lg shadow-xl w-full mx-4 ${
          sizeClasses[size]
        } z-modal ${className} ${size === "full" ? "flex flex-col" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "model-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton || header) && (
          <div
            className={`${
              size === "full" ? "flex-shrink-0" : ""
            } flex items-center justify-between p-4 border-b border-gray-200`}
          >
            {title && (
              <h3
                id="model-title"
                className="text-lg font-medium text-gray-900"
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Close"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div
            className={`${size === "full" ? "flex-shrink-0" : ""} px-4 pt-4`}
          >
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        )}

        {/* Content */}
        <div className={`${size === "full" ? "flex-1 overflow-hidden" : ""}`}>
          {size === "full" ? children : <div className="p-4">{children}</div>}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`${
              size === "full" ? "flex-shrink-0" : ""
            } px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Model;
