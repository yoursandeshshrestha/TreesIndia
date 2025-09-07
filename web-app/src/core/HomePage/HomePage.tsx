import HeroSection from "./sections/HeroSection";
import PromotionalBanner from "./sections/PromotionalBanner";
import PopularServices from "./sections/PopularServices";
import PropertySection from "./sections/PropertySection";
import RentalSection from "./sections/RentalSection";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Popular Services */}
      <PopularServices />

      {/* Listed Properties */}
      <PropertySection />

      {/* Listed Rentals */}
      <RentalSection />
    </>
  );
}
