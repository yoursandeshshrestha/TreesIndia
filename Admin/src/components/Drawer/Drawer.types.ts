import type { ReactNode } from "react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  width?: string;
  height?: string;
  position?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  animationDuration?: number;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  slideToClose?: boolean;
  slideThreshold?: number; // Percentage of width/height to trigger close
  customPosition?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    transform?: string;
  };
}
