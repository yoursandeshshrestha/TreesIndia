"use client";

import Image from "next/image";
import { Vendor } from "@/types/vendor";
import {
  Eye,
  Trash2,
  Images,
  Building2,
  MapPin,
  Phone,
  Clock,
  User,
} from "lucide-react";
import { formatAddressShort } from "@/utils/addressUtils";
import { formatDateLong } from "@/utils/dateTimeUtils";

interface MyVendorCardProps {
  vendor: Vendor;
  onView: (vendorId: number) => void;
  onDelete: (vendorId: number) => void;
  className?: string;
}

export default function MyVendorCard({
  vendor,
  onView,
  onDelete,
  className = "",
}: MyVendorCardProps) {
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

  const formatYearsInBusiness = (years: number) => {
    if (years === 0) return "New Business";
    if (years === 1) return "1 year";
    return `${years} years`;
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwQzE3My4yNTUgMTIwIDE4NCAxMDkuMjU1IDE4NCA5NkMxODQgODIuNzQ0NSAxNzMuMjU1IDcyIDE2MCA3MkMxNDYuNzQ1IDcyIDEzNiA4Mi43NDQ1IDEzNiA5NkMxMzYgMTA5LjI1NSAxNDYuNzQ1IDEyMCAxNjAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTYwIDEzMkMxMjAuNDU5IDEzMiA4OCAxNDkuNDU5IDg4IDE3MlYyMDBIMjMyVjE3MkMyMzIgMTQ5LjQ1OSAxOTkuNTQxIDEzMiAxNjAgMTMyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        Inactive
      </span>
    );
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-80 h-48 lg:h-auto relative bg-gray-200">
          {vendor.business_gallery && vendor.business_gallery.length > 0 ? (
            <Image
              src={vendor.business_gallery[0]}
              alt={vendor.vendor_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : vendor.profile_picture ? (
            <Image
              src={vendor.profile_picture}
              alt={vendor.vendor_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Image
                src={getDefaultImage()}
                alt="Default vendor image"
                width={320}
                height={240}
                className="object-cover"
              />
            </div>
          )}

          {/* Image Counter */}
          {vendor.business_gallery && vendor.business_gallery.length > 1 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
              <Images className="w-3 h-3 mr-1" />
              {vendor.business_gallery.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vendor.vendor_name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{formatAddressShort(vendor.business_address)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(vendor.is_active)}
                  <span className="text-xs text-gray-500">
                    Listed on {formatDateLong(vendor.CreatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold">
                    {getBusinessTypeLabel(vendor.business_type)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm font-semibold">
                    {formatYearsInBusiness(vendor.years_in_business)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="text-sm font-semibold">
                    {vendor.contact_person_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold">
                    {vendor.contact_person_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Products/Services */}
            {vendor.services_offered && vendor.services_offered.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">What We Sell</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.services_offered.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {item}
                    </span>
                  ))}
                  {vendor.services_offered.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 border border-gray-200">
                      +{vendor.services_offered.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {vendor.business_description && (
              <div className="mb-4 flex-1">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {vendor.business_description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onView(vendor.ID)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => onDelete(vendor.ID)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
              <div className="text-xs text-gray-500">
                ID: #{vendor.ID || vendor.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
