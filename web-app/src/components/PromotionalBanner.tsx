"use client";

import Image from "next/image";

interface PromotionalCard {
  id: string;
  backgroundImage: string;
  link: string;
}

interface PromotionalBannerProps {
  cards?: PromotionalCard[];
  className?: string;
  backgroundColor?: string;
}

const defaultCards: PromotionalCard[] = [
  {
    id: "banner-one",
    backgroundImage: "/images/banner/one.webp",

    link: "/",
  },
  {
    id: "banner-two",
    backgroundImage: "/images/banner/two.webp",
    link: "/",
  },
  {
    id: "banner-three",
    backgroundImage: "/images/banner/three.webp",
    link: "/",
  },
  {
    id: "banner-four",
    backgroundImage: "/images/banner/four.webp",
    link: "/",
  },
  {
    id: "banner-five",
    backgroundImage: "/images/banner/five.webp",
    link: "/",
  },
];

const PromotionalCard = ({ card }: { card: PromotionalCard }) => {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => window.open(card.link, "_blank")}
    >
      <div className="relative  overflow-hidden border border-gray-200 shadow-lg rounded-xl">
        {/* Background Image */}
        <Image
          src={card.backgroundImage}
          alt={card.id}
          width={400}
          height={100}
          className="w-full h-auto max-h-48 object-cover transition-transform duration-300 group-hover:scale-102"
        />
      </div>
    </div>
  );
};

export default function PromotionalBanner({
  cards = defaultCards,
  className = "",
  backgroundColor = "bg-white",
}: PromotionalBannerProps) {
  return (
    <section className={`w-full py-8 ${backgroundColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner Container */}
        <div className="relative">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <PromotionalCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
