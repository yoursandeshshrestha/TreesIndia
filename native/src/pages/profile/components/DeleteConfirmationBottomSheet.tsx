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
import CancelIcon from '../../../components/icons/CancelIcon';

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
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
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
  }, [visible]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
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

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            transform: [{ translateY }],
            zIndex: 30,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={{
              marginBottom: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']}>
            <View className="px-6 pt-6 pb-12">
              {/* Handle bar */}
              <View className="items-center mb-6">
                <View className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
              </View>

              {/* Header */}
              <Text
                className="text-2xl font-semibold text-[#111928] mb-4"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Delete Account
              </Text>

              {/* Description */}
              <Text
                className="text-base text-[#6B7280] mb-8"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
              >
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </Text>

              {/* Buttons */}
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

