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
    is_active: true,
  });

  const addServiceArea = () => {
    if (!newArea.city.trim() || !newArea.state.trim()) {
      return;
    }

    const areaToAdd = {
      ...newArea,
      city: newArea.city.trim(),
      state: newArea.state.trim(),
      country: newArea.country.trim() || "India",
    };

    onChange([...serviceAreas, areaToAdd]);
    setNewArea({
      city: "",
      state: "",
      country: "India",
      is_active: true,
    });
  };

  const removeServiceArea = (index: number) => {
    const updatedAreas = serviceAreas.filter((_, i) => i !== index);
    onChange(updatedAreas);
  };

  const updateServiceArea = (index: number, field: keyof CreateServiceAreaRequest, value: string | boolean) => {
    const updatedAreas = serviceAreas.map((area, i) =>
      i === index ? { ...area, [field]: value } : area
    );
    onChange(updatedAreas);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addServiceArea();
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
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
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
          ))}
        </div>
      )}

      {/* Add New Service Area */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Add New Service Area</h5>
        <div className="grid grid-cols-3 gap-3 mb-3">
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
