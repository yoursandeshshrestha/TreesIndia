import { Metadata } from "next";
import CategoriesManagementPage from "@/core/CategoriesManagementPage/CategoriesManagementPage";

export const metadata: Metadata = {
  title: "Categories Management | Admin Dashboard",
  description: "Manage service categories and subcategories",
};

export default function CategoriesPage() {
  return <CategoriesManagementPage />;
}
