"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors group ${className}`}
      title="Search (⌘K)"
    >
      <Search size={18} className="text-gray-600" />
      
      {/* Keyboard shortcut indicator */}
      <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        ⌘K
      </div>
    </button>
  );
};

export default SearchButton;
