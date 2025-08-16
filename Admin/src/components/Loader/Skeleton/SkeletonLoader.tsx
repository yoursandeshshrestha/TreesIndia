import React from "react";
import type { SkeletonLoaderProps } from "./SkeletonLoader.types";

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "text",
  width,
  height,
  className = "",
  count = 1,
  rounded = false,
}) => {
  const getSkeletonStyles = () => {
    const baseStyles = "animate-pulse bg-gray-200";
    const roundedStyles = rounded ? "rounded-full" : "rounded";

    switch (type) {
      case "avatar":
        return `${baseStyles} ${roundedStyles} w-12 h-12`;
      case "image":
        return `${baseStyles} ${roundedStyles} w-full h-48`;
      case "card":
        return `${baseStyles} ${roundedStyles} w-full h-64`;
      default:
        return `${baseStyles} ${roundedStyles} w-full h-4`;
    }
  };

  const renderSkeleton = () => {
    const style = {
      width: width,
      height: height,
    };

    return (
      <div className={`${getSkeletonStyles()} ${className}`} style={style} />
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
