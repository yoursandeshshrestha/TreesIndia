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
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      // Reset filters to initial values when opened
      setProjectType(initialFilters.project_type);
      setStatus(initialFilters.status);

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
    return !!(projectType || status);
  };

  const handleClearAll = () => {
    setProjectType(undefined);
    setStatus(undefined);
    onApply({});
    handleClose();
  };

  const handleApply = () => {
    const filters: ProjectFilters = {};
    if (projectType) filters.project_type = projectType;
    if (status) filters.status = status;

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
              {/* Project Type */}
              <View className="mb-8">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Project Type
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {PROJECT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setProjectType(projectType === type.value ? undefined : type.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        projectType === type.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          projectType === type.value ? 'text-white' : 'text-[#4B5563]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View className="mb-6">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Status
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setStatus(status === option.value ? undefined : option.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        status === option.value
                          ? 'bg-[#00a871] border-[#00a871]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          status === option.value ? 'text-white' : 'text-[#4B5563]'
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
