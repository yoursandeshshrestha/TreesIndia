"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  Loader2,
  Home,
  RotateCcw,
  Target,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "@/hooks/useLocationRedux";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeLocationModal } from "@/store/slices/locationModalSlice";

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  type: "home" | "work" | "other";
}

interface RecentLocation {
  id: string;
  city: string;
  state: string;
  country: string;
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted: string;
}

export default function LocationModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.locationModal.isOpen);

  const { detectLocation, isLoading, error, setLocation, setError } =
    useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  // Load saved and recent locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedLocations");
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }

      const recent = localStorage.getItem("recentLocations");
      if (recent) {
        setRecentLocations(JSON.parse(recent));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDetectLocation = async () => {
    try {
      // Clear any previous errors
      setError(null);
      const detectedLocation = await detectLocation();

      if (detectedLocation) {
        // Add to recent locations
        addToRecentLocations(detectedLocation);

        // Show success toast
        toast.success(
          `Location detected: ${detectedLocation.city}, ${detectedLocation.state}`
        );
      }

      // Close modal after successful location detection
      dispatch(closeLocationModal());
    } catch (error) {
      console.error(error);
    }
  };

  // Use TanStack Query for location search
  const { data: searchResultsData, isLoading: isSearching } = useLocationSearch(
    {
      query: searchQuery,
      enabled: searchQuery.length >= 2,
    }
  );

  // Update search results when data changes
  useEffect(() => {
    if (searchResultsData) {
      setSearchResults(searchResultsData);
    } else {
      setSearchResults([]);
    }
  }, [searchResultsData]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    handleLocationSelect({
      city: result.city,
      state: result.state,
      country: result.country,
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  // Helper function to add location to recent locations
  const addToRecentLocations = (location: {
    city: string;
    state: string;
    country: string;
  }) => {
    const newRecent: RecentLocation = {
      id: Date.now().toString(),
      city: location.city,
      state: location.state,
      country: location.country,
    };

    setRecentLocations((prev) => {
      // Remove duplicates based on city and state
      const filtered = prev.filter(
        (loc) => loc.city !== location.city || loc.state !== location.state
      );
      // Add new location at the beginning and keep only 5 items
      const updated = [newRecent, ...filtered.slice(0, 4)];
      localStorage.setItem("recentLocations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLocationSelect = (selectedLocation: {
    city: string;
    state: string;
    country: string;
  }) => {
    setLocation(selectedLocation);
    localStorage.setItem("userLocation", JSON.stringify(selectedLocation));

    // Add to recent locations
    addToRecentLocations(selectedLocation);

    dispatch(closeLocationModal());
  };

  const handleSavedLocationSelect = (savedLocation: SavedLocation) => {
    // Extract city and state from the address
    const addressParts = savedLocation.address.split(", ");
    const city = addressParts[2] || savedLocation.name; // Siliguri
    const state = addressParts[3] || "Unknown State"; // West Bengal

    handleLocationSelect({
      city,
      state,
      country: "India",
    });
  };

  const handleClose = () => {
    dispatch(closeLocationModal());
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Simple overflow hidden approach
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-2 sm:p-4"
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
            className="relative w-full min-w-[300px] sm:max-w-md 
            lg:max-w-lg"
          >
            {/* Close Button - Responsive positioning */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={handleClose}
              className="absolute -top-10 sm:-top-12 -right-0 sm:-right-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-xl sm:rounded-2xl w-full shadow-xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Search Bar */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    placeholder="Search for your location/society/apartment"
                    className="w-full text-black pl-10 pr-4 py-3 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-120 overflow-y-auto  rounded-lg">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => handleSearchResultSelect(result)}
                        className="w-full text-left p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {result.structured_formatting.main_text}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {result.structured_formatting.secondary_text}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Use Current Location */}
              {searchResults.length === 0 && (
                <div className="p-4 ">
                  <button
                    onClick={handleDetectLocation}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 text-[var(--color-brand-main)] hover:bg-[var(--color-brand-light)] p-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Target className="w-5 h-5" />
                    <span className="font-medium">
                      {isLoading
                        ? "Getting your current location..."
                        : "Use current location"}
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                </div>
              )}

              {/* Saved Locations */}
              {searchResults.length === 0 && savedLocations.length > 0 && (
                <div className="p-4 ">
                  <h3 className="font-semibold text-gray-900 mb-3">Saved</h3>
                  <div className="space-y-3">
                    {savedLocations.map((savedLocation) => (
                      <button
                        key={savedLocation.id}
                        onClick={() => handleSavedLocationSelect(savedLocation)}
                        className="w-full flex items-start space-x-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <Home className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {savedLocation.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {savedLocation.address}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Locations */}
              {searchResults.length === 0 && recentLocations.length > 0 && (
                <div className="p-4 ">
                  <h3 className="font-semibold text-gray-900 mb-3">Recents</h3>
                  <div className="space-y-3">
                    {recentLocations.map((recentLocation) => (
                      <button
                        key={recentLocation.id}
                        onClick={() => handleLocationSelect(recentLocation)}
                        className="w-full flex items-start space-x-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {recentLocation.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {recentLocation.state}, {recentLocation.country}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 border-b border-gray-200">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
