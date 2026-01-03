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

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
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
          }}
        >
          <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
            <View className="px-6 py-6">
              {/* Drag Handle */}
              <View className="w-10 h-1 bg-[#D1D5DB] rounded-full self-center mb-6" />

              {/* Warning Icon */}
              <View className="w-16 h-16 rounded-full bg-[#FEE2E2] items-center justify-center self-center mb-6">
                <Text className="text-3xl">🗑️</Text>
              </View>

              {/* Title */}
              <Text
                className="text-xl font-bold text-[#111928] text-center mb-2"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Delete Property
              </Text>

              {/* Description */}
              <Text
                className="text-base text-[#374151] text-center mb-8"
                style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
              >
                Are you sure you want to delete "{propertyTitle}"? This action cannot be undone.
              </Text>

              {/* Action Buttons */}
              <View className="flex-row" style={{ gap: 12 }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isDeleting}
                  className="flex-1 border border-[#D1D5DB] rounded-lg py-3 items-center"
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-base font-semibold text-[#374151]"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-[#DC2626] rounded-lg py-3 items-center"
                  activeOpacity={0.7}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      className="text-base font-bold text-white"
                      style={{ fontFamily: 'Inter-Bold' }}
                    >
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


