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
} from "lucide-react";
import Banner from "../components/Banner";
import Image from "next/image";

interface MainCategoryCardProps {
  icon: string;
  title: string;
}

const MainCategoryCard: React.FC<MainCategoryCardProps> = ({ icon, title }) => {
  // Get background color based on title
  const getBgColor = (title: string) => {
    switch (title) {
      case "Home Service":
        return "bg-gray-200 hover:bg-gray-300";
      case "Construction Service":
        return "bg-gray-200 hover:bg-gray-300";
      case "Marketplace":
        return "bg-gray-200 hover:bg-gray-300";
      default:
        return "bg-gray-200 hover:bg-gray-300";
    }
  };

  return (
    <div className="group cursor-pointer flex flex-col items-center min-w-0 flex-1 ">
      <div
        className={`${getBgColor(
          title
        )} rounded-full w-20 h-20 flex items-center justify-center mb-3 transition-colors`}
      >
        <Image
          width={60}
          height={60}
          src={icon}
          alt={title}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            // Fallback to default icon if the image fails to load
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("test-")) {
              target.src = `/images/main-icons/test-1.png`;
            }
          }}
        />
      </div>
      <p className="text-gray-700 text-sm font-normal text-center leading-tight w-full">
        {title}
      </p>
      <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
    </div>
  );
};

interface ServiceCardProps {
  image: string;
  title: string;
  type?: "fixed" | "inquiry";
}

interface CategoryCardProps {
  image: string;
  title: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ image, title }) => (
  <div className="min-w-[180px]">
    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
    </div>
    <div className="px-1">
      <h3 className="text-sm font-medium text-gray-800">{title}</h3>
    </div>
  </div>
);

const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  title,
  type = "fixed",
}) => (
  <div className="min-w-[180px]">
    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/others/placeholder.svg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
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
    </div>
    <div className="px-1">
      <h3 className="text-sm font-medium text-gray-800 mb-2">{title}</h3>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>2-3 hours</span>
        <span className="font-medium text-green-600">₹299</span>
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
  <button onClick={onClick} className="flex flex-col items-center gap-1">
    <div className={`text-lg ${isActive ? "text-[#055c3a]" : "text-gray-400"}`}>
      {icon}
    </div>
    <span
      className={`text-xs font-medium ${
        isActive ? "text-[#055c3a]" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </button>
);

function HomePagetwo() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <div className="w-[405px] h-[767px] bg-blue-50 mx-auto relative overflow-hidden">
      {/* App Container */}
      <div className="bg-[#055c3a] h-full rounded-3xl my-2 overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-6 ">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-white" />
              <div>
                <p className="text-lg font-semibold text-white">
                  Siliguri, West Bengal
                </p>
                <p className="text-xs text-white/80">
                  Hill Cart Road, Siliguri
                </p>
              </div>
            </div>
            <Bell className="w-6 h-6 text-white" />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for Services"
              className="w-full h-10 bg-white rounded-lg pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white rounded-t-2xl pt-6 shadow-2xl">
          {/* Promotion Banner Section */}
          <div className="px-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Promotion Banner
            </h2>
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
            {/* Headline */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                What are you looking for?
              </h2>
            </div>

            {/* Categories */}
            <div className="flex gap-4 w-full justify-between">
              <MainCategoryCard
                icon="/main-icons/home_service_two.png"
                title="Home Service"
              />
              <MainCategoryCard
                icon="/main-icons/construction_service_two.png"
                title="Construction Service"
              />
              <MainCategoryCard
                icon="/main-icons/marketplace.png"
                title="Marketplace"
              />
            </div>
          </div>

          {/* Popular Services Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Popular Services
              </h2>
              <button className="text-blue-500 text-sm font-medium">
                See all
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              <ServiceCard
                image="/images/others/maid.jpg"
                title="Home Cleaning"
                type="fixed"
              />
              <ServiceCard
                image="/images/others/maid2.jpg"
                title="Plumbing Service"
                type="inquiry"
              />
              <ServiceCard
                image="/images/others/maid3.jpg"
                title="Electrical Work"
                type="fixed"
              />
              <ServiceCard
                image="/images/others/maid4.jpg"
                title="Carpentry"
                type="inquiry"
              />
              <ServiceCard
                image="/images/others/maid5.jpg"
                title="Construction"
                type="fixed"
              />
            </div>
          </div>

          {/* Popular Categories Section */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Popular Categories
              </h2>
              <button className="text-blue-500 text-sm font-medium">
                See all
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              <CategoryCard
                image="/images/others/maid6.jpg"
                title="Home Cleaning"
              />
              <CategoryCard
                image="/images/others/maid7.avif"
                title="Plumbing Service"
              />
              <CategoryCard
                image="/images/others/maid8.jpg"
                title="Electrical Work"
              />
              <CategoryCard
                image="/images/others/maid9.jpg"
                title="Carpentry"
              />
              <CategoryCard
                image="/images/others/maid10.jpg"
                title="Construction"
              />
            </div>
          </div>

          {/* We are Hiring Banner */}
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Apply Now</h2>
            </div>
            <div className="relative h-32 rounded-lg overflow-hidden">
              <Image
                width={100}
                height={100}
                src="/images/others/we_are_hiring.jpg"
                alt="We are hiring"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/others/placeholder.svg";
                }}
              />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 pb-7 ">
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

export default HomePagetwo;
