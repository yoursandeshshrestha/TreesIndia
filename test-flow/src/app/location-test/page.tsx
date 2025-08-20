"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, CheckCircle, AlertCircle } from "lucide-react";

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
  // Enhanced fields from Geoapify API
  country?: string;
  country_code?: string;
  region?: string;
  state?: string;
  city?: string;
  postcode?: string;
  iso3166_2?: string;
  latitude?: number;
  longitude?: number;
  result_type?: string;
  category?: string;
  address_line1?: string;
  address_line2?: string;
  formatted?: string;
  timezone?: {
    name: string;
    offset_STD: string;
    offset_STD_seconds: number;
    offset_DST: string;
    offset_DST_seconds: number;
    abbreviation_STD: string;
    abbreviation_DST: string;
  };
  rank?: {
    importance: number;
    confidence: number;
    confidence_city_level: number;
    match_type: string;
  };
  datasource?: {
    sourcename: string;
    attribution: string;
    license: string;
    url: string;
  };
  geometry?: {
    type: string;
    coordinates: number[];
  };
  bbox?: number[];
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

export default function LocationTestPage() {
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  // Check authentication on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (token.trim()) {
      localStorage.setItem("auth_token", token);
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Please enter a valid token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken("");
    setIsAuthenticated(false);
    setSearchInput("");
    setSuggestions([]);
    setSelectedLocation(null);
    setUpdateStatus("idle");
    setError("");
  };

  const searchLocations = async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/places/autocomplete?input=${encodeURIComponent(
          input
        )}`
      );
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.predictions || []);
      } else {
        setError("Failed to fetch suggestions");
        setSuggestions([]);
      }
    } catch (err) {
      setError("Error fetching suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setSelectedLocation(null);
    searchLocations(value);
  };

  const handleLocationSelect = async (suggestion: LocationSuggestion) => {
    setSearchInput(suggestion.description);
    setSuggestions([]);
    setLoading(true);
    setError("");

    try {
      // Use enhanced data directly from autocomplete response
      const locationData: LocationData = {
        latitude: suggestion.latitude || 0,
        longitude: suggestion.longitude || 0,
        address: suggestion.formatted || suggestion.description,
        city: suggestion.city || "",
        state: suggestion.state || "",
        postal_code: suggestion.postcode || "",
      };

      // If coordinates are not available in autocomplete, show error
      if (!suggestion.latitude || !suggestion.longitude) {
        setError(
          "Location coordinates not available. Please select a different location."
        );
        setLoading(false);
        return;
      }

      setSelectedLocation(locationData);
    } catch (err) {
      setError("Error processing location data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = async () => {
    if (!selectedLocation || !isAuthenticated) return;

    setUpdateStatus("loading");
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/v1/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          address: selectedLocation.address,
          city: selectedLocation.city,
          state: selectedLocation.state,
          postal_code: selectedLocation.postal_code,
          source: "manual",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUpdateStatus("success");
        setTimeout(() => setUpdateStatus("idle"), 3000);
      } else {
        setUpdateStatus("error");
        setError(data.message || "Failed to create location");
      }
    } catch (err) {
      setUpdateStatus("error");
      setError("Error creating location");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <MapPin className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Location Test</h1>
            <p className="text-gray-600 mt-2">
              Enter your authentication token to continue
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Authentication Token
              </label>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your JWT token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Location Update Test
                </h1>
                <p className="text-gray-600">Search and update your location</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Location
          </h2>

          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <Search className="h-5 w-5 text-gray-400 ml-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search for city, place, or pincode..."
                className="flex-1 px-3 py-2 border-0 focus:outline-none focus:ring-0"
              />
              {loading && (
                <div className="mr-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm mt-3">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Selected Location */}
        {selectedLocation && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Location
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{selectedLocation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">City:</span>
                <span className="font-medium">
                  {selectedLocation.city || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State:</span>
                <span className="font-medium">
                  {selectedLocation.state || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Postal Code:</span>
                <span className="font-medium">
                  {selectedLocation.postal_code || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium">
                  {selectedLocation.latitude.toFixed(6)},{" "}
                  {selectedLocation.longitude.toFixed(6)}
                </span>
              </div>

              {/* Enhanced Data Display */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Enhanced Data Available:
                </h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    • Country:{" "}
                    {suggestions.find(
                      (s) => s.description === selectedLocation.address
                    )?.country || "N/A"}
                  </div>
                  <div>
                    • Country Code:{" "}
                    {suggestions.find(
                      (s) => s.description === selectedLocation.address
                    )?.country_code || "N/A"}
                  </div>
                  <div>
                    • Region:{" "}
                    {suggestions.find(
                      (s) => s.description === selectedLocation.address
                    )?.region || "N/A"}
                  </div>
                  <div>
                    • Result Type:{" "}
                    {suggestions.find(
                      (s) => s.description === selectedLocation.address
                    )?.result_type || "N/A"}
                  </div>
                  <div>
                    • Category:{" "}
                    {suggestions.find(
                      (s) => s.description === selectedLocation.address
                    )?.category || "N/A"}
                  </div>
                  <div>
                    • Confidence:{" "}
                    {suggestions
                      .find((s) => s.description === selectedLocation.address)
                      ?.rank?.confidence?.toFixed(2) || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={updateUserLocation}
              disabled={updateStatus === "loading"}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updateStatus === "loading" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Location...
                </>
              ) : updateStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Location Updated Successfully!
                </>
              ) : (
                "Create My Location"
              )}
            </button>

            {updateStatus === "error" && (
              <div className="flex items-center text-red-600 text-sm mt-3">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ol className="text-blue-800 text-sm space-y-1">
            <li>1. Enter your authentication token to login</li>
            <li>2. Start typing in the search box (city, place, or pincode)</li>
            <li>3. Select a location from the suggestions</li>
            <li>4. Click "Update My Location" to save your location</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
