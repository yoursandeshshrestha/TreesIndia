import React from "react";
import type { ButtonProps } from "../Base/Button.types";
import type { ButtonGroupProps } from "./ButtonGroup.types";

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  orientation = "horizontal",
  spacing = "md",
  fullWidth = false,
  attached = false,
  className = "",
  children,
}) => {
  const spacingClasses = {
    xs: attached ? "" : orientation === "horizontal" ? "gap-1" : "gap-y-1",
    sm: attached ? "" : orientation === "horizontal" ? "gap-2" : "gap-y-2",
    md: attached ? "" : orientation === "horizontal" ? "gap-3" : "gap-y-3",
    lg: attached ? "" : orientation === "horizontal" ? "gap-4" : "gap-y-4",
  };

  const orientationClasses = {
    horizontal: "flex flex-row",
    vertical: "flex flex-col",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const attachedClasses = attached
    ? orientation === "horizontal"
      ? "overflow-hidden [&>*:not(:first-child)]:-ml-px [&>*]:rounded-none [&>*]:shadow-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg"
      : "overflow-hidden [&>*:not(:first-child)]:-mt-px [&>*]:rounded-none [&>*]:shadow-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg"
    : "";

  const childClasses =
    fullWidth && orientation === "horizontal" ? "[&>*]:flex-1" : "";

  const groupClasses = [
    orientationClasses[orientation],
    spacingClasses[spacing],
    widthClasses,
    attachedClasses,
    childClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClasses}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ButtonProps>(child)) {
          return React.cloneElement(child, {
            className: `${child.props.className || ""} ${attached ? "focus:relative focus:z-10" : ""}`,
            fullWidth:
              fullWidth && orientation === "vertical"
                ? true
                : child.props.fullWidth,
          });
        }
        return child;
      })}
    </div>
  );
};

export default ButtonGroup;
