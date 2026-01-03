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

export interface ServiceFilters {
  price_type?: 'fixed' | 'inquiry';
  price_min?: number;
  price_max?: number;
  category?: string;
  subcategory?: string;
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
  const [priceType, setPriceType] = useState<'fixed' | 'inquiry' | undefined>(initialFilters.price_type);
  const [priceMin, setPriceMin] = useState<number | undefined>(initialFilters.price_min);
  const [priceMax, setPriceMax] = useState<number | undefined>(initialFilters.price_max);
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setPriceType(initialFilters.price_type);
      setPriceMin(initialFilters.price_min);
      setPriceMax(initialFilters.price_max);

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
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsClosing(false);
    });
  };

  const hasActiveFilters = () => {
    return !!(priceType || priceMin || priceMax);
  };

  const handleClearAll = () => {
    setPriceType(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
  };

  const handleApply = () => {
    const filters: ServiceFilters = {};
    if (priceType) filters.price_type = priceType;
    if (priceMin) filters.price_min = priceMin;
    if (priceMax) filters.price_max = priceMax;

    onApply(filters);
    handleClose();
  };

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
              {/* Price Type */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Price Type
                </Text>
                <View className="flex-row" style={{ gap: 12 }}>
                  {PRICE_TYPE_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setPriceType(priceType === type.value ? undefined : type.value)}
                      className={`flex-1 py-3 rounded-lg border ${
                        priceType === type.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium text-center ${
                          priceType === type.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Min Price */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Min Price
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {MIN_PRICE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setPriceMin(priceMin === option.value ? undefined : option.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        priceMin === option.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          priceMin === option.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Max Price */}
              <View className="mb-6">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Max Price
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {MAX_PRICE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setPriceMax(priceMax === option.value ? undefined : option.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        priceMax === option.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          priceMax === option.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        Under {option.label}
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
