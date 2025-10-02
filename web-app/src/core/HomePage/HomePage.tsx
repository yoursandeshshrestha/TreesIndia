import HeroSection from "./sections/HeroSection";
import PromotionalBanner from "./sections/PromotionalBanner";
import BannerImages from "./sections/BannerImages";
import CategorySection from "./sections/CategorySection";
import PopularServices from "./sections/PopularServices";
import PropertySection from "./sections/PropertySection";
import RentalSection from "./sections/RentalSection";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      <div className="space-y-20">
        {/* Popular Services */}
        <PopularServices />

        {/* Category Section */}
        <CategorySection />

        {/* First Banner Image */}
        <BannerImages bannerIndex={0} />

        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* Listed Properties */}
        <PropertySection />

        {/* Second Banner Image */}
        <BannerImages bannerIndex={1} />

        {/* Listed Rentals */}
        <RentalSection />

        {/* Third Banner Image */}
        <BannerImages bannerIndex={2} />
      </div>
    </>
  );
}
