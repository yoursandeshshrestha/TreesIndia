"use client";

import React from "react";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import Table from "@/components/Table/Table";
import Toggle from "@/components/Toggle";
import { PromotionBanner } from "../types";

interface BannerTableProps {
  banners: PromotionBanner[];
  togglingItems: Set<number>;
  onEditBanner: (banner: PromotionBanner) => void;
  onDeleteBanner: (banner: PromotionBanner) => void;
  onToggleBannerStatus: (banner: PromotionBanner) => void;
}

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  togglingItems,
  onEditBanner,
  onDeleteBanner,
  onToggleBannerStatus,
}) => {
  // Calculate statistics
  const stats = {
    total: banners.length,
    active: banners.filter((b) => b.is_active).length,
    inactive: banners.filter((b) => !b.is_active).length,
    withLinks: banners.filter((b) => b.link && b.link.trim() !== "").length,
  };

  return (
    <div className="mt-2">
      {/* Statistics Summary */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Total Banners</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">With Links</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.withLinks}
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "Banner",
              accessor: (banner: PromotionBanner) => (
                <div className="flex items-center">
                  <div className="h-16 w-24 flex-shrink-0">
                    <img
                      className="h-16 w-24 object-cover rounded-lg"
                      src={banner.image}
                      alt={banner.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-image.jpg";
                      }}
                    />
                  </div>
                </div>
              ),
            },
            {
              header: "Title",
              accessor: (banner: PromotionBanner) => (
                <div className="flex items-center">
                  <div
                    className="text-sm font-medium text-gray-900 truncate max-w-xs"
                    title={banner.title}
                  >
                    {banner.title}
                  </div>
                </div>
              ),
            },
            {
              header: "Link",
              accessor: (banner: PromotionBanner) => (
                <div className="flex items-center">
                  {banner.link ? (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      View Link
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No link</span>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (banner: PromotionBanner) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Toggle
                    checked={banner.is_active}
                    onChange={() => onToggleBannerStatus(banner)}
                    disabled={togglingItems.has(banner.id)}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 w-16 text-center">
                    {banner.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ),
            },
          ]}
          data={banners}
          keyField="id"
          actions={[
            {
              label: "Edit",
              onClick: (banner: PromotionBanner) => onEditBanner(banner),
              className: "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
              icon: <Edit2 size={16} />,
            },
            {
              label: "Delete",
              onClick: (banner: PromotionBanner) => onDeleteBanner(banner),
              className: "text-red-600 hover:text-red-700 hover:bg-red-50",
              icon: <Trash2 size={16} />,
            },
          ]}
        />
      </div>
    </div>
  );
};
