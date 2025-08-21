"use client";

import { useGlobalCommandPalette } from "@/hooks/useGlobalCommandPalette";

const GlobalCommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalCommandPalette();
  
  return <>{children}</>;
};

export default GlobalCommandPaletteProvider;
