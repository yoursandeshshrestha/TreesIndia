import Image from "next/image";
import Link from "next/link";
import { Category, Subcategory } from "@/types/api";
import { ChevronRight } from "lucide-react";

interface ServiceSidebarProps {
  selectedCategory?: Category;
  selectedSubcategory?: Subcategory;
  subcategories: Subcategory[];
  subcategoriesLoading: boolean;
  subcategoriesError: Error | null;
  onSubcategorySelect: (subcategoryId: number) => void;
}

export function ServiceSidebar({
  selectedCategory,
  selectedSubcategory,
  subcategories,
  subcategoriesLoading,
  subcategoriesError,
  onSubcategorySelect,
}: ServiceSidebarProps) {
  // Show full sidebar skeleton when loading subcategories
  if (subcategoriesLoading) {
    return <ServiceSidebarSkeleton />;
  }

  return (
    <div className="w-full lg:w-80 bg-white flex flex-col pb-6 lg:sticky lg:top-24 h-fit">
      {/* Subcategory Header Section */}
      {(selectedSubcategory || selectedCategory) && (
        <div className="mb-4 sm:mb-6 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {selectedSubcategory?.name || selectedCategory?.name}
          </h1>
        </div>
      )}

      {/* Subcategories section */}
      {subcategories.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-normal text-black leading-normal tracking-normal mb-3 sm:mb-4">
            Browse other categories
          </h2>
          {subcategoriesError ? (
            <div className="text-center text-red-600 text-sm">
              Failed to load services
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  onSelect={onSubcategorySelect}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={`${
          selectedSubcategory || selectedCategory ? "mt-4 sm:mt-6" : "mt-0"
        } hidden lg:block`}
      >
        <Link
          href="/terms-and-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/terms.png"
                alt="Terms"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className="text-gray-900 font-medium text-sm">
                Terms and Conditions
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-900 text-sm" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function ServiceSidebarSkeleton() {
  return (
    <div className="w-full lg:w-80 bg-white flex flex-col pb-6 lg:sticky lg:top-24 h-fit">
      {/* Header Section Skeleton */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-2">
        <div className="h-7 sm:h-8 bg-gray-200 rounded w-40 sm:w-48 animate-pulse"></div>
      </div>

      {/* Subcategories section Skeleton */}
      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-40 mb-3 sm:mb-4 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 mb-2 sm:mb-3">
                <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-gray-200 rounded-lg mx-auto"></div>
              </div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mx-auto w-14 sm:w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms and Conditions Skeleton */}
      <div className="mt-4 sm:mt-6 hidden lg:block">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubcategoryCardProps {
  subcategory: Subcategory;
  onSelect: (subcategoryId: number) => void;
}

function SubcategoryCard({ subcategory, onSelect }: SubcategoryCardProps) {
  return (
    <div
      className="group cursor-pointer"
      onClick={() => onSelect(subcategory.id)}
    >
      <div className="bg-gray-100 rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 hover:bg-gray-200 transition-colors">
        {subcategory.image ? (
          <Image
            src={subcategory.image}
            alt={subcategory.name}
            width={50}
            height={50}
            className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] object-contain mx-auto"
          />
        ) : (
          <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-gray-200 rounded-lg mx-auto flex items-center justify-center text-gray-500 text-base sm:text-lg font-medium">
            {subcategory.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-gray-700 text-xs sm:text-sm font-normal text-center leading-tight">
        {subcategory.name}
      </p>
      <div className="w-0 group-hover:w-6 sm:group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-1 sm:mt-2 transition-all duration-300"></div>
    </div>
  );
}
