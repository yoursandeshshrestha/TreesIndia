export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // Password visibility toggle
  showPasswordToggle?: boolean;
  visibleIcon?: React.ReactNode;
  hiddenIcon?: React.ReactNode;
  // Clickable right icon
  onRightIconClick?: () => void;
  rightIconClassName?: string;
}
