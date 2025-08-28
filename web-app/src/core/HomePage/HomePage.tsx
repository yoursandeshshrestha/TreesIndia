import HeroSection from "./components/HeroSection";
import PromotionalBanner from "./components/PromotionalBanner";
import PopularServices from "./components/PopularServices";
import { getTreesIndiaData } from "@/lib/data";

export default function HomePage() {
  const data = getTreesIndiaData();

  return (
    <>
      {/* Hero Section */}
      <div className="bg-white min-h-[80vh] flex items-center">
        <HeroSection data={data.hero} />
      </div>

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Popular Services */}
      <PopularServices />
    </>
  );
}
