export interface SkeletonLoaderProps {
  type?: "text" | "avatar" | "image" | "card";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  rounded?: boolean;
}
