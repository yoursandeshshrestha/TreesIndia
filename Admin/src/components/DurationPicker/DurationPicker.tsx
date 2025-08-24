"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { BaseInput as Input } from "@/components/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

export interface DurationUnit {
  value: string;
  label: string;
  maxValue?: number;
}

export interface DurationValue {
  value: number;
  unit: string;
}

export interface DurationPickerProps {
  value?: string;
  onChange: (duration: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const durationUnits: DurationUnit[] = [
  { value: "minutes", label: "Minutes", maxValue: 59 },
  { value: "hours", label: "Hours", maxValue: 23 },
  { value: "days", label: "Days", maxValue: 30 },
  { value: "weeks", label: "Weeks", maxValue: 52 },
  { value: "months", label: "Months", maxValue: 12 },
  { value: "years", label: "Years" },
];

export default function DurationPicker({
  value = "",
  onChange,
  placeholder = "Select duration",
  className = "",
  disabled = false,
  error,
}: DurationPickerProps) {
  const [durationParts, setDurationParts] = useState<DurationValue[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Parse duration string on mount
  useEffect(() => {
    if (value) {
      const parsed = parseDurationString(value);
      setDurationParts(parsed);
    }
  }, [value]);

  const parseDurationString = (durationStr: string): DurationValue[] => {
    const parts: DurationValue[] = [];
    const regex = /(\d+)\s+(\w+)/g;
    let match;

    while ((match = regex.exec(durationStr)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];
      parts.push({ value, unit });
    }

    return parts;
  };

  const formatDurationString = (parts: DurationValue[]): string => {
    return parts
      .map((part) => {
        const unit = part.value === 1 ? part.unit.slice(0, -1) : part.unit;
        return `${part.value} ${unit}`;
      })
      .join(" ");
  };

  const addDurationPart = () => {
    setDurationParts([...durationParts, { value: 0, unit: "minutes" }]);
  };

  const updateDurationPart = (
    index: number,
    field: "value" | "unit",
    newValue: string | number
  ) => {
    const updated = [...durationParts];
    updated[index] = {
      ...updated[index],
      [field]: field === "value" ? Number(newValue) : newValue,
    };
    setDurationParts(updated);

    // Update the formatted string
    const formatted = formatDurationString(updated);
    onChange(formatted);
  };

  const removeDurationPart = (index: number) => {
    const updated = durationParts.filter((_, i) => i !== index);
    setDurationParts(updated);

    const formatted = formatDurationString(updated);
    onChange(formatted);
  };

  const getMaxValue = (unit: string): number => {
    const unitConfig = durationUnits.find((u) => u.value === unit);
    return unitConfig?.maxValue || 999;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border rounded-lg p-2 cursor-pointer ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        } ${error ? "border-red-500" : "border-gray-300"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={value ? "text-gray-900" : "text-gray-500"}>
              {value || placeholder}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {durationParts.length > 0 ? `${durationParts.length} part(s)` : ""}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-[20] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Duration</h4>
              <button
                type="button"
                onClick={addDurationPart}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Part
              </button>
            </div>

            {durationParts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Click &quot;Add Part&quot; to set duration
              </p>
            ) : (
              <div className="space-y-2">
                {durationParts.map((part, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={part.value}
                        onChange={(e) =>
                          updateDurationPart(index, "value", e.target.value)
                        }
                        min="0"
                        max={getMaxValue(part.unit)}
                        className="text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="w-32">
                      <SearchableDropdown
                        options={durationUnits}
                        value={part.unit}
                        onChange={(value) =>
                          updateDurationPart(index, "unit", value as string)
                        }
                        placeholder="Unit"
                        width="100%"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDurationPart(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {durationParts.length > 0 && (
              <div className="">
                <div className="text-sm text-gray-600">
                  <strong>Preview:</strong>{" "}
                  {formatDurationString(durationParts)}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2   ">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
