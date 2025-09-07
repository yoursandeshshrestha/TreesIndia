"use client";

import { useParams } from "next/navigation";
import { usePropertyById } from "@/hooks/useProperties";
import { PropertyCard } from "@/commonComponents/PropertyCard";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  Calendar,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = parseInt(params.id as string);

  const {
    data: response,
    isLoading,
    error,
    isError,
  } = usePropertyById(propertyId);

  const property = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-8 bg-gray-200 rounded w-24 mb-6"></div>

            {/* Property card skeleton */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-96 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Property Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push("/marketplace/properties")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (property: typeof property) => {
    if (property.listing_type === "sale" && property.sale_price) {
      return `₹${property.sale_price.toLocaleString()}`;
    }
    if (property.listing_type === "rent" && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString()}/month`;
    }
    return "Price on request";
  };

  const getLocationText = () => {
    const parts = [property.locality, property.city, property.state].filter(
      Boolean
    );
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Property Details */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {/* Property Images */}
          <div className="relative h-96 bg-gray-200">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Square className="w-16 h-16 mx-auto mb-4" />
                  <p>No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Property Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {property.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{getLocationText()}</span>
                </div>

                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(property)}
                </div>

                {property.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Description
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Property Features */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Property Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Bed className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Bath className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.parking_spaces && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Car className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Parking</p>
                          <p className="font-semibold">
                            {property.parking_spaces}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Square className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Area</p>
                          <p className="font-semibold">{property.area} sq ft</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {property.property_type}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Listing:</span>
                      <span className="font-medium capitalize">
                        {property.listing_type}
                      </span>
                    </div>

                    {property.furnishing_status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Furnishing:</span>
                        <span className="font-medium capitalize">
                          {property.furnishing_status.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    {property.floor_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">
                          {property.floor_number}
                        </span>
                      </div>
                    )}

                    {property.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">
                          {property.age} years
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">
                        {property.status}
                      </span>
                    </div>
                  </div>

                  {property.user && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Listed by
                      </h4>
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-sm text-gray-600">
                          {property.user.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Contact Owner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
