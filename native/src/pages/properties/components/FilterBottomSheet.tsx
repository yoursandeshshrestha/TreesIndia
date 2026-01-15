import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';

export interface PropertyFilters {
  listing_type?: 'sale' | 'rent';
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_price?: number;
  furnishing_status?: string;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PropertyFilters) => void;
  initialFilters: PropertyFilters;
}

const PROPERTY_TYPES = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
];

const BEDROOM_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

const BATHROOM_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
];

const FURNISHING_STATUS = [
  { label: 'Furnished', value: 'furnished' },
  { label: 'Semi-Furnished', value: 'semi-furnished' },
  { label: 'Unfurnished', value: 'unfurnished' },
];

const PRICE_RANGES_SALE = [
  { label: '₹50K', value: 50000 },
  { label: '₹1L', value: 100000 },
  { label: '₹2L', value: 200000 },
  { label: '₹10L', value: 1000000 },
];

const PRICE_RANGES_RENT = [
  { label: '₹50K', value: 50000 },
  { label: '₹1L', value: 100000 },
  { label: '₹2L', value: 200000 },
  { label: '₹10L', value: 1000000 },
];

export default function FilterBottomSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterBottomSheetProps) {
  const [listingType, setListingType] = useState<'sale' | 'rent' | undefined>(
    initialFilters.listing_type
  );
  const [propertyType, setPropertyType] = useState<string | undefined>(
    initialFilters.property_type
  );
  const [bedrooms, setBedrooms] = useState<number | undefined>(initialFilters.bedrooms);
  const [bathrooms, setBathrooms] = useState<number | undefined>(initialFilters.bathrooms);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters.max_price);
  const [furnishingStatus, setFurnishingStatus] = useState<string | undefined>(
    initialFilters.furnishing_status
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
      setListingType(initialFilters.listing_type);
      setPropertyType(initialFilters.property_type);
      setBedrooms(initialFilters.bedrooms);
      setBathrooms(initialFilters.bathrooms);
      setMaxPrice(initialFilters.max_price);
      setFurnishingStatus(initialFilters.furnishing_status);
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
    return !!(listingType || propertyType || bedrooms || bathrooms || maxPrice || furnishingStatus);
  };

  const handleClearAll = () => {
    setListingType(undefined);
    setPropertyType(undefined);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setMaxPrice(undefined);
    setFurnishingStatus(undefined);
    handleClose();
  };

  const handleApply = () => {
    const filters: PropertyFilters = {};
    if (listingType) filters.listing_type = listingType;
    if (propertyType) filters.property_type = propertyType;
    if (bedrooms) filters.bedrooms = bedrooms;
    if (bathrooms) filters.bathrooms = bathrooms;
    if (maxPrice) filters.max_price = maxPrice;
    if (furnishingStatus) filters.furnishing_status = furnishingStatus;

    onApply(filters);
    handleClose();
  };

  const priceRanges = listingType === 'rent' ? PRICE_RANGES_RENT : PRICE_RANGES_SALE;

  const handleClose = () => {
    if (!isDismissing.current) {
      isDismissing.current = true;
      bottomSheetRef.current?.dismiss();
    }
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
          {/* Listing Type */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Listing Type
            </Text>
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => setListingType(listingType === 'sale' ? undefined : 'sale')}
                className={`flex-1 rounded-lg border py-3 ${
                  listingType === 'sale'
                    ? 'border-[#00a871] bg-[#00a871]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.7}>
                <Text
                  className={`text-center font-medium text-sm ${
                    listingType === 'sale' ? 'text-white' : 'text-[#4B5563]'
                  }`}
                  style={{ fontFamily: 'Inter-Medium' }}>
                  For Sale
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setListingType(listingType === 'rent' ? undefined : 'rent')}
                className={`flex-1 rounded-lg border py-3 ${
                  listingType === 'rent'
                    ? 'border-[#00a871] bg-[#00a871]'
                    : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.7}>
                <Text
                  className={`text-center font-medium text-sm ${
                    listingType === 'rent' ? 'text-white' : 'text-[#4B5563]'
                  }`}
                  style={{ fontFamily: 'Inter-Medium' }}>
                  For Rent
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Type */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Property Type
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() =>
                    setPropertyType(propertyType === type.value ? undefined : type.value)
                  }
                  className={`rounded-lg border px-4 py-2 ${
                    propertyType === type.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      propertyType === type.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Bedrooms
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {BEDROOM_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setBedrooms(bedrooms === option.value ? undefined : option.value)}
                  className={`h-14 w-14 items-center justify-center rounded-lg border ${
                    bedrooms === option.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-semibold text-base ${
                      bedrooms === option.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bathrooms */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Bathrooms
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {BATHROOM_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    setBathrooms(bathrooms === option.value ? undefined : option.value)
                  }
                  className={`h-14 w-14 items-center justify-center rounded-lg border ${
                    bathrooms === option.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-semibold text-base ${
                      bathrooms === option.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Furnishing Status */}
          <View className="mb-8">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Furnishing Status
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {FURNISHING_STATUS.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() =>
                    setFurnishingStatus(
                      furnishingStatus === status.value ? undefined : status.value
                    )
                  }
                  className={`rounded-lg border px-4 py-2 ${
                    furnishingStatus === status.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      furnishingStatus === status.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View className="mb-6">
            <Text
              className="mb-4 font-semibold text-xs uppercase tracking-wide text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Max Price {listingType === 'rent' ? '(Monthly)' : ''}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  onPress={() => setMaxPrice(maxPrice === range.value ? undefined : range.value)}
                  className={`rounded-lg border px-4 py-2 ${
                    maxPrice === range.value
                      ? 'border-[#00a871] bg-[#00a871]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`font-medium text-sm ${
                      maxPrice === range.value ? 'text-white' : 'text-[#4B5563]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}>
                    Under {range.label}
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
