"use client";

import dynamic from "next/dynamic";

// Dynamically import the hook to prevent SSR issues
const NotificationSetupClient = dynamic(
  () => import("./NotificationSetupClient"),
  { ssr: false }
);

export default function NotificationSetup() {
  return <NotificationSetupClient />;
}
