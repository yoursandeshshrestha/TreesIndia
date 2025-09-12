"use client";

import React from "react";
import {
  ArrowLeft,
  MapPin,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Badge from "@/components/Badge/Badge";
import { Vendor, BusinessType } from "../types";
import Image from "next/image";

interface VendorDetailPageProps {
  vendor: Vendor;
  onBack: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isLoading?: boolean;
}

export default function VendorDetailPage({
  vendor,
  onBack,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: VendorDetailPageProps) {
  const getBusinessTypeBadge = (type: BusinessType) => {
    const typeConfig = {
      individual: { variant: "primary" as const, label: "Individual" },
      partnership: { variant: "secondary" as const, label: "Partnership" },
      company: { variant: "success" as const, label: "Company" },
      llp: { variant: "warning" as const, label: "LLP" },
      pvt_ltd: { variant: "info" as const, label: "Private Ltd" },
      public_ltd: { variant: "danger" as const, label: "Public Ltd" },
      other: { variant: "outline" as const, label: "Other" },
    };

    const config = typeConfig[type] || typeConfig.other;
    return (
      <Badge variant={config.variant} className="text-sm">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return "No address provided";
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    if (address.landmark) parts.push(`Landmark: ${address.landmark}`);
    return parts.join(", ") || "No address provided";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vendor.vendor_name}
            </h1>
            <p className="text-sm text-gray-500">
              Vendor ID: {vendor.ID} • Created {formatDate(vendor.CreatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {vendor.is_active ? (
            <Badge variant="success" className="text-sm">
              <CheckCircle size={14} className="mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="danger" className="text-sm">
              <XCircle size={14} className="mr-1" />
              Inactive
            </Badge>
          )}
          {getBusinessTypeBadge(vendor.business_type)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={
            vendor.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />
          }
          onClick={onToggleStatus}
          disabled={isLoading}
        >
          {vendor.is_active ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Trash2 size={16} />}
          onClick={onDelete}
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building size={20} />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                <p className="text-gray-900">
                  {vendor.business_description || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Business
                  </label>
                  <p className="text-gray-900">
                    {vendor.years_in_business} years
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <div className="mt-1">
                    {getBusinessTypeBadge(vendor.business_type)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <p className="text-gray-900">{vendor.contact_person_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {vendor.contact_person_phone}
                  </p>
                </div>
              </div>
              {vendor.contact_person_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {vendor.contact_person_email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Business Address
            </h2>
            <div>
              <p className="text-gray-900">
                {formatAddress(vendor.business_address)}
              </p>
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Services Offered
            </h2>
            {vendor.services_offered && vendor.services_offered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {vendor.services_offered.map((service, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {service}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No services listed</p>
            )}
          </div>

          {/* Business Gallery */}
          {vendor.business_gallery && vendor.business_gallery.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Business Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.business_gallery.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`Business image ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          {vendor.user && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Name
                  </label>
                  <p className="text-gray-900">{vendor.user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  <Badge variant="outline" className="text-sm">
                    {vendor.user.user_type}
                  </Badge>
                </div>
                {vendor.user.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{vendor.user.email}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{vendor.user.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge
                    variant={vendor.user.is_active ? "success" : "danger"}
                    className="text-sm"
                  >
                    {vendor.user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Profile Picture */}
          {vendor.profile_picture && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Picture
              </h3>
              <div className="flex justify-center">
                <Image
                  src={vendor.profile_picture}
                  alt="Vendor profile"
                  width={200}
                  height={200}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timestamps
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(vendor.CreatedAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated At
                </label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(vendor.UpdatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
