import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/providers/Providers";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { GlobalWebSocketProvider } from "@/components/GlobalWebSocketProvider/GlobalWebSocketProvider";
import LocationModal from "@/commonComponents/LocationModel/LocationModal";
import { AuthModal } from "@/core/AuthRelated";
import SubcategoriesModal from "@/core/HomePage/components/SubcategoryOptionModel/SubcategoryOptionModel";
import AddressModal from "@/commonComponents/AddressModel/AddressModal";
import SlotModal from "@/core/BookingPage/components/SlotModal";
import ServiceSearchModal from "@/commonComponents/ServiceSearchModel/ServiceSearchModal";

import MarketplaceModal from "@/commonComponents/MarketplaceModal/MarketplaceModal";
import ChatModal from "@/commonComponents/ChatModal/ChatModal";
import ServiceDetailModal from "@/commonComponents/ServiceDetailModal/ServiceDetailModal";
// import { SimpleChatbot } from "@/components/Chatbot";
import { Toaster } from "sonner";

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
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KXRR2MXW');`,
          }}
        />
        {/* End Google Tag Manager */}
        <Providers>
          <GlobalWebSocketProvider>
            {/* Global Modals */}
            <LocationModal />
            <AuthModal />
            <SubcategoriesModal />
            <AddressModal />
            <SlotModal />
            <ServiceSearchModal />
            <MarketplaceModal />
            <ChatModal />
            <ServiceDetailModal />

            {/* Chatbot Widget */}
            {/* <SimpleChatbot /> */}

            <div className="flex flex-col min-h-screen">
              {/* Sticky Header */}
              <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <Header />
              </div>

              {/* Main Content */}
              <main className="flex-1 bg-white">{children}</main>

              {/* Global Footer */}
              <Footer />
            </div>
          </GlobalWebSocketProvider>
        </Providers>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
