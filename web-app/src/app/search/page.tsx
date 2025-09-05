"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  Star,
  MapPin,
  Wrench,
  ArrowLeft,
} from "lucide-react";
import { useDebouncedValue } from "../../utils/debounce";
import { useSearchSuggestions, useSearchServices } from "../../hooks/useSearch";
import {
  SearchSuggestion,
  SearchService,
  SearchResult,
} from "../../services/searchService";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get initial query from URL params
  const initialQuery = searchParams.get("q") || "";

  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [showResults, setShowResults] = useState(initialQuery.length > 0);

  const debouncedQuery = useDebouncedValue(localQuery, 300);

  // Fetch suggestions and search results
  const { data: suggestions, isLoading: suggestionsLoading } =
    useSearchSuggestions();
  const { data: searchResults, isLoading: searchLoading } = useSearchServices(
    { q: debouncedQuery },
    debouncedQuery.length > 0
  );

  // Focus input when page loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      const params = new URLSearchParams(searchParams);
      params.set("q", debouncedQuery);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    } else {
      router.replace("/search", { scroll: false });
    }
  }, [debouncedQuery, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setShowResults(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    setShowResults(true);
  };

  const handleServiceClick = (service: SearchResult) => {
    router.push(`/services/${service.slug}`);
  };


  const handleBackClick = () => {
    router.back();
  };

  const renderSuggestionItem = (suggestion: SearchSuggestion) => (
    <button
      key={suggestion.keyword}
      onClick={() => handleSuggestionClick(suggestion.keyword)}
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
    >
      <div className="flex items-center space-x-3">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-medium text-gray-900">{suggestion.keyword}</p>
          <p className="text-sm text-gray-500">{suggestion.category}</p>
        </div>
      </div>
      <span className="text-xs text-gray-400">
        {suggestion.search_count} searches
      </span>
    </button>
  );

  const renderServiceItem = (service: SearchService) => (
    <button
      key={service.id}
      onClick={() => handleSuggestionClick(service.name)}
      className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
    >
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
        {service.images && service.images.length > 0 ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            className="object-cover rounded-lg"
            sizes="48px"
          />
        ) : (
          <Wrench className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-900">{service.name}</p>
        <p className="text-sm text-gray-500">
          {service.category.name} • {service.subcategory.name}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{service.price_type}</span>
          </div>
          {service.price && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">₹{service.price}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );

  const renderSearchResult = (result: SearchResult) => (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleServiceClick(result)}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            {result.images && result.images.length > 0 ? (
              <Image
                src={result.images[0]}
                alt={result.name}
                fill
                className="object-cover rounded-lg"
                sizes="64px"
              />
            ) : (
              <Wrench className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {result.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {result.category} • {result.subcategory}
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                {result.rating} ({result.total_bookings} bookings)
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {result.price_type === "fixed" && result.price
                    ? `₹${result.price}`
                    : "Inquiry Based"}
                </span>
                {result.duration && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {result.duration}
                    </span>
                  </>
                )}
              </div>
              {result.highlighted_price && (
                <span className="text-sm font-medium text-blue-600">
                  {result.highlighted_price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={handleInputChange}
                placeholder="Search for services, prices, or types..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {showResults ? (
          // Search Results
          <div>
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">Searching...</span>
              </div>
            ) : searchResults?.results.length ? (
              <div>
                <div className="mb-6">
                  <p className="text-lg text-gray-600">
                    Found {searchResults.pagination.total} results for &quot;
                    {debouncedQuery}&quot;
                  </p>
                  {searchResults.search_metadata.filter_applied && (
                    <p className="text-sm text-blue-600 mt-1">
                      Filter: {searchResults.search_metadata.filter_applied}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  {searchResults.results.map(renderSearchResult)}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  No results found for &quot;{debouncedQuery}&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try different keywords or check spelling
                </p>
              </div>
            )}
          </div>
        ) : (
          // Suggestions
          <div>
            {/* Popular Keywords */}
            {suggestions?.keywords && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Popular Searches
                </h2>
                <div className="grid gap-3">
                  {suggestions.keywords.map(renderSuggestionItem)}
                </div>
              </div>
            )}

            {/* Popular Services */}
            {suggestions?.services && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Popular Services
                </h2>
                <div className="grid gap-3">
                  {suggestions.services.map(renderServiceItem)}
                </div>
              </div>
            )}

            {/* Loading State */}
            {suggestionsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">
                  Loading suggestions...
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

