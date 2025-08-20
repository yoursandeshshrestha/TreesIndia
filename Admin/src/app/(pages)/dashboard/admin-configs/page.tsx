import { Metadata } from "next";
import AdminConfigsPage from "@/core/AdminConfigsPage/AdminConfigsPage";

export const metadata: Metadata = {
  title: "System Configuration | Admin Dashboard",
  description: "Manage system-wide configuration settings",
};

export default function AdminConfigsPageRoute() {
  return <AdminConfigsPage />;
}
