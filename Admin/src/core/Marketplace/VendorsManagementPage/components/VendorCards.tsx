"use client";

import React, { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  Eye,
  Check,
  X,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import Badge from "@/components/Badge/Badge";
import Button from "@/components/Button/Base/Button";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { Vendor, BusinessType, BusinessAddress } from "../types";

interface VendorCardsProps {
  vendors: Vendor[];
  isLoading: boolean;
  onViewVendor: (vendor: Vendor) => void;
  onToggleStatus?: (vendorId: number) => Promise<void>;
  onDeleteVendor?: (vendorId: number) => Promise<void>;
}

export default function VendorCards({
  vendors,
  isLoading,
  onViewVendor,
  onToggleStatus,
  onDeleteVendor,
}: VendorCardsProps) {
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleToggleClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsToggleModalOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (selectedVendor && onToggleStatus) {
      await onToggleStatus(selectedVendor.ID);
      setIsToggleModalOpen(false);
      setSelectedVendor(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVendor && onDeleteVendor) {
      await onDeleteVendor(selectedVendor.ID);
      setIsDeleteModalOpen(false);
      setSelectedVendor(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="text-xs">
        <CheckCircle size={12} className="mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="danger" className="text-xs">
        <XCircle size={12} className="mr-1" />
        Inactive
      </Badge>
    );
  };

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
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddress = (address: BusinessAddress) => {
    if (!address) return "No address";
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    return parts.join(", ") || "No address";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Truck className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No vendors found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new vendor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.ID}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {vendor.vendor_name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {vendor.business_description || "No description available"}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {getStatusBadge(vendor.is_active)}
                {getBusinessTypeBadge(vendor.business_type)}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={14} />
                <span>{vendor.contact_person_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                <span>{vendor.contact_person_phone}</span>
              </div>
              {vendor.contact_person_email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">
                    {vendor.contact_person_email}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} />
                <span className="truncate">
                  {formatAddress(vendor.business_address)}
                </span>
              </div>
            </div>

            {/* Business Details */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span>{vendor.years_in_business} years</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatDate(vendor.CreatedAt)}</span>
              </div>
            </div>

            {/* Services */}
            {vendor.services_offered && vendor.services_offered.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Services:
                </p>
                <div className="flex flex-wrap gap-1">
                  {vendor.services_offered.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {vendor.services_offered.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{vendor.services_offered.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<Eye size={14} />}
                onClick={() => onViewVendor(vendor)}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={
                  vendor.is_active ? <X size={14} /> : <Check size={14} />
                }
                onClick={() => handleToggleClick(vendor)}
              >
                {vendor.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<X size={14} />}
                onClick={() => handleDeleteClick(vendor)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Status Modal */}
      <ConfirmModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={`${
          selectedVendor?.is_active ? "Deactivate" : "Activate"
        } Vendor`}
        message={`Are you sure you want to ${
          selectedVendor?.is_active ? "deactivate" : "activate"
        } "${selectedVendor?.vendor_name}"?`}
        confirmText={selectedVendor?.is_active ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        variant={selectedVendor?.is_active ? "danger" : "default"}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${selectedVendor?.vendor_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
