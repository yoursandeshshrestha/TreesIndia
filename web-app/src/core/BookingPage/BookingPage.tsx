"use client";

import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { setSelectedService, resetBooking } from "@/store/slices/bookingSlice";
import { BookingSidebar, MainContent, PriceSummary } from "./components";
import { useServiceById } from "@/hooks/useServiceById";
import { Service } from "@/types/booking";
import Image from "next/image";
import ContactInfoModalManager from "@/components/ContactInfoModal/ContactInfoModalManager";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const dispatch = useAppDispatch();

  const serviceId = params.serviceId
    ? parseInt(params.serviceId as string)
    : null;
  const {
    data: serviceData,
    isLoading,
    error,
  } = useServiceById(serviceId || 0);

  // Check authentication on component mount
  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (!authLoading && !isAuthenticated) {
      // Open auth modal with redirect back to this page after login
      dispatch(openAuthModal({ redirectTo: `/services/${serviceId}/book` }));
      // Redirect to home page as fallback
      router.push("/");
    }
  }, [isAuthenticated, authLoading, dispatch, router, serviceId]);

  const handleBackToService = () => {
    // Reset booking state before navigating back
    dispatch(resetBooking());
    router.back();
  };

  const service = serviceData?.data;
  const isInquiryService = service?.price_type === "inquiry";

  // Reset booking state and set service when component mounts or service changes
  useEffect(() => {
    // Reset booking state when entering the booking page (clean slate for new booking)
    dispatch(resetBooking());

    // Set the service after reset
    if (service) {
      dispatch(setSelectedService(service as unknown as Service));
    }
  }, [service, dispatch]);

  // Cleanup booking state when component unmounts
  useEffect(() => {
    return () => {
      // Reset booking state when leaving the booking page
      dispatch(resetBooking());
    };
  }, [dispatch]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <LoadingSpinner 
        message="Checking authentication..." 
        variant="fullscreen"
      />
    );
  }

  // Don't render booking page content if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">
            Please log in to access the booking page
          </div>
          <div className="text-sm text-gray-500">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBackToService}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to service</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex gap-6 ">
        {/* Left Sidebar */}
        <BookingSidebar
          service={service as unknown as Service}
          isInquiryService={isInquiryService}
        />

        {/* Main Content Area */}
        <MainContent
          service={service as unknown as Service}
          isInquiryService={isInquiryService}
          isLoading={isLoading}
          error={error}
        />

        {/* Right Sidebar - Price Summary */}
        <PriceSummary
          service={service as unknown as Service}
          isInquiryService={isInquiryService}
        />
      </div>

      {/* Contact Info Modal */}
      <ContactInfoModalManager />
    </div>
  );
}

export default BookingPage;
