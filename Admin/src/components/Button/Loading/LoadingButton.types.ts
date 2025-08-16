import type { ButtonProps } from "../Base/Button.types";

export interface LoadingButtonProps extends Omit<ButtonProps, "loading"> {
  onClick: () => Promise<void>;
  successMessage?: string;
  successDuration?: number;
  errorMessage?: string;
  errorDuration?: number;
}
