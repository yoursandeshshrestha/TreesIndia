import { Metadata } from "next";
import WebsiteManagementPage from "@/core/WebsiteManagementPage/WebsiteManagementPage";

export const metadata: Metadata = {
  title: "Website Management | Admin Dashboard",
  description: "Manage hero section, category icons, and website content",
};

export default function WebsiteManagementPageRoute() {
  return <WebsiteManagementPage />;
}
