import { ProfileLayout } from "@/core/ProfilePage/components/ProfileLayout";
import React from "react";

export default function ProfileLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
