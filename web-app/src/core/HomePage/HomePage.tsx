import HeroSection from "./sections/HeroSection";
import PromotionalBanner from "./sections/PromotionalBanner";
import PopularServices from "./sections/PopularServices";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Popular Services */}
      <PopularServices />
    </>
  );
}
