import { TreesIndiaData } from "@/types/treesindia";

// Fallback data in case JSON file is not found
const fallbackData: TreesIndiaData = {
  header: {
    logo: {
      text: "TreesIndia",
      icon: "/images/logo.png",
      image: "/images/logo.png",
    },
    navigation: [
      { label: "Home", href: "#home" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    location: {
      placeholder: "Enter your location",
      icon: "map-pin",
    },
    search: {
      placeholder: "Search for services...",
      icon: "search",
    },
    cta: {
      label: "Contact Us",
      href: "#contact",
    },
  },
  hero: {
    headline: {
      primary: "What are you looking for?",
      secondary: "Find the perfect service for your needs",
    },
    description:
      "Connect with verified professionals for home services, construction, and marketplace needs",
    cta: {
      label: "Explore Services",
      href: "#services",
    },
    socialProof: {
      text: "More than 100K+ satisfied customers",
      avatars: [
        { src: "/images/sandesh/one.PNG", alt: "Satisfied customer" },
        { src: "/images/sandesh/two.jpg", alt: "Satisfied customer" },
        { src: "/images/sandesh/three.jpg", alt: "Satisfied customer" },
      ],
    },
    partners: [
      { name: "Partner 1", icon: "/images/partner1.png" },
      { name: "Partner 2", icon: "/images/partner2.png" },
    ],
    heroImage: {
      src: "/images/others/maid11.jpg",
      alt: "Professional service platform",
    },
  },
};

export function getTreesIndiaData(): TreesIndiaData {
  // For now, return fallback data
  // In production, you can implement proper JSON loading
  return fallbackData;
}
