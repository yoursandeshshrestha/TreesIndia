import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { DrawerProps } from "./Drawer.types";

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  width = "100%",
  height = "auto",
  position = "top",
  showCloseButton = true,
  closeOnOverlayClick = true,
  animationDuration = 300,
  overlayClassName = "",
  contentClassName = "",
  headerClassName = "",
  footerClassName = "",
  footer,
  customPosition,
}: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getPositionStyles = () => {
    if (customPosition) {
      return {
        position: "fixed" as const,
        zIndex: 50,
        backgroundColor: "white",
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        ...customPosition,
      };
    }
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 50,
      backgroundColor: "white",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    };
    const transform = isOpen ? "translate(0, 0)" : getInitialTransform();
    switch (position) {
      case "top":
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          width,
          height,
          borderBottomLeftRadius: "1rem",
          borderBottomRightRadius: "1rem",
          transform,
        };
      case "right":
        return {
          ...baseStyles,
          top: 0,
          right: 0,
          bottom: 0,
          width: width || "400px",
          height: "100%",
          borderTopLeftRadius: "1rem",
          borderBottomLeftRadius: "1rem",
          transform,
        };
      case "bottom":
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          width,
          height,
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          transform,
        };
      case "left":
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          bottom: 0,
          width: width || "400px",
          height: "100%",
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          transform,
        };
    }
  };

  const getInitialTransform = () => {
    switch (position) {
      case "top":
        return "translateY(-100%)";
      case "right":
        return "translateX(100%)";
      case "bottom":
        return "translateY(100%)";
      case "left":
        return "translateX(-100%)";
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-${animationDuration} ${
            isOpen ? "opacity-100" : "opacity-0"
          } ${overlayClassName}`}
          onClick={handleOverlayClick}
          style={{ zIndex: 40 }}
        />
      )}
      <div
        ref={drawerRef}
        className={`transition-transform duration-${animationDuration} ease-in-out ${className}`}
        style={getPositionStyles()}
      >
        <div className={`flex flex-col h-full ${contentClassName}`}>
          {(title || showCloseButton) && (
            <div
              className={`flex items-center justify-between p-4 border-b ${headerClassName}`}
            >
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 p-4 overflow-auto">{children}</div>
          {footer && (
            <div
              className={`p-4 border-t flex flex-nowrap items-center justify-end gap-2 overflow-x-auto ${footerClassName}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;
