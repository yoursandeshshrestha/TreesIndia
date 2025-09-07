"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import { PropertyCard } from "@/commonComponents/PropertyCard";
import { useRouter } from "next/navigation";
import { Search, Filter, Home, MapPin } from "lucide-react";
import { PropertyFilters } from "@/types/property";
import { useLocation } from "@/hooks/useLocationRedux";

export default function PropertiesPage() {
  const router = useRouter();
  const { location } = useLocation();
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    is_approved: true,
    status: "available",
  });

  // Auto-populate city and state from user's location
  useEffect(() => {
    if (location?.city && location?.state) {
      setFilters((prev) => ({
        ...prev,
        city: location.city,
        state: location.state,
      }));
    }
  }, [location]);

  const { data: response, isLoading, error, isError } = useProperties(filters);

  const properties = response?.data || [];
  const pagination = response?.pagination;

  const handlePropertyClick = (propertyId: number) => {
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      is_approved: true,
      status: "available",
      // Keep location filters if user has set a location
      ...(location?.city && { city: location.city }),
      ...(location?.state && { state: location.state }),
    });
  };

  // Count active filters (excluding default ones)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.property_type) count++;
    if (filters.listing_type) count++;
    if (filters.bedrooms) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Home className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Properties</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Find your perfect property for sale or rent
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.property_type || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "property_type",
                    e.target.value || undefined
                  )
                }
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Listing Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.listing_type || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "listing_type",
                    e.target.value || undefined
                  )
                }
              >
                <option value="">All Listings</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.bedrooms || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "bedrooms",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.city || ""}
                onChange={(e) =>
                  handleFilterChange("city", e.target.value || undefined)
                }
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                placeholder="Enter state..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.state || ""}
                onChange={(e) =>
                  handleFilterChange("state", e.target.value || undefined)
                }
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="h-60 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <div className="max-w-lg mx-auto">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Failed to load properties
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                We encountered an error while loading the properties. Please try
                again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-lg mx-auto">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No properties found
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                No properties match your current filters. Try adjusting your
                search criteria.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.page} of {pagination.total_pages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
