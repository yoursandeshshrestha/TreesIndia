import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import CommandPalette from "@/components/CommandPalette";
import GlobalCommandPaletteProvider from "@/components/GlobalCommandPaletteProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const geist = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TreesIndia",
  description: "The service company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${geist.variable} antialiased `}
      >
        <Providers>
          <GlobalCommandPaletteProvider>
            {children}
            <CommandPalette />
          </GlobalCommandPaletteProvider>
        </Providers>
      </body>
    </html>
  );
}
