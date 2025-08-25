import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/hooks/useLocation";
import Providers from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TreesIndia - One Platform, All Solutions",
  description:
    "Professional home services including beauty, cleaning, repairs, and more. Book trusted professionals for all your home service needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <LocationProvider>{children}</LocationProvider>
        </Providers>
      </body>
    </html>
  );
}
