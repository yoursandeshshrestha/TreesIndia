"use client";

import Image from "next/image";
import { Hero as HeroType } from "@/types/treesindia";

interface HeroSectionProps {
  data: HeroType;
  className?: string;
}

interface CategoryProps {
  name: string;
  icon: string;
  href: string;
}

const categories: CategoryProps[] = [
  {
    name: "Home Service",
    icon: "/images/main-icons/test.png",
    href: "#home-service",
  },
  {
    name: "Construction Service",
    icon: "/images/main-icons/test-2.png",
    href: "#construction-service",
  },
  {
    name: "Rental & Property",
    icon: "/images/main-icons/test-3.png",
    href: "#rental-property",
  },
];

const CategoryCard = ({ name, icon, href }: CategoryProps) => (
  <div className="group cursor-pointer">
    <div className="bg-gray-100 rounded-xl p-4 mb-3 hover:bg-gray-200 transition-colors">
      <Image
        src={icon}
        alt={name}
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-contain mx-auto"
      />
    </div>
    <p className="text-gray-700 text-sm font-normal text-center">{name}</p>
    <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
  </div>
);

export default function HeroSection({
  data,
  className = "",
}: HeroSectionProps) {
  return (
    <section className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="space-y-4">
              <p className="text-gray-800 text-4xl font-medium">
                Your Trusted Partner for All Services
              </p>
            </div>

            {/* Headline and Categories Section */}
            <div className="border border-gray-200 rounded-2xl p-6 ">
              {/* Headline */}
              <div className="space-y-4 mb-8">
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                  {data.headline.primary}
                </h1>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.name} {...category} />
                ))}
              </div>
            </div>

            {/* Social Proof */}
            {/* <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {data.socialProof.avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm"
                  >
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {data.socialProof.text}
              </span>
            </div> */}
          </div>

          {/* Right Column - Hero Image */}
          <div className="lg:pl-10">
            <div className="relative w-full aspect-square">
              <Image
                src={data.heroImage.src}
                alt={data.heroImage.alt}
                width={500}
                height={500}
                className="rounded-2xl w-full h-full object-cover border border-gray-200 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
