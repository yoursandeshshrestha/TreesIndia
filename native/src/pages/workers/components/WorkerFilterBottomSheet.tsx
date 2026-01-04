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
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setExperienceMin(initialFilters.experience_min);
      setExperienceMax(initialFilters.experience_max);

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
    return !!(experienceMin !== undefined || experienceMax !== undefined);
  };

  const handleClearAll = () => {
    setExperienceMin(undefined);
    setExperienceMax(undefined);
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
