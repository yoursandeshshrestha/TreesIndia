"use client";

import { useState } from "react";
import { Plus, X, MapPin } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import { CreateServiceAreaRequest } from "../types";

interface ServiceAreaFormProps {
  serviceAreas: CreateServiceAreaRequest[];
  onChange: (serviceAreas: CreateServiceAreaRequest[]) => void;
  errors?: Record<string, string>;
}

export default function ServiceAreaForm({
  serviceAreas,
  onChange,
  errors = {},
}: ServiceAreaFormProps) {
  const [newArea, setNewArea] = useState<CreateServiceAreaRequest>({
    city: "",
    state: "",
    country: "India",
    pincodes: [],
    is_active: true,
  });
  const [pincodeInput, setPincodeInput] = useState("");

  const addServiceArea = () => {
    if (!newArea.city.trim() || !newArea.state.trim()) {
      return;
    }

    const areaToAdd = {
      ...newArea,
      city: newArea.city.trim(),
      state: newArea.state.trim(),
      country: newArea.country.trim() || "India",
      pincodes: newArea.pincodes || [],
    };

    onChange([...serviceAreas, areaToAdd]);
    setNewArea({
      city: "",
      state: "",
      country: "India",
      pincodes: [],
      is_active: true,
    });
    setPincodeInput("");
  };

  const removeServiceArea = (index: number) => {
    const updatedAreas = serviceAreas.filter((_, i) => i !== index);
    onChange(updatedAreas);
  };

  const updateServiceArea = (index: number, field: keyof CreateServiceAreaRequest, value: string | boolean | string[]) => {
    const updatedAreas = serviceAreas.map((area, i) =>
      i === index ? { ...area, [field]: value } : area
    );
    onChange(updatedAreas);
  };

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

  const removePincodeFromNewArea = (pincode: string) => {
    setNewArea({
      ...newArea,
      pincodes: (newArea.pincodes || []).filter((p) => p !== pincode),
    });
  };

  const addPincodeToArea = (index: number, pincode: string) => {
    const area = serviceAreas[index];
    const currentPincodes = area.pincodes || [];
    if (!currentPincodes.includes(pincode)) {
      updateServiceArea(index, "pincodes", [...currentPincodes, pincode]);
    }
  };

  const removePincodeFromArea = (index: number, pincode: string) => {
    const area = serviceAreas[index];
    updateServiceArea(
      index,
      "pincodes",
      (area.pincodes || []).filter((p) => p !== pincode)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addServiceArea();
    }
  };

  const handlePincodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPincodeToNewArea();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Service Areas ({serviceAreas.length})
        </h4>
        {serviceAreas.length === 0 && (
          <span className="text-sm text-red-600">
            At least one service area is required
          </span>
        )}
      </div>

      {/* Existing Service Areas */}
      {serviceAreas.length > 0 && (
        <div className="space-y-3">
          {serviceAreas.map((area, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Input
                      type="text"
                      value={area.city}
                      onChange={(e) => updateServiceArea(index, "city", e.target.value)}
                      placeholder="City"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={area.state}
                      onChange={(e) => updateServiceArea(index, "state", e.target.value)}
                      placeholder="State"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={area.country}
                      onChange={(e) => updateServiceArea(index, "country", e.target.value)}
                      placeholder="Country"
                      className="text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeServiceArea(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Pincodes for existing area */}
              <div className="ml-7 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Pincodes (optional):</p>
                {area.pincodes && area.pincodes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {area.pincodes.map((pincode) => (
                      <span
                        key={pincode}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {pincode}
                        <button
                          type="button"
                          onClick={() => removePincodeFromArea(index, pincode)}
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
                    placeholder="Add pincode (6 digits)"
                    className="text-sm flex-1"
                    maxLength={6}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const pincode = input.value.trim();
                        if (pincode && /^\d{6}$/.test(pincode)) {
                          addPincodeToArea(index, pincode);
                          input.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Service Area */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Add New Service Area</h5>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Input
              type="text"
              value={newArea.city}
              onChange={(e) => setNewArea({ ...newArea, city: e.target.value })}
              placeholder="City *"
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
          </div>
          <div>
            <Input
              type="text"
              value={newArea.state}
              onChange={(e) => setNewArea({ ...newArea, state: e.target.value })}
              placeholder="State *"
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
          </div>
          <div>
            <Input
              type="text"
              value={newArea.country}
              onChange={(e) => setNewArea({ ...newArea, country: e.target.value })}
              placeholder="Country"
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
          </div>
        </div>

        {/* Pincodes for new area */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium">Pincodes (optional):</p>
          {newArea.pincodes && newArea.pincodes.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
              placeholder="Add pincode (6 digits)"
              className="text-sm flex-1"
              maxLength={6}
              onKeyPress={handlePincodeKeyPress}
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addServiceArea}
          disabled={!newArea.city.trim() || !newArea.state.trim()}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Service Area
        </Button>
      </div>

      {/* Error Display */}
      {errors.service_areas && (
        <p className="text-sm text-red-600">{errors.service_areas}</p>
      )}
    </div>
  );
}
