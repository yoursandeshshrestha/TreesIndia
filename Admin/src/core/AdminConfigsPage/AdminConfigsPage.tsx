"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

// Components
import AdminConfigsHeader from "./components/AdminConfigsHeader";
import AdminConfigsFilters from "./components/AdminConfigsFilters";
import AdminConfigsGrid from "./components/AdminConfigsGrid";
import AdminConfigModal from "./components/AdminConfigModal";

// Types
import { AdminConfig } from "./types";

function AdminConfigsPage() {
  // State management
  const [configs, setConfigs] = useState<AdminConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AdminConfig | null>(
    null
  );

  // Load configurations on component mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/configs");
      if (response.success) {
        setConfigs(response.data as unknown as AdminConfig[]);
      } else {
        setError(response.message || "Failed to load configurations");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load configurations";
      setError(errorMessage);
      toast.error("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (configData: Partial<AdminConfig>) => {
    try {
      // If configData doesn't have ID, try to get it from selectedConfig
      let configId = configData.ID;
      if (!configId && selectedConfig) {
        configId = selectedConfig.ID;
      }

      if (!configId) {
        toast.error("Configuration ID is missing");
        return;
      }

      // Only send the fields that can be updated
      const updateData = {
        key: configData.key,
        value: configData.value,
        type: configData.type,
        category: configData.category,
        description: configData.description,
        is_active: configData.is_active || true, // Ensure is_active is always true if not provided
      };

      const response = await api.put(`/admin/configs/${configId}`, updateData);
      if (response.success) {
        toast.success("Configuration updated successfully");
        setIsEditModalOpen(false);
        setSelectedConfig(null);
        loadConfigs();
      } else {
        toast.error(response.message || "Failed to update configuration");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update configuration";
      toast.error(errorMessage);
    }
  };

  const handleEditConfig = (config: AdminConfig) => {
    setSelectedConfig(config);
    setIsEditModalOpen(true);
  };

  const handleToggleValue = async (config: AdminConfig, newValue: string) => {
    // Optimistic update - update UI immediately
    const originalConfigs = [...configs];
    const updatedConfigs = configs.map((c) =>
      c.ID === config.ID ? { ...c, value: newValue } : c
    );
    setConfigs(updatedConfigs);

    try {
      const updatedConfig = { ...config, value: newValue };
      const response = await api.put(
        `/admin/configs/${config.ID}`,
        updatedConfig
      );
      if (response.success) {
        toast.success("Configuration updated successfully");
        loadConfigs(); // Reload to get updated data
      } else {
        // Revert optimistic update on error
        setConfigs(originalConfigs);
        toast.error(response.message || "Failed to update configuration");
      }
    } catch (err: unknown) {
      // Revert optimistic update on error
      setConfigs(originalConfigs);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update configuration";
      toast.error(errorMessage);
    }
  };

  // Filter configurations based on search and category
  const filteredConfigs = configs.filter((config) => {
    const matchesSearch =
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.value.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || config.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminConfigsHeader />

      {/* Filters */}
      <AdminConfigsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={(value) => setSelectedCategory(String(value))}
      />

      {/* Configuration Grid */}
      <AdminConfigsGrid
        configs={filteredConfigs}
        isLoading={isLoading}
        error={error}
        onEdit={handleEditConfig}
        onToggleValue={handleToggleValue}
        onRetry={loadConfigs}
      />

      {/* Edit Modal */}
      <AdminConfigModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedConfig(null);
        }}
        onSubmit={handleUpdateConfig}
        config={selectedConfig}
      />
    </div>
  );
}

export default AdminConfigsPage;
