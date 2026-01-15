import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from './ui/Button';

export type FilterFieldType = 'single-select' | 'multi-select' | 'toggle' | 'range';

export interface FilterOption {
  label: string;
  value: string | number | undefined;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  options: FilterOption[];
  defaultValue?: string | number | string[] | number[];
}

export interface FilterConfig {
  fields: FilterField[];
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  initialFilters: Record<string, any>;
  config: FilterConfig;
}

export default function FilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
  config,
}: FilterBottomSheetProps) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setFilters(initialFilters);

      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible, initialFilters]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const hasActiveFilters = () => {
    return Object.keys(filters).some((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });
  };

  const handleClearAll = () => {
    setFilters({});
    handleClose();
  };

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleApply = () => {
    // Filter out empty values
    const cleanedFilters = Object.keys(filters).reduce(
      (acc, key) => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length === 0) {
            return acc;
          }
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    onApply(cleanedFilters);
    handleClose();
  };

  const handleSelectOption = (fieldKey: string, optionValue: any, type: FilterFieldType) => {
    setFilters((prev) => {
      if (type === 'toggle') {
        // Toggle behavior: select/deselect
        return {
          ...prev,
          [fieldKey]: prev[fieldKey] === optionValue ? undefined : optionValue,
        };
      } else if (type === 'single-select') {
        // Single select: only one option at a time
        return {
          ...prev,
          [fieldKey]: prev[fieldKey] === optionValue ? undefined : optionValue,
        };
      } else if (type === 'multi-select') {
        // Multi-select: array of values
        const currentValues = prev[fieldKey] || [];
        const isSelected = currentValues.includes(optionValue);
        return {
          ...prev,
          [fieldKey]: isSelected
            ? currentValues.filter((v: any) => v !== optionValue)
            : [...currentValues, optionValue],
        };
      }
      return prev;
    });
  };

  const isOptionSelected = (fieldKey: string, optionValue: any, type: FilterFieldType) => {
    const currentValue = filters[fieldKey];

    if (type === 'multi-select') {
      return Array.isArray(currentValue) && currentValue.includes(optionValue);
    }

    return currentValue === optionValue;
  };

  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'toggle':
      case 'single-select':
        return (
          <View className="mb-8" key={field.key}>
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              {field.label}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {field.options.map((option, index) => {
                const isSelected = isOptionSelected(field.key, option.value, field.type);
                return (
                  <TouchableOpacity
                    key={`${field.key}-${index}`}
                    onPress={() => handleSelectOption(field.key, option.value, field.type)}
                    className={`rounded-lg border px-4 py-2 ${
                      isSelected ? 'border-[#00a871] bg-[#00a871]' : 'border-[#E5E7EB] bg-white'
                    }`}
                    activeOpacity={0.7}>
                    <Text
                      className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-[#4B5563]'
                      }`}
                      style={{ fontFamily: 'Inter-Medium' }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'multi-select':
        return (
          <View className="mb-8" key={field.key}>
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              {field.label}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {field.options.map((option, index) => {
                const isSelected = isOptionSelected(field.key, option.value, field.type);
                return (
                  <TouchableOpacity
                    key={`${field.key}-${index}`}
                    onPress={() => handleSelectOption(field.key, option.value, field.type)}
                    className={`rounded-lg border px-4 py-2 ${
                      isSelected ? 'border-[#00a871] bg-[#00a871]' : 'border-[#E5E7EB] bg-white'
                    }`}
                    activeOpacity={0.7}>
                    <Text
                      className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-[#4B5563]'
                      }`}
                      style={{ fontFamily: 'Inter-Medium' }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-[#E5E7EB]">
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text
              className="font-semibold text-lg text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Filters
            </Text>
            {hasActiveFilters() && (
              <TouchableOpacity
                onPress={handleClearAll}
                className="rounded-lg bg-[#F3F4F6] px-3 py-1.5"
                activeOpacity={0.7}>
                <Text
                  className="font-semibold text-sm text-[#00a871]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          {config.fields.map((field) => renderFilterField(field))}
        </BottomSheetScrollView>

        {/* Footer with Apply Button */}
        <SafeAreaView edges={['bottom']} className="border-t border-[#E5E7EB] bg-white">
          <View
            className="px-6 pt-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <Button label="Apply Filters" onPress={handleApply} />
          </View>
        </SafeAreaView>
      </View>
    </BottomSheetModal>
  );
}
