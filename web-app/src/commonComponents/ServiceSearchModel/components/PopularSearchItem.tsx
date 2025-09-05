"use client";

import { TrendingUp } from "lucide-react";

interface PopularSearchItemProps {
  text: string;
  onClick: () => void;
  isSelected?: boolean;
  className?: string;
}

export default function PopularSearchItem({
  text,
  onClick,
  isSelected = false,
  className = "",
}: PopularSearchItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 
        rounded-lg text-left transition-colors whitespace-nowrap
        ${
          isSelected
            ? "bg-[#00a871] text-white border-[#00a871] hover:bg-[#00a871]/90"
            : ""
        }
        ${className}
      `}
    >
      <div className="flex-shrink-0">
        <TrendingUp className="w-4 h-4 text-gray-500" />
      </div>
      <span className="text-sm font-medium text-gray-900">{text}</span>
    </button>
  );
}
