export type FloatingActionButtonSize = "sm" | "md" | "lg";
export type FloatingActionButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning";
export type FloatingActionButtonPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: FloatingActionButtonSize;
  variant?: FloatingActionButtonVariant;
  position?: FloatingActionButtonPosition;
  icon: React.ReactNode;
  tooltip?: string;
  fixed?: boolean;
  zIndex?: number;
  className?: string;
}
