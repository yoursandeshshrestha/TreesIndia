export interface TreesIndiaData {
  header: Header;
  hero: Hero;
}

export interface Header {
  logo: Logo;
  navigation: NavigationItem[];
  location: Location;
  search: Search;
  cta: CTA;
}

export interface Logo {
  text: string;
  icon: string;
  image: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface Location {
  placeholder: string;
  icon: string;
}

export interface Search {
  placeholder: string;
  icon: string;
}

export interface CTA {
  label: string;
  href: string;
}

export interface Hero {
  headline: Headline;
  description?: string;
  cta: CTA;
  socialProof: SocialProof;
  partners: Partner[];
  heroImage: HeroImage;
}

export interface Headline {
  primary: string;
  secondary: string;
}

export interface SocialProof {
  text: string;
  avatars: Avatar[];
}

export interface Avatar {
  src: string;
  alt: string;
}

export interface Partner {
  name: string;
  icon: string;
}

export interface HeroImage {
  src: string;
  alt: string;
}
