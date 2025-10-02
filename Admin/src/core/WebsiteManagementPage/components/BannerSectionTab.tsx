"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Link,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { useBannerImages } from "../hooks/useBannerImages";
import {
  BannerImage,
  CreateBannerImageRequest,
  UpdateBannerImageRequest,
} from "../types";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { ImageUploadCard } from "@/components/FileUpload";
import Toggle from "@/components/Toggle";

function BannerSectionTab() {
  const {
    bannerImages,
    isLoading,
    createBannerImage,
    updateBannerImage,
    deleteBannerImage,
    updateBannerImageSort,
    getBannerImageCount,
  } = useBannerImages();

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BannerImage | null>(null);
  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());
  const [imageCount, setImageCount] = useState(0);

  // Form states
  const [editFormData, setEditFormData] = useState<UpdateBannerImageRequest>({
    title: "",
    link: "",
    is_active: true,
  });

  // Check image count on component mount
  useEffect(() => {
    const checkCount = async () => {
      const count = await getBannerImageCount();
      setImageCount(count);
    };
    checkCount();
  }, [getBannerImageCount]);

  const handleCreateBannerImage = async (imageFile: File) => {
    if (imageCount >= 3) {
      toast.error("Maximum of 3 banner images allowed");
      return;
    }

    try {
      const request: CreateBannerImageRequest = {
        title: `Banner ${imageCount + 1}`,
        image: imageFile,
      };
      await createBannerImage(request);
      setImageCount(imageCount + 1);
    } catch (error) {
      console.error("Failed to create banner image:", error);
    }
  };

  const handleEditImage = (image: BannerImage) => {
    setSelectedImage(image);
    setEditFormData({
      title: image.title,
      link: image.link,
      is_active: image.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedImage) return;

    try {
      await updateBannerImage(selectedImage.id, editFormData);
      setIsEditModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Failed to update banner image:", error);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;

    try {
      await deleteBannerImage(selectedImage.id);
      setIsDeleteModalOpen(false);
      setSelectedImage(null);
      setImageCount(imageCount - 1);
      toast.success("Banner image deleted successfully");
    } catch (error) {
      console.error("Failed to delete banner image:", error);
      toast.error("Failed to delete banner image. Please try again.");
    }
  };

  const handleToggleImageStatus = async (image: BannerImage) => {
    if (togglingItems.has(image.id)) return;

    try {
      setTogglingItems((prev) => new Set(prev).add(image.id));
      await updateBannerImage(image.id, { is_active: !image.is_active });
      toast.success(
        `Banner image ${
          !image.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      console.error("Failed to toggle image status:", error);
      toast.error("Failed to toggle image status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  };

  const handleSortChange = async (
    image: BannerImage,
    direction: "up" | "down"
  ) => {
    const currentSort = image.sort_order;
    const newSort = direction === "up" ? currentSort - 1 : currentSort + 1;

    // Validate sort order bounds
    if (newSort < 0 || newSort >= bannerImages.length) return;

    try {
      await updateBannerImageSort(image.id, { sort_order: newSort });
    } catch (error) {
      console.error("Failed to update sort order:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Images Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Banner Images</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage promotional banner images (max 3 images)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bannerImages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((image, index) => (
              <div
                key={image.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Full Image Display */}
                <div className="relative aspect-video">
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Sort Controls */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => handleSortChange(image, "up")}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {index < bannerImages.length - 1 && (
                      <button
                        onClick={() => handleSortChange(image, "down")}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {image.title}
                    </h4>
                    {image.link && (
                      <div className="flex items-center gap-1 mt-1">
                        <Link className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">
                          {image.link}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={image.is_active}
                        onChange={() => handleToggleImageStatus(image)}
                        disabled={togglingItems.has(image.id)}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600 w-16 text-center">
                        {image.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditImage(image)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImage(image);
                        setIsDeleteModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Add Image Card */}
          {imageCount < 3 && (
            <ImageUploadCard
              onImageSelect={handleCreateBannerImage}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Banner Image"
              description="Click to browse or drag and drop"
            />
          )}
        </div>

        {imageCount >= 3 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Maximum of 3 banner images reached. Delete an existing image to
              add a new one.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ConfirmModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleSaveEdit}
        title="Edit Banner Image"
        message={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (optional)
              </label>
              <input
                type="url"
                value={editFormData.link}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, link: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Active
              </label>
              <Toggle
                checked={editFormData.is_active}
                onChange={(checked) =>
                  setEditFormData({ ...editFormData, is_active: checked })
                }
                size="sm"
              />
            </div>
          </div>
        }
        confirmText="Save Changes"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteImage}
        title="Delete Banner Image"
        message="Are you sure you want to delete this banner image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default BannerSectionTab;
