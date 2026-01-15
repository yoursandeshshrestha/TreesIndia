import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';

export interface ProjectFilters {
  project_type?: string;
  status?: string;
}

interface ProjectFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProjectFilters) => void;
  initialFilters: ProjectFilters;
}

const PROJECT_TYPES = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Infrastructure', value: 'infrastructure' },
];

const STATUS_OPTIONS = [
  { label: 'Starting Soon', value: 'starting_soon' },
  { label: 'Ongoing', value: 'on_going' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function ProjectFilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: ProjectFilterBottomSheetProps) {
  const [projectType, setProjectType] = useState<string | undefined>(initialFilters.project_type);
  const [status, setStatus] = useState<string | undefined>(initialFilters.status);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['60%'], []);
  const isDismissing = useRef(false);

  // Handle sheet visibility
  useEffect(() => {
    if (visible) {
      isDismissing.current = false;
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    } else if (!visible && bottomSheetRef.current) {
      if (!isDismissing.current) {
        isDismissing.current = true;
        bottomSheetRef.current.dismiss();
      }
    }
  }, [visible]);

  // Reset filters when sheet opens
  useEffect(() => {
    if (visible) {
      setProjectType(initialFilters.project_type);
      setStatus(initialFilters.status);
    }
  }, [visible, initialFilters]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && !isDismissing.current) {
        isDismissing.current = true;
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
    return !!(projectType || status);
  };

  const handleClearAll = () => {
    setProjectType(undefined);
    setStatus(undefined);
    onApply({});
    handleClose();
  };

  const handleClose = () => {
    if (!isDismissing.current) {
      isDismissing.current = true;
      bottomSheetRef.current?.dismiss();
    }
  };

  const handleApply = () => {
    const filters: ProjectFilters = {};
    if (projectType) filters.project_type = projectType;
    if (status) filters.status = status;

    onApply(filters);
    handleClose();
  };

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
          {/* Project Type */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Project Type
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {PROJECT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() =>
                    setProjectType(projectType === type.value ? undefined : type.value)
                  }
                  className={`rounded-lg border px-4 py-2 ${
                    projectType === type.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      projectType === type.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View className="mb-6">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Status
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setStatus(status === option.value ? undefined : option.value)}
                  className={`rounded-lg border px-4 py-2 ${
                    status === option.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      status === option.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
