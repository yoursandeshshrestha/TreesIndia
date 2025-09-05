"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useSubcategories } from "@/hooks/useSubcategories";
import { useServices } from "@/hooks/useServices";
import { ServiceSidebar } from "./components/ServiceSidebar";
import { ServiceMainContent } from "./components/ServiceMainContent";
import { ServicePromises } from "./components/ServicePromises";

export default function ServicePage() {
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
    <div className="pt-8 min-h-screen">
      <div className="max-w-7xl mx-auto flex  bg-white">
        {/* Left Sidebar */}
        <ServiceSidebar
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          subcategories={subcategories}
          subcategoriesLoading={subcategoriesLoading}
          subcategoriesError={subcategoriesError}
          onSubcategorySelect={handleSubcategorySelect}
        />

        {/* Main Content Area */}
        <ServiceMainContent
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          services={services}
          servicesLoading={servicesLoading}
          servicesError={servicesError}
        />

        {/* Right Sidebar */}
        <ServicePromises />
      </div>
    </div>
  );
}
