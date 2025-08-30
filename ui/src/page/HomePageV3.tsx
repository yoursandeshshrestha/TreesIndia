import React from "react";
import {
  Search,
  Bell,
  Home,
  Calendar,
  MessageCircle,
  Bookmark,
  User,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import Banner from "../components/Banner";
import Image from "next/image";

interface MainCategoryCardProps {
  icon: string;
  title: string;
  description?: string;
}

const MainCategoryCard: React.FC<MainCategoryCardProps> = ({
  icon,
  title,
  description,
}) => {
  // Enhanced background colors with gradients
  const getBgColor = (title: string) => {
    switch (title) {
      case "Home Service":
        return "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200";
      case "Construction Service":
        return "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200";
      case "Marketplace":
        return "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200";
    }
  };

  return (
    <div className="group cursor-pointer flex flex-col items-center min-w-0 flex-1">
      <div
        className={`${getBgColor(
          title
        )} rounded-2xl w-24 h-24 flex items-center justify-center mb-4 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105`}
      >
        <Image
          width={60}
          height={60}
          src={icon}
          alt={title}
          className="w-12 h-12 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("test-")) {
              target.src = `/images/main-icons/test-1.png`;
            }
          }}
        />
      </div>
      <p className="text-gray-800 text-sm font-semibold text-center leading-tight w-full mb-1">
        {title}
      </p>
      {description && (
        <p className="text-gray-500 text-xs text-center leading-tight w-full">
          {description}
        </p>
      )}
      <div className="w-0 group-hover:w-10 h-1 bg-gradient-to-r from-[#00a871] to-[#00c484] mx-auto mt-3 transition-all duration-300 rounded-full"></div>
    </div>
  );
};

interface ServiceCardProps {
  image: string;
  title: string;
  type?: "fixed" | "inquiry";
  rating?: number;
  price?: string;
  duration?: string;
  badge?: string;
}

interface CategoryCardProps {
  image: string;
  title: string;
  count?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ image, title, count }) => (
  <div className="min-w-[200px] group cursor-pointer">
    <div className="relative h-36 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      {count && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium text-gray-700">{count}+</span>
        </div>
      )}
    </div>
    <div className="px-1">
      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#00a871] transition-colors">
        {title}
      </h3>
    </div>
  </div>
);

