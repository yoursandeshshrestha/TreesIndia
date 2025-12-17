import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import type {
  SearchableDropdownProps,
  Option,
} from "./SearchableDropdown.types";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
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
  onOpen,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedOption = options.find((option) => option.value === value);

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
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Focus search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // Set initial selected index to current value if it exists
      if (value !== undefined) {
        const currentIndex = filteredOptions.findIndex(
          (opt) => opt.value === value
        );
        if (currentIndex >= 0) {
          setSelectedIndex(currentIndex);
        }
      }
    }
  }, [isOpen, value, filteredOptions]);

  // Reset selected index when search term or filtered options change
  useEffect(() => {
    setSelectedIndex(-1);
    // Reset refs array when options change
    optionRefs.current = new Array(filteredOptions.length).fill(null);
  }, [searchTerm, filteredOptions.length]);

  // Scroll selected option into view
  useEffect(() => {
    if (selectedIndex >= 0 && optionRefs.current[selectedIndex]) {
      optionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Helper function to find next enabled option
  const findNextEnabledIndex = (
    currentIndex: number,
    direction: "up" | "down"
  ): number => {
    if (filteredOptions.length === 0) return -1;

    let nextIndex = currentIndex;
    const maxAttempts = filteredOptions.length;
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (direction === "down") {
        nextIndex = nextIndex < filteredOptions.length - 1 ? nextIndex + 1 : 0;
      } else {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : filteredOptions.length - 1;
      }

      if (!filteredOptions[nextIndex]?.disabled) {
        return nextIndex;
      }
      attempts++;
    }

    return -1;
  };

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
        setSelectedIndex((prev) => {
          if (prev < 0 && filteredOptions.length > 0) {
            const firstEnabled = findNextEnabledIndex(-1, "down");
            return firstEnabled >= 0 ? firstEnabled : 0;
          }
          const nextIndex = findNextEnabledIndex(prev, "down");
          return nextIndex >= 0 ? nextIndex : prev;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev < 0 && filteredOptions.length > 0) {
            const lastEnabled = findNextEnabledIndex(
              filteredOptions.length,
              "up"
            );
            return lastEnabled >= 0 ? lastEnabled : filteredOptions.length - 1;
          }
          const nextIndex = findNextEnabledIndex(prev, "up");
          return nextIndex >= 0 ? nextIndex : prev;
        });
        break;
      case "Home":
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const firstEnabled = findNextEnabledIndex(-1, "down");
          setSelectedIndex(firstEnabled >= 0 ? firstEnabled : 0);
        }
        break;
      case "End":
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const lastEnabled = findNextEnabledIndex(
            filteredOptions.length,
            "up"
          );
          setSelectedIndex(
            lastEnabled >= 0 ? lastEnabled : filteredOptions.length - 1
          );
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const option = filteredOptions[selectedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm("");
            setSelectedIndex(-1);
          }
        } else if (filteredOptions.length === 1) {
          // If only one option, select it
          const option = filteredOptions[0];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm("");
            setSelectedIndex(-1);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setSelectedIndex(-1);
        break;
      case "Tab":
        // Allow Tab to close dropdown and move focus
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't interfere with normal typing
    if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      ![
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
        "Enter",
        "Escape",
        "Tab",
      ].includes(e.key)
    ) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev < 0 && filteredOptions.length > 0) {
            const firstEnabled = findNextEnabledIndex(-1, "down");
            return firstEnabled >= 0 ? firstEnabled : 0;
          }
          const nextIndex = findNextEnabledIndex(prev, "down");
          return nextIndex >= 0 ? nextIndex : prev;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev < 0 && filteredOptions.length > 0) {
            const lastEnabled = findNextEnabledIndex(
              filteredOptions.length,
              "up"
            );
            return lastEnabled >= 0 ? lastEnabled : filteredOptions.length - 1;
          }
          const nextIndex = findNextEnabledIndex(prev, "up");
          return nextIndex >= 0 ? nextIndex : prev;
        });
        break;
      case "Home":
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const firstEnabled = findNextEnabledIndex(-1, "down");
          setSelectedIndex(firstEnabled >= 0 ? firstEnabled : 0);
        }
        break;
      case "End":
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const lastEnabled = findNextEnabledIndex(
            filteredOptions.length,
            "up"
          );
          setSelectedIndex(
            lastEnabled >= 0 ? lastEnabled : filteredOptions.length - 1
          );
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const option = filteredOptions[selectedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm("");
            setSelectedIndex(-1);
          }
        } else if (filteredOptions.length === 1) {
          // If only one option, select it
          const option = filteredOptions[0];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm("");
            setSelectedIndex(-1);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setSelectedIndex(-1);
        break;
      case "Tab":
        // Allow Tab to close dropdown and move focus
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width }}
      ref={dropdownRef}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 ">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={`relative flex items-center justify-between w-full px-3 py-[7px] text-left bg-white border rounded-md shadow-sm cursor-pointer  ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        } ${error ? "border-red-500" : "border-gray-300"}`}
        onClick={() => {
          if (!disabled) {
            if (!isOpen && onOpen) {
              onOpen();
            }
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="dropdown-options"
      >
        <span className="block truncate">
          {selectedOption ? (
            <div className="flex items-center">
              {selectedOption.icon && (
                <span className="mr-2">{selectedOption.icon}</span>
              )}
              {selectedOption.label}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
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
                onKeyDown={handleSearchKeyDown}
                onClick={(e) => e.stopPropagation()}
                aria-autocomplete="list"
                aria-controls="dropdown-options"
              />
            </div>
          </div>

          <div
            ref={optionsListRef}
            className="overflow-auto"
            role="listbox"
            id="dropdown-options"
            style={{ maxHeight: `calc(${maxHeight} - 60px)` }}
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
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    option.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  } ${selectedIndex === index ? "bg-blue-100" : ""} ${
                    option.value === value ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={
                    option.value === value || selectedIndex === index
                  }
                  onMouseEnter={() => setSelectedIndex(index)}
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

export default SearchableDropdown;
