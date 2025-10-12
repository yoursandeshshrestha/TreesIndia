"use client";

import Image from "next/image";
import { Vendor } from "@/types/vendor";
import { MapPin, Building2, Phone, MessageCircle } from "lucide-react";
import { formatAddressShort } from "@/utils/addressUtils";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
  onClick?: (vendorId: number) => void;
  onChatClick?: (vendor: Vendor) => void;
  onCallClick?: (vendor: Vendor) => void;
  currentUserId?: number;
}

export function VendorCard({
  vendor,
  className = "",
  onClick,
  onChatClick,
  onCallClick,
  currentUserId,
}: VendorCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(vendor.ID || vendor.id || 0);
    }
  };

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(vendor);
    }
  };

  const handleCallClick = () => {
    if (onCallClick) {
      onCallClick(vendor);
    }
  };

  // Check if current user is the same as the vendor owner
  const isCurrentUserOwner = currentUserId && currentUserId === vendor.user_id;

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case "individual":
        return "Individual";
      case "partnership":
        return "Partnership";
      case "company":
        return "Company";
      case "llp":
        return "LLP";
      case "pvt_ltd":
        return "Private Limited";
      case "public_ltd":
        return "Public Limited";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  return (
    <div className={`group cursor-pointer ${className}`} onClick={handleClick}>
      <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        {/* Header Section with Profile Picture and Vendor Info */}
        <div className="p-3 sm:p-4 flex items-start space-x-3">
          {/* Circular Profile Picture */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={
                vendor.profile_picture
                  ? vendor.profile_picture
                  : getDefaultImage()
              }
              alt={vendor.vendor_name}
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("data:image/svg+xml")) {
                  target.src = getDefaultImage();
                }
              }}
            />
          </div>

          {/* Vendor Info */}
          <div className="flex-1 min-w-0">
            {/* Vendor Name */}
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">
              {vendor.vendor_name}
            </h3>

            {/* Business Type and Years */}
            <div className="flex items-center text-gray-600 text-xs sm:text-sm">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="font-medium">
                {getBusinessTypeLabel(vendor.business_type)} •{" "}
                {vendor.years_in_business === 0
                  ? "New Business"
                  : `${vendor.years_in_business} years`}
              </span>
            </div>
          </div>
        </div>

        {/* Business Description */}
        {vendor.business_description && (
          <div className="px-3 sm:px-4 pb-2 sm:pb-3">
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {vendor.business_description}
            </p>
          </div>
        )}

        {/* Services Offered */}
        {vendor.services_offered && vendor.services_offered.length > 0 && (
          <div className="px-3 sm:px-4 pb-2 sm:pb-3">
            <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
              What we sell
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {vendor.services_offered.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full"
                >
                  {service}
                </span>
              ))}
              {vendor.services_offered.length > 3 && (
                <span className="text-xs text-gray-500 italic">
                  +{vendor.services_offered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3 space-y-1.5 sm:space-y-2">
          {vendor.contact_person_name && (
            <div className="flex items-center text-gray-600 text-xs sm:text-sm">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{vendor.contact_person_name}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {formatAddressShort(vendor.business_address)}
            </span>
          </div>
        </div>

        {/* Business Gallery Image */}
        {vendor.business_gallery && vendor.business_gallery.length > 0 && (
          <div className="relative w-full h-40 sm:h-48 overflow-hidden flex-shrink-0">
            <Image
              src={vendor.business_gallery[0]}
              alt={`${vendor.vendor_name} business`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("data:image/svg+xml")) {
                  target.src = getDefaultImage();
                }
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 mt-auto">
          {!isCurrentUserOwner && (
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium sm:font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleChatClick();
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}
          {vendor.contact_person_phone && (
            <button
              className={`${
                isCurrentUserOwner ? "w-full" : "flex-1"
              } bg-white text-black border border-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-gray-50 transition-colors font-medium sm:font-semibold text-sm`}
              onClick={(e) => {
                e.stopPropagation();
                handleCallClick();
              }}
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
