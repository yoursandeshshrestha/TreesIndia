import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { type WorkerFilters } from '../../../services';

interface WorkerFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: WorkerFilters) => void;
  initialFilters: WorkerFilters;
}

const EXPERIENCE_OPTIONS = [
  { label: 'Any', min: undefined, max: undefined },
  { label: '0-2 years', min: 0, max: 2 },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '6-10 years', min: 6, max: 10 },
  { label: '10+ years', min: 10, max: undefined },
];

export default function WorkerFilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: WorkerFilterBottomSheetProps) {
  const [experienceMin, setExperienceMin] = useState<number | undefined>(initialFilters.experience_min);
  const [experienceMax, setExperienceMax] = useState<number | undefined>(initialFilters.experience_max);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setExperienceMin(initialFilters.experience_min);
      setExperienceMax(initialFilters.experience_max);

      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible, initialFilters]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const hasActiveFilters = () => {
    return !!(experienceMin !== undefined || experienceMax !== undefined);
  };

  const handleClearAll = () => {
    setExperienceMin(undefined);
    setExperienceMax(undefined);
    handleClose();
  };

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handleExperienceSelect = (min: number | undefined, max: number | undefined) => {
    if (experienceMin === min && experienceMax === max) {
      setExperienceMin(undefined);
      setExperienceMax(undefined);
    } else {
      setExperienceMin(min);
      setExperienceMax(max);
    }
  };

  const isExperienceSelected = (min: number | undefined, max: number | undefined) => {
    return experienceMin === min && experienceMax === max;
  };

  const handleApply = () => {
    const filters: WorkerFilters = {};
    if (experienceMin !== undefined) filters.experience_min = experienceMin;
    if (experienceMax !== undefined) filters.experience_max = experienceMax;

    onApply(filters);
    handleClose();
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
      }}
    >
      <View className="flex-1">
            {/* Header */}
            <View className="border-b border-[#E5E7EB]">
              <View className="px-4 py-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Filters
                </Text>
                {hasActiveFilters() && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    className="py-1.5 px-3 bg-[#F3F4F6] rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-sm font-semibold text-[#00a871]"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <BottomSheetScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Experience */}
              <View className="mb-6">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Experience
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {EXPERIENCE_OPTIONS.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleExperienceSelect(option.min, option.max)}
                      className={`px-4 py-2 rounded-lg border ${
                        isExperienceSelected(option.min, option.max)
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isExperienceSelected(option.min, option.max) ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </BottomSheetScrollView>

            {/* Footer with Apply Button */}
            <SafeAreaView edges={['bottom']} className="bg-white border-t border-[#E5E7EB]">
              <View
                className="px-6 pt-5"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Button
                  label="Apply Filters"
                  onPress={handleApply}
                />
              </View>
            </SafeAreaView>
      </View>
    </BottomSheetModal>
  );
}
