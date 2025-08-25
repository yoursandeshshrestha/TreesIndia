"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  Loader2,
  ArrowLeft,
  Home,
  RotateCcw,
  Target,
  Search,
} from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
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

  const { detectLocation, isLoading, error, location, setLocation } =
    useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

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
      console.error("Error loading saved/recent locations:", error);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleDetectLocation = async () => {
    await detectLocation();
    // Close modal after successful location detection
    dispatch(closeLocationModal());
  };

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using your backend API for autocomplete
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const response = await fetch(
        `${apiUrl}/places/autocomplete?input=${encodeURIComponent(
          query
        )}&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.predictions) {
          setSearchResults(data.data.predictions);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Clear results immediately if query is too short
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      handleSearch(value);
    }, 500); // 500ms delay

    setDebounceTimeout(timeout);
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

  const handleLocationSelect = (selectedLocation: {
    city: string;
    state: string;
    country: string;
  }) => {
    setLocation(selectedLocation);
    localStorage.setItem("userLocation", JSON.stringify(selectedLocation));

    // Add to recent locations
    const newRecent: RecentLocation = {
      id: Date.now().toString(),
      city: selectedLocation.city,
      state: selectedLocation.state,
      country: selectedLocation.country,
    };

    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (loc) =>
          loc.city !== selectedLocation.city ||
          loc.state !== selectedLocation.state
      );
      const updated = [newRecent, ...filtered.slice(0, 4)]; // Keep max 5 recent locations
      localStorage.setItem("recentLocations", JSON.stringify(updated));
      return updated;
    });

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4"
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
            className="relative"
          >
            {/* Close Button - Positioned on top of the modal */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={handleClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl min-w-lg max-w-lg w-full shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    placeholder="Search for your location/society/apartment"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-120 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => handleSearchResultSelect(result)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
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
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={handleDetectLocation}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Target className="w-5 h-5" />
                    <span className="font-medium">
                      {isLoading
                        ? "Detecting your current location..."
                        : "Use current location"}
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                </div>
              )}

              {/* Saved Locations */}
              {searchResults.length === 0 && savedLocations.length > 0 && (
                <div className="p-4 border-b border-gray-200">
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
                <div className="p-4 border-b border-gray-200">
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
