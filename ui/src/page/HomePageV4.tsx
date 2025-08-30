import React from "react";
import {
  Search,
  Bell,
  Home,
  Calendar,
  MessageCircle,
  User,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Heart,
  Filter,
  ArrowRight,
  Play,
  CheckCircle,
} from "lucide-react";
import Banner from "../components/Banner";
import Image from "next/image";

interface MainCategoryCardProps {
  icon: string;
  title: string;
  description?: string;
  gradient: string;
}

const MainCategoryCard: React.FC<MainCategoryCardProps> = ({
  icon,
  title,
  description,
  gradient,
}) => {
  return (
    <div className="group cursor-pointer flex flex-col items-center min-w-0 flex-1">
      <div
        className={`${gradient} rounded-3xl w-28 h-28 flex items-center justify-center mb-4 transition-all duration-500 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
        <Image
          width={60}
          height={60}
          src={icon}
          alt={title}
          className="w-14 h-14 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("test-")) {
              target.src = `/images/main-icons/test-1.png`;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <p className="text-gray-800 text-sm font-bold text-center leading-tight w-full mb-1">
        {title}
      </p>
      {description && (
        <p className="text-gray-600 text-xs text-center leading-tight w-full">
          {description}
        </p>
      )}
      <div className="w-0 group-hover:w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 transition-all duration-500 rounded-full"></div>
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
  isPopular?: boolean;
}

interface CategoryCardProps {
  image: string;
  title: string;
  count?: number;
  isNew?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  image,
  title,
  count,
  isNew,
}) => (
  <div className="min-w-[220px] group cursor-pointer">
    <div className="relative h-40 rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-2xl transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      {/* New Badge */}
      {isNew && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            NEW
          </span>
        </div>
      )}

      {count && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs font-bold text-gray-700">{count}+</span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="p-4 w-full">
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
            Explore
          </button>
        </div>
      </div>
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
  isPopular,
}) => (
  <div className="min-w-[220px] group cursor-pointer">
    <div className="relative h-40 rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-2xl transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Zap className="w-3 h-3" />
            HOT
          </span>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full px-3 py-1">
          <span className="text-xs font-bold text-white">{badge}</span>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            type === "fixed"
              ? "bg-green-500/90 backdrop-blur-sm text-white"
              : "bg-orange-500/90 backdrop-blur-sm text-white"
          }`}
        >
          {type === "fixed" ? "Fixed" : "Inquiry"}
        </span>
      </div>

      {/* Rating */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-xs text-gray-700 font-bold">{rating}</span>
      </div>

      {/* Price */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
        <span className="text-xs font-bold text-gray-700">{price}</span>
      </div>
    </div>
    <div className="px-1">
      <h3 className="text-gray-800 text-sm font-bold mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Verified</span>
        </div>
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
          ? "text-blue-600 scale-110"
          : "text-gray-500 group-hover:text-gray-700 group-hover:scale-105"
      }`}
    >
      {icon}
    </div>
    <span
      className={`text-xs font-bold transition-colors duration-300 ${
        isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
      }`}
    >
      {label}
    </span>
    {isActive && (
      <div className="absolute -bottom-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
    )}
  </button>
);

function HomePageV4() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <div className="w-[405px] h-[767px] bg-gradient-to-br from-blue-50 to-indigo-50 mx-auto relative overflow-hidden">
      {/* App Container */}
      <div className="bg-gradient-to-b from-white to-gray-50 h-full rounded-3xl my-2 overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Fixed Header */}
        <div className="px-6 py-6 relative bg-gradient-to-r from-blue-600 to-purple-600">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
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
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for Services..."
                className="w-full h-14 bg-white/95 backdrop-blur-sm rounded-2xl pl-12 pr-4 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300 border border-white/20 shadow-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white rounded-t-3xl pt-6">
          {/* Promotion Banner Section */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
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
              <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-2">
                What are you looking for?
              </h2>
              <p className="text-gray-600 text-sm">
                Choose from our premium services
              </p>
            </div>

            {/* Categories with unique gradients */}
            <div className="flex gap-4 w-full justify-between">
              <MainCategoryCard
                icon="/main-icons/home_service_two.png"
                title="Home Service"
                description="Cleaning & Maintenance"
                gradient="bg-gradient-to-br from-blue-500 to-purple-600"
              />
              <MainCategoryCard
                icon="/main-icons/construction_service_two.png"
                title="Construction"
                description="Building & Renovation"
                gradient="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <MainCategoryCard
                icon="/main-icons/marketplace.png"
                title="Marketplace"
                description="Products & Tools"
                gradient="bg-gradient-to-br from-green-500 to-teal-600"
              />
            </div>
          </div>

          {/* Popular Services Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Popular Services
                </h2>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors flex items-center gap-1">
                See all
                <ArrowRight className="w-4 h-4" />
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
                isPopular={true}
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
                badge="Best"
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
                isPopular={true}
              />
            </div>
          </div>

          {/* Popular Categories Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Popular Categories
                </h2>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors flex items-center gap-1">
                See all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              <CategoryCard
                image="/images/others/maid6.jpg"
                title="Home Cleaning"
                count={150}
                isNew={true}
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
                isNew={true}
              />
            </div>
          </div>

          {/* Enhanced Hiring Banner */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Join Our Team</h2>
            </div>
            <div className="relative h-44 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
              <Image
                width={100}
                height={100}
                src="/images/others/we_are_hiring.jpg"
                alt="We are hiring"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/others/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-blue-500/40 to-purple-600/80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-3">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <h3 className="text-2xl font-bold mb-2">We're Hiring!</h3>
                    <p className="text-sm opacity-90">Join our growing team</p>
                  </div>
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 pb-8 shadow-lg">
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

export default HomePageV4;
