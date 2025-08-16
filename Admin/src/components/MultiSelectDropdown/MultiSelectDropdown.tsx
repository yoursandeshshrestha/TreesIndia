import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2, X } from "lucide-react";
import type { Option } from "../SearchableDropdown/SearchableDropdown.types";

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  maxHeight?: string;
  width?: string;
}

const MultiSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className = "",
  disabled = false,
  error,
  label,
  required = false,
  searchPlaceholder = "Search...",
  noOptionsMessage = "No options found",
  loading = false,
  loadingMessage = "Loading...",
  maxHeight = "200px",
  width = "100%",
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((option) =>
    value.includes(option.value as string)
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const option = filteredOptions[selectedIndex];
          if (option.disabled) return;

          const newValue = value.includes(option.value as string)
            ? value.filter((v) => v !== option.value)
            : [...value, option.value as string];

          onChange(newValue);
          setSearchTerm("");
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setSelectedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    if (option.disabled) return;

    const newValue = value.includes(option.value as string)
      ? value.filter((v) => v !== option.value)
      : [...value, option.value as string];

    onChange(newValue);
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width }}
      ref={dropdownRef}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={`relative flex items-center justify-between w-full px-3 py-[7px] text-left bg-white border rounded-md shadow-sm cursor-pointer ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        } ${error ? "border-red-500" : "border-gray-300"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="dropdown-options"
      >
        <div className="flex flex-wrap gap-1 min-h-[24px]">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm"
              >
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeOption(option.value as string, e)}
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
          style={{ maxHeight }}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className="overflow-auto"
            role="listbox"
            id="dropdown-options"
            style={{ maxHeight: `calc(${maxHeight} - 40px)` }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {loadingMessage}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                {noOptionsMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    option.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  } ${selectedIndex === index ? "bg-gray-100" : ""} ${
                    value.includes(option.value as string) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={value.includes(option.value as string)}
                >
                  <div className="flex items-center">
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
