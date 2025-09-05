"use client";

import { usePathname } from "next/navigation";
import { ProfileOverview } from "./sections/ProfileOverview/ProfileOverview";
import { WalletSection } from "./sections/Wallet/WalletSection";
import { BookingsSection } from "./sections/Booking/BookingsSection";
import { MyWorkSection } from "./sections/MyWork/MyWorkSection";
import { SubscriptionSection } from "./sections/Subscription/SubscriptionSection";
import { RatingsSection } from "./sections/Rating/RatingsSection";
import { SettingsSection } from "./sections/Settings/SettingsSection";
import { AddressSection } from "./sections/Address/AddressSection";
import { AboutSection } from "./sections/About/AboutSection";

export function ProfileMainContent() {
  const pathname = usePathname();

  const renderContent = () => {
    switch (pathname) {
      case "/profile":
        return <ProfileOverview />;
      case "/profile/wallet":
        return <WalletSection />;
      case "/profile/my-bookings":
        return <BookingsSection />;
      case "/profile/my-work":
        return <MyWorkSection />;
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
