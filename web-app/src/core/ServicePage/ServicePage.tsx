"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useSubcategories } from "@/hooks/useSubcategories";
import { useServices } from "@/hooks/useServices";
import { ServiceSidebar } from "./components/ServiceSidebar";
import { ServiceMainContent } from "./components/ServiceMainContent";
import { ServicePromises } from "./components/ServicePromises";

function ServicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("category");
  const subcategoryId = searchParams.get("subcategory");

  // TanStack Query hooks
  const { data: categoriesResponse } = useCategories();

  const {
    data: subcategoriesResponse,
    isLoading: subcategoriesLoading,
    error: subcategoriesError,
  } = useSubcategories({
    categoryId: categoryId ? parseInt(categoryId) : 0,
    enabled: !!categoryId,
  });

  const {
    data: servicesResponse,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices({
    subcategory: subcategoryId || undefined,
    enabled: true, // Always enabled to show all services when no subcategory is selected
  });

  // Extract data from responses
  const categories = categoriesResponse?.data || [];
  const subcategories = subcategoriesResponse?.data || [];
  const services = servicesResponse?.data?.services || [];

  // Find selected category and subcategory
  const selectedCategory = categories.find(
    (c) => c.id.toString() === categoryId
  );
  const selectedSubcategory = subcategories.find(
    (s) => s.id.toString() === subcategoryId
  );

  const handleSubcategorySelect = (subcategoryId: number) => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.set("category", categoryId);
    }
    params.set("subcategory", subcategoryId.toString());
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="pt-4 sm:pt-6 lg:pt-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 bg-white">
          {/* Left Sidebar - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <ServiceSidebar
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              subcategories={subcategories}
              subcategoriesLoading={subcategoriesLoading}
              subcategoriesError={subcategoriesError}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <ServiceMainContent
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              services={services}
              servicesLoading={servicesLoading}
              servicesError={servicesError}
            />
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet, visible on xl screens */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            <ServicePromises />
          </div>
        </div>

        {/* Mobile Subcategories Section - Show only on mobile */}
        <div className="lg:hidden mt-4">
          <ServiceSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            subcategories={subcategories}
            subcategoriesLoading={subcategoriesLoading}
            subcategoriesError={subcategoriesError}
            onSubcategorySelect={handleSubcategorySelect}
          />
        </div>

        {/* Mobile/Tablet Promises Section - Show only on smaller screens */}
        <div className="xl:hidden mt-4">
          <ServicePromises />
        </div>
      </div>
    </div>
  );
}

export default function ServicePage() {
  return (
    <Suspense
      fallback={
        <div className="pt-8 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      }
    >
      <ServicePageContent />
    </Suspense>
  );
}
