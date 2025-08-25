"use client";

import React from "react";
import { Plus, RefreshCw } from "lucide-react";
import Button from "@/components/Button/Base/Button";

interface BannerHeaderProps {
  onCreateNew: () => void;
  onRefresh: () => void;
  totalBanners: number;
  activeBanners: number;
}

export const BannerHeader: React.FC<BannerHeaderProps> = ({
  onCreateNew,
  onRefresh,
  totalBanners,
  activeBanners,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Promotion Banners</h1>
        <p className="text-sm text-gray-500">
          Manage promotional banners for your application
        </p>
        <div className="flex items-center space-x-6 mt-2 text-sm">
          <div className="text-center">
            <span className="text-gray-500">Total: </span>
            <span className="font-semibold text-gray-900">{totalBanners}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500">Active: </span>
            <span className="font-semibold text-green-600">
              {activeBanners}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-30 h-10"
          leftIcon={<RefreshCw size={16} />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-34 h-10 whitespace-nowrap"
          leftIcon={<Plus size={16} />}
          onClick={onCreateNew}
        >
          Create Banner
        </Button>
      </div>
    </div>
  );
};
