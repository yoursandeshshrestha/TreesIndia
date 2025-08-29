import { Loader } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export default function BaseLoader({
  size = "sm",
  className = "",
  fullScreen = false,
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const loaderElement = (
    <Loader className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
