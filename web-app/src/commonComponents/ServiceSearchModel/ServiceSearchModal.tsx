"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeSearchModal } from "@/store/slices/searchModalSlice";
import { useSearchSuggestions, useSearchServices } from "@/hooks/useSearch";
import { useDebouncedValue } from "@/utils/debounce";
import { SearchService, SearchSuggestion } from "@/services/searchService";
import PopularSearchItem from "./components/PopularSearchItem";
import CompactServiceCard from "../ServiceCard/CompactServiceCard";
import Input from "@/commonComponents/Input/Base/Input";
import BouncingDots from "../BouncingDots/BouncingDots";

export default function ServiceSearchModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector((state) => state.searchModal.isOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Fetch search suggestions
  const { data: suggestionsData, isLoading: isLoadingSuggestions } =
    useSearchSuggestions();

  // Search services when query is long enough
  const { data: searchResults, isLoading: isSearching } = useSearchServices(
    { q: debouncedSearchQuery },
    debouncedSearchQuery.trim().length >= 2
  );

  const handleClose = () => {
    dispatch(closeSearchModal());
    setSearchQuery("");
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length < 2);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (
    suggestion: SearchSuggestion | SearchService
  ) => {
    const query =
      "keyword" in suggestion ? suggestion.keyword : suggestion.name;
    setSearchQuery(query);
    setShowSuggestions(false);
    // Just fill the input, don't navigate
  };

  const handleServiceClick = (service: SearchService) => {
    router.push(`/services/${service.slug}`);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const suggestions = [
      ...(suggestionsData?.keywords || []),
      ...(suggestionsData?.services || []),
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        // Don't navigate on Enter, just fill the input
        break;
      case "Escape":
        handleClose();
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative w-full max-w-2xl"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[10000] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Search Input */}
              <div className="px-4 pt-4 pb-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for services..."
                  leftIcon={<Search className="w-5 h-5" />}
                  rightIcon={
                    isSearching || isLoadingSuggestions ? (
                      <BouncingDots size="sm" color="text-gray-400" />
                    ) : undefined
                  }
                  className="text-lg py-4"
                  autoFocus
                />
              </div>

              {/* Content */}
              <div className="h-[600px] overflow-y-auto">
                {showSuggestions && searchQuery.trim().length < 2 ? (
                  /* Show Suggestions */
                  <div className="p-4">
                    {isLoadingSuggestions ? (
                      <div className="flex items-center justify-center py-8">
                        <BouncingDots size="md" color="text-gray-400" />
                        <span className="ml-2 text-gray-500">
                          Loading suggestions...
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Popular Keywords */}
                        {suggestionsData?.keywords &&
                          suggestionsData.keywords.length > 0 && (
                            <div className="mb-6">
                              <div className="mb-3">
                                <h3 className="font-semibold text-gray-900">
                                  Popular Searches
                                </h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {suggestionsData.keywords.map(
                                  (keyword, index) => (
                                    <PopularSearchItem
                                      key={keyword.keyword}
                                      text={keyword.keyword}
                                      onClick={() =>
                                        handleSuggestionClick(keyword)
                                      }
                                      isSelected={selectedIndex === index}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Popular Services */}
                        {suggestionsData?.services &&
                          suggestionsData.services.length > 0 && (
                            <div>
                              <div className="mb-3">
                                <h3 className="font-semibold text-gray-900">
                                  Popular Services
                                </h3>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {suggestionsData.services.map((service) => (
                                  <CompactServiceCard
                                    key={service.id}
                                    service={service}
                                    onClick={() =>
                                      handleSuggestionClick(service)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Show Search Results */
                  <div className="h-full">
                    {isSearching ? (
                      <div className="flex items-center justify-center h-full">
                        <BouncingDots size="md" color="text-gray-400" />
                      </div>
                    ) : searchResults?.results &&
                      searchResults.results.length > 0 ? (
                      <div className="p-4">
                        <div className="text-sm text-gray-500 mb-3">
                          {searchResults.search_metadata.total_results} results
                          found
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {searchResults.results.map((service) => {
                            // Convert SearchResult to SearchService format
                            const adaptedService: SearchService = {
                              ...service,
                              category_id: 0, // Not available in SearchResult
                              subcategory_id: 0, // Not available in SearchResult
                              is_active: true, // Assume active for search results
                              service_areas: service.service_areas.map(
                                (area) => ({ name: area })
                              ),
                              category: {
                                id: 0,
                                name: service.category,
                                slug: service.category
                                  .toLowerCase()
                                  .replace(/\s+/g, "-"),
                                description: "",
                                is_active: true,
                                created_at: "",
                                updated_at: "",
                              },
                              subcategory: {
                                id: 0,
                                name: service.subcategory,
                                slug: service.subcategory
                                  .toLowerCase()
                                  .replace(/\s+/g, "-"),
                                description: "",
                                icon: "",
                                parent_id: 0,
                                is_active: true,
                                created_at: "",
                                updated_at: "",
                              },
                            };

                            return (
                              <CompactServiceCard
                                key={service.id}
                                service={adaptedService}
                                onClick={() =>
                                  handleServiceClick(adaptedService)
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center text-center">
                          <Search className="w-12 h-12 text-gray-300 mb-3" />
                          <div className="text-gray-500">
                            No services found for &ldquo;{searchQuery}&rdquo;
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Try different keywords or check spelling
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
