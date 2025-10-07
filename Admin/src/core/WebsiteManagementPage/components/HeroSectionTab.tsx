"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useHeroConfig } from "../hooks/useHeroConfig";
import { useHeroImages } from "../hooks/useHeroImages";
import { useCategoryIcons } from "../hooks/useCategoryIcons";
import { UpdateHeroConfigRequest, HeroImage } from "../types";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { MediaUploadCard } from "@/components/FileUpload";
import Toggle from "@/components/Toggle";

function HeroSectionTab() {
  const {
    heroConfig,
    isLoading: configLoading,
    updateHeroConfig,
  } = useHeroConfig();
  const {
    heroImages,
    isLoading: imagesLoading,
    createHeroImage,
    updateHeroImage,
    deleteHeroImage,
  } = useHeroImages();

  // Category icons
  const {
    categoryIcons,
    isLoading: iconsLoading,
    updateCategoryIcon,
  } = useCategoryIcons();

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HeroImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  // Form states
  const [formData, setFormData] = useState<UpdateHeroConfigRequest>({
    title: "",
    description: "",
    prompt_text: "",
    is_active: true,
  });

  // Initialize form data when hero config loads
  useEffect(() => {
    if (heroConfig) {
      setFormData({
        title: heroConfig.title,
        description: heroConfig.description,
        prompt_text: heroConfig.prompt_text,
        is_active: heroConfig.is_active,
      });
    }
  }, [heroConfig]);

  const handleSaveConfig = async () => {
    try {
      await updateHeroConfig(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update hero config:", error);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;

    try {
      await deleteHeroImage(selectedImage.id);
      setIsDeleteModalOpen(false);
      setSelectedImage(null);
      toast.success("Hero image deleted successfully");
    } catch (error) {
      console.error("Failed to delete hero image:", error);
      toast.error("Failed to delete hero image. Please try again.");
    }
  };

  const handleToggleImageStatus = async (image: HeroImage) => {
    if (togglingItems.has(image.id)) return;

    try {
      setTogglingItems((prev) => new Set(prev).add(image.id));
      await updateHeroImage(image.id, { is_active: !image.is_active });
      toast.success(
        `Hero image ${
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

  const handleIconUpload = async (name: string, iconFile: File) => {
    try {
      await updateCategoryIcon(name, iconFile);
    } catch (error) {
      console.error("Failed to update category icon:", error);
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Category Icons and Hero Text Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Icons Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Category Icons
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage icons for the 3 main homepage categories
            </p>
          </div>

          {iconsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {categoryIcons.map((icon) => (
                <div
                  key={icon.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  {/* Bigger Icon Upload */}
                  <div className="text-center">
                    <div
                      onClick={() => {
                        // Trigger file input click
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            handleIconUpload(icon.name, file);
                          }
                        };
                        input.click();
                      }}
                      className="w-20 h-20 mx-auto mb-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      {icon.icon_url ? (
                        <img
                          src={icon.icon_url}
                          alt={`${icon.name} icon`}
                          className="w-14 h-14 object-cover rounded"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <h4 className="font-medium text-gray-900 text-sm">
                      {icon.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero Text Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Hero Text Configuration
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveConfig}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Your Trusted Partner for All Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Add a description for the hero section"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Text
              </label>
              <input
                type="text"
                value={formData.prompt_text}
                onChange={(e) =>
                  setFormData({ ...formData, prompt_text: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="What are you looking for?"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Active
              </label>
              <Toggle
                checked={formData.is_active}
                onChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                disabled={!isEditing}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Images Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hero Images</h3>
        </div>

        {imagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroImages.map((image) => {
              const mediaUrl = image.media_url || image.image_url;
              const isVideo = image.media_type === "video";

              return (
                <div
                  key={image.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Full Media Display */}
                  <div className="relative aspect-video bg-gray-100">
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Hero media"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Controls */}
                  <div className="p-4 space-y-3">
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

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setSelectedImage(image);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete {isVideo ? "Video" : "Image"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Media Card */}
            <MediaUploadCard
              onMediaSelect={createHeroImage}
              accept="image/*,video/*"
              maxSize={50 * 1024 * 1024} // 50MB
              label="Upload Hero Media"
              description="Click to browse or drag and drop"
              allowVideo={true}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteImage}
        title={`Delete Hero ${
          selectedImage?.media_type === "video" ? "Video" : "Image"
        }`}
        message={`Are you sure you want to delete this hero ${
          selectedImage?.media_type === "video" ? "video" : "image"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default HeroSectionTab;
