import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DeleteConfirmationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationBottomSheet({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationBottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsClosing(false);

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, slideAnim]);

  const handleClose = () => {
    if (isClosing || isLoading) return;
    setIsClosing(true);
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            opacity: overlayOpacity,
          }}
          className="absolute inset-0 bg-black/50"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
            disabled={isLoading}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
        >
          {/* Header - Fixed */}
          <View className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
            <Text
              className="text-2xl font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Delete Account
            </Text>
          </View>

          {/* Content */}
          <View className="px-6 pt-6 pb-6">
            {/* Description */}
            <Text
              className="text-base text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
            >
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </Text>
          </View>

          {/* Action Buttons - Fixed at bottom */}
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'white' }}>
            <View className="px-6 pt-4 pb-12 border-t border-[#E5E7EB]">
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isLoading}
                  className="flex-1 border border-[#D1D5DB] rounded-xl py-4 items-center"
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-base font-medium text-[#374151]"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-[#DC2626] rounded-xl py-4 items-center"
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      className="text-base font-semibold text-white"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
