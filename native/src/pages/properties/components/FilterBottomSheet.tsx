import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
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
  const [listingType, setListingType] = useState<'sale' | 'rent' | undefined>(initialFilters.listing_type);
  const [propertyType, setPropertyType] = useState<string | undefined>(initialFilters.property_type);
  const [bedrooms, setBedrooms] = useState<number | undefined>(initialFilters.bedrooms);
  const [bathrooms, setBathrooms] = useState<number | undefined>(initialFilters.bathrooms);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters.max_price);
  const [furnishingStatus, setFurnishingStatus] = useState<string | undefined>(initialFilters.furnishing_status);
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setListingType(initialFilters.listing_type);
      setPropertyType(initialFilters.property_type);
      setBedrooms(initialFilters.bedrooms);
      setBathrooms(initialFilters.bathrooms);
      setMaxPrice(initialFilters.max_price);
      setFurnishingStatus(initialFilters.furnishing_status);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialFilters]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const hasActiveFilters = () => {
    return !!(
      listingType ||
      propertyType ||
      bedrooms ||
      bathrooms ||
      maxPrice ||
      furnishingStatus
    );
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '90%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']} className="flex-1">
            {/* Drag Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-[#D1D5DB] rounded-full" />
            </View>

            {/* Header */}
            <View className="border-b border-[#E5E7EB]">
              <View className="px-4 py-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Filters
                </Text>
                <View className="flex-row items-center gap-3">
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
                  <TouchableOpacity
                    onPress={handleClose}
                    className="p-1.5 -mr-2"
                    activeOpacity={0.7}
                    disabled={isClosing}
                  >
                    <Text className="text-2xl text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Listing Type */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Listing Type
                </Text>
                <View className="flex-row" style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setListingType(listingType === 'sale' ? undefined : 'sale')}
                    className={`flex-1 py-3 rounded-lg border ${
                      listingType === 'sale'
                        ? 'bg-[#00a871] border-[#00a871]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium text-center ${
                        listingType === 'sale' ? 'text-white' : 'text-[#4B5563]'
                      }`}
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      For Sale
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setListingType(listingType === 'rent' ? undefined : 'rent')}
                    className={`flex-1 py-3 rounded-lg border ${
                      listingType === 'rent'
                        ? 'bg-[#00a871] border-[#00a871]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium text-center ${
                        listingType === 'rent' ? 'text-white' : 'text-[#4B5563]'
                      }`}
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      For Rent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Property Type */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Property Type
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {PROPERTY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setPropertyType(propertyType === type.value ? undefined : type.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        propertyType === type.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          propertyType === type.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bedrooms */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Bedrooms
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {BEDROOM_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setBedrooms(bedrooms === option.value ? undefined : option.value)}
                      className={`w-14 h-14 rounded-lg border items-center justify-center ${
                        bedrooms === option.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          bedrooms === option.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bathrooms */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Bathrooms
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {BATHROOM_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setBathrooms(bathrooms === option.value ? undefined : option.value)}
                      className={`w-14 h-14 rounded-lg border items-center justify-center ${
                        bathrooms === option.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          bathrooms === option.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Furnishing Status */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Furnishing Status
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {FURNISHING_STATUS.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      onPress={() => setFurnishingStatus(furnishingStatus === status.value ? undefined : status.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        furnishingStatus === status.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          furnishingStatus === status.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range */}
              <View className="mb-6">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Max Price {listingType === 'rent' ? '(Monthly)' : ''}
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {priceRanges.map((range) => (
                    <TouchableOpacity
                      key={range.value}
                      onPress={() => setMaxPrice(maxPrice === range.value ? undefined : range.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        maxPrice === range.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          maxPrice === range.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        Under {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer with Apply Button */}
            <View
              className="px-6 pt-5 bg-white border-t border-[#E5E7EB]"
              style={{
                paddingBottom: 48,
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
        </Animated.View>
      </View>
    </Modal>
  );
}
