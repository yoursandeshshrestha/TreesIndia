export interface ButtonGroupProps {
  orientation?: "horizontal" | "vertical";
  spacing?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  attached?: boolean;
  className?: string;
  children: React.ReactNode;
}
