import React, { useState, useEffect } from "react";
import Button from "../Base/Button";
import type { LoadingButtonProps } from "./LoadingButton.types";

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  onClick,
  successMessage = "Success!",
  successDuration = 2000,
  errorMessage = "Error occurred",
  errorDuration = 3000,
  disabled = false,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    let timer: number;

    if (status === "success") {
      timer = window.setTimeout(() => {
        setStatus("idle");
      }, successDuration);
    } else if (status === "error") {
      timer = window.setTimeout(() => {
        setStatus("idle");
      }, errorDuration);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [status, successDuration, errorDuration]);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setStatus("loading");

    try {
      await onClick();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      console.error("LoadingButton error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  let variant = rest.variant || "primary";
  if (status === "success") {
    variant = "success";
  } else if (status === "error") {
    variant = "danger";
  }

  let buttonText = children;
  if (status === "success") {
    buttonText = successMessage;
  } else if (status === "error") {
    buttonText = errorMessage;
  }

  let leftIcon = rest.leftIcon;
  if (status === "success") {
    leftIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (status === "error") {
    leftIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <Button
      {...rest}
      variant={variant}
      loading={isLoading}
      disabled={disabled || isLoading}
      leftIcon={leftIcon}
      onClick={handleClick}
      className={rest.className || ""}
    >
      {buttonText}
    </Button>
  );
};

export default LoadingButton;
