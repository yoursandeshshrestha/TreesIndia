"use client";

import React, { useRef, useState, useEffect } from "react";
import type { DropdownProps, DropdownItem } from "./Dropdown.types";

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  align = "left",
  width = "w-48",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: DropdownItem) => {
    if (!item.disabled) {
      onSelect(item.value);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-dropdown mt-1 ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {items.map((item) => (
              <div
                key={item.value}
                onClick={() => handleSelect(item)}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center ${
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
