import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { type VendorFilters } from '../../../services';

interface VendorFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: VendorFilters) => void;
  initialFilters: VendorFilters;
}

const BUSINESS_TYPE_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'Individual', value: 'individual' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Company', value: 'company' },
  { label: 'LLP', value: 'llp' },
  { label: 'Pvt Ltd', value: 'pvt_ltd' },
  { label: 'Public Ltd', value: 'public_ltd' },
];

export default function VendorFilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: VendorFilterBottomSheetProps) {
  const [businessType, setBusinessType] = useState<string | undefined>(
    initialFilters.business_type
  );
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
      setBusinessType(initialFilters.business_type);
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
    return !!(businessType !== undefined);
  };

  const handleClearAll = () => {
    setBusinessType(undefined);
    handleClose();
  };

  const handleClose = () => {
    if (!isDismissing.current) {
      isDismissing.current = true;
      bottomSheetRef.current?.dismiss();
    }
  };

  const handleBusinessTypeSelect = (value: string | undefined) => {
    if (businessType === value) {
      setBusinessType(undefined);
    } else {
      setBusinessType(value);
    }
  };

  const isBusinessTypeSelected = (value: string | undefined) => {
    return businessType === value;
  };

  const handleApply = () => {
    const filters: VendorFilters = {};
    if (businessType !== undefined) filters.business_type = businessType;

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
          {/* Business Type */}
          <View className="mb-6">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Business Type
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {BUSINESS_TYPE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleBusinessTypeSelect(option.value)}
                  className={`rounded-lg border px-4 py-2 ${
                    isBusinessTypeSelected(option.value)
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      isBusinessTypeSelected(option.value) ? 'text-white' : 'text-[#4B5563]'
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
