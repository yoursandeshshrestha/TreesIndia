import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PromotionalBanner from "@/components/PromotionalBanner";
import PopularServices from "@/components/PopularServices";
import Footer from "@/components/Footer";
import LocationModal from "@/components/LocationModal";
import { getTreesIndiaData } from "@/lib/data";

export default function Home() {
  const data = getTreesIndiaData();

  return (
    <main className="min-h-screen bg-white">
      {/* Location Modal */}
      <LocationModal />

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <Header data={data.header} />
      </div>

      {/* Hero Section */}
      <div className="bg-white min-h-[80vh] flex items-center">
        <HeroSection data={data.hero} />
      </div>

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Popular Services */}
      <PopularServices />

      <Footer />
    </main>
  );
}
