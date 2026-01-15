import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';

export interface ServiceFilters {
  price_type?: 'fixed' | 'inquiry';
  price_min?: number;
  price_max?: number;
  category?: string;
  subcategory?: string;
  city?: string;
  state?: string;
  search?: string;
}

interface ServiceFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ServiceFilters) => void;
  initialFilters: ServiceFilters;
}

const PRICE_TYPE_OPTIONS = [
  { label: 'Fixed Price', value: 'fixed' as const },
  { label: 'Inquiry Based', value: 'inquiry' as const },
];

const MIN_PRICE_OPTIONS = [
  { label: '₹500', value: 500 },
  { label: '₹1K', value: 1000 },
  { label: '₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹25K', value: 25000 },
  { label: '₹50K', value: 50000 },
];

const MAX_PRICE_OPTIONS = [
  { label: '₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹25K', value: 25000 },
  { label: '₹50K', value: 50000 },
  { label: '₹1L', value: 100000 },
  { label: '₹5L', value: 500000 },
];

export default function ServiceFilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: ServiceFilterBottomSheetProps) {
  const [priceType, setPriceType] = useState<'fixed' | 'inquiry' | undefined>(
    initialFilters.price_type
  );
  const [priceMin, setPriceMin] = useState<number | undefined>(initialFilters.price_min);
  const [priceMax, setPriceMax] = useState<number | undefined>(initialFilters.price_max);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isDismissing = useRef(false);

  const snapPoints = useMemo(() => ['60%'], []);

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
      setPriceType(initialFilters.price_type);
      setPriceMin(initialFilters.price_min);
      setPriceMax(initialFilters.price_max);
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
    return !!(priceType || priceMin || priceMax);
  };

  const handleClearAll = () => {
    setPriceType(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    handleClose();
  };

  const handleClose = () => {
    if (!isDismissing.current) {
      isDismissing.current = true;
      bottomSheetRef.current?.dismiss();
    }
  };

  const handleApply = () => {
    const filters: ServiceFilters = {};
    if (priceType) filters.price_type = priceType;
    if (priceMin) filters.price_min = priceMin;
    if (priceMax) filters.price_max = priceMax;

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
          {/* Price Type */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Price Type
            </Text>
            <View className="flex-row" style={{ gap: 12 }}>
              {PRICE_TYPE_OPTIONS.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setPriceType(priceType === type.value ? undefined : type.value)}
                  className={`flex-1 rounded-lg border py-3 ${
                    priceType === type.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-center font-medium text-sm ${
                      priceType === type.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Min Price */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Min Price
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {MIN_PRICE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setPriceMin(priceMin === option.value ? undefined : option.value)}
                  className={`rounded-lg border px-4 py-2 ${
                    priceMin === option.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      priceMin === option.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Price */}
          <View className="mb-6">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Max Price
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {MAX_PRICE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setPriceMax(priceMax === option.value ? undefined : option.value)}
                  className={`rounded-lg border px-4 py-2 ${
                    priceMax === option.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      priceMax === option.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Under {option.label}
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
