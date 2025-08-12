import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Trees India Admin",
  description: "Admin panel for Trees India application",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={GeistSans.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
