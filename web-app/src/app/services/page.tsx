"use client";

import { Suspense } from "react";
import ServicePage from "@/core/ServicePage";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white text-black h-[80vh] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ServicePage />
    </Suspense>
  );
}
