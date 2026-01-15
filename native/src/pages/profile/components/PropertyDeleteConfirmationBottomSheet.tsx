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

interface PropertyDeleteConfirmationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyTitle: string;
  isDeleting?: boolean;
}

export default function PropertyDeleteConfirmationBottomSheet({
  visible,
  onClose,
  onConfirm,
  propertyTitle,
  isDeleting = false,
}: PropertyDeleteConfirmationBottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
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

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            transform: [{ translateY }],
            zIndex: 30,
          }}>
          <TouchableOpacity
            onPress={handleClose}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={{
              marginBottom: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Sheet */}
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
          }}>
          <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-white">
            <View className="px-6 py-6">
              {/* Drag Handle */}
              <View className="mb-6 h-1 w-10 self-center rounded-full bg-[#D1D5DB]" />

              {/* Warning Icon */}
              <View className="mb-6 h-16 w-16 items-center justify-center self-center rounded-full bg-[#FEE2E2]">
                <Text className="text-3xl">🗑️</Text>
              </View>

              {/* Title */}
              <Text
                className="mb-2 text-center font-bold text-xl text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}>
                Delete Property
              </Text>

              {/* Description */}
              <Text
                className="mb-8 text-center text-base text-[#374151]"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}>
                Are you sure you want to delete &quot;{propertyTitle}&quot;? This action cannot be
                undone.
              </Text>

              {/* Action Buttons */}
              <View className="flex-row" style={{ gap: 12 }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isDeleting}
                  className="flex-1 items-center rounded-lg border border-[#D1D5DB] py-3"
                  activeOpacity={0.7}>
                  <Text
                    className="font-semibold text-base text-[#374151]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={isDeleting}
                  className="flex-1 items-center rounded-lg bg-[#DC2626] py-3"
                  activeOpacity={0.7}>
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      className="font-bold text-base text-white"
                      style={{ fontFamily: 'Inter-Bold' }}>
                      Delete
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
