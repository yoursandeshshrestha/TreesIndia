"use client";

import { usePathname } from "next/navigation";
import { ProfileOverview } from "./sections/ProfileOverview";
import { WalletSection } from "./sections/WalletSection";
import { BookingsSection } from "./sections/BookingsSection";
import { SubscriptionSection } from "./sections/SubscriptionSection";
import { RatingsSection } from "./sections/RatingsSection";
import { SettingsSection } from "./sections/SettingsSection";
import { AddressSection } from "./sections/AddressSection";
import { AboutSection } from "./sections/AboutSection";

export function ProfileMainContent() {
  const pathname = usePathname();

  const renderContent = () => {
    switch (pathname) {
      case "/profile":
        return <ProfileOverview />;
      case "/profile/wallet":
        return <WalletSection />;
      case "/profile/bookings":
        return <BookingsSection />;
      case "/profile/subscription":
        return <SubscriptionSection />;
      case "/profile/ratings":
        return <RatingsSection />;
      case "/profile/settings":
        return <SettingsSection />;
      case "/profile/address":
        return <AddressSection />;
      case "/profile/about":
        return <AboutSection />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
      {renderContent()}
    </div>
  );
}

