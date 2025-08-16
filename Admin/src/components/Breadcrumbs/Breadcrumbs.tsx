import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbsProps } from "./Breadcrumbs.types";

const Breadcrumbs = ({
  items,
  className = "",
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  showIcons = true,
}: BreadcrumbsProps) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.isActive || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">{separator}</span>}
              {item.href && !isActive ? (
                <Link
                  href={item.href}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {showIcons && item.icon && (
                    <span className="mr-1.5">{item.icon}</span>
                  )}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`flex items-center text-sm font-medium ${
                    isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {showIcons && item.icon && (
                    <span className="mr-1.5">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
