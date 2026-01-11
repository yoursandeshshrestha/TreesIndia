"use client";

import { useAuth } from "@/hooks/useAuth";
import HeroSection from "./sections/HeroSection";
import PromotionalBanner from "./sections/PromotionalBanner";
import BannerImages from "./sections/BannerImages";
import CategorySection from "./sections/CategorySection";
import PopularServices from "./sections/PopularServices";
import PropertySection from "./sections/PropertySection";
import RentalSection from "./sections/RentalSection";
import FixedPriceServicesSection from "./sections/FixedPriceServicesSection";
import ProjectsSection from "./sections/ProjectsSection";
import HomeServicesSection from "./sections/HomeServicesSection";
import TopRatedWorkersSection from "./sections/TopRatedWorkersSection";
import TopVendorsSection from "./sections/TopVendorsSection";
import TwoBHKRentalsSection from "./sections/TwoBHKRentalsSection";
import ThreeBHKRentalsSection from "./sections/ThreeBHKRentalsSection";
import RentalsUnder10KSection from "./sections/RentalsUnder10KSection";
import ConstructionServicesSection from "./sections/ConstructionServicesSection";
import InquiryServicesSection from "./sections/InquiryServicesSection";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* First Banner Image */}
      <BannerImages bannerIndex={0} />
      {/* Hero Section */}
      <HeroSection />

      <div className="space-y-20">
        {/* Popular Services */}
        <PopularServices />

        {/* Category Section */}
        <CategorySection />

        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* Listed Properties */}
        <PropertySection />

        {/* Second Banner Image */}
        <BannerImages bannerIndex={1} />

        {/* Fixed Price Services */}
        <FixedPriceServicesSection />

        {/* Projects (authenticated users only) */}
        {isAuthenticated && <ProjectsSection />}

        {/* Home Services */}
        <HomeServicesSection />

        {/* Listed Rentals */}
        <RentalSection />

        {/* Third Banner Image */}
        <BannerImages bannerIndex={2} />

        {/* Top Rated Workers (authenticated users only) */}
        {isAuthenticated && <TopRatedWorkersSection />}

        {/* Top Vendors (authenticated users only) */}
        {isAuthenticated && <TopVendorsSection />}

        {/* 2 BHK Rentals */}
        <TwoBHKRentalsSection />

        {/* 3 BHK Rentals */}
        <ThreeBHKRentalsSection />

        {/* Rentals Under ₹10,000 */}
        <RentalsUnder10KSection />

        {/* Construction Services */}
        <ConstructionServicesSection />

        {/* Inquiry Services */}
        <InquiryServicesSection />
      </div>
    </>
  );
}
