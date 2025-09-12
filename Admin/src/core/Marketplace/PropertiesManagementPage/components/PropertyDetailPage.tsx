"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  IndianRupee,
  Car,
  Building,
  Clock,
  Award,
  Check,
} from "lucide-react";
import {
  Property,
  PropertyType,
  ListingType,
  PropertyStatus,
  FurnishingStatus,
  UpdatePropertyRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";
import Button from "@/components/Button/Base/Button";
import Badge from "@/components/Badge/Badge";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { PropertyModal } from "./PropertyModal";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

interface PropertyDetailPageProps {
  propertyId: string;
}

export default function PropertyDetailPage({
  propertyId,
}: PropertyDetailPageProps) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  useEffect(() => {
    loadProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/admin/properties/${propertyId}`);
      const propertyData = response.data.data;
      setProperty(propertyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load property");
      toast.error("Error loading property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProperty = async (
    data: UpdatePropertyRequest,
    imageFiles?: File[]
  ) => {
    if (!property) return;

    setIsSubmitting(true);
    try {
      let response;

      if (imageFiles && imageFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();

        // Append all property data
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
              formData.append(key, value.toString());
            } else if (typeof value === "object" && Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Append image files
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        response = await apiClient.put(
          `/admin/properties/${property.ID}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Use JSON for data without files
        response = await apiClient.put(
          `/admin/properties/${property.ID}`,
          data
        );
      }

      if (response.data.success) {
        toast.success("Property updated successfully");
        setIsEditModalOpen(false);
        loadProperty(); // Reload the property data
      } else {
        throw new Error(response.data.message || "Failed to update property");
      }
    } catch (err) {
      console.error("Failed to update property", err);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!property) return;

    try {
      setIsToggling(true);

      // Determine new status based on current status and listing type
      let newStatus: PropertyStatus;
      if (property.status === "available") {
        // If available, mark as sold/rented based on listing type
        newStatus = property.listing_type === "sale" ? "sold" : "rented";
      } else {
        // If sold/rented, mark as available
        newStatus = "available";
      }

      await apiClient.patch(`/admin/properties/${property.ID}/status`, {
        status: newStatus,
      });

      setProperty((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
            }
          : null
      );

      const statusText =
        newStatus === "available"
          ? "available"
          : newStatus === "sold"
          ? "sold"
          : "rented";
      toast.success(`Property marked as ${statusText} successfully`);
    } catch (err) {
      console.error("Failed to update property status", err);
      toast.error("Failed to update property status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    try {
      await apiClient.delete(`/admin/properties/${property.ID}`);
      toast.success("Property deleted successfully");
      router.push("/dashboard/marketplace/rental-property/all");
    } catch (err) {
      console.error("Failed to delete property", err);
      toast.error("Failed to delete property");
    }
  };

  const handleApproveClick = () => {
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!property) return;

    try {
      setIsApproving(true);
      const response = await apiClient.post(
        `/admin/properties/${property.ID}/approve`
      );

      if (response.status === 200) {
        toast.success("Property approved successfully");
        // Update the property state
        setProperty((prev) =>
          prev
            ? {
                ...prev,
                is_approved: true,
                approved_at: new Date().toISOString(),
              }
            : null
        );
        setIsApproveModalOpen(false);
      } else {
        throw new Error("Failed to approve property");
      }
    } catch (err) {
      console.error("Failed to approve property", err);
      toast.error("Failed to approve property");
    } finally {
      setIsApproving(false);
    }
  };

  const formatPrice = (property: Property) => {
    if (property.listing_type === "sale" && property.sale_price) {
      return `₹${property.sale_price.toLocaleString()}`;
    } else if (property.listing_type === "rent" && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString()}/month`;
    }
    return "Price on request";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      available: { variant: "success" as const, label: "Available" },
      sold: { variant: "danger" as const, label: "Sold" },
      rented: { variant: "primary" as const, label: "Rented" },
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: PropertyType) => {
    const typeConfig = {
      residential: { variant: "primary" as const, label: "Residential" },
      commercial: { variant: "secondary" as const, label: "Commercial" },
    };

    const config = typeConfig[type] || typeConfig.residential;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getListingTypeBadge = (type: ListingType) => {
    const typeConfig = {
      sale: { variant: "success" as const, label: "For Sale" },
      rent: { variant: "warning" as const, label: "For Rent" },
    };

    const config = typeConfig[type] || typeConfig.sale;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getFurnishingBadge = (status?: FurnishingStatus) => {
    if (!status) return null;

    const statusConfig = {
      furnished: { variant: "success" as const, label: "Furnished" },
      semi_furnished: { variant: "warning" as const, label: "Semi Furnished" },
      unfurnished: { variant: "secondary" as const, label: "Unfurnished" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The property you're looking for doesn't exist."}
        </p>
        <Button
          variant="primary"
          onClick={() =>
            router.push("/dashboard/marketplace/rental-property/all")
          }
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() =>
                router.push("/dashboard/marketplace/rental-property/all")
              }
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {property.title}
              </h1>
              <p className="text-sm text-gray-600">
                Created on {formatDate(property.CreatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 size={16} />}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Property Type</p>
                      <p className="font-medium capitalize">
                        {property.property_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Listing Type</p>
                      <p className="font-medium capitalize">
                        {property.listing_type === "sale"
                          ? "For Sale"
                          : "For Rent"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">{formatPrice(property)}</p>
                    </div>
                  </div>
                  {property.furnishing_status && (
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Furnishing</p>
                        <p className="font-medium capitalize">
                          {property.furnishing_status.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex items-center space-x-3">
                      <Bed className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-medium">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center space-x-3">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-medium">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center space-x-3">
                      <Square className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Area</p>
                        <p className="font-medium">{property.area} sq ft</p>
                      </div>
                    </div>
                  )}
                  {property.parking_spaces && (
                    <div className="flex items-center space-x-3">
                      <Car className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Parking</p>
                        <p className="font-medium">
                          {property.parking_spaces} spaces
                        </p>
                      </div>
                    </div>
                  )}
                  {property.floor_number && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Floor</p>
                        <p className="font-medium">{property.floor_number}</p>
                      </div>
                    </div>
                  )}
                  {property.age && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium">{property.age} years</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {formatDate(property.CreatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Images */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Images
                </h2>
                {property.images && property.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`${property.title} - Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                              <div class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                                </svg>
                              </div>
                            `;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Address</div>
                      <div className="text-gray-900">
                        {property.address ||
                          `${property.city}, ${property.state}`}
                      </div>
                    </div>
                  </div>
                  {property.pincode && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Pincode</div>
                        <div className="text-gray-900">{property.pincode}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Status
                    </span>
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Property Type</span>
                    {getTypeBadge(property.property_type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Listing Type</span>
                    {getListingTypeBadge(property.listing_type)}
                  </div>
                  {property.furnishing_status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Furnishing</span>
                      {getFurnishingBadge(property.furnishing_status)}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Approval Status
                    </span>
                    <Badge
                      variant={property.is_approved ? "success" : "warning"}
                    >
                      {property.is_approved ? (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                  {property.uploaded_by_admin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uploaded By</span>
                      <Badge variant="primary">
                        <Shield size={14} className="mr-1" />
                        Admin
                      </Badge>
                    </div>
                  )}
                  {property.treesindia_assured && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality Tag</span>
                      <Badge
                        variant="success"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        <Award size={14} className="mr-1" />
                        TreesIndia Assured
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                    className="w-full"
                    leftIcon={
                      property.status === "available" ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )
                    }
                  >
                    {isToggling
                      ? "Updating..."
                      : property.status === "available"
                      ? `Mark as ${
                          property.listing_type === "sale" ? "Sold" : "Rented"
                        }`
                      : "Mark as Available"}
                  </Button>

                  {/* Approve Button for Pending Properties */}
                  {!property.is_approved && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleApproveClick}
                      disabled={isApproving}
                      className="w-full"
                      leftIcon={<Check size={16} />}
                    >
                      {isApproving ? "Approving..." : "Approve Property"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full"
                    leftIcon={<Edit size={16} />}
                  >
                    Edit Property
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push("/dashboard/marketplace/rental-property/all")
                    }
                    className="w-full"
                    leftIcon={<ArrowLeft size={16} />}
                  >
                    Back to Properties
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Details
                </h3>
                <div className="space-y-3">
                  {property.price_negotiable && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Price Negotiable
                      </Badge>
                    </div>
                  )}
                  {property.subscription_required && (
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-xs">
                        Subscription Required
                      </Badge>
                    </div>
                  )}
                  {property.uploaded_by_admin && (
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Uploaded by Admin
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              {(property.user || property.broker) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {property.user && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Owner</div>
                            <div className="text-gray-900 font-medium">
                              {property.user.name}
                            </div>
                          </div>
                        </div>
                        {property.user.email && (
                          <div className="flex items-center gap-2 ml-6">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {property.user.email}
                            </span>
                          </div>
                        )}
                        {property.user.phone && (
                          <div className="flex items-center gap-2 ml-6">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {property.user.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {property.broker && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Broker</div>
                            <div className="text-gray-900 font-medium">
                              {property.broker.name}
                            </div>
                          </div>
                        </div>
                        {property.broker.email && (
                          <div className="flex items-center gap-2 ml-6">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {property.broker.email}
                            </span>
                          </div>
                        )}
                        {property.broker.phone && (
                          <div className="flex items-center gap-2 ml-6">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {property.broker.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timestamps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="text-gray-900">
                        {formatDate(property.CreatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                      <div className="text-gray-900">
                        {formatDate(property.UpdatedAt)}
                      </div>
                    </div>
                  </div>
                  {property.approved_at && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Approved</div>
                        <div className="text-gray-900">
                          {formatDate(property.approved_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      <PropertyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        property={property}
        onSubmit={handleUpdateProperty}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${property.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Property"
        message={`Are you sure you want to approve "${property?.title}"? This action will make the property visible to users.`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
