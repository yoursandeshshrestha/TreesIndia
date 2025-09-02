import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import LocationModal from "@/components/Models/LocationModal";
import { AuthModal } from "@/core/AuthRelated";
import SubcategoriesModal from "@/components/Models/SubcategoriesModal";
import AddressModal from "@/components/Models/AddressModal";
import SlotModal from "@/components/Models/SlotModal";
import { getTreesIndiaData } from "@/lib/data";
import { Toaster } from "sonner";
import NotificationSetup from "@/components/NotificationSetup";
import NotificationBanner from "@/components/NotificationBanner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TreesIndia - One Platform, All Solutions",
  description:
    "Professional home services including beauty, cleaning, repairs, and more. Book trusted professionals for all your home service needs.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = getTreesIndiaData();

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          {/* Global Modals */}
          <LocationModal />
          <AuthModal />
          <SubcategoriesModal />
          <AddressModal />
          <SlotModal />

          {/* Notification Setup - Handles permission and device registration */}
          <NotificationSetup />

          {/* Notification Banner - Shows permission status and allows enabling */}
          <NotificationBanner />

          <div className="flex flex-col min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
              <Header data={data.header} />
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-white">{children}</main>

            {/* Global Footer */}
            <Footer />
          </div>
        </Providers>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
