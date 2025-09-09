"use client";

import { useParams } from "next/navigation";
import { usePropertyById, useProperties } from "@/hooks/useProperties";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  User,
  Phone,
  Shield,
  Clock,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import PropertyCard from "@/commonComponents/PropertyCard/PropertyCard";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Safely parse the property ID with validation
  const propertyIdParam = params.id as string;
  const propertyId =
    propertyIdParam && !isNaN(Number(propertyIdParam))
      ? parseInt(propertyIdParam)
      : null;

  const {
    data: response,
    isLoading,
    isError,
  } = usePropertyById(propertyId || 0);

  // Handle invalid property ID with useEffect to avoid hydration issues
  useEffect(() => {
    if (!propertyId || propertyId <= 0) {
      router.push("/marketplace/rental-properties");
    }
  }, [propertyId, router]);

  // Show loading while redirecting
  if (!propertyId || propertyId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="h-96 bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const property = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>

              {/* Property card skeleton */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="h-96 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
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
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="text-center py-12">
              <h1 className="text-lg font-bold text-gray-900 mb-3">
                Property Not Found
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                The property you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
              <button
                onClick={() => router.push("/marketplace/rental-properties")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
              >
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (property: {
    listing_type: string;
    sale_price?: number | null;
    monthly_rent?: number | null;
  }) => {
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

  const formatAge = (age: string | null) => {
    if (!age) return null;

    switch (age) {
      case "under_1_year":
        return "Under 1 year";
      case "1_year":
        return "1 year";
      case "1_2_years":
        return "1-2 years";
      case "2_3_years":
        return "2-3 years";
      case "3_5_years":
        return "3-5 years";
      case "5_10_years":
        return "5-10 years";
      case "over_10_years":
        return "Over 10 years";
      default:
        return age.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 px-4 sm:px-6 lg:px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Main Content Layout */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Header */}
              <div className="bg-white  ">
                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {property.treesindia_assured && (
                    <div className="inline-flex items-center bg-white text-green-600 font-semibold px-4 py-2 rounded-lg border border-green-200">
                      <div className="relative w-6 h-6 mr-2">
                        <Image
                          src="/logo/logo.svg"
                          alt="TreesIndia Logo"
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                      <span className="text-2xl ">TreesIndia Assured</span>
                    </div>
                  )}
                </div>

                {/* Title and Location */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{property.address || getLocationText()}</span>
                </div>
              </div>

              {/* Property Images */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="relative h-96 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Square className="w-16 h-16 mx-auto mb-4" />
                        <p>No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Image Counter */}
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      1/{property.images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {property.images && property.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2">
                      {property.images.slice(0, 3).map((image, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative"
                        >
                          <Image
                            src={image}
                            alt={`${property.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Property Details
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {property.bedrooms && (
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Bed className="w-4 h-4 text-gray-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Bedrooms</p>
                        <p className="text-sm font-semibold">
                          {property.bedrooms}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Bath className="w-4 h-4 text-gray-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Bathrooms</p>
                        <p className="text-sm font-semibold">
                          {property.bathrooms}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.age && (
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="text-sm font-semibold">
                          {formatAge(property.age)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-semibold capitalize">
                        {property.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Location Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Location
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {property.address && (
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {property.address}
                      </p>
                    )}
                    {property.locality && (
                      <p>
                        <span className="font-medium">Locality:</span>{" "}
                        {property.locality}
                      </p>
                    )}
                    {property.city && (
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {property.city}
                      </p>
                    )}
                    {property.state && (
                      <p>
                        <span className="font-medium">State:</span>{" "}
                        {property.state}
                      </p>
                    )}
                    {property.pincode && (
                      <p>
                        <span className="font-medium">Pincode:</span>{" "}
                        {property.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Price Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 mr-2">₹</span>
                  {property.listing_type === "sale"
                    ? "Sale Information"
                    : "Rental Information"}
                </h3>
                <div className="text-xl font-bold text-gray-900 mb-2">
                  {formatPrice(property)}
                </div>
                {property.price_negotiable && (
                  <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mb-3">
                    Price Negotiable
                  </span>
                )}
                <ul className="space-y-1 text-sm text-gray-600">
                  {property.monthly_rent && (
                    <li>
                      • Monthly rent: ₹{property.monthly_rent.toLocaleString()}
                    </li>
                  )}
                  {property.sale_price && (
                    <li>
                      • Sale price: ₹{property.sale_price.toLocaleString()}
                    </li>
                  )}
                  {property.expires_at && (
                    <li>
                      • Listing expires:{" "}
                      {new Date(property.expires_at).toLocaleDateString()}
                    </li>
                  )}
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact
                </h3>

                {property.user &&
                  (property.user.name || property.user.email) && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 font-medium">
                        Owner: {property.user.name || property.user.email}
                      </p>
                    </div>
                  )}

                <div className="space-y-2">
                  {property.user?.phone && (
                    <button className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                      <Phone className="w-3 h-3 mr-2" />
                      Call Owner {property.user.phone}
                    </button>
                  )}

                  <button className="w-full border border-green-600 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                    Send Message
                  </button>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Property ID:</span> #
                    {property.ID}
                  </p>
                  <p>
                    <span className="font-medium">Listed on:</span>{" "}
                    {new Date(property.CreatedAt).toLocaleDateString()}
                  </p>
                  {property.status && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Status:</span>
                      <span className="inline-flex items-center text-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        {property.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Properties Section */}
          <RelatedPropertiesSection
            currentPropertyId={property.ID}
            city={property.city}
            state={property.state}
            listingType={property.listing_type}
          />
        </div>
      </div>
    </div>
  );
}

// Related Properties Component
function RelatedPropertiesSection({
  currentPropertyId,
  city,
  state,
  listingType,
}: {
  currentPropertyId: number;
  city: string;
  state: string;
  listingType: "sale" | "rent";
}) {
  const router = useRouter();

  const {
    data: relatedPropertiesResponse,
    isLoading: isLoadingRelated,
    isError: isErrorRelated,
  } = useProperties({
    city,
    state,
    listing_type: listingType,
    is_approved: true,
    status: "available",
    limit: 6,
    sortBy: "priority_score",
    sortOrder: "desc",
  });

  // Filter out the current property from related properties
  const relatedProperties =
    relatedPropertiesResponse?.data?.filter(
      (prop) => prop.ID !== currentPropertyId
    ) || [];

  if (isLoadingRelated) {
    return (
      <div className="mt-12">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isErrorRelated || !relatedProperties || relatedProperties.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Related{" "}
          {listingType === "sale"
            ? "Properties for Sale"
            : "Properties for Rent"}{" "}
          in {city}, {state}
        </h2>
        <button
          onClick={() =>
            router.push(
              `/marketplace/properties?city=${city}&state=${state}&listing_type=${listingType}`
            )
          }
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProperties.slice(0, 6).map((relatedProperty) => (
          <PropertyCard
            key={relatedProperty.ID}
            property={relatedProperty}
            onClick={() =>
              router.push(`/marketplace/properties/${relatedProperty.ID}`)
            }
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}
