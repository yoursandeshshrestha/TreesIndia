"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { close } from "@/app/store";
import commandItemsData from "./commandItems.json";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  path?: string;
  keywords: string[];
}

const CommandPalette: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, searchQuery } = useAppSelector(
    (state) => state.commandPalette
  );
  const initialQuery = searchQuery;
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get command items from JSON
  const commandItems: CommandItem[] = commandItemsData.items;

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Combined effect to handle both opening/closing and filtering
  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setQuery("");
      setSelectedIndex(0);
      setFilteredItems([]);
      return;
    }

    // When opened, set initial query and focus
    if (
      query === "" &&
      initialQuery &&
      typeof initialQuery === "string" &&
      initialQuery !== ""
    ) {
      setQuery(initialQuery);
    }

    inputRef.current?.focus();

    // Handle filtering logic
    if (!query || typeof query !== "string" || !query.trim()) {
      // When no query, show all items
      setFilteredItems(commandItems);
    } else {
      // When there's a query, filter items
      const queryLower = (query || "").toLowerCase();

      const filtered = commandItems
        .filter((item) => {
          const labelMatch = item.label.toLowerCase().includes(queryLower);
          const keywordMatch = item.keywords.some((keyword) =>
            keyword.toLowerCase().includes(queryLower)
          );

          return labelMatch || keywordMatch;
        })
        .sort((a, b) => {
          // Prioritize exact matches
          const aExact = a.label.toLowerCase() === queryLower;
          const bExact = b.label.toLowerCase() === queryLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Then prioritize starts with
          const aStartsWith = a.label.toLowerCase().startsWith(queryLower);
          const bStartsWith = b.label.toLowerCase().startsWith(queryLower);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return 0;
        });

      setFilteredItems(filtered);
      setSelectedIndex(0);
    }
  }, [isOpen, query, initialQuery, commandItems]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Handle Command+K to close the palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(close());
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          const selectedItem = filteredItems[selectedIndex];
          if (selectedItem) {
            handleItemSelect(selectedItem);
          }
          break;
        case "Escape":
          e.preventDefault();
          dispatch(close());
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, filteredItems, selectedIndex, dispatch]
  );

  // Handle item selection
  const handleItemSelect = (item: CommandItem) => {
    if (item.path) {
      router.push(item.path);
    }
    dispatch(close());
    setQuery("");
    setSelectedIndex(0);
  };

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        dispatch(close());
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-[500px] max-h-[500px] overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-lg"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(close())}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[520px] min-h-[500px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm">Try searching for something else</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => handleItemSelect(item)}
                    className={`flex items-center px-4 py-3 transition-colors relative ${
                      isSelected
                        ? "bg-gray-100 cursor-pointer"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#737373]" />
                    )}
                    <div className="flex items-center space-x-3 flex-1">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
