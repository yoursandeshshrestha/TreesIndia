"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { VendorCard } from "@/commonComponents/VendorCard/VendorCard";
import { VendorFilters } from "@/types/vendor";

export default function TopVendorsSection() {
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Create filters for top vendors
  const vendorFilters: VendorFilters = {
    page: 1,
    limit: 8,
    is_active: true,
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch top vendors
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useVendors(vendorFilters);

  const vendors = Array.isArray(response?.data?.vendors) ? response.data.vendors : [];

  const handleVendorClick = (vendorId: number) => {
    // Validate vendor ID before navigation
    if (!vendorId || vendorId <= 0) {
      console.error("Invalid vendor ID:", vendorId);
      return;
    }
    // Navigate to vendor detail page
    router.push(`/marketplace/vendors/${vendorId}`);
  };

  const handleViewAllVendors = () => {
    router.push("/marketplace/vendors");
  };

  const handleChatClick = (vendor: { user_id: number }) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal({}));
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: vendor.user_id,
      })
    );
  };

  const handleCallClick = (vendor: { contact_phone: string }) => {
    if (!vendor.contact_phone) {
      console.error("No phone number available");
      return;
    }
    // Open phone dialer
    window.location.href = `tel:${vendor.contact_phone}`;
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Top Vendors in ${location.city}`;
    }
    return "Top Vendors";
  };

  if (isLoading || locationLoading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Don't render the section if there are no vendors or if there's an error
  if (vendors.length === 0 || isError || error) {
    return null;
  }

  return (
    <section className="px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
          {getSectionTitle()}
        </h2>
        <button
          onClick={handleViewAllVendors}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Vendors
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendors.map((vendor, index) => (
          <VendorCard
            key={`vendor-${vendor.ID}-${index}`}
            vendor={vendor}
            onClick={() => handleVendorClick(vendor.ID)}
            onChatClick={() => handleChatClick(vendor)}
            onCallClick={() => handleCallClick(vendor)}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </section>
  );
}