const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  title,
  type = "fixed",
  rating = 4.5,
  price = "₹299",
  duration = "2-3 hours",
  badge,
}) => (
  <div className="min-w-[200px] group cursor-pointer">
    <div className="relative h-36 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
            {badge}
          </span>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            type === "fixed"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {type === "fixed" ? "Fixed" : "Inquiry"}
        </span>
      </div>

      {/* Rating */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-xs text-white font-medium">{rating}</span>
      </div>
    </div>
    <div className="px-1">
      <h3 className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-[#00a871] transition-colors">
        {title}
      </h3>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
        <span className="font-bold text-green-600 text-sm">{price}</span>
      </div>
    </div>
  </div>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 relative group"
  >
    <div
      className={`text-lg transition-all duration-300 ${
        isActive
          ? "text-[#055c3a] scale-110"
          : "text-gray-400 group-hover:text-gray-600 group-hover:scale-105"
      }`}
    >
      {icon}
    </div>
    <span
      className={`text-xs font-medium transition-colors duration-300 ${
        isActive ? "text-[#055c3a]" : "text-gray-400 group-hover:text-gray-600"
      }`}
    >
      {label}
    </span>
    {isActive && (
      <div className="absolute -bottom-1 w-1 h-1 bg-[#055c3a] rounded-full"></div>
    )}
  </button>
);

function HomePageV3() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <div className="w-[405px] h-[767px] bg-gradient-to-br from-blue-50 to-indigo-50 mx-auto relative overflow-hidden">
      {/* App Container */}
      <div className="bg-gradient-to-b from-[#055c3a] to-[#0a7a4f] h-full rounded-3xl my-2 overflow-hidden flex flex-col shadow-2xl">
        {/* Fixed Header */}
        <div className="px-6 py-6 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-full">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    Siliguri, West Bengal
                  </p>
                  <p className="text-xs text-white/90">
                    Hill Cart Road, Siliguri
                  </p>
                </div>
              </div>
              <div className="relative">
                <Bell className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for Services..."
                className="w-full h-12 bg-white/95 backdrop-blur-sm rounded-xl pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white rounded-t-3xl pt-6 shadow-2xl">
          {/* Promotion Banner Section */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#055c3a]" />
              <h2 className="text-lg font-bold text-gray-800">Trending Now</h2>
            </div>
          </div>

          {/* Banner Section */}
          <Banner
            items={[
              {
                id: "1",
                image: "/images/banner/one.webp",
              },
              {
                id: "2",
                image: "/images/banner/two.webp",
              },
              {
                id: "3",
                image: "/images/banner/three.webp",
              },
              {
                id: "4",
                image: "/images/banner/four.webp",
              },
              {
                id: "5",
                image: "/images/banner/five.webp",
              },
            ]}
          />

          {/* What are you looking for Section */}
          <div className="px-4 mb-8">
            {/* Enhanced Headline */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                What are you looking for?
              </h2>
              <p className="text-gray-600 text-sm">
                Choose from our wide range of services
              </p>
            </div>

            {/* Categories with descriptions */}
            <div className="flex gap-4 w-full justify-between">
              <MainCategoryCard
                icon="/main-icons/home_service_two.png"
                title="Home Service"
                description="Cleaning & Maintenance"
              />
              <MainCategoryCard
                icon="/main-icons/construction_service_two.png"
                title="Construction"
                description="Building & Renovation"
              />
              <MainCategoryCard
                icon="/main-icons/marketplace.png"
                title="Marketplace"
                description="Products & Tools"
              />
            </div>
          </div>

          {/* Popular Services Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#055c3a]" />
                <h2 className="text-lg font-bold text-gray-800">
                  Popular Services
                </h2>
              </div>
              <button className="text-[#055c3a] text-sm font-semibold hover:underline">
                See all
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              <ServiceCard
                image="/images/others/maid.jpg"
                title="Home Cleaning"
                type="fixed"
                rating={4.8}
                price="₹299"
                duration="2-3 hours"
                badge="Popular"
              />
              <ServiceCard
                image="/images/others/maid2.jpg"
                title="Plumbing Service"
                type="inquiry"
                rating={4.6}
                price="₹399"
                duration="1-2 hours"
              />
              <ServiceCard
                image="/images/others/maid3.jpg"
                title="Electrical Work"
                type="fixed"
                rating={4.7}
                price="₹499"
                duration="2-4 hours"
              />
              <ServiceCard
                image="/images/others/maid4.jpg"
                title="Carpentry"
                type="inquiry"
                rating={4.5}
                price="₹599"
                duration="3-5 hours"
              />
              <ServiceCard
                image="/images/others/maid5.jpg"
                title="Construction"
                type="fixed"
                rating={4.9}
                price="₹1999"
                duration="1-2 days"
                badge="Best"
              />
            </div>
          </div>

          {/* Popular Categories Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#055c3a]" />
                <h2 className="text-lg font-bold text-gray-800">
                  Popular Categories
                </h2>
              </div>
              <button className="text-[#055c3a] text-sm font-semibold hover:underline">
                See all
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              <CategoryCard
                image="/images/others/maid6.jpg"
                title="Home Cleaning"
                count={150}
              />
              <CategoryCard
                image="/images/others/maid7.avif"
                title="Plumbing Service"
                count={89}
              />
              <CategoryCard
                image="/images/others/maid8.jpg"
                title="Electrical Work"
                count={67}
              />
              <CategoryCard
                image="/images/others/maid9.jpg"
                title="Carpentry"
                count={45}
              />
              <CategoryCard
                image="/images/others/maid10.jpg"
                title="Construction"
                count={123}
              />
            </div>
          </div>

          {/* Enhanced Hiring Banner */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Join Our Team</h2>
            </div>
            <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
              <Image
                width={100}
                height={100}
                src="/images/others/we_are_hiring.jpg"
                alt="We are hiring"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/others/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">We're Hiring!</h3>
                  <p className="text-sm opacity-90">Join our growing team</p>
                  <button className="mt-3 px-6 py-2 bg-white text-[#055c3a] rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Navigation */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 pb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <NavItem
              icon={<Home className="w-5 h-5" />}
              label="Home"
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavItem
              icon={<Calendar className="w-5 h-5" />}
              label="Booking"
              isActive={activeTab === "booking"}
              onClick={() => setActiveTab("booking")}
            />
            <NavItem
              icon={<MessageCircle className="w-5 h-5" />}
              label="Chat"
              isActive={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
            />
            <NavItem
              icon={<User className="w-5 h-5" />}
              label="Profile"
              isActive={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageV3;
