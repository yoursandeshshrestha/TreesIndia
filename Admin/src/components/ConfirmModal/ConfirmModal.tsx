import { X } from "lucide-react";
import Button from "../Button/Base/Button";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-confirm-modal flex items-center justify-center">
      {/* Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-200 ease-in-out"
        onClick={onClose}
      />

      {/* Modal with slide-up animation */}
      <div className="relative transform transition-all duration-200 ease-out">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="min-w-[80px]"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                size="sm"
                onClick={onConfirm}
                className="min-w-[80px]"
                loading={isLoading}
                disabled={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
