import type { ButtonProps } from "../Base/Button.types";

export type SocialProvider =
  | "google"
  | "facebook"
  | "twitter"
  | "github"
  | "apple"
  | "microsoft"
  | "linkedin";

export interface SocialButtonProps
  extends Omit<ButtonProps, "variant" | "leftIcon"> {
  provider: SocialProvider;
  children?: React.ReactNode;
}
