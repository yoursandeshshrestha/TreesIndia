"use client";

import React from "react";
import { BookingPageSkeleton } from "./BookingPageSkeleton";
import { HTMLRenderer } from "@/components/HTMLRenderer";

interface MainContentProps {
  service?: {
    id: number;
    name: string;
    description: string;
    price: number | null;
    price_type: "fixed" | "inquiry";
    duration: string | null;
    images: string[] | null;
  };
  isInquiryService?: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function MainContent({
  service,
  isInquiryService,
  isLoading,
  error,
}: MainContentProps) {
  return (
    <div className="flex-1 pt-4 lg:pt-6">
      {isLoading ? (
        <BookingPageSkeleton />
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-red-600">
            Error loading service: {error.message}
          </div>
        </div>
      ) : service ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {service.name}
              </h2>
              {service.description && (
                <div className="text-gray-600 text-sm mb-3">
                  <HTMLRenderer
                    html={service.description}
                    stripDataAttributes={true}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isInquiryService
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isInquiryService ? "Inquiry Based" : "Fixed Price"}
                </span>

                {service.duration && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span>⏱</span>
                    {service.duration}
                  </span>
                )}
              </div>
            </div>

            {service.price && !isInquiryService && (
              <div className="text-left sm:text-right">
                <span className="text-xl sm:text-2xl font-bold text-green-600">
                  ₹{service.price}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-gray-600">Service not found</div>
        </div>
      )}
    </div>
  );
}
