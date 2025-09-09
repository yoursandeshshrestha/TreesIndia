"use client";

import { useParams } from "next/navigation";
import PropertyDetailPage from "@/core/Marketplace/PropertiesManagementPage/components/PropertyDetailPage";

export default function PropertyDetailRoute() {
  const params = useParams();
  const propertyId = params.id as string;

  return <PropertyDetailPage propertyId={propertyId} />;
}
