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
  const [businessType, setBusinessType] = useState<string | undefined>(initialFilters.business_type);
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setBusinessType(initialFilters.business_type);

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
    return !!(businessType !== undefined);
  };

  const handleClearAll = () => {
    setBusinessType(undefined);
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
              {/* Business Type */}
              <View className="mb-6">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Business Type
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {BUSINESS_TYPE_OPTIONS.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleBusinessTypeSelect(option.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        isBusinessTypeSelected(option.value)
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isBusinessTypeSelected(option.value) ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {option.label}
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
