export type ModelSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModelSize;
  showCloseButton?: boolean;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}
