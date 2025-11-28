"use client";

import { useState, useEffect } from "react";
import { Plus, X, MapPin, Search, Check, Filter } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import { ServiceArea, CreateServiceAreaRequest } from "../types";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ServiceAreaSelectorProps {
  selectedServiceAreaIds: number[];
  onChange: (serviceAreaIds: number[]) => void;
  errors?: Record<string, string>;
}

export default function ServiceAreaSelector({
  selectedServiceAreaIds,
  onChange,
  errors = {},
}: ServiceAreaSelectorProps) {
  const [existingServiceAreas, setExistingServiceAreas] = useState<
    ServiceArea[]
  >([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArea, setNewArea] = useState<CreateServiceAreaRequest>({
    city: "",
    state: "",
    country: "India",
    pincodes: [],
    is_active: true,
  });
  const [pincodeInput, setPincodeInput] = useState("");
  const [isCreatingArea, setIsCreatingArea] = useState(false);

  // Load existing service areas
  const loadServiceAreas = async () => {
    setIsLoadingAreas(true);
    try {
      const response = await apiClient.get("/admin/service-areas");
      const areas = response.data.data || [];
      setExistingServiceAreas(areas);
    } catch (error) {
      console.error("Error loading service areas:", error);
      toast.error("Failed to load service areas");
    } finally {
      setIsLoadingAreas(false);
    }
  };

  useEffect(() => {
    loadServiceAreas();
  }, []);

  // Add pincode to new area
  const addPincodeToNewArea = () => {
    const pincode = pincodeInput.trim();
    if (pincode && /^\d{6}$/.test(pincode)) {
      const currentPincodes = newArea.pincodes || [];
      if (!currentPincodes.includes(pincode)) {
        setNewArea({
          ...newArea,
          pincodes: [...currentPincodes, pincode],
        });
        setPincodeInput("");
      }
    }
  };

  // Remove pincode from new area
  const removePincodeFromNewArea = (pincode: string) => {
    setNewArea({
      ...newArea,
      pincodes: (newArea.pincodes || []).filter((p) => p !== pincode),
    });
  };

  // Create new service area
  const createNewServiceArea = async () => {
    if (!newArea.city.trim() || !newArea.state.trim()) {
      toast.error("City and State are required");
      return;
    }

    setIsCreatingArea(true);
    try {
      const response = await apiClient.post("/admin/service-areas", newArea);
      const createdArea = response.data.data;

      // Add to existing areas
      setExistingServiceAreas((prev) => [...prev, createdArea]);

      // Add to selected areas
      onChange([...selectedServiceAreaIds, createdArea.id]);

      // Reset form
      setNewArea({
        city: "",
        state: "",
        country: "India",
        pincodes: [],
        is_active: true,
      });
      setPincodeInput("");
      setShowCreateForm(false);

      toast.success("Service area created successfully");
    } catch (error) {
      console.error("Error creating service area:", error);
      toast.error("Failed to create service area");
    } finally {
      setIsCreatingArea(false);
    }
  };

  // Filter service areas based on search term
  const filteredAreas = existingServiceAreas.filter(
    (area) =>
      area.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.pincodes && area.pincodes.some(p => p.includes(searchTerm)))
  );

  // Get selected service areas
  const selectedAreas = existingServiceAreas.filter((area) =>
    selectedServiceAreaIds.includes(area.id)
  );

  // Toggle service area selection
  const toggleServiceArea = (areaId: number) => {
    if (selectedServiceAreaIds.includes(areaId)) {
      onChange(selectedServiceAreaIds.filter((id) => id !== areaId));
    } else {
      onChange([...selectedServiceAreaIds, areaId]);
    }
  };

  // Remove selected service area
  const removeSelectedArea = (areaId: number) => {
    onChange(selectedServiceAreaIds.filter((id) => id !== areaId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Service Areas</h4>
          <p className="text-sm text-gray-600 mt-1">
            Select existing areas or create new ones for this service
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {selectedServiceAreaIds.length} selected
          </span>
          {selectedServiceAreaIds.length === 0 && (
            <span className="text-sm text-red-600 font-medium">
              At least one required
            </span>
          )}
        </div>
      </div>

      {/* Selected Service Areas */}
      {selectedAreas.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Selected Areas ({selectedAreas.length})
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedAreas.map((area) => (
              <div
                key={area.id}
                className="flex flex-col p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {area.city}, {area.state}
                      </p>
                      <p className="text-xs text-gray-500">{area.country}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedArea(area.id)}
                    className="flex-shrink-0 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove area"
                  >
                    <X size={16} />
                  </button>
                </div>
                {area.pincodes && area.pincodes.length > 0 && (
                  <div className="ml-8">
                    <p className="text-xs text-gray-600 font-medium mb-1">Pincodes:</p>
                    <div className="flex flex-wrap gap-1">
                      {area.pincodes.slice(0, 3).map((pincode) => (
                        <span
                          key={pincode}
                          className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs"
                        >
                          {pincode}
                        </span>
                      ))}
                      {area.pincodes.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                          +{area.pincodes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Select Existing Areas */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <h5 className="text-base font-medium text-gray-900">
              Select from Existing Areas
            </h5>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Input
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by city, state, country, or pincode..."
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Service Areas List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {isLoadingAreas ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading service areas...</p>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="p-8 text-center">
                <Filter className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "No service areas found matching your search"
                    : "No service areas available"}
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredAreas.map((area) => {
                  const isSelected = selectedServiceAreaIds.includes(area.id);
                  return (
                    <div
                      key={area.id}
                      className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                        isSelected
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => toggleServiceArea(area.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {area.city}, {area.state}
                            </p>
                            <p className="text-xs text-gray-500">
                              {area.country}
                            </p>
                            {area.pincodes && area.pincodes.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {area.pincodes.slice(0, 5).map((pincode) => (
                                    <span
                                      key={pincode}
                                      className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                    >
                                      {pincode}
                                    </span>
                                  ))}
                                  {area.pincodes.length > 5 && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                      +{area.pincodes.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Service Area */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          {!showCreateForm && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h5 className="text-base font-medium text-gray-900">
                  Create New Service Area
                </h5>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                Add New Area
              </Button>
            </div>
          )}

          {showCreateForm && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={newArea.city}
                    onChange={(e) =>
                      setNewArea({ ...newArea, city: e.target.value })
                    }
                    placeholder="Enter city name"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={newArea.state}
                    onChange={(e) =>
                      setNewArea({ ...newArea, state: e.target.value })
                    }
                    placeholder="Enter state name"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Input
                    type="text"
                    value={newArea.country}
                    onChange={(e) =>
                      setNewArea({ ...newArea, country: e.target.value })
                    }
                    placeholder="Enter country name"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Pincodes Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pincodes (optional)
                </label>
                {newArea.pincodes && newArea.pincodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newArea.pincodes.map((pincode) => (
                      <span
                        key={pincode}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {pincode}
                        <button
                          type="button"
                          onClick={() => removePincodeFromNewArea(pincode)}
                          className="hover:text-blue-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={pincodeInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPincodeInput(value);
                    }}
                    placeholder="Enter 6-digit pincode"
                    className="h-10 flex-1"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPincodeToNewArea();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPincodeToNewArea}
                    disabled={!pincodeInput.trim() || !/^\d{6}$/.test(pincodeInput)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewArea({
                      city: "",
                      state: "",
                      country: "India",
                      pincodes: [],
                      is_active: true,
                    });
                    setPincodeInput("");
                  }}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={createNewServiceArea}
                  disabled={
                    !newArea.city.trim() ||
                    !newArea.state.trim() ||
                    isCreatingArea
                  }
                  loading={isCreatingArea}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  leftIcon={<Plus size={16} />}
                >
                  Create & Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.service_area_ids && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.service_area_ids}</p>
        </div>
      )}
    </div>
  );
}
